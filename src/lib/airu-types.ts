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
};

export type RouteAnalysisResult = {
  routes: RouteOption[];
  recommendedRouteId: RouteChoiceId;
  summary: string;
  source: "api" | "mock";
  analyzedAt: string;
};

export type AIRecommendBody = {
  routeId: RouteChoiceId;
  origin: string;
  destination: string;
  travelMode: TravelMode;
  conditions: string[];
};

export type CurrentAQI = {
  aqi: number;
  pm25: number;
  category: string;
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
