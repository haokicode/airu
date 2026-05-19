import type { HistoryItem, RouteOption } from "@/lib/mock-data";

export type TravelMode = "WALK" | "BICYCLE";

export type PlacePoint = {
  address: string;
  lat: number;
  lng: number;
};

export type RouteChoiceId = "healthy" | "fastest";

export type RouteAnalysisParams = {
  origin: PlacePoint;
  destination: PlacePoint;
  travelMode: TravelMode;
  conditions?: string[];
  familyMode?: boolean;
};

export type RouteAnalysisResult = {
  routeAnalysisId?: string;
  origin?: PlacePoint;
  destination?: PlacePoint;
  travelMode?: TravelMode;
  routes: RouteOption[];
  recommendedRouteId: RouteChoiceId;
  summary: string;
  aiRecommendation?: string | null;
  source: "api" | "mock";
  analyzedAt: string;
};

export type AIRecommendBody = {
  routeAnalysisId?: string;
  routeId: RouteChoiceId;
  origin: string;
  destination: string;
  travelMode: TravelMode;
  conditions: string[];
};

export type CurrentAQI = {
  geohash?: string;
  aqi: number;
  pm25: number;
  pm10?: number | null;
  category: string;
  stale?: boolean;
  source?: "cache" | "google" | "mock";
  updatedAt: string;
  location: PlacePoint;
};

export type RouteHistoryResult = {
  items: HistoryItem[];
  source: "api" | "mock";
};

export type AiruUser = {
  id: string;
  email: string;
  displayName?: string;
};
