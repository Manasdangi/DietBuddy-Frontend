# DietBuddy API

A tiny Vercel function that calls Gemini for the app, so the Gemini API key stays on the server and never ships inside the app bundle.

`POST /api/analyze-meal` takes a text description, a photo, or a voice note and returns:

```json
{
  "transcription": "",
  "foodName": "2 roti, dal",
  "macros": { "calories": 410, "protein": 14, "carbs": 62, "fat": 9 },
  "confidence": "high",
  "notes": "Good source of fibre"
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
