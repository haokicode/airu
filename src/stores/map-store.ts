"use client";

import { create } from "zustand";
import type { PlacePoint, RouteChoiceId, TravelMode } from "@/lib/airu-types";
import { defaultDestination, defaultOrigin } from "@/lib/mock-data";

type MapState = {
  origin: PlacePoint;
  destination: PlacePoint;
  travelMode: TravelMode;
  activeRoute: RouteChoiceId;
  setOrigin: (origin: PlacePoint) => void;
  setDestination: (destination: PlacePoint) => void;
  setTravelMode: (travelMode: TravelMode) => void;
  setActiveRoute: (activeRoute: RouteChoiceId) => void;
  setRouteRequest: (request: { origin: PlacePoint; destination: PlacePoint; travelMode: TravelMode }) => void;
};

export const useMapStore = create<MapState>((set) => ({
  origin: defaultOrigin,
  destination: defaultDestination,
  travelMode: "WALK",
  activeRoute: "healthy",
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setTravelMode: (travelMode) => set({ travelMode }),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setRouteRequest: (request) => set(request),
}));
