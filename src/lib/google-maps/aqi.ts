import { geohashForLocation } from "geofire-common";
import type { CurrentAQI } from "@/lib/airu-types";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAQILabel } from "@/lib/scoring/health-score";
import { logWarn } from "@/lib/server/logger";

function cleanEnvValue(value: string | undefined) {
  if (!value) return undefined;
  let v = value.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.substring(1, v.length - 1);
  }
  return v;
}

const CACHE_TTL_MS = 30 * 60 * 1000;

type CachedAQI = {
  geohash: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10?: number | null;
  category: string;
  fetchedAt: Date | string | { toDate: () => Date };
};

type GoogleAQIResponse = {
  indexes?: Array<{
    aqi?: number;
    category?: string;
  }>;
  pollutants?: Array<{
    code?: string;
    concentration?: {
      value?: number;
    };
  }>;
};

function toDate(value: CachedAQI["fetchedAt"] | undefined) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return value.toDate();
}

function isFresh(fetchedAt: Date) {
  return Date.now() - fetchedAt.getTime() < CACHE_TTL_MS;
}

function deterministicMockAQI(lat: number, lng: number) {
  const seed = Math.abs(Math.round(lat * 1000) + Math.round(lng * 1000));
  return 55 + (seed % 70);
}

function buildMockAQI(lat: number, lng: number, geohash: string): CurrentAQI {
  const aqi = deterministicMockAQI(lat, lng);
  return {
    geohash,
    aqi,
    pm25: Math.round(aqi * 0.38),
    pm10: Math.round(aqi * 0.62),
    category: getAQILabel(aqi),
    stale: false,
    source: "mock",
    updatedAt: new Date().toISOString(),
    location: {
      address: "Koordinat saat ini",
      lat,
      lng,
    },
  };
}

function allowProviderMocks() {
  return process.env.AIRU_ALLOW_PROVIDER_MOCKS === "true";
}

function fromCachedAQI(data: CachedAQI, stale: boolean): CurrentAQI {
  const fetchedAt = toDate(data.fetchedAt) ?? new Date();
  return {
    geohash: data.geohash,
    aqi: data.aqi,
    pm25: data.pm25,
    pm10: data.pm10 ?? null,
    category: data.category,
    stale,
    source: "cache",
    updatedAt: fetchedAt.toISOString(),
    location: {
      address: "Koordinat cache",
      lat: data.lat,
      lng: data.lng,
    },
  };
}

async function fetchGoogleAQI(lat: number, lng: number, geohash: string): Promise<CurrentAQI | null> {
  const apiKey = cleanEnvValue(process.env.GOOGLE_AIR_QUALITY_API_KEY || process.env.GOOGLE_MAPS_API_KEY);
  if (!apiKey) {
    return null;
  }

  const response = await fetch(`https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: {
        latitude: lat,
        longitude: lng,
      },
      extraComputations: ["POLLUTANT_CONCENTRATION"],
      languageCode: "id",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Air Quality API failed with status ${response.status}`);
  }

  const data = (await response.json()) as GoogleAQIResponse;
  const index = data.indexes?.[0];
  const aqi = Math.round(index?.aqi ?? deterministicMockAQI(lat, lng));
  const pm25 = data.pollutants?.find((pollutant) => pollutant.code?.toLowerCase() === "pm25")?.concentration?.value;
  const pm10 = data.pollutants?.find((pollutant) => pollutant.code?.toLowerCase() === "pm10")?.concentration?.value;

  return {
    geohash,
    aqi,
    pm25: Math.round(pm25 ?? aqi * 0.38),
    pm10: pm10 ? Math.round(pm10) : null,
    category: index?.category ?? getAQILabel(aqi),
    stale: false,
    source: "google",
    updatedAt: new Date().toISOString(),
    location: {
      address: "Koordinat Google AQI",
      lat,
      lng,
    },
  };
}

export async function getAQIWithCache({ lat, lng }: { lat: number; lng: number }): Promise<CurrentAQI> {
  const geohash = geohashForLocation([lat, lng]).slice(0, 6);
  const db = getAdminDb();
  const docRef = db?.collection("aqi_cache").doc(geohash);
  let staleCache: CurrentAQI | null = null;

  if (docRef) {
    const snapshot = await docRef.get();
    const cached = snapshot.data() as CachedAQI | undefined;
    const fetchedAt = toDate(cached?.fetchedAt);

    if (cached && fetchedAt && isFresh(fetchedAt)) {
      return fromCachedAQI(cached, false);
    }

    if (cached && fetchedAt) {
      staleCache = fromCachedAQI(cached, true);
    }
  }

  try {
    const fresh = await fetchGoogleAQI(lat, lng, geohash);
    if (fresh && docRef) {
      await docRef.set({
        geohash,
        lat,
        lng,
        aqi: fresh.aqi,
        pm25: fresh.pm25,
        pm10: fresh.pm10 ?? null,
        category: fresh.category,
        fetchedAt: new Date(fresh.updatedAt),
      });
    }

    return fresh ?? staleCache ?? buildMockAQI(lat, lng, geohash);
  } catch (error) {
    logWarn("aqi-current", "AQI provider failed; using cached or mock data", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (staleCache) {
      return staleCache;
    }
    if (allowProviderMocks() || !(process.env.GOOGLE_AIR_QUALITY_API_KEY || process.env.GOOGLE_MAPS_API_KEY)) {
      return buildMockAQI(lat, lng, geohash);
    }
    throw error;
  }
}
