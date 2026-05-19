"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiRequestError, fetchJson } from "@/lib/api-client";
import type { CurrentAQI } from "@/lib/airu-types";

function buildMockAQI(lat: number, lng: number): CurrentAQI {
  return {
    aqi: 82,
    pm25: 31,
    category: "Sedang",
    updatedAt: new Date().toISOString(),
    location: {
      address: "Jakarta pusat",
      lat,
      lng,
    },
  };
}

export function useAQICurrent(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: ["aqi-current", coords?.lat, coords?.lng],
    enabled: Boolean(coords),
    queryFn: async () => {
      const lat = coords?.lat ?? 0;
      const lng = coords?.lng ?? 0;

      try {
        return await fetchJson<CurrentAQI>(`/api/aqi/current?lat=${lat}&lng=${lng}`);
      } catch (error) {
        if (error instanceof ApiRequestError && error.status !== 404) {
          throw error;
        }
        return buildMockAQI(lat, lng);
      }
    },
  });
}
