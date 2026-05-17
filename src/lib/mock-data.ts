import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bike,
  BriefcaseBusiness,
  Building2,
  HeartPulse,
  Home,
  MapPin,
  ShieldCheck,
  Trees,
  Users,
  Wind,
} from "lucide-react";

export type RiskLevel = "healthy" | "caution" | "danger";

export type Segment = {
  name: string;
  distance: string;
  aqi: number;
  label: string;
  risk: RiskLevel;
};

export type RouteOption = {
  id: string;
  label: string;
  summary: string;
  duration: string;
  distance: string;
  score: number;
  aqi: number;
  aqiLabel: string;
  delta?: string;
  recommended?: boolean;
  segments: Segment[];
};

export type AlertItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  aqi: number;
  status: "Berisiko" | "Membaik" | "Stabil";
  unread?: boolean;
};

export type HistoryItem = {
  id: string;
  from: string;
  to: string;
  date: string;
  score: number;
  aqi: number;
  duration: string;
  distance: string;
};

export type ProfileCondition = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  selected?: boolean;
};

export const routes: RouteOption[] = [
  {
    id: "healthy",
    label: "Rute sehat",
    summary: "Lebih teduh dan menghindari koridor lalu lintas berat.",
    duration: "28 min",
    distance: "2.7 km",
    score: 81,
    aqi: 64,
    aqiLabel: "Sedang",
    delta: "+5 min",
    recommended: true,
    segments: [
      {
        name: "Jalan teduh dekat taman",
        distance: "650 m",
        aqi: 42,
        label: "Baik",
        risk: "healthy",
      },
      {
        name: "Koridor ruko terbuka",
        distance: "920 m",
        aqi: 68,
        label: "Sedang",
        risk: "healthy",
      },
      {
        name: "Persimpangan padat",
        distance: "380 m",
        aqi: 96,
        label: "Waspada",
        risk: "caution",
      },
      {
        name: "Jalur belakang kantor",
        distance: "750 m",
        aqi: 58,
        label: "Sedang",
        risk: "healthy",
      },
    ],
  },
  {
    id: "fastest",
    label: "Rute tercepat",
    summary: "Lebih singkat, tetapi melewati segmen AQI tinggi.",
    duration: "23 min",
    distance: "2.2 km",
    score: 54,
    aqi: 122,
    aqiLabel: "Berisiko sensitif",
    delta: "-5 min",
    segments: [
      {
        name: "Jalur utama Tebet",
        distance: "520 m",
        aqi: 88,
        label: "Sedang",
        risk: "caution",
      },
      {
        name: "Koridor lalu lintas berat",
        distance: "840 m",
        aqi: 154,
        label: "Tidak sehat",
        risk: "danger",
      },
      {
        name: "Pintu masuk Sudirman",
        distance: "430 m",
        aqi: 128,
        label: "Berisiko",
        risk: "danger",
      },
      {
        name: "Trotoar kantor",
        distance: "410 m",
        aqi: 72,
        label: "Sedang",
        risk: "healthy",
      },
    ],
  },
];

export const alerts: AlertItem[] = [
  {
    id: "sudirman-spike",
    title: "AQI dekat Sudirman mencapai 126",
    description: "PM2.5 meningkat di sekitar koridor lalu lintas berat.",
    time: "08:20",
    aqi: 126,
    status: "Berisiko",
    unread: true,
  },
  {
    id: "home-improved",
    title: "AQI dekat rumah turun ke 68",
    description: "Kondisi membaik, masih dalam kategori sedang.",
    time: "Kemarin",
    aqi: 68,
    status: "Membaik",
  },
  {
    id: "campus-stable",
    title: "AQI sekitar kampus stabil",
    description: "Tidak ada kenaikan signifikan dalam 2 jam terakhir.",
    time: "2 hari lalu",
    aqi: 76,
    status: "Stabil",
  },
];

export const history: HistoryItem[] = [
  {
    id: "demo-route",
    from: "Rumah, Tebet",
    to: "Kantor, Sudirman",
    date: "Hari ini, 08:04",
    score: 81,
    aqi: 64,
    duration: "28 min",
    distance: "2.7 km",
  },
  {
    id: "station-campus",
    from: "Stasiun MRT",
    to: "Kampus",
    date: "Kemarin, 17:21",
    score: 69,
    aqi: 88,
    duration: "18 min",
    distance: "1.8 km",
  },
  {
    id: "market-home",
    from: "Pasar Santa",
    to: "Rumah",
    date: "Jumat, 19:12",
    score: 74,
    aqi: 71,
    duration: "22 min",
    distance: "2.1 km",
  },
];

export const profileConditions: ProfileCondition[] = [
  {
    id: "asthma",
    label: "Asma",
    description: "Lebih sensitif terhadap PM2.5",
    icon: Wind,
    selected: true,
  },
  {
    id: "sensitive",
    label: "Sensitif AQI",
    description: "Hindari segmen >100 AQI",
    icon: HeartPulse,
    selected: true,
  },
  {
    id: "family",
    label: "Anak kecil",
    description: "Ambang risiko lebih ketat",
    icon: Users,
  },
  {
    id: "elderly",
    label: "Lansia",
    description: "Prioritaskan rute teduh",
    icon: ShieldCheck,
  },
];

export const navItems = [
  { href: "/", label: "Airu", icon: MapPin },
  { href: "/map", label: "Peta", icon: MapPin },
  { href: "/profile", label: "Profil", icon: HeartPulse },
  { href: "/alerts", label: "Alert", icon: Bell },
  { href: "/history", label: "Riwayat", icon: BriefcaseBusiness },
];

export const placeSuggestions = [
  { label: "Rumah, Tebet", icon: Home },
  { label: "Kantor, Sudirman", icon: Building2 },
  { label: "Jalur taman dekat Karet", icon: Trees },
  { label: "Mode sepeda ke MRT", icon: Bike },
];
