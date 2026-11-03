import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// URL of the deployed backend (see server/README.md), e.g. https://dietbuddy-api.vercel.app
const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
// Optional: must match APP_CLIENT_TOKEN on the server. Not a real secret (it ships in the app),
// it just blocks casual abuse of the endpoint.
const APP_TOKEN = process.env.EXPO_PUBLIC_APP_TOKEN || '';

const MAX_IMAGE_WIDTH = 1024;
const MAX_BASE64_CHARS = 4 * 1024 * 1024; // keep in sync with the server limit
const TIMEOUT_MS = 45000;

// Shrinks photos so uploads are fast and stay under the server's size limit
const prepareImage = async (uri) => {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const context = ImageManipulator.manipulate(uri);
  if (original.width > MAX_IMAGE_WIDTH) context.resize({ width: MAX_IMAGE_WIDTH });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
  return { data: saved.base64, mimeType: 'image/jpeg' };
};

// On the web, recordings are blob: URLs (webm on Chrome, mp4 on Safari) and expo-file-system can't read them
const readAudioWeb = async (uri, fallbackMime) => {
  const blob = await (await fetch(uri)).blob();
  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  // "audio/webm;codecs=opus" -> "audio/webm"
  return { data, mimeType: (blob.type || fallbackMime).split(';')[0] };
};

const buildBody = async (input, mimeType, type) => {
  if (type === 'text') return { type: 'text', text: input };
  if (type === 'image') return { type: 'image', ...(await prepareImage(input)) };
  if (type === 'audio') {
    if (Platform.OS === 'web') return { type: 'audio', ...(await readAudioWeb(input, mimeType)) };
    const data = await FileSystem.readAsStringAsync(input, { encoding: 'base64' });
    return { type: 'audio', data, mimeType };
  }
  throw new Error(`Unsupported input type: ${type}`);
};

// (uri-or-text, mimeType, 'image' | 'audio' | 'text', { roast })
// Throws on failure so callers can show an error instead of logging fake data.
export const analyzeDietInput = async (input, mimeType, type = 'image', { roast = false } = {}) => {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set. Deploy the server and add its URL to .env');
  }

  const body = await buildBody(input, mimeType, type);
  if (roast) body.mode = 'roast';
  if (body.data && body.data.length > MAX_BASE64_CHARS) {
    throw new Error(type === 'audio' ? 'Voice note is too long. Keep it under a minute.' : 'Image is too large.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/api/analyze-meal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(APP_TOKEN ? { 'x-app-token': APP_TOKEN } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
    return json;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('The request timed out. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
};
