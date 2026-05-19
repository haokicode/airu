import { NextRequest } from "next/server";
import { getAQIWithCache } from "@/lib/google-maps/aqi";
import { handleApiError, jsonOk, validationError } from "@/lib/server/errors";
import { requireAuthenticatedUser } from "@/lib/server/auth";
import { logInfo } from "@/lib/server/logger";
import { aqiQuerySchema } from "@/lib/server/validation";

export async function GET(request: NextRequest) {
  const service = "aqi-current";
  const start = Date.now();

  try {
    const user = await requireAuthenticatedUser(request);
    const parsed = aqiQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw validationError(parsed.error);
    }

    const data = await getAQIWithCache(parsed.data);
    logInfo(service, "AQI lookup completed", {
      userId: user.uid,
      durationMs: Date.now() - start,
      source: data.source,
      geohash: data.geohash,
    });

    return jsonOk(data);
  } catch (error) {
    return handleApiError(service, error);
  }
}
