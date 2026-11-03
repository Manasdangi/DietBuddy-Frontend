# DietBuddy API

A tiny Vercel function that calls Gemini for the app, so the Gemini API key stays on the server and never ships inside the app bundle.

`POST /api/analyze-meal` takes a text description, a photo, or a voice note (Hindi, English or Hinglish). Add `"mode": "roast"` for a savage comment instead of a tip.

```json
{ "type": "text", "text": "2 roti aur 1 katori dal", "mode": "roast" }
```

Returns:

```json
{
  "transcription": "",
  "foodName": "Roti, dal",
  "items": [
    { "name": "Roti", "portion": "2 roti", "macros": { "calories": 240, "protein": 8, "carbs": 44, "fat": 4 } },
    { "name": "Dal tadka", "portion": "1 katori", "macros": { "calories": 180, "protein": 9, "carbs": 22, "fat": 6 } }
  ],
  "macros": { "calories": 420, "protein": 17, "carbs": 66, "fat": 10 },
  "confidence": "high",
  "comment": "Ghar ka khana, solid. But 17g protein? Your biceps filed a complaint.",
  "notes": "(same as comment, for older app versions)",
  "roast": true
}
```

## Deploy

1. In Vercel, import this repo and set **Root Directory** to `server`.
2. Add environment variables:
   - `GEMINI_API_KEY` (required): from Google AI Studio
   - `GEMINI_MODEL` (optional): defaults to `gemini-flash-latest`
   - `APP_CLIENT_TOKEN` (optional): any random string; the app must send the same value
   - `ALLOWED_ORIGIN` (optional): only needed for the Expo web build
3. Deploy, then in the app's `.env` set `EXPO_PUBLIC_API_URL` to the deployment URL (and `EXPO_PUBLIC_APP_TOKEN` if you set a token).

## Test

```bash
cd server && npm test
```

## Before a public launch

`APP_CLIENT_TOKEN` only stops casual abuse, since anything inside the app can be extracted. For real protection, add Firebase Auth (or App Check) and verify the user's token here, plus per-user rate limiting (e.g. Upstash Redis), so one person can't drain your Gemini quota.
