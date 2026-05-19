# Airu

Airu is a route-planning UI for comparing the fastest route with a healthier route based on AQI, heat, shade, and user health sensitivity.

## Local Development

```bash
npm install
npm run dev
```

The dev server runs with Webpack because the local Windows/Node 24 environment falls back to SWC WASM.

```bash
npm run type-check
npm run lint
npm run build
```

## Backend Configuration

Backend API routes are implemented under `src/app/api`. Copy `.env.example` to `.env.local` and fill Firebase Admin, browser-safe Google Maps, Google Routes/Air Quality, and Gemini values when using real providers. With these values present, route search uses Firebase session cookies, Google Places, Google Routes, Google Air Quality, Firestore route history, and Gemini streaming.

Firebase Auth must also be initialized in Firebase Console:

- Open Firebase Console > Authentication > Get started.
- Enable Sign-in method > Email/Password.
- Add `localhost` and `127.0.0.1` under Authentication > Settings > Authorized domains if needed.

To verify the current `.env.local` Firebase Auth setup without printing secrets:

```powershell
.\scripts\check-firebase-auth.ps1
```

## Implemented UI Routes

- `/` - Airu landing and route preview
- `/login` - Authentication mockup
- `/profile` - Health profile setup
- `/map` - Core map workspace with route comparison and bottom sheet
- `/result/demo-route` - Route result detail
- `/alerts` - AQI alert list
- `/history` - Route history

## Implemented API Routes

- `POST /api/auth/session` and `DELETE /api/auth/session`
- `GET /api/aqi/current`
- `POST /api/route/analyze`
- `POST /api/ai/recommend`
- `GET /api/history`
