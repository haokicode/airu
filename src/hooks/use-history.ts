"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-client";
import type { RouteHistoryResult } from "@/lib/airu-types";

export function useHistory() {
  return useQuery({
    queryKey: ["route-history"],
    queryFn: () => fetchJson<RouteHistoryResult>("/api/history"),
  });
}
