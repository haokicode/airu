import { decode } from "@googlemaps/polyline-codec";
import type { PlacePoint, TravelMode } from "@/lib/airu-types";
import { routes as mockRoutes } from "@/lib/mock-data";
import { logWarn } from "@/lib/server/logger";

function cleanEnvValue(value: string | undefined) {
  if (!value) return undefined;
  let v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

function allowProviderMocks() {
  return process.env.AIRU_ALLOW_PROVIDER_MOCKS === "true";
}

export type RouteCandidateSegment = {
  index: number;
  name: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  roadType: string;
  greenProximity: number;
  heatIndex: number;
  aqi?: number;
};

export type RouteCandidate = {
  id: string;
  source: "google" | "mock";
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
  segments: RouteCandidateSegment[];
};

type GoogleRoutesResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: {
      encodedPolyline?: string;
    };
  }>;
};

function parseDurationSeconds(duration: string | undefined) {
  if (!duration) {
    return 0;
  }
  return Number(duration.replace("s", "")) || 0;
}

function parseMockDistance(distance: string) {
  const value = Number(distance.replace(/[^\d.]/g, ""));
  return distance.includes("km") ? Math.round(value * 1000) : Math.round(value);
}

function parseMockDuration(duration: string) {
  return Math.round(Number(duration.replace(/[^\d.]/g, "")) * 60);
}

function interpolate(origin: PlacePoint, destination: PlacePoint, ratio: number) {
  return {
    lat: origin.lat + (destination.lat - origin.lat) * ratio,
    lng: origin.lng + (destination.lng - origin.lng) * ratio,
  };
}

function samplePolyline(
  encodedPolyline: string,
  origin: PlacePoint,
  destination: PlacePoint,
  distanceMeters: number,
  durationSeconds: number,
): RouteCandidateSegment[] {
  const decoded = encodedPolyline ? decode(encodedPolyline).map(([lat, lng]) => ({ lat, lng })) : [];
  const points = decoded.length >= 2 ? decoded : [origin, interpolate(origin, destination, 0.33), interpolate(origin, destination, 0.66), destination];
  const segmentCount = Math.min(4, Math.max(1, points.length - 1));
  const sampled: RouteCandidateSegment[] = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const start = points[Math.floor((index / segmentCount) * (points.length - 1))];
    const end = points[Math.floor(((index + 1) / segmentCount) * (points.length - 1))] ?? destination;
    sampled.push({
      index,
      name: `Segmen ${index + 1}`,
      start,
      end,
      distanceMeters: Math.round(distanceMeters / segmentCount),
      durationSeconds: Math.round(durationSeconds / segmentCount),
      roadType: index === 0 ? "residential" : index === 1 ? "tertiary" : "primary",
      greenProximity: index === 0 ? 76 : index === 1 ? 58 : 34,
      heatIndex: index === 2 ? 34 : 31,
    });
  }

  return sampled;
}

function buildMockCandidates(origin: PlacePoint, destination: PlacePoint): RouteCandidate[] {
  return mockRoutes.map((route, routeIndex) => {
    const distanceMeters = parseMockDistance(route.distance);
    const durationSeconds = parseMockDuration(route.duration);
    const segmentCount = route.segments.length;

    return {
      id: route.id,
      source: "mock",
      distanceMeters,
      durationSeconds,
      encodedPolyline: "",
      segments: route.segments.map((segment, index) => ({
        index,
        name: segment.name,
        start: interpolate(origin, destination, index / segmentCount),
        end: interpolate(origin, destination, (index + 1) / segmentCount),
        distanceMeters: parseMockDistance(segment.distance),
        durationSeconds: Math.round(durationSeconds / segmentCount),
        roadType: segment.risk === "healthy" ? "footway" : segment.risk === "caution" ? "secondary" : "primary",
        greenProximity: segment.risk === "healthy" ? 80 : segment.risk === "caution" ? 45 : 18,
        heatIndex: routeIndex === 0 ? 30 : 35,
        aqi: segment.aqi,
      })),
    };
  });
}

export async function getRoutes(origin: PlacePoint, destination: PlacePoint, travelMode: TravelMode) {
  const apiKey = cleanEnvValue(process.env.GOOGLE_MAPS_API_KEY);
  if (!apiKey) {
    return buildMockCandidates(origin, destination);
  }

  try {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
        travelMode,
        computeAlternativeRoutes: true,
        languageCode: "id-ID",
        units: "METRIC",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Routes API failed with status ${response.status}`);
    }

    const data = (await response.json()) as GoogleRoutesResponse;
    const candidates =
      data.routes?.map((route, index): RouteCandidate => {
        const distanceMeters = route.distanceMeters ?? 0;
        const durationSeconds = parseDurationSeconds(route.duration);
        const encodedPolyline = route.polyline?.encodedPolyline ?? "";

        return {
          id: `google-${index}`,
          source: "google",
          distanceMeters,
          durationSeconds,
          encodedPolyline,
          segments: samplePolyline(encodedPolyline, origin, destination, distanceMeters, durationSeconds),
        };
      }) ?? [];

    return candidates.length > 0 ? candidates : buildMockCandidates(origin, destination);
  } catch (error) {
    logWarn("google-routes", "Routes provider failed; using mock route candidates", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (!allowProviderMocks()) {
      throw error;
    }
    return buildMockCandidates(origin, destination);
  }
}
