import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { buildParts, normalizeResult } from '../api/analyze-meal.js';

function mockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
    end() { return this; },
    setHeader(k, v) { this.headers[k] = v; },
  };
}

const realFetch = globalThis.fetch;
let lastRequest;

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key';
  delete process.env.APP_CLIENT_TOKEN;
  delete process.env.GEMINI_MODEL;
  lastRequest = null;
});
afterEach(() => { globalThis.fetch = realFetch; });

function mockGemini(payload, { ok = true, status = 200 } = {}) {
  globalThis.fetch = async (url, init) => {
    lastRequest = { url, init, body: JSON.parse(init.body) };
    return {
      ok,
      status,
      text: async () => 'error detail',
      json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] }),
    };
  };
}

test('text meal returns normalized macros and keeps key server-side', async () => {
  mockGemini({ transcription: '', foodName: '2 roti, dal', macros: { calories: 410.6, protein: 14.2, carbs: 62, fat: 9 }, confidence: 'high', notes: 'Good fibre' });
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { type: 'text', text: '2 roti and dal' } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.macros, { calories: 411, protein: 14, carbs: 62, fat: 9 });
  assert.match(lastRequest.url, /models\/gemini-flash-latest:generateContent$/);
  assert.equal(lastRequest.init.headers['x-goog-api-key'], 'test-key');
  assert.ok(!lastRequest.url.includes('test-key'), 'key must not be in the URL');
  assert.equal(lastRequest.body.generationConfig.responseMimeType, 'application/json');
});

test('image request sends inline data with mime type', async () => {
  mockGemini({ transcription: '', foodName: 'Paneer', macros: { calories: 300, protein: 18, carbs: 8, fat: 22 }, confidence: 'medium', notes: '' });
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { type: 'image', data: 'aGVsbG8=', mimeType: 'image/jpeg' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(lastRequest.body.contents[0].parts[0], { inlineData: { data: 'aGVsbG8=', mimeType: 'image/jpeg' } });
});

test('accepts a JSON string body', async () => {
  mockGemini({ transcription: '', foodName: 'Egg', macros: { calories: 78, protein: 6, carbs: 1, fat: 5 }, confidence: 'high', notes: '' });
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body: JSON.stringify({ type: 'text', text: 'egg' }) }, res);
  assert.equal(res.statusCode, 200);
});

test('rejects bad input before calling Gemini', async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; };
  for (const body of [{ type: 'text', text: '' }, { type: 'image', data: 'x', mimeType: 'image/gif' }, { type: 'video' }, null]) {
    const res = mockRes();
    await handler({ method: 'POST', headers: {}, body }, res);
    assert.equal(res.statusCode, 400, JSON.stringify(body));
  }
  assert.equal(called, false);
});

test('rejects oversized media with 413', () => {
  const big = 'a'.repeat(4 * 1024 * 1024 + 1);
  const r = buildParts({ type: 'audio', data: big, mimeType: 'audio/m4a' });
  assert.equal(r.status, 413);
});

test('rejects non-POST and missing client token', async () => {
  let res = mockRes();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 405);

  process.env.APP_CLIENT_TOKEN = 'secret';
  res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { type: 'text', text: 'egg' } }, res);
  assert.equal(res.statusCode, 401);
});

test('maps Gemini failures to clean errors', async () => {
  mockGemini({}, { ok: false, status: 429 });
  let res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { type: 'text', text: 'egg' } }, res);
  assert.equal(res.statusCode, 429);

  mockGemini({}, { ok: false, status: 500 });
  res = mockRes();
  await handler({ method: 'POST', headers: {}, body: { type: 'text', text: 'egg' } }, res);
  assert.equal(res.statusCode, 502);
});

test('normalizeResult fills gaps and clamps junk', () => {
  const r = normalizeResult({ foodName: '', macros: { calories: 'abc', protein: -5 }, confidence: 'very' });
  assert.deepEqual(r.macros, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  assert.equal(r.foodName, 'Unknown food');
  assert.equal(r.confidence, 'low');
});
