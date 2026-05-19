# Airu — Fullstack Web Development Guide
> "Air" (udara) + "ru" (route) — Rute tercepat bukan selalu rute terbaik.
> Stack: Next.js · Google Maps Platform · Google Air Quality API · Gemini API · Firebase · Google Cloud Run

---

## Daftar Tahapan

1. [Planning & Architecture](#1-planning--architecture)
2. [UI/UX Design](#2-uiux-design)
3. [Backend Development](#3-backend-development)
4. [Frontend Development](#4-frontend-development)
5. [Testing](#5-testing)
6. [CI/CD Pipeline](#6-cicd-pipeline)
7. [Infrastruktur & Deployment](#7-infrastruktur--deployment)
8. [Security Hardening](#8-security-hardening)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Production Launch & Iterasi](#10-production-launch--iterasi)

---

## 1. Planning & Architecture

> Requirements, tech stack, system design

### Aktivitas

- [x] Definisikan user stories & functional requirements
- [x] Pilih tech stack (frontend, backend, database, cloud)
- [x] Buat system design (API design, arsitektur layanan)
- [x] Estimasi waktu & bagi ke milestones

---

### User Stories

| ID | As a... | I want to... | So that... | Priority |
|---|---|---|---|---|
| US-001 | Pejalan kaki | input asal & tujuan lalu lihat 2 rute | saya bisa bandingkan rute tercepat vs sehat | Must |
| US-002 | Penderita asma | set kondisi kesehatan di profil | rekomendasi disesuaikan dengan sensitivitas saya | Must |
| US-003 | Pengguna umum | lihat skor udara di tiap segmen rute | saya tahu persis titik mana yang berbahaya | Must |
| US-004 | Orang tua | aktifkan "mode keluarga" | tahu apakah rute aman untuk anak kecil | Should |
| US-005 | Komuter | terima push notification saat AQI memburuk | bisa ubah rencana perjalanan lebih awal | Should |
| US-006 | Semua pengguna | baca rekomendasi AI dalam Bahasa Indonesia | memahami alasan rute, bukan hanya angka | Must |
| US-007 | Semua pengguna | lihat riwayat rute yang pernah dilalui | bisa pantau paparan polusi pribadi dari waktu ke waktu | Could |
| US-008 | Pesepeda | pilih mode sepeda | rute yang dihasilkan sesuai jalur sepeda | Should |

---

### Functional Requirements

```
FR-01  Pengguna dapat input asal & tujuan via Places Autocomplete atau GPS
FR-02  Sistem menampilkan minimal 2 rute alternatif (tercepat & terpilih sehat)
FR-03  Setiap rute memiliki Health Score 0–100 berdasarkan AQI, shade, heat
FR-04  Polyline di peta diwarnai per segmen (hijau/kuning/merah) sesuai skor
FR-05  Gemini menghasilkan rekomendasi teks dalam Bahasa Indonesia (streaming)
FR-06  Pengguna dapat menyimpan profil kondisi kesehatan
FR-07  FCM push notification dikirim saat AQI lokasi pengguna melebihi threshold
FR-08  Riwayat rute tersimpan di Firestore dan bisa diakses kembali
FR-09  Aplikasi bisa diinstall sebagai PWA di mobile
FR-10  AQI cache di Firestore dengan TTL 30 menit untuk hemat API call
```

### Non-Functional Requirements

```
NFR-01  Response API route analysis < 5 detik (termasuk scoring)
NFR-02  Availability 99.5% (Cloud Run SLA)
NFR-03  Aplikasi responsif: mobile-first, breakpoint 375px / 768px / 1280px
NFR-04  Semua secret harus dikelola via Google Secret Manager, tidak di repo
NFR-05  Firestore Security Rules: user hanya bisa akses data miliknya sendiri
NFR-06  AQI data tidak lebih dari 30 menit lama (cache TTL enforcement)
```

---

### Tech Stack

| Layer | Teknologi | Versi | Alasan |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 14.x | SSR + API routes dalam satu project |
| **Language** | TypeScript | 5.x | Type safety di seluruh codebase |
| **Styling** | Tailwind CSS | 3.x | Utility-first, cepat untuk iterasi |
| **Animation** | Framer Motion | 11.x | Smooth bottom sheet & transitions |
| **Maps** | @react-google-maps/api | latest | Official Google Maps React wrapper |
| **AI** | @google/generative-ai | latest | Gemini 2.0 Flash |
| **Auth & DB** | Firebase (Auth + Firestore + FCM) | 10.x | Full Google ecosystem |
| **Admin SDK** | firebase-admin | 12.x | Server-side Firestore + FCM |
| **Cache key** | geofire-common | 6.x | Geohash untuk AQI cache |
| **Deploy** | Google Cloud Run | — | Serverless container, auto-scale to zero |
| **CI/CD** | Google Cloud Build | — | Trigger otomatis dari GitHub push |
| **Registry** | Google Artifact Registry | — | Simpan Docker image |
| **Secrets** | Google Secret Manager | — | Kelola API keys server-side |

---

### System Design — Arsitektur Layanan

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (PWA)                          │
│  Next.js React · @react-google-maps/api · Firebase SDK  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│           Google Cloud Run (Next.js container)           │
│                                                          │
│  API Routes:                                             │
│  POST /api/route/analyze   → score routes               │
│  POST /api/ai/recommend    → Gemini streaming           │
│  GET  /api/aqi/current     → AQI with cache             │
│  POST /api/auth/session    → session cookie             │
└───────────┬───────────────────────────┬─────────────────┘
            │                           │
┌───────────▼──────────┐  ┌────────────▼────────────────┐
│  Google APIs         │  │  Firebase                    │
│                      │  │                              │
│  - Routes API        │  │  Authentication              │
│  - Air Quality API   │  │  Firestore (NoSQL)           │
│  - Places API        │  │  Cloud Messaging (FCM)       │
│  - Gemini API        │  │  Cloud Functions (scheduled) │
│  - Maps JS API       │  │                              │
└──────────────────────┘  └──────────────────────────────┘
```

---

### Firestore Collections (ERD equivalent)

```
/users/{uid}
  ├── email, displayName, photoURL
  ├── travelMode: "WALK" | "BICYCLE"
  ├── conditions: string[]
  ├── fcmToken, alertEnabled, alertAQIThreshold
  └── createdAt

/routes/{routeId}
  ├── userId, origin, destination, travelMode
  ├── fastest: { durationSeconds, healthScore, avgAQI, encodedPolyline, segments[] }
  ├── healthiest: { durationSeconds, healthScore, avgAQI, encodedPolyline, segments[] }
  ├── aiRecommendation: string | null
  └── createdAt

/aqi_cache/{geohash6}
  ├── aqi, pm25, pm10, category
  └── fetchedAt  ← TTL check: stale if > 30 menit

/alerts/{alertId}
  ├── userId, lat, lng, aqi, message
  ├── isRead: boolean
  └── sentAt
```

---

### API Design (OpenAPI Summary)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/route/analyze` | 🔒 Required | Fetch & score 2 routes dari Google |
| `POST` | `/api/ai/recommend` | 🔒 Required | Streaming Gemini recommendation |
| `GET` | `/api/aqi/current` | 🔒 Required | AQI for lat/lng with Firestore cache |
| `POST` | `/api/auth/session` | ❌ Public | Set Firebase session cookie |
| `DELETE` | `/api/auth/session` | ❌ Public | Clear session cookie (logout) |

---

### Health Score Algorithm

```
HealthScore(segment) =
  (AQI_score)        × 0.40   // AQI 0–500 → normalized 0–100
  + (shade_score)    × 0.25   // road type → proxy shade value
  + (heat_score)     × 0.20   // heat index → normalized 0–100
  + (greenery_score) × 0.15   // OSM green area proximity

RouteScore = weighted average of all segment scores
```

---

### Milestones & Estimasi Waktu

| Milestone | Scope | Target |
|---|---|---|
| M1 — Foundation | Project setup, Firebase, env, auth | Hari 1 |
| M2 — Map & Search | Google Maps, Places Autocomplete, GPS | Hari 1–2 |
| M3 — Core Analysis | Routes API + Air Quality API + scoring | Hari 2–3 |
| M4 — Result UI | RouteCompare, polyline, Gemini stream | Hari 3 |
| M5 — Alerts & FCM | Cloud Functions, push notification | Hari 4 |
| M6 — Polish & Deploy | PWA, responsif, Cloud Run, Cloud Build | Hari 4 |

---

### Tools & Deliverables Fase 1

| Tool | Digunakan untuk |
|---|---|
| **PRD-Airu.md** | Requirements, schema, API spec lengkap |
| **Draw.io / Excalidraw** | System architecture diagram |
| **Firestore Console** | Validasi schema collections |
| **Google Cloud Console** | Enable APIs, setup project |
| **Notion / Linear** | Task tracking per milestone |

---

## 2. UI/UX Design

> Wireframe, prototype, design system

### Aktivitas

- [ ] Buat wireframe low-fidelity setiap halaman
- [ ] Design high-fidelity mockup & interactive prototype
- [ ] Tentukan design tokens: warna, tipografi, spacing, komponen
- [ ] Validasi dengan user testing / feedback stakeholder

---

### Halaman yang Perlu Didesain

| Halaman | Route | Prioritas |
|---|---|---|
| Landing Page | `/` | Must |
| Login | `/login` | Must |
| Health Profile Setup | `/profile` | Must |
| **Map (Core)** | `/map` | Must — desain paling kritis |
| Route Result Detail | `/result/:id` | Must |
| Alert List | `/alerts` | Should |
| Route History | `/history` | Should |

---

### Design Tokens

```css
/* ── Color: Health Status ─────────────────── */
--color-healthy:       #1D9E75;   /* AQI baik, score ≥ 70 */
--color-healthy-light: #E1F5EE;
--color-caution:       #BA7517;   /* AQI sedang, score 40–69 */
--color-caution-light: #FAEEDA;
--color-danger:        #E24B4A;   /* AQI tidak sehat, score < 40 */
--color-danger-light:  #FAEBEB;

/* ── Color: Brand ─────────────────────────── */
--color-brand-primary: #1D9E75;
--color-brand-dark:    #0F6E56;

/* ── Color: Neutral ───────────────────────── */
--color-bg:            #F9F9F7;
--color-surface:       #FFFFFF;
--color-border:        #E8E6DF;
--color-text-primary:  #2C2C2A;
--color-text-muted:    #6B6B66;

/* ── Typography ───────────────────────────── */
--font-sans:    'Inter', sans-serif;
--font-size-xs: 11px;
--font-size-sm: 13px;
--font-size-md: 15px;
--font-size-lg: 18px;
--font-size-xl: 24px;
--font-size-2xl:32px;

/* ── Spacing ──────────────────────────────── */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;

/* ── Border Radius ────────────────────────── */
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   16px;
--radius-full: 9999px;
```

---

### AQI Color System

| AQI | Warna | Hex | Label |
|---|---|---|---|
| 0–50 | Hijau | `#1D9E75` | Baik |
| 51–100 | Hijau-kuning | `#639922` | Sedang |
| 101–150 | Amber | `#BA7517` | Tidak Sehat (Sensitif) |
| 151–200 | Merah | `#E24B4A` | Tidak Sehat |
| 201–300 | Merah tua | `#A32D2D` | Sangat Tidak Sehat |
| 300+ | Ungu gelap | `#501313` | Berbahaya |

---

### Komponen UI Utama

```
Primitives:
  Button          — primary, secondary, ghost, danger
  Badge           — health status (Sehat / Cukup / Berisiko)
  AQIBadge        — color-coded AQI number chip
  Card            — surface container
  ProgressBar     — Health Score visualization
  BottomSheet     — collapsed / mid / expanded (drag gesture)
  Spinner         — loading state

Feature Components:
  SearchBar       — dual input (origin + destination) + GPS button
  RouteCard       — single route summary (duration, distance, score)
  RouteCompare    — side-by-side fastest vs healthiest
  HealthScoreBar  — gradient bar 0–100 with color transitions
  AIRecommendation— typewriter streaming text from Gemini
  MapContainer    — full-screen Google Maps wrapper
  RoutePolyline   — segmented colored polyline on map
  AQIMarker       — hotspot marker for AQI > 100
  ConditionSelector— health condition multi-select cards
```

---

### UX Pattern — Bottom Sheet (Mobile Core)

```
State 1 — Collapsed (default)
  ┌────────────────────────────┐
  │  [🔍 Cari tujuan...]       │  ← 56px, always visible
  └────────────────────────────┘

State 2 — Mid (after route calculated)
  ┌────────────────────────────┐
  │  Drag handle ────────      │
  │  Rute Tercepat  [42] 🔴    │  ← 45vh
  │  Rute Sehat     [81] 🟢    │
  └────────────────────────────┘

State 3 — Expanded (user taps route card)
  ┌────────────────────────────┐
  │  Detail skor per segmen    │
  │  AQI breakdown             │  ← 85vh
  │  Rekomendasi AI (stream)   │
  │  [Mulai Rute Sehat]        │
  └────────────────────────────┘
```

---

### Tools & Deliverables Fase 2

| Tool | Digunakan untuk |
|---|---|
| **Figma** | Wireframe lo-fi → mockup hi-fi → prototype |
| **shadcn/ui** | Base component library (Button, Card, dll) |
| **Tailwind CSS** | Implementasi design tokens langsung di kode |
| **Storybook** | Dokumentasi & preview komponen terisolasi |

---

## 3. Backend Development

> API, database, auth, business logic

### Aktivitas

- [ ] Setup project structure + dependency management
- [ ] Setup Firebase (Auth, Firestore, FCM, Cloud Functions)
- [ ] Implementasi Firestore Security Rules
- [ ] Implementasi REST API endpoints
- [ ] Implementasi autentikasi (Firebase session cookie)
- [ ] Input validation, error handling, logging

---

### Setup Project

```bash
# 1. Init Next.js project
npx create-next-app@latest airu --typescript --tailwind --app --src-dir

# 2. Install semua dependencies
npm install \
  @google/generative-ai \
  firebase \
  firebase-admin \
  @react-google-maps/api \
  @googlemaps/polyline-codec \
  geofire-common \
  framer-motion \
  lucide-react \
  zod \
  @tanstack/react-query

# 3. Dev dependencies
npm install -D \
  @types/google.maps \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  playwright
```

---

### Firebase Setup (lib/firebase/)

```typescript
// lib/firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app  = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth      = getAuth(app);
export const db        = getFirestore(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
```

```typescript
// lib/firebase/admin.ts  — server-side only
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";

const adminApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });

export const adminDb        = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);
export const adminAuth      = getAuth(adminApp);
```

---

### Firestore Security Rules

```javascript
// Paste ke Firebase Console → Firestore → Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth()        { return request.auth != null; }
    function isOwner(uid)    { return isAuth() && request.auth.uid == uid; }
    function getSession(sid) {
      return get(/databases/$(database)/documents/routes/$(sid)).data;
    }

    match /users/{uid} {
      allow read, write: if isOwner(uid);
    }

    match /routes/{routeId} {
      allow read, write: if isAuth() && isOwner(resource.data.userId);
      allow create:      if isAuth() && isOwner(request.resource.data.userId);
    }

    match /aqi_cache/{geohash} {
      allow read:  if isAuth();
      allow write: if false;   // Cloud Functions only
    }

    match /alerts/{alertId} {
      allow read, update: if isAuth() && isOwner(resource.data.userId);
      allow write:        if false;   // Cloud Functions only
    }
  }
}
```

---

### API Endpoints Implementation

#### `POST /api/route/analyze`

```typescript
// app/api/route/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoutes }      from "@/lib/google-maps/routes";
import { getAQIWithCache } from "@/lib/google-maps/aqi";
import { calculateHealthScore } from "@/lib/scoring/health-score";
import { adminDb }         from "@/lib/firebase/admin";
import { adminAuth }       from "@/lib/firebase/admin";

const schema = z.object({
  origin:      z.object({ lat: z.number(), lng: z.number(), address: z.string() }),
  destination: z.object({ lat: z.number(), lng: z.number(), address: z.string() }),
  travelMode:  z.enum(["WALK", "BICYCLE"]),
  conditions:  z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = req.cookies.get("__session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = await adminAuth.verifySessionCookie(session);

    // 2. Validate input
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { origin, destination, travelMode, conditions } = parsed.data;

    // 3. Fetch routes from Google Routes API
    const routes = await getRoutes(origin, destination, travelMode);
    if (!routes || routes.length < 1) {
      return NextResponse.json({ error: "No routes found" }, { status: 404 });
    }

    // 4. Score each route
    const scoredRoutes = await Promise.all(
      routes.slice(0, 2).map(async (route) => {
        const segments = await scoreRouteSegments(route, conditions);
        const avgScore = segments.reduce((s, seg) => s + seg.healthScore, 0) / segments.length;
        return { ...route, segments, healthScore: Math.round(avgScore) };
      })
    );

    // 5. Identify fastest vs healthiest
    const fastest    = scoredRoutes.reduce((a, b) => a.durationSeconds < b.durationSeconds ? a : b);
    const healthiest = scoredRoutes.reduce((a, b) => a.healthScore    > b.healthScore    ? a : b);

    // 6. Save to Firestore
    const docRef = adminDb.collection("routes").doc();
    await docRef.set({
      userId: decoded.uid, origin, destination, travelMode,
      fastest, healthiest, aiRecommendation: null,
      createdAt: new Date(),
    });

    return NextResponse.json({ routeId: docRef.id, fastest, healthiest });
  } catch (err) {
    console.error("[route/analyze]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

#### `POST /api/ai/recommend`

```typescript
// app/api/ai/recommend/route.ts
import { NextRequest } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { buildRecommendationPrompt } from "@/lib/prompts/route-recommendation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const model = getGeminiModel();
  const prompt = buildRecommendationPrompt(body);

  // Stream Gemini response
  const result = await model.generateContentStream(prompt);
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

---

### Health Score Algorithm

```typescript
// lib/scoring/health-score.ts

const ROAD_SHADE_MAP: Record<string, number> = {
  footway:     85,   // park path
  path:        85,
  residential: 65,
  tertiary:    50,
  secondary:   35,
  primary:     15,
  trunk:       10,
  motorway:    5,
};

const CONDITION_THRESHOLDS: Record<string, number> = {
  normal:       150,
  asthma:       75,
  elderly:      75,
  pregnant:     75,
  child:        75,
  active_sport: 100,
};

export function calculateSegmentScore(
  aqi:      number,
  roadType: string,
  heatIndex: number,
  greenProximity: number
): number {
  const aqiScore      = Math.max(0, Math.min(100, 100 - aqi));
  const shadeScore    = ROAD_SHADE_MAP[roadType] ?? 40;
  const heatScore     = Math.max(0, Math.min(100, 100 - (heatIndex - 27) * 3));
  const greenScore    = greenProximity;

  return (
    aqiScore   * 0.40 +
    shadeScore * 0.25 +
    heatScore  * 0.20 +
    greenScore * 0.15
  );
}

export function getAQIWarning(aqi: number, conditions: string[]): string | null {
  const threshold = conditions.reduce((min, c) => {
    return Math.min(min, CONDITION_THRESHOLDS[c] ?? 150);
  }, 150);
  return aqi > threshold ? `AQI ${aqi} melebihi batas aman untuk kondisi kamu` : null;
}
```

---

### Error Handling Convention

```typescript
// Semua API route mengikuti format ini:
// Success:
{ data: T }

// Error:
{ error: string, code?: string, details?: unknown }

// HTTP Status codes:
// 200 — OK
// 400 — Bad Request (validasi Zod gagal)
// 401 — Unauthorized (tidak ada session cookie)
// 403 — Forbidden (akses data milik user lain)
// 404 — Not Found
// 429 — Too Many Requests (rate limit)
// 500 — Internal Server Error
```

---

### Logging Convention

```typescript
// Gunakan structured logging (JSON) agar mudah di-query di Cloud Logging
console.log(JSON.stringify({
  level:     "info",
  service:   "route-analyze",
  userId:    decoded.uid,
  duration:  Date.now() - start,
  routeId:   docRef.id,
  message:   "Route analysis completed",
}));

console.error(JSON.stringify({
  level:   "error",
  service: "route-analyze",
  error:   err instanceof Error ? err.message : String(err),
  stack:   err instanceof Error ? err.stack : undefined,
}));
```

---

## 4. Frontend Development

> UI implementation, state, integrasi API

### Aktivitas

- [x] Setup framework + routing + state management
- [x] Implementasi komponen UI sesuai design system
- [x] Integrasi API (TanStack Query + Fetch)
- [x] Client-side validation & form handling (React Hook Form + Zod)
- [x] Responsif & accessibility (a11y)

---

### State Management Strategy

```
Global state (Zustand):
  - authStore     → user, isLoading, isLoggedIn
  - profileStore  → conditions, travelMode, fcmToken
  - mapStore      → origin, destination, activeRoute

Server state (TanStack Query):
  - useRouteAnalysis  → POST /api/route/analyze
  - useAIRecommend    → POST /api/ai/recommend (streaming)
  - useAQICurrent     → GET /api/aqi/current
  - useHistory        → GET route history from Firestore

Local state (useState / useReducer):
  - bottomSheetState  → 'collapsed' | 'mid' | 'expanded'
  - selectedRoute     → 'fastest' | 'healthiest'
  - isRecording       → GPS loading state
```

---

### Custom Hooks

```typescript
// hooks/useRouteAnalysis.ts
export function useRouteAnalysis() {
  return useMutation({
    mutationFn: async (params: RouteAnalysisParams) => {
      const res = await fetch("/api/route/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<RouteAnalysisResult>;
    },
  });
}

// hooks/useStreamingAI.ts
export function useStreamingAI() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (body: AIRecommendBody) => {
    setLoading(true);
    setText("");
    const res = await fetch("/api/ai/recommend", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      setText(prev => prev + decoder.decode(value));
    }
    setLoading(false);
  };

  return { text, loading, generate };
}

// hooks/useUserLocation.ts
export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung GPS");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setError(err.message)
    );
  };

  return { location, error, requestLocation };
}
```

---

### Input Validation (Zod + React Hook Form)

```typescript
// schemas/route-form.ts
import { z } from "zod";

export const routeFormSchema = z.object({
  origin: z.object({
    address: z.string().min(3, "Masukkan lokasi asal"),
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    address: z.string().min(3, "Masukkan lokasi tujuan"),
    lat: z.number(),
    lng: z.number(),
  }),
  travelMode: z.enum(["WALK", "BICYCLE"]),
});

export type RouteFormValues = z.infer<typeof routeFormSchema>;
```

---

### Responsif Breakpoints

```typescript
// Tailwind breakpoints yang digunakan:
// (default)  → mobile  375px+   — bottom sheet, full-screen map
// sm:        → tablet  640px+   — sidebar mulai muncul
// lg:        → desktop 1024px+  — split view: map kiri, panel kanan

// Contoh penggunaan di komponen:
<div className="
  fixed bottom-0 w-full          // mobile: bottom sheet
  lg:relative lg:w-96 lg:h-full  // desktop: sidebar kanan
">
```

---

### Accessibility (a11y) Checklist

```
- [ ] Semua button punya aria-label yang deskriptif
- [ ] AQI color tidak hanya bergantung warna — tambahkan teks label
- [ ] Focus visible di semua interactive element (ring focus)
- [ ] Bottom sheet dapat di-trigger dengan keyboard (Escape untuk tutup)
- [ ] Google Maps: tambahkan aria-label di container map
- [ ] Loading state menggunakan aria-live="polite"
- [ ] Form error menggunakan aria-describedby
```

---

## 5. Testing

> Unit, integration, E2E testing

### Lapisan Testing

| Layer | Scope | Tool | Target Coverage |
|---|---|---|---|
| Unit | Fungsi & komponen terisolasi | Vitest + Testing Library | ≥ 80% |
| Integration | API endpoints, Firestore | Vitest + supertest | Semua endpoint |
| E2E | Alur user dari browser nyata | Playwright | 5 alur kritis |
| Load | Performa di bawah beban | k6 | < 5 detik response |

---

### Unit Tests

```typescript
// __tests__/lib/health-score.test.ts
import { describe, it, expect } from "vitest";
import { calculateSegmentScore, getAQIWarning } from "@/lib/scoring/health-score";

describe("calculateSegmentScore", () => {
  it("returns high score for clean air and shaded path", () => {
    const score = calculateSegmentScore(20, "footway", 28, 80);
    expect(score).toBeGreaterThan(70);
  });

  it("returns low score for polluted highway", () => {
    const score = calculateSegmentScore(180, "primary", 38, 10);
    expect(score).toBeLessThan(40);
  });

  it("clamps AQI score to 0 when AQI > 100", () => {
    const score = calculateSegmentScore(500, "footway", 25, 90);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("getAQIWarning", () => {
  it("returns warning for asthma user at AQI 100", () => {
    const warning = getAQIWarning(100, ["asthma"]);
    expect(warning).toBeTruthy();
  });

  it("returns null for normal user at AQI 100", () => {
    const warning = getAQIWarning(100, ["normal"]);
    expect(warning).toBeNull();
  });
});
```

```typescript
// __tests__/components/HealthScoreBar.test.tsx
import { render, screen } from "@testing-library/react";
import { HealthScoreBar } from "@/components/result/HealthScoreBar";

describe("HealthScoreBar", () => {
  it("renders score correctly", () => {
    render(<HealthScoreBar score={72} />);
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("shows green color for score >= 70", () => {
    const { container } = render(<HealthScoreBar score={80} />);
    expect(container.firstChild).toHaveClass("bg-healthy");
  });

  it("shows red color for score < 40", () => {
    const { container } = render(<HealthScoreBar score={25} />);
    expect(container.firstChild).toHaveClass("bg-danger");
  });
});
```

---

### Integration Tests

```typescript
// __tests__/api/aqi.test.ts
import { describe, it, expect, vi } from "vitest";

// Mock Google Air Quality API
vi.mock("@/lib/google-maps/aqi", () => ({
  getAQIWithCache: vi.fn().mockResolvedValue({ aqi: 80, pm25: 35, category: "Sedang" }),
}));

describe("GET /api/aqi/current", () => {
  it("returns AQI data for valid coordinates", async () => {
    const res = await fetch("/api/aqi/current?lat=-6.20&lng=106.84");
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty("aqi");
    expect(data.aqi).toBeGreaterThanOrEqual(0);
  });

  it("returns 400 for missing coordinates", async () => {
    const res = await fetch("/api/aqi/current");
    expect(res.status).toBe(400);
  });
});
```

---

### E2E Tests (Playwright)

```typescript
// e2e/route-search.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Route Search Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login via test account
    await page.goto("/login");
    await page.fill('[name="email"]', process.env.TEST_EMAIL!);
    await page.fill('[name="password"]', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    await page.waitForURL("/map");
  });

  test("should show route comparison after search", async ({ page }) => {
    // Input origin
    await page.fill('[placeholder="Dari mana?"]', "Monas, Jakarta");
    await page.click('[data-testid="origin-suggestion-0"]');

    // Input destination
    await page.fill('[placeholder="Mau ke mana?"]', "Blok M");
    await page.click('[data-testid="destination-suggestion-0"]');

    // Trigger search
    await page.click('[data-testid="search-route-btn"]');
    await page.waitForSelector('[data-testid="route-compare"]', { timeout: 10000 });

    // Verify both routes shown
    expect(await page.locator('[data-testid="fastest-route"]').isVisible()).toBe(true);
    expect(await page.locator('[data-testid="healthiest-route"]').isVisible()).toBe(true);
  });

  test("should display AI recommendation", async ({ page }) => {
    // ... search flow ...
    await page.waitForSelector('[data-testid="ai-recommendation"]', { timeout: 15000 });
    const text = await page.locator('[data-testid="ai-recommendation"]').textContent();
    expect(text?.length).toBeGreaterThan(20);
  });
});
```

---

### Load Test (k6)

```javascript
// k6/route-analyze.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },   // ramp up
    { duration: "60s", target: 50 },   // hold
    { duration: "30s", target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"],  // 95% request < 5 detik
    http_req_failed:   ["rate<0.01"],   // error rate < 1%
  },
};

export default function () {
  const res = http.post(
    "https://airu.app/api/route/analyze",
    JSON.stringify({
      origin:      { lat: -6.2088, lng: 106.8456, address: "Monas" },
      destination: { lat: -6.2615, lng: 106.7816, address: "Blok M" },
      travelMode:  "WALK",
      conditions:  [],
    }),
    { headers: { "Content-Type": "application/json", "Cookie": `__session=${__ENV.SESSION}` } }
  );
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
```

---

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles:  ["./vitest.setup.ts"],
    globals:     true,
    coverage: {
      reporter: ["text", "lcov"],
      exclude:  ["node_modules", ".next", "e2e"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

---

## 6. CI/CD Pipeline

> Otomasi build, test, deploy

### Pipeline Flow

```
GitHub push ke main branch
          │
          ▼
┌─────────────────────────────────────────────┐
│         Google Cloud Build                   │
│                                             │
│  Step 1: Install dependencies               │
│  Step 2: Lint (ESLint + TypeScript check)   │
│  Step 3: Unit + Integration tests (Vitest)  │
│  Step 4: Build Docker image                 │
│  Step 5: Push ke Artifact Registry          │
│  Step 6: Deploy ke Cloud Run (Staging)      │
│  Step 7: E2E tests vs Staging (Playwright)  │
│  Step 8: Deploy ke Cloud Run (Production)   │
└─────────────────────────────────────────────┘
```

---

### `cloudbuild.yaml`

```yaml
substitutions:
  _REGION:  asia-southeast2
  _REPO:    airu
  _SERVICE: airu-app
  _SERVICE_STAGING: airu-app-staging

steps:
  # 1. Install dependencies
  - name: "node:20-alpine"
    entrypoint: npm
    args: ["ci"]

  # 2. Lint
  - name: "node:20-alpine"
    entrypoint: npm
    args: ["run", "lint"]

  # 3. Type check
  - name: "node:20-alpine"
    entrypoint: npm
    args: ["run", "type-check"]

  # 4. Unit + Integration tests
  - name: "node:20-alpine"
    entrypoint: npm
    args: ["run", "test:ci"]

  # 5. Build Docker image
  - name: "gcr.io/cloud-builders/docker"
    args:
      - build
      - --tag
      - "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/app:$COMMIT_SHA"
      - --build-arg
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${_NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - --build-arg
      - NEXT_PUBLIC_FIREBASE_API_KEY=${_NEXT_PUBLIC_FIREBASE_API_KEY}
      - --build-arg
      - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
      - --build-arg
      - NEXT_PUBLIC_FIREBASE_PROJECT_ID=${_NEXT_PUBLIC_FIREBASE_PROJECT_ID}
      - --build-arg
      - NEXT_PUBLIC_FIREBASE_APP_ID=${_NEXT_PUBLIC_FIREBASE_APP_ID}
      - .

  # 6. Push image
  - name: "gcr.io/cloud-builders/docker"
    args:
      - push
      - "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/app:$COMMIT_SHA"

  # 7. Deploy ke Staging
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: gcloud
    args:
      - run
      - deploy
      - ${_SERVICE_STAGING}
      - --image=${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/app:$COMMIT_SHA
      - --region=${_REGION}
      - --platform=managed
      - --allow-unauthenticated
      - --port=3000
      - --memory=512Mi
      - --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest
      - --set-secrets=GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest
      - --set-secrets=FIREBASE_ADMIN_PRIVATE_KEY=FIREBASE_ADMIN_PRIVATE_KEY:latest
      - --set-secrets=FIREBASE_ADMIN_CLIENT_EMAIL=FIREBASE_ADMIN_CLIENT_EMAIL:latest
      - --set-secrets=FIREBASE_ADMIN_PROJECT_ID=FIREBASE_ADMIN_PROJECT_ID:latest

  # 8. E2E test vs Staging
  - name: "mcr.microsoft.com/playwright:v1.44.0-jammy"
    entrypoint: npx
    env:
      - "PLAYWRIGHT_BASE_URL=https://airu-app-staging-xxxxxxxx-et.a.run.app"
    args: ["playwright", "test", "--project=chromium"]

  # 9. Deploy ke Production
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: gcloud
    args:
      - run
      - deploy
      - ${_SERVICE}
      - --image=${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/app:$COMMIT_SHA
      - --region=${_REGION}
      - --platform=managed
      - --allow-unauthenticated
      - --port=3000
      - --memory=512Mi
      - --min-instances=0
      - --max-instances=10
      - --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest
      - --set-secrets=GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest
      - --set-secrets=FIREBASE_ADMIN_PRIVATE_KEY=FIREBASE_ADMIN_PRIVATE_KEY:latest
      - --set-secrets=FIREBASE_ADMIN_CLIENT_EMAIL=FIREBASE_ADMIN_CLIENT_EMAIL:latest
      - --set-secrets=FIREBASE_ADMIN_PROJECT_ID=FIREBASE_ADMIN_PROJECT_ID:latest

images:
  - "${_REGION}-docker.pkg.dev/$PROJECT_ID/${_REPO}/app:$COMMIT_SHA"
```

---

### `package.json` scripts

```json
{
  "scripts": {
    "dev":        "next dev",
    "build":      "next build",
    "start":      "next start",
    "lint":       "next lint",
    "type-check": "tsc --noEmit",
    "test":       "vitest",
    "test:ci":    "vitest run --coverage",
    "test:e2e":   "playwright test",
    "test:load":  "k6 run k6/route-analyze.js"
  }
}
```

---

## 7. Infrastruktur & Deployment

> Cloud provisioning, container, scaling

### Aktivitas

- [ ] Containerisasi dengan Docker (multi-stage build)
- [ ] Setup Google Cloud Run + Artifact Registry
- [ ] Setup Google Secret Manager untuk semua API keys
- [ ] Setup Firebase Cloud Functions (AQI cache refresh + FCM alerts)
- [ ] Setup domain & SSL/TLS (Cloud Run auto-provision)

---

### One-time GCP Setup

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs yang dibutuhkan
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com

# Buat Artifact Registry repository
gcloud artifacts repositories create airu \
  --repository-format=docker \
  --location=asia-southeast2 \
  --description="Airu Docker images"

# Simpan secrets ke Secret Manager
echo -n "your_gemini_api_key"       | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "your_maps_api_key"         | gcloud secrets create GOOGLE_MAPS_API_KEY --data-file=-
echo -n "your_firebase_project_id"  | gcloud secrets create FIREBASE_ADMIN_PROJECT_ID --data-file=-
echo -n "your_client_email"         | gcloud secrets create FIREBASE_ADMIN_CLIENT_EMAIL --data-file=-
gcloud secrets create FIREBASE_ADMIN_PRIVATE_KEY --data-file=firebase-key.json

# Grant Cloud Build access ke Secret Manager
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_BUILD_SA@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

### Dockerfile (Multi-stage)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

---

### Firebase Cloud Functions

```typescript
// functions/src/aqi-cache-refresh.ts
// Dijalankan setiap 30 menit via Cloud Scheduler
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";

export const aqiCacheRefresh = onSchedule("every 30 minutes", async () => {
  const db = getFirestore();
  const staleTime = new Date(Date.now() - 30 * 60 * 1000);

  const staleDocs = await db.collection("aqi_cache")
    .where("fetchedAt", "<", staleTime)
    .get();

  const refreshPromises = staleDocs.docs.map(async (doc) => {
    const fresh = await fetchGoogleAQI(doc.data().lat, doc.data().lng);
    return doc.ref.update({ ...fresh, fetchedAt: new Date() });
  });

  await Promise.all(refreshPromises);
  console.log(`Refreshed ${staleDocs.size} AQI cache entries`);
});
```

```typescript
// functions/src/aqi-alert-notify.ts
// Trigger saat AQI cache diupdate
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getMessaging } from "firebase-admin/messaging";

export const aqiAlertNotify = onDocumentUpdated("aqi_cache/{geohash}", async (event) => {
  const after  = event.data?.after.data();
  const before = event.data?.before.data();
  if (!after || !before) return;

  // Hanya kirim notif jika AQI naik signifikan (> 20 poin)
  if (after.aqi - before.aqi < 20) return;

  const db = getFirestore();
  const usersNearby = await db.collection("users")
    .where("alertEnabled", "==", true)
    .where("alertAQIThreshold", "<=", after.aqi)
    .get();

  const notifications = usersNearby.docs
    .filter(u => u.data().fcmToken)
    .map(u => getMessaging().send({
      token: u.data().fcmToken,
      notification: {
        title: "⚠️ Kualitas udara memburuk",
        body:  `AQI di sekitarmu mencapai ${after.aqi} (${after.category}). Pertimbangkan rute alternatif.`,
      },
      data: { aqi: String(after.aqi), category: after.category },
    }));

  await Promise.all(notifications);
});
```

---

### Scaling Config (Cloud Run)

```yaml
# Konfigurasi optimal untuk kompetisi & early production
min-instances: 0      # scale to zero saat idle (hemat biaya)
max-instances: 10     # max 10 container saat traffic tinggi
memory: 512Mi         # cukup untuk Next.js + Gemini streaming
cpu: 1                # 1 vCPU per instance
concurrency: 80       # 80 request per container (Cloud Run default)
timeout: 30s          # max 30 detik per request (cukup untuk Gemini)
```

---

## 8. Security Hardening

> OWASP, secrets, rate limiting, HTTPS

### Checklist Keamanan

```
OWASP Top 10:
  [x] SQL Injection        → Tidak ada SQL; Firestore parameterized queries
  [ ] XSS                  → Sanitasi semua user input; Content-Security-Policy header
  [ ] CSRF                 → SameSite=Strict pada session cookie
  [ ] Broken Auth          → Firebase session cookie (HttpOnly, Secure)
  [ ] Security Misconfiguration → Firestore Security Rules enforced
  [ ] Sensitive Data Exposure   → Secrets di Secret Manager, tidak di env file yang di-commit

Rate Limiting:
  [ ] Implementasi rate limiting di API routes (max 60 req/menit per user)
  [ ] Google Maps API key dibatasi hanya untuk domain airu.app
  [ ] Gemini API key hanya diakses dari server-side (tidak di client)

Headers:
  [ ] HTTPS only (Cloud Run enforce otomatis)
  [ ] HSTS header
  [ ] X-Frame-Options: DENY
  [ ] X-Content-Type-Options: nosniff
  [ ] Content-Security-Policy

Secrets:
  [ ] TIDAK ada secret di .env file yang di-commit
  [ ] .env.local ada di .gitignore
  [ ] Semua server-side secrets di Google Secret Manager
  [ ] NEXT_PUBLIC_ vars hanya untuk non-sensitive public config
```

---

### Security Headers (Next.js)

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security",value: "max-age=63072000; includeSubDomains; preload" },
  {
    key:   "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com",
      "frame-src 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  output: "standalone",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

---

### Rate Limiting (API Routes)

```typescript
// lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(identifier: string, limit = 60, windowMs = 60_000): boolean {
  const now    = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;  // allowed
  }

  if (record.count >= limit) return false;  // blocked

  record.count++;
  return true;  // allowed
}

// Penggunaan di API route:
const allowed = rateLimit(`route-analyze:${decoded.uid}`, 10, 60_000);
if (!allowed) {
  return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
}
```

---

### .gitignore (Security)

```
# Secrets — JANGAN PERNAH COMMIT
.env
.env.local
.env.*.local
firebase-admin-key.json
*-service-account.json
*.pem
*.key

# Build outputs
.next/
out/
node_modules/
```

---

## 9. Monitoring & Observability

> Logs, metrics, alerting, tracing

### Tiga Pilar Observability

```
Logs    → Structured JSON logs → Google Cloud Logging (auto-collected dari Cloud Run)
Metrics → Request count, latency, error rate → Google Cloud Monitoring
Tracing → Request path lintas service → Google Cloud Trace
```

---

### Structured Logging

```typescript
// lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

export function log(level: LogLevel, data: Record<string, unknown>) {
  const entry = {
    severity:  level.toUpperCase(),
    timestamp: new Date().toISOString(),
    service:   "airu-web",
    ...data,
  };
  // Cloud Run otomatis pickup stdout sebagai Cloud Logging entry
  console.log(JSON.stringify(entry));
}

// Penggunaan:
log("info", {
  action:   "route_analyzed",
  userId:   decoded.uid,
  routeId:  docRef.id,
  duration: Date.now() - startTime,
  fastest_score:   fastest.healthScore,
  healthiest_score: healthiest.healthScore,
});

log("error", {
  action:  "gemini_failed",
  error:   err instanceof Error ? err.message : String(err),
  userId:  decoded.uid,
});
```

---

### Google Cloud Monitoring Alerts

Buat alert policies di Google Cloud Console → Monitoring → Alerting:

| Alert | Kondisi | Notifikasi |
|---|---|---|
| High Error Rate | HTTP 5xx > 5% dalam 5 menit | Email + Slack |
| High Latency | P95 response > 10 detik | Email |
| Cloud Run Out of Memory | Memory > 450Mi | Email |
| Gemini API Errors | Error log count > 10/menit | Email |
| Firestore Read Spike | Reads > 40.000/hari (80% limit) | Email |

---

### Sentry (Client-side Error Tracking)

```typescript
// app/layout.tsx — Sentry initialization
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:              process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:      process.env.NODE_ENV,
  tracesSampleRate: 0.1,   // 10% sampling
  replaysOnErrorSampleRate: 1.0,
});
```

---

### Key Metrics yang Dipantau

```
Business Metrics:
  - Daily Active Users (DAU)
  - Route searches per day
  - % user yang pilih rute sehat vs tercepat
  - Average Health Score improvement

Technical Metrics:
  - API p50 / p95 / p99 latency
  - Error rate per endpoint
  - Google Air Quality API call count (cost management)
  - Gemini API token usage
  - FCM delivery rate
  - Firestore read/write count vs daily limit

Infrastructure Metrics:
  - Cloud Run instance count (scaling events)
  - Container memory usage
  - Cold start frequency & duration
```

---

## 10. Production Launch & Iterasi

> Go-live, rollback strategy, continuous improvement

### Strategi Release

```
Strategi yang digunakan untuk Airu: Rolling Deploy via Cloud Run

Cloud Run otomatis melakukan rolling update:
  - Deploy revision baru
  - Traffic dialihkan secara bertahap ke revision baru
  - Jika health check gagal → otomatis rollback ke revision sebelumnya
  - Zero downtime deployment by default
```

---

### Rollback Strategy

```bash
# Lihat semua revision yang tersedia
gcloud run revisions list --service=airu-app --region=asia-southeast2

# Rollback ke revision sebelumnya
gcloud run services update-traffic airu-app \
  --to-revisions=airu-app-00042-abc=100 \
  --region=asia-southeast2

# Verifikasi rollback berhasil
gcloud run services describe airu-app --region=asia-southeast2 \
  --format="value(status.traffic)"
```

---

### Pre-launch Checklist

```
Fungsionalitas:
  [ ] Route search + scoring berjalan dengan benar
  [ ] Gemini streaming tidak timeout
  [ ] AQI cache berfungsi (tidak memanggil API berulang untuk lokasi sama)
  [ ] FCM notification terkirim ke device test
  [ ] Login Google + email berfungsi
  [ ] Firestore Security Rules sudah ditest
  [ ] Riwayat rute tersimpan & bisa diakses kembali

Performa:
  [ ] Route analysis selesai < 5 detik (P95)
  [ ] Lighthouse score: Performance > 80, Accessibility > 90
  [ ] PWA installable (manifest.json + service worker)
  [ ] Google Maps load tanpa delay di mobile

Security:
  [ ] Tidak ada API key di client bundle (verifikasi dengan: npm run build → cari key di .next/)
  [ ] Firestore Rules sudah di-deploy ke Firebase Console
  [ ] HTTPS enforced (Cloud Run default)
  [ ] Rate limiting aktif di semua endpoint

Monitoring:
  [ ] Cloud Logging menerima structured logs dari Cloud Run
  [ ] Alert policy aktif untuk error rate & latency
  [ ] Sentry DSN terkonfigurasi & menerima event test
```

---

### Post-launch: Analisis & Iterasi

```
Minggu 1 — Stabilisasi:
  - Pantau error rate di Cloud Logging setiap hari
  - Cek API cost: Google Maps, Air Quality, Gemini
  - Kumpulkan feedback awal dari pengguna awal

Minggu 2 — Optimasi:
  - Analisis rute mana yang paling sering dicari (Firestore analytics)
  - Optimalkan AQI cache strategy jika cost tinggi
  - A/B test: apakah pengguna pilih rute sehat atau tercepat?

Iterasi berikutnya (backlog):
  - Integrasi BMKG API untuk peringatan cuaca ekstrem
  - Fitur berbagi rute sebagai gambar ke media sosial
  - Laporan mingguan paparan polusi personal
  - Offline mode: cache rute terakhir
  - Dark mode
```

---

### Tools per Fase

| Fase | Tools |
|---|---|
| 1. Planning | Notion, Draw.io, PRD-Airu.md |
| 2. UI/UX | Figma, shadcn/ui, Storybook |
| 3. Backend | VS Code, Postman, Firebase Console |
| 4. Frontend | VS Code, React DevTools, Chrome DevTools |
| 5. Testing | Vitest, Playwright, k6 |
| 6. CI/CD | Google Cloud Build, GitHub |
| 7. Infrastruktur | Google Cloud Console, gcloud CLI |
| 8. Security | OWASP ZAP, Snyk, Dependabot |
| 9. Monitoring | Google Cloud Monitoring, Sentry, Grafana |
| 10. Launch | Posthog, Google Analytics 4, Hotjar |

---

*Airu — Development Guide v1.0.0*
*Built for #JuaraVibeCoding by Google*
*Stack: Next.js · Google Maps Platform · Air Quality API · Gemini API · Firebase · Cloud Run*
