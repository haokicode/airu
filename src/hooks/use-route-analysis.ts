"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { RouteAnalysisParams, RouteAnalysisResult } from "@/lib/airu-types";

export function useRouteAnalysis() {
  return useMutation({
    mutationFn: async (params: RouteAnalysisParams) =>
      fetchJson<RouteAnalysisResult>("/api/route/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }),
  });
}
