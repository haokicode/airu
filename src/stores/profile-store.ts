"use client";

import { create } from "zustand";
import type { TravelMode } from "@/lib/airu-types";

type ProfileState = {
  conditions: string[];
  travelMode: TravelMode;
  fcmToken: string | null;
  familyMode: boolean;
  alertAQIThreshold: number;
  toggleCondition: (conditionId: string) => void;
  setConditions: (conditions: string[]) => void;
  setTravelMode: (travelMode: TravelMode) => void;
  setFcmToken: (fcmToken: string | null) => void;
  setFamilyMode: (enabled: boolean) => void;
  setAlertAQIThreshold: (threshold: number) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  conditions: ["asthma", "sensitive"],
  travelMode: "WALK",
  fcmToken: null,
  familyMode: false,
  alertAQIThreshold: 110,
  toggleCondition: (conditionId) =>
    set((state) => ({
      conditions: state.conditions.includes(conditionId)
        ? state.conditions.filter((id) => id !== conditionId)
        : [...state.conditions, conditionId],
    })),
  setConditions: (conditions) => set({ conditions }),
  setTravelMode: (travelMode) => set({ travelMode }),
  setFcmToken: (fcmToken) => set({ fcmToken }),
  setFamilyMode: (familyMode) => set({ familyMode }),
  setAlertAQIThreshold: (alertAQIThreshold) => set({ alertAQIThreshold }),
}));
