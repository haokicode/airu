import type { PlacePoint, RouteAnalysisResult, RouteChoiceId, TravelMode } from "@/lib/airu-types";
import type { RouteOption, Segment } from "@/lib/mock-data";
import type { RouteCandidate, RouteCandidateSegment } from "@/lib/google-maps/routes";
import { getAQIWithCache } from "@/lib/google-maps/aqi";
import { calculateSegmentScore, getAQILabel, getRiskLevel } from "@/lib/scoring/health-score";

type ScoredCandidate = {
  candidate: RouteCandidate;
  score: number;
  avgAQI: number;
  segments: Segment[];
};

function formatDistance(meters: number) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

function segmentMidpoint(segment: RouteCandidateSegment) {
  return {
    lat: (segment.start.lat + segment.end.lat) / 2,
    lng: (segment.start.lng + segment.end.lng) / 2,
  };
}

async function scoreSegment(segment: RouteCandidateSegment, conditions: string[]): Promise<Segment & { score: number }> {
  const midpoint = segmentMidpoint(segment);
  const aqi = segment.aqi ?? (await getAQIWithCache(midpoint)).aqi;
  const score = calculateSegmentScore(aqi, segment.roadType, segment.heatIndex, segment.greenProximity);
  const risk = getRiskLevel(score, aqi, conditions);

  return {
    name: segment.name,
    distance: formatDistance(segment.distanceMeters),
    aqi,
    label: getAQILabel(aqi),
    risk,
    score,
  };
}

async function scoreCandidate(candidate: RouteCandidate, conditions: string[]): Promise<ScoredCandidate> {
  const scoredSegments = await Promise.all(candidate.segments.map((segment) => scoreSegment(segment, conditions)));
  const totalDistance = candidate.segments.reduce((sum, segment) => sum + segment.distanceMeters, 0) || 1;
  const weightedScore = scoredSegments.reduce((sum, segment, index) => {
    return sum + segment.score * (candidate.segments[index].distanceMeters / totalDistance);
  }, 0);
  const weightedAQI = scoredSegments.reduce((sum, segment, index) => {
    return sum + segment.aqi * (candidate.segments[index].distanceMeters / totalDistance);
  }, 0);

  return {
    candidate,
    score: Math.round(weightedScore),
    avgAQI: Math.round(weightedAQI),
    segments: scoredSegments.map(({ score: _score, ...segment }) => segment),
  };
}

function toRouteOption(scored: ScoredCandidate, id: RouteChoiceId, deltaMinutes: number, recommended: boolean): RouteOption {
  const isHealthy = id === "healthy";
  return {
    id,
    label: isHealthy ? "Rute sehat" : "Rute tercepat",
    summary: isHealthy
      ? "Dipilih karena skor kesehatan rute lebih baik untuk profil saat ini."
      : "Dipilih karena durasi paling singkat, dengan catatan paparan AQI tetap perlu diperhatikan.",
    duration: formatDuration(scored.candidate.durationSeconds),
    distance: formatDistance(scored.candidate.distanceMeters),
    score: scored.score,
    aqi: scored.avgAQI,
    aqiLabel: getAQILabel(scored.avgAQI),
    delta: deltaMinutes === 0 ? "Baseline" : `${deltaMinutes > 0 ? "+" : ""}${deltaMinutes} min`,
    recommended,
    segments: scored.segments,
    encodedPolyline: scored.candidate.encodedPolyline,
  };
}

export async function buildRouteAnalysis({
  origin,
  destination,
  travelMode,
  conditions,
  candidates,
}: {
  origin: PlacePoint;
  destination: PlacePoint;
  travelMode: TravelMode;
  conditions: string[];
  candidates: RouteCandidate[];
}): Promise<RouteAnalysisResult> {
  const scoredCandidates = await Promise.all(candidates.slice(0, 3).map((candidate) => scoreCandidate(candidate, conditions)));
  if (scoredCandidates.length === 0) {
    throw new Error("No route candidates available");
  }

  const fastest = scoredCandidates.reduce((best, candidate) =>
    candidate.candidate.durationSeconds < best.candidate.durationSeconds ? candidate : best,
  );
  const healthiest = scoredCandidates.reduce((best, candidate) => (candidate.score > best.score ? candidate : best));
  const comparisonFastest =
    fastest.candidate.id === healthiest.candidate.id && scoredCandidates.length > 1
      ? scoredCandidates.find((candidate) => candidate.candidate.id !== healthiest.candidate.id) ?? fastest
      : fastest;
  const deltaMinutes = Math.round((healthiest.candidate.durationSeconds - comparisonFastest.candidate.durationSeconds) / 60);
  const routeSource = candidates.some((candidate) => candidate.source === "google") ? "api" : "mock";

  return {
    origin,
    destination,
    travelMode,
    routes: [
      toRouteOption(healthiest, "healthy", deltaMinutes, true),
      toRouteOption(comparisonFastest, "fastest", 0, false),
    ],
    recommendedRouteId: "healthy",
    summary:
      conditions.length > 0
        ? `Rute sehat direkomendasikan dari ${origin.address} ke ${destination.address} untuk mengurangi paparan AQI pada mode ${travelMode}.`
        : `Rute sehat memiliki skor paparan lebih baik dari ${origin.address} ke ${destination.address}.`,
    source: routeSource,
    analyzedAt: new Date().toISOString(),
  };
}
