"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiRequestError, fetchJson } from "@/lib/api-client";
import type { RouteHistoryResult } from "@/lib/airu-types";
import { history } from "@/lib/mock-data";

export function useHistory() {
  return useQuery({
    queryKey: ["route-history"],
    queryFn: async () => {
      try {
        return await fetchJson<RouteHistoryResult>("/api/history");
      } catch (error) {
        if (error instanceof ApiRequestError && error.status !== 404) {
          throw error;
        }
        return {
          items: history,
          source: "mock",
        } satisfies RouteHistoryResult;
      }
    },
  });
}
