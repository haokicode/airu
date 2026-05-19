import type { RiskLevel } from "@/lib/mock-data";

const ROAD_SHADE_MAP: Record<string, number> = {
  footway: 85,
  path: 85,
  residential: 65,
  tertiary: 50,
  secondary: 35,
  primary: 15,
  trunk: 10,
  motorway: 5,
};

const CONDITION_THRESHOLDS: Record<string, number> = {
  normal: 150,
  asthma: 75,
  elderly: 75,
  pregnant: 75,
  child: 75,
  family: 75,
  sensitive: 100,
  active_sport: 100,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function calculateSegmentScore(
  aqi: number,
  roadType: string,
  heatIndex: number,
  greenProximity: number,
): number {
  const aqiScore = clamp(100 - aqi);
  const shadeScore = ROAD_SHADE_MAP[roadType] ?? 40;
  const heatScore = clamp(100 - (heatIndex - 27) * 3);
  const greenScore = clamp(greenProximity);

  return Math.round(aqiScore * 0.4 + shadeScore * 0.25 + heatScore * 0.2 + greenScore * 0.15);
}

export function getAQIWarning(aqi: number, conditions: string[]): string | null {
  const threshold = conditions.reduce((min, condition) => {
    return Math.min(min, CONDITION_THRESHOLDS[condition] ?? 150);
  }, 150);

  return aqi > threshold ? `AQI ${aqi} melebihi batas aman untuk kondisi kamu` : null;
}

export function getRiskLevel(score: number, aqi: number, conditions: string[]): RiskLevel {
  if (getAQIWarning(aqi, conditions) || score < 40) {
    return "danger";
  }

  if (score < 70 || aqi > 100) {
    return "caution";
  }

  return "healthy";
}

export function getAQILabel(aqi: number) {
  if (aqi <= 50) {
    return "Baik";
  }
  if (aqi <= 100) {
    return "Sedang";
  }
  if (aqi <= 150) {
    return "Tidak Sehat (Sensitif)";
  }
  if (aqi <= 200) {
    return "Tidak Sehat";
  }
  if (aqi <= 300) {
    return "Sangat Tidak Sehat";
  }
  return "Berbahaya";
}
