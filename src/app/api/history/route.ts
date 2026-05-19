import { NextRequest } from "next/server";
import type { RouteHistoryResult } from "@/lib/airu-types";
import type { HistoryItem, RouteOption } from "@/lib/mock-data";
import { getAdminDb } from "@/lib/firebase/admin";
import { history as mockHistory } from "@/lib/mock-data";
import { handleApiError, jsonOk } from "@/lib/server/errors";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { logInfo, logWarn } from "@/lib/server/logger";

type RouteDocument = {
  origin?: { address?: string };
  destination?: { address?: string };
  routes?: RouteOption[];
  createdAt?: Date | string | { toDate: () => Date };
};

function allowProviderMocks() {
  return process.env.AIRU_ALLOW_PROVIDER_MOCKS === "true";
}

function toDate(value: RouteDocument["createdAt"]) {
  if (!value) {
    return new Date();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return value.toDate();
}

function formatHistoryDate(value: RouteDocument["createdAt"]) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(toDate(value));
}

function routeDocumentToHistoryItem(id: string, data: RouteDocument): HistoryItem {
  const healthyRoute = data.routes?.find((route) => route.id === "healthy") ?? data.routes?.[0];

  return {
    id,
    from: data.origin?.address ?? "Lokasi asal",
    to: data.destination?.address ?? "Lokasi tujuan",
    date: formatHistoryDate(data.createdAt),
    score: healthyRoute?.score ?? 0,
    aqi: healthyRoute?.aqi ?? 0,
    duration: healthyRoute?.duration ?? "-",
    distance: healthyRoute?.distance ?? "-",
  };
}

export async function GET(request: NextRequest) {
  const service = "route-history";
  const start = Date.now();

  try {
    const user = await requireAuthenticatedUser(request);
    const db = getAdminDb();

    if (!db) {
      if (!allowProviderMocks()) {
        throw new Error("Firebase Admin is not configured for route history");
      }
      return jsonOk<RouteHistoryResult>({
        items: mockHistory,
        source: "mock",
      });
    }

    try {
      const snapshot = await db
        .collection("routes")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(20)
        .get();
      const items = snapshot.docs.map((doc) => routeDocumentToHistoryItem(doc.id, doc.data() as RouteDocument));

      logInfo(service, "Route history loaded", {
        userId: user.uid,
        count: items.length,
        durationMs: Date.now() - start,
      });

      return jsonOk<RouteHistoryResult>({
        items,
        source: "api",
      });
    } catch (error) {
      logWarn(service, "Failed to load Firestore history; returning mock history", {
        error: error instanceof Error ? error.message : String(error),
      });
      if (!allowProviderMocks()) {
        throw error;
      }
      return jsonOk<RouteHistoryResult>({
        items: mockHistory,
        source: "mock",
      });
    }
  } catch (error) {
    return handleApiError(service, error);
  }
}
