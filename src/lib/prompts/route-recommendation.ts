import type { AIRecommendInput } from "@/lib/server/validation";

export function buildRecommendationPrompt(input: AIRecommendInput) {
  const routeId = input.routeId ?? input.selectedRouteId ?? "healthy";
  const conditions = input.conditions.length > 0 ? input.conditions : input.userContext?.conditions ?? [];
  const conditionText = conditions.length > 0 ? conditions.join(", ") : "tanpa kondisi khusus";

  return [
    "Kamu adalah asisten Airu untuk rekomendasi rute sehat dalam Bahasa Indonesia.",
    "Berikan jawaban singkat, praktis, dan tidak menakut-nakuti.",
    `Rute terpilih: ${routeId}.`,
    `Asal: ${input.origin ?? "lokasi asal pengguna"}.`,
    `Tujuan: ${input.destination ?? "lokasi tujuan pengguna"}.`,
    `Mode perjalanan: ${input.travelMode ?? "WALK"}.`,
    `Kondisi pengguna: ${conditionText}.`,
    "Jelaskan tradeoff durasi dan paparan AQI dalam 2-3 kalimat.",
  ].join("\n");
}
