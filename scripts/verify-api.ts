// import { config } from "dotenv";
// import { resolve } from "path";

// Load .env.local
// config({ path: resolve(process.cwd(), ".env.local") });

import { getRoutes } from "../src/lib/google-maps/routes";
import { getAQIWithCache } from "../src/lib/google-maps/aqi";
import { getGeminiModel } from "../src/lib/gemini";

async function verify() {
  console.log("--- Verifikasi API Airu ---");

  // 1. Google Routes API
  console.log("\n1. Mengetes Google Routes API...");
  try {
    const origin = { lat: -6.2088, lng: 106.8456, address: "Jakarta" };
    const destination = { lat: -6.1751, lng: 106.8272, address: "Monas" };
    const routes = await getRoutes(origin, destination, "WALK");
    console.log(`✅ Berhasil! Ditemukan ${routes.length} rute.`);
    console.log(`   Sumber: ${routes[0].source}`);
    if (routes[0].source === "mock") {
      console.warn("   ⚠️ Peringatan: Menggunakan data mock. Cek GOOGLE_MAPS_API_KEY.");
    }
  } catch (error) {
    console.error("❌ Gagal mengetes Routes API:", error);
  }

  // 2. Google Air Quality API
  console.log("\n2. Mengetes Google Air Quality API...");
  try {
    const aqiData = await getAQIWithCache({ lat: -6.2088, lng: 106.8456 });
    console.log(`✅ Berhasil! AQI: ${aqiData.aqi} (${aqiData.category})`);
    console.log(`   Sumber: ${aqiData.source}`);
    if (aqiData.source === "mock") {
      console.warn("   ⚠️ Peringatan: Menggunakan data mock. Cek GOOGLE_AIR_QUALITY_API_KEY.");
    }
  } catch (error) {
    console.error("❌ Gagal mengetes Air Quality API:", error);
  }

  // 3. Gemini API
  console.log("\n3. Mengetes Gemini API...");
  try {
    const model = getGeminiModel();
    if (model) {
      const result = await model.generateContent("Halo, apakah kamu siap membantu proyek Airu?");
      const response = await result.response;
      console.log(`✅ Berhasil! Gemini merespon: "${response.text().substring(0, 50)}..."`);
    } else {
      console.warn("❌ Gagal: Model Gemini tidak tersedia. Cek GEMINI_API_KEY.");
    }
  } catch (error) {
    console.error("❌ Gagal mengetes Gemini API:", error);
  }

  console.log("\n--- Verifikasi Selesai ---");
}

verify().catch(console.error);
