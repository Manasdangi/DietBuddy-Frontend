// Vercel serverless function: POST /api/analyze-meal
// Keeps the Gemini API key on the server so it never ships inside the app.
//
// Body (JSON):
//   { "type": "text",  "text": "2 roti and dal" }
//   { "type": "image", "data": "<base64>", "mimeType": "image/jpeg" }
//   { "type": "audio", "data": "<base64>", "mimeType": "audio/m4a" }
//
// Env vars (set in Vercel project settings):
//   GEMINI_API_KEY    required
//   GEMINI_MODEL      optional, defaults to "gemini-flash-latest"
//   APP_CLIENT_TOKEN  optional; if set, requests must send header "x-app-token" with this value
//   ALLOWED_ORIGIN    optional; CORS origin for the Expo web build (native apps don't need CORS)

const DEFAULT_MODEL = 'gemini-flash-latest';
const MAX_TEXT_CHARS = 1000;
// Vercel caps request bodies at 4.5 MB; base64 adds ~33%, so keep media under ~3 MB raw
const MAX_BASE64_CHARS = 4 * 1024 * 1024;

const ALLOWED_MIME = {
  // The app re-encodes photos to JPEG before upload
  image: ['image/jpeg', 'image/png', 'image/webp'],
  audio: ['audio/m4a', 'audio/mp4', 'audio/aac', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/flac', 'audio/opus'],
};

const SYSTEM_PROMPT = `You are a highly capable AI nutrition assistant.
Analyze the user's input (a photo of food, a voice note describing food, or a text description).
Identify every food item and estimate realistic portion sizes. You understand Indian food well
(roti, dal, sabzi, rice, paneer, thali, etc.) and common Indian portion terms like katori and plate.
Estimate total calories, protein, carbs and fat for the whole meal.
If audio is provided, include a transcript of what the user said; otherwise use an empty string.
If the input contains no food, set foodName to "No food detected", all macros to 0, and confidence to "low".`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcription: { type: 'STRING' },
    foodName: { type: 'STRING', description: 'Comma separated list of identified items' },
    macros: {
      type: 'OBJECT',
      properties: {
        calories: { type: 'NUMBER' },
        protein: { type: 'NUMBER', description: 'grams' },
        carbs: { type: 'NUMBER', description: 'grams' },
        fat: { type: 'NUMBER', description: 'grams' },
      },
      required: ['calories', 'protein', 'carbs', 'fat'],
    },
    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
    notes: { type: 'STRING', description: 'A short helpful tip or warning' },
  },
  required: ['transcription', 'foodName', 'macros', 'confidence', 'notes'],
};

function setCors(req, res) {
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed && req.headers.origin === allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-token');
  }
}

// Returns { parts } for Gemini, or { error } describing what's wrong with the request
export function buildParts(body) {
  if (!body || typeof body !== 'object') return { error: 'Request body must be JSON' };
  const { type } = body;

  if (type === 'text') {
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text) return { error: 'text is required' };
    if (text.length > MAX_TEXT_CHARS) return { error: `text must be under ${MAX_TEXT_CHARS} characters` };
    return { parts: [{ text: `User described their meal: ${text}` }] };
  }

  if (type === 'image' || type === 'audio') {
    const { data, mimeType } = body;
    if (typeof data !== 'string' || !data) return { error: 'data (base64) is required' };
    if (data.length > MAX_BASE64_CHARS) return { error: 'File is too large', status: 413 };
    if (!ALLOWED_MIME[type].includes(mimeType)) return { error: `Unsupported ${type} type: ${mimeType}` };
    return {
      parts: [
        { inlineData: { data, mimeType } },
        { text: `Analyze the nutritional content of the food in this ${type === 'image' ? 'photo' : 'voice note'}.` },
      ],
    };
  }

  return { error: 'type must be "text", "image" or "audio"' };
}

// Coerces Gemini's JSON into the exact shape the app expects
export function normalizeResult(raw) {
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) && x >= 0 ? Math.round(x) : 0;
  };
  const m = raw?.macros || {};
  return {
    transcription: typeof raw?.transcription === 'string' ? raw.transcription : '',
    foodName: typeof raw?.foodName === 'string' && raw.foodName ? raw.foodName : 'Unknown food',
    macros: { calories: n(m.calories), protein: n(m.protein), carbs: n(m.carbs), fat: n(m.fat) },
    confidence: ['high', 'medium', 'low'].includes(raw?.confidence) ? raw.confidence : 'low',
    notes: typeof raw?.notes === 'string' ? raw.notes : '',
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const clientToken = process.env.APP_CLIENT_TOKEN;
  if (clientToken && req.headers['x-app-token'] !== clientToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const { parts, error, status } = buildParts(body);
  if (error) return res.status(status || 400).json({ error });

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      console.error('Gemini error', geminiRes.status, detail.slice(0, 500));
      const code = geminiRes.status === 429 ? 429 : 502;
      return res.status(code).json({ error: code === 429 ? 'Too many requests, try again shortly' : 'AI service error' });
    }

    const json = await geminiRes.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error('Unparseable Gemini output', text.slice(0, 500));
      return res.status(502).json({ error: 'AI returned an invalid response' });
    }

    return res.status(200).json(normalizeResult(parsed));
  } catch (e) {
    console.error('analyze-meal failed', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
