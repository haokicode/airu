"use client";

import { useCallback, useState } from "react";
import type { AIRecommendBody } from "@/lib/airu-types";
import { ApiRequestError } from "@/lib/api-client";

function buildFallbackRecommendation(body: AIRecommendBody) {
  const modeLabel = body.travelMode === "BICYCLE" ? "bersepeda" : "berjalan";
  const conditionLabel = body.conditions.length > 0 ? "profil sensitif" : "profil umum";
  return `Untuk ${conditionLabel}, pilih ${
    body.routeId === "healthy" ? "rute sehat" : "rute tercepat"
  } dari ${body.origin} ke ${body.destination}. Mode ${modeLabel} tetap perlu memperhatikan segmen AQI tinggi dan persimpangan padat.`;
}

export function useStreamingAI() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async (body: AIRecommendBody) => {
    setLoading(true);
    setText("");

    try {
      const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiRequestError(await response.text(), response.status);
      }

      if (!response.body) {
        setText(buildFallbackRecommendation(body));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        setText((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      if (error instanceof ApiRequestError && error.status !== 404) {
        setText("Rekomendasi AI belum tersedia. Gunakan perbandingan skor, AQI, dan detail segmen untuk memilih rute.");
        return;
      }
      setText(buildFallbackRecommendation(body));
    } finally {
      setLoading(false);
    }
  }, []);

  return { text, loading, generate };
}
