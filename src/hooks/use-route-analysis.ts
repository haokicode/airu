"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiRequestError, fetchJson } from "@/lib/api-client";
import type { RouteAnalysisParams, RouteAnalysisResult } from "@/lib/airu-types";
import { routes } from "@/lib/mock-data";

function buildMockRouteAnalysis(params: RouteAnalysisParams): RouteAnalysisResult {
  const sensitiveProfile = params.conditions?.some((condition) =>
    ["asthma", "sensitive", "family", "elderly"].includes(condition),
  );

  return {
    routes,
    recommendedRouteId: sensitiveProfile ? "healthy" : "fastest",
    summary: sensitiveProfile
      ? "Rute sehat direkomendasikan karena profil sensitif perlu mengurangi paparan AQI tinggi."
      : "Rute tercepat tetap tersedia, dengan rute sehat sebagai alternatif paparan lebih rendah.",
    source: "mock",
    analyzedAt: new Date().toISOString(),
  };
}

export function useRouteAnalysis() {
  return useMutation({
    mutationFn: async (params: RouteAnalysisParams) => {
      try {
        return await fetchJson<RouteAnalysisResult>("/api/route/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
      } catch (error) {
        if (error instanceof ApiRequestError && error.status !== 404) {
          throw error;
        }
        return buildMockRouteAnalysis(params);
      }
    },
  });
}
