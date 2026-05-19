"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { CurrentAQI } from "@/lib/airu-types";

export function useAQICurrent(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ["aqi-current", coords?.lat, coords?.lng],
    enabled: Boolean(coords),
    queryFn: async () => {
      const lat = coords?.lat ?? 0;
      const lng = coords?.lng ?? 0;

      return fetchJson<CurrentAQI>(`/api/aqi/current?lat=${lat}&lng=${lng}`);
    },
  });
}
