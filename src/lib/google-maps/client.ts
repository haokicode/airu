"use client";

export const googleMapsLibraries: ("places")[] = ["places"];

export function getPublicGoogleMapsApiKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
}
