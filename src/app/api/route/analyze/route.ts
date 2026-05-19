import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getRoutes } from "@/lib/google-maps/routes";
import { buildRouteAnalysis } from "@/lib/scoring/route-analysis";
import { ApiError, handleApiError, jsonOk, validationError } from "@/lib/server/errors";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { logInfo, logWarn } from "@/lib/server/logger";
import { routeAnalyzeSchema } from "@/lib/server/validation";

export async function POST(request: NextRequest) {
  const service = "route-analyze";
  const start = Date.now();

  try {
    const user = await requireAuthenticatedUser(request);
    const parsed = routeAnalyzeSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const { origin, destination, travelMode, conditions, familyMode } = parsed.data;
    const candidates = await getRoutes(origin, destination, travelMode);
    if (candidates.length === 0) {
      throw new ApiError(404, "ROUTE_NOT_FOUND", "No routes found");
    }

    const result = await buildRouteAnalysis({
      origin,
      destination,
      travelMode,
      conditions: familyMode ? [...conditions, "family"] : conditions,
      candidates,
    });
    const db = getAdminDb();
    const docRef = db?.collection("routes").doc();

    if (docRef) {
      try {
        await docRef.set({
          userId: user.uid,
          origin,
          destination,
          travelMode,
          conditions,
          familyMode,
          routes: result.routes,
          recommendedRouteId: result.recommendedRouteId,
          summary: result.summary,
          source: result.source,
          analyzedAt: result.analyzedAt,
          aiRecommendation: null,
          createdAt: new Date(result.analyzedAt),
        });
        result.routeAnalysisId = docRef.id;
      } catch (error) {
        logWarn(service, "Failed to persist route analysis", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      result.routeAnalysisId = `mock-${Date.now()}`;
    }

    logInfo(service, "Route analysis completed", {
      userId: user.uid,
      routeAnalysisId: result.routeAnalysisId,
      durationMs: Date.now() - start,
      source: result.source,
    });

    return jsonOk(result);
  } catch (error) {
    return handleApiError(service, error);
  }
}
