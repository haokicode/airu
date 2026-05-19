# Backend Implementation

Status: completed for issue #1, phase 3.

Source: `AIRU-DEVELOPMENT-GUIDE.md`.

## What Was Added

- Firebase setup files: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `.env.example`, and a starter `functions/` codebase.
- Firebase SDK modules:
  - `src/lib/firebase/client.ts`
  - `src/lib/firebase/admin.ts`
- Backend utilities for auth, validation, structured logging, and API error responses.
- Google adapter modules for Routes API and Air Quality API with local mock fallback.
- Health scoring modules for segment score, AQI warning, risk label, and route comparison.
- Gemini wrapper and Bahasa Indonesia route recommendation prompt builder.
- Cloud Functions placeholders for scheduled AQI cache refresh and AQI alert fanout.

## API Routes

| Method | Endpoint | Status | Notes |
|---|---|---|---|
| `POST` | `/api/auth/session` | Implemented | Creates `__session` using Firebase Admin when configured; dev fallback is available locally. |
| `DELETE` | `/api/auth/session` | Implemented | Clears `__session`. |
| `GET` | `/api/aqi/current` | Implemented | Validates coordinates, checks Firestore cache, fetches Google AQI when configured, otherwise uses mock. |
| `POST` | `/api/route/analyze` | Implemented | Validates route input, gets route candidates, scores segments, persists to Firestore when configured. |
| `POST` | `/api/ai/recommend` | Implemented | Streams Gemini output when `GEMINI_API_KEY` exists, otherwise streams fallback text. |
| `GET` | `/api/history` | Implemented | Reads Firestore route history when configured, otherwise uses mock history. |

## Local Fallback Behavior

No secrets are committed. When Firebase Admin, Google Maps, Google Air Quality, or Gemini credentials are configured, the app uses real Firebase session cookies, Google Places, Google Routes, Google Air Quality, Firestore, and Gemini. Deterministic mock provider fallback is now opt-in via `AIRU_ALLOW_PROVIDER_MOCKS=true`; keep it disabled when validating real provider integration.

## Verification

Run:

```bash
npm run type-check
npm run lint
npm run build
node --check functions/index.js
```

`npm audit --omit=dev` currently reports 8 low-severity transitive findings through the `firebase-admin` dependency chain. The suggested fix requires `npm audit fix --force` and would install a breaking `firebase-admin@10.3.0`, so it was not applied.
