"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import { decode } from "@googlemaps/polyline-codec";
import { useMapStore } from "@/stores/map-store";
import type { PlacePoint } from "@/lib/airu-types";
import type { RouteOption } from "@/lib/mock-data";
import { getPublicGoogleMapsApiKey, googleMapsLibraries } from "@/lib/google-maps/client";

type MapVisualProps = {
  compact?: boolean;
  showHotspots?: boolean;
  selected?: "healthy" | "fastest";
  label?: string;
  routes?: RouteOption[];
  origin?: PlacePoint;
  destination?: PlacePoint;
};

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
};

export function MapVisual({
  compact,
  selected = "healthy",
  label = "Peta rute Airu dengan data Google Maps",
  routes: providedRoutes,
  origin: providedOrigin,
  destination: providedDestination,
}: MapVisualProps) {
  const apiKey = getPublicGoogleMapsApiKey();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: googleMapsLibraries,
  });

  const storeOrigin = useMapStore((state) => state.origin);
  const storeDestination = useMapStore((state) => state.destination);

  const origin = providedOrigin || storeOrigin;
  const destination = providedDestination || storeDestination;

  const activeRouteData = useMemo(() => {
    const routes = providedRoutes;
    if (!routes || routes.length === 0) return null;
    return routes.find((r) => r.id === selected) || routes[0];
  }, [providedRoutes, selected]);

  const polylinePath = useMemo(() => {
    if (!activeRouteData?.encodedPolyline) return [];
    return decode(activeRouteData.encodedPolyline).map(([lat, lng]) => ({ lat, lng }));
  }, [activeRouteData]);

  const center = useMemo(() => {
    if (polylinePath.length > 0) {
      return polylinePath[Math.floor(polylinePath.length / 2)];
    }
    return { lat: (origin.lat + destination.lat) / 2, lng: (origin.lng + destination.lng) / 2 };
  }, [origin, destination, polylinePath]);

  if (!apiKey) {
    return (
      <div className={`map-visual ${compact ? "map-visual-compact" : ""}`} role="img" aria-label={label}>
        <div className="map-placeholder">
          <p>Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) tidak ditemukan.</p>
          <p>Menggunakan tampilan mock.</p>
        </div>
        <MockVisual compact selected={selected} />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`map-visual ${compact ? "map-visual-compact" : ""}`} aria-live="polite">
        <div className="map-loading">Memuat peta Google...</div>
      </div>
    );
  }

  return (
    <div className={`map-visual ${compact ? "map-visual-compact" : ""}`} role="img" aria-label={label}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
      >
        {polylinePath.length > 0 && (
          <Polyline
            path={polylinePath}
            options={{
              strokeColor: selected === "healthy" ? "#10b981" : "#f59e0b",
              strokeOpacity: 0.8,
              strokeWeight: 6,
            }}
          />
        )}
        <Marker position={{ lat: origin.lat, lng: origin.lng }} label="A" />
        <Marker position={{ lat: destination.lat, lng: destination.lng }} label="B" />
      </GoogleMap>
    </div>
  );
}

// Fallback to original mock for aesthetic or when API is missing
function MockVisual({ compact: _compact, selected }: { compact?: boolean; selected: string }) {
  const healthySegments = [
    { className: "seg h1", risk: "healthy" },
    { className: "seg h2", risk: "healthy" },
    { className: "seg h3", risk: "caution" },
    { className: "seg h4", risk: "healthy" },
  ];

  const fastestSegments = [
    { className: "seg f1", risk: "caution" },
    { className: "seg f2", risk: "danger" },
    { className: "seg f3", risk: "danger" },
  ];

  const activeSegments = selected === "healthy" ? healthySegments : fastestSegments;
  const mutedSegments = selected === "healthy" ? fastestSegments : healthySegments;

  return (
    <div className="map-visual-mock-overlay" aria-hidden="true">
      <div className="map-grid" />
      <span className="map-road road-a" />
      <span className="map-road road-b" />
      <span className="map-road road-c" />
      <span className="map-road road-d" />
      {mutedSegments.map((segment) => (
        <span
          key={segment.className}
          className={`${segment.className} route-segment route-muted risk-${segment.risk}`}
        />
      ))}
      {activeSegments.map((segment) => (
        <span key={segment.className} className={`${segment.className} route-segment risk-${segment.risk}`} />
      ))}
      <span className="map-pin map-pin-start">A</span>
      <span className="map-pin map-pin-end">B</span>
    </div>
  );
}
