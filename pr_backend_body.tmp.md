Menyelesaikan integrasi Backend & API untuk proyek Airu.

**Perubahan utama meliputi:**
- Setup Firebase Auth, Firestore, & Security Rules (`firebase.json`, `firestore.rules`).
- Pembuatan struktur backend API di `src/app/api/` (Next.js App Router).
- Integrasi Google Maps API (Geocoding & Routes) di `src/lib/google-maps/`.
- Integrasi Gemini API (`src/lib/gemini.ts`) beserta sistem prompt untuk rekomendasi rute.
- Setup algoritma scoring kesehatan dan rute (`src/lib/scoring/`).
- Penambahan Firebase Admin SDK dan utility server di `src/lib/server/`.
- Skrip verifikasi API dan Firebase Auth (`scripts/`).
- Integrasi *client hooks* untuk terhubung ke API backend (bukan lagi *mock data*).
- Dokumentasi implementasi backend di `docs/backend-implementation.md`.

Closes #1
