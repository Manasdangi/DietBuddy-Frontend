// Vercel serverless function: POST /api/analyze-meal
// Keeps the Gemini API key on the server so it never ships inside the app.
//
// Body (JSON):
//   { "type": "text",  "text": "2 roti and dal" }
//   { "type": "image", "data": "<base64>", "mimeType": "image/jpeg" }
//   { "type": "audio", "data": "<base64>", "mimeType": "audio/m4a" }
//   Add "mode": "roast" to any of these for a funny roast comment instead of a tip.
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

const SYSTEM_PROMPT = `You are DietBuddy, an AI nutrition assistant built for Indian users.
Analyze the user's input (a photo of food, a voice note, or a text description).

Indian food first:
- Recognise Indian dishes accurately: roti/chapati, paratha, dal, rajma, chole, sabzi, rice, biryani,
  paneer dishes, idli, dosa, poha, upma, thali components, street food, sweets, chai.
- Use Indian portion language: katori (~150 ml bowl), plate, piece, roti count, glass, scoop.
  Example: "2 roti, 1 katori dal, 1 katori bhindi sabzi".
- Account for home-style oil and ghee. A restaurant curry has more fat than home-cooked.
- Voice notes may be in Hindi, English or Hinglish. Understand all of them. Transcribe in the
  original words using Roman script (e.g. "maine do roti aur dal khayi").

Return:
- items: each food with a portion and its own macros.
- macros: totals for the whole meal (sum of items).
- foodName: a short comma separated summary of the items.
- If audio is provided, transcription is what the user said; otherwise an empty string.
- If there is no food, set foodName to "No food detected", items to [], macros to 0, confidence "low".`;

const ROAST_PROMPT = `
Roast mode is ON. In "comment", write a short, funny, brutally honest one-liner about this meal
(max 25 words), like a savage desi gym friend. Roast the food choice, never the person's body,
weight or looks. No slurs, nothing hateful. Hinglish is welcome.`;

const NORMAL_PROMPT = `
In "comment", write one short, friendly, useful tip about this meal (max 25 words).`;

const MACROS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    calories: { type: 'NUMBER' },
    protein: { type: 'NUMBER', description: 'grams' },
    carbs: { type: 'NUMBER', description: 'grams' },
    fat: { type: 'NUMBER', description: 'grams' },
  },
  required: ['calories', 'protein', 'carbs', 'fat'],
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    transcription: { type: 'STRING' },
    foodName: { type: 'STRING', description: 'Short comma separated summary of items' },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          portion: { type: 'STRING', description: 'e.g. "2 roti", "1 katori", "1 plate"' },
          macros: MACROS_SCHEMA,
        },
        required: ['name', 'portion', 'macros'],
      },
    },
    macros: MACROS_SCHEMA,
    confidence: { type: 'STRING', enum: ['high', 'medium', 'low'] },
    comment: { type: 'STRING' },
  },
  required: ['transcription', 'foodName', 'items', 'macros', 'confidence', 'comment'],
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

const MAX_ITEMS = 20;

const toMacros = (m = {}) => {
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) && x >= 0 ? Math.round(x) : 0;
  };
  return { calories: n(m.calories), protein: n(m.protein), carbs: n(m.carbs), fat: n(m.fat) };
};

// Coerces Gemini's JSON into the exact shape the app expects
export function normalizeResult(raw, { roast = false } = {}) {
  const items = Array.isArray(raw?.items)
    ? raw.items.slice(0, MAX_ITEMS).filter((i) => i && typeof i.name === 'string' && i.name).map((i) => ({
        name: i.name,
        portion: typeof i.portion === 'string' ? i.portion : '',
        macros: toMacros(i.macros),
      }))
    : [];
  const comment = typeof raw?.comment === 'string' ? raw.comment : '';
  return {
    transcription: typeof raw?.transcription === 'string' ? raw.transcription : '',
    foodName: typeof raw?.foodName === 'string' && raw.foodName ? raw.foodName : 'Unknown food',
    items,
    macros: toMacros(raw?.macros),
    confidence: ['high', 'medium', 'low'].includes(raw?.confidence) ? raw.confidence : 'low',
    // "notes" kept for older app versions
    notes: comment,
    comment,
    roast: roast && Boolean(comment),
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
  const roast = body.mode === 'roast';

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT + (roast ? ROAST_PROMPT : NORMAL_PROMPT) }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          // A little more creativity for roasts, accuracy otherwise
          temperature: roast ? 0.8 : 0.2,
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

    return res.status(200).json(normalizeResult(parsed, { roast }));
  } catch (e) {
    console.error('analyze-meal failed', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
