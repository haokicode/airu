"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJsApiLoader } from "@react-google-maps/api";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Bell,
  Bike,
  Footprints,
  HeartPulse,
  Home,
  LocateFixed,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { PlacePoint, RouteChoiceId, TravelMode } from "@/lib/airu-types";
import { defaultDestination, defaultOrigin, placeSuggestions } from "@/lib/mock-data";
import { ApiRequestError } from "@/lib/api-client";
import { getPublicGoogleMapsApiKey, googleMapsLibraries } from "@/lib/google-maps/client";
import { routeFormSchema, type RouteFormValues } from "@/schemas/route-form";
import { useRouteAnalysis } from "@/hooks/use-route-analysis";
import { useStreamingAI } from "@/hooks/use-streaming-ai";
import { useUserLocation } from "@/hooks/use-user-location";
import { useMapStore } from "@/stores/map-store";
import { useProfileStore } from "@/stores/profile-store";
import { Button, IconButton, LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { RouteCard } from "@/components/route-card";
import { SegmentList } from "@/components/segment-list";

type SheetState = "collapsed" | "mid" | "expanded";
type LocationField = "origin" | "destination";
type PlacePrediction = {
  placeId: string;
  label: string;
  description: string;
};

function toRouteChoiceId(routeId: string): RouteChoiceId {
  return routeId === "fastest" ? "fastest" : "healthy";
}

function routeModeLabel(travelMode: TravelMode) {
  return travelMode === "BICYCLE" ? "Sepeda" : "Jalan kaki";
}

function getRouteErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      return "Masuk dulu agar Airu bisa mengambil data rute dan AQI real.";
    }
    if (error.status === 400) {
      return "Lokasi belum valid. Pilih saran Google Places atau gunakan GPS.";
    }
    return `Analisis gagal (${error.status}). Periksa konfigurasi Google API dan coba lagi.`;
  }

  return "Analisis gagal. Periksa koneksi dan konfigurasi provider real.";
}

export function MapWorkspace() {
  const [sheetState, setSheetState] = useState<SheetState>("mid");
  const [activeLocationField, setActiveLocationField] = useState<LocationField>("destination");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);
  const apiKey = getPublicGoogleMapsApiKey();
  const { isLoaded: isPlacesLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries: googleMapsLibraries,
  });
  const origin = useMapStore((state) => state.origin);
  const destination = useMapStore((state) => state.destination);
  const activeRoute = useMapStore((state) => state.activeRoute);
  const setOrigin = useMapStore((state) => state.setOrigin);
  const setDestination = useMapStore((state) => state.setDestination);
  const setMapTravelMode = useMapStore((state) => state.setTravelMode);
  const setActiveRoute = useMapStore((state) => state.setActiveRoute);
  const setRouteRequest = useMapStore((state) => state.setRouteRequest);
  const conditions = useProfileStore((state) => state.conditions);
  const profileTravelMode = useProfileStore((state) => state.travelMode);
  const familyMode = useProfileStore((state) => state.familyMode);
  const setProfileTravelMode = useProfileStore((state) => state.setTravelMode);
  const routeAnalysis = useRouteAnalysis();
  const { text: aiText, loading: aiLoading, generate } = useStreamingAI();
  const { location, error: locationError, isLoading: isLocating, requestLocation } = useUserLocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      origin: origin ?? defaultOrigin,
      destination: destination ?? defaultDestination,
      travelMode: profileTravelMode,
    },
    mode: "onBlur",
  });

  const travelMode = watch("travelMode");
  const watchedOriginAddress = watch("origin.address");
  const watchedDestinationAddress = watch("destination.address");
  const activeAddress = activeLocationField === "origin" ? watchedOriginAddress : watchedDestinationAddress;
  const analyzedRoutes = routeAnalysis.data?.routes ?? [];
  const hasAnalysis = analyzedRoutes.length > 0;
  const selected = useMemo(
    () => analyzedRoutes.find((route) => route.id === activeRoute) ?? analyzedRoutes[0] ?? null,
    [activeRoute, analyzedRoutes],
  );
  const recommendation =
    aiLoading
      ? "Menyiapkan rekomendasi AI..."
      : aiText ||
        routeAnalysis.data?.summary ||
        "Pilih lokasi asal dan tujuan, lalu jalankan analisis untuk mengambil data Google Routes, AQI, dan rekomendasi AI real.";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSheetState("collapsed");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!apiKey || !isPlacesLoaded || activeAddress.trim().length < 3) {
      setPredictions([]);
      return;
    }

    let cancelled = false;
    const service = new google.maps.places.AutocompleteService();
    const timer = window.setTimeout(() => {
      service.getPlacePredictions(
        {
          input: activeAddress,
          componentRestrictions: { country: "id" },
        },
        (results, status) => {
          if (cancelled) {
            return;
          }

          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            setPredictions([]);
            return;
          }

          setPredictions(
            results.slice(0, 5).map((result) => ({
              placeId: result.place_id,
              label: result.structured_formatting?.main_text ?? result.description,
              description: result.description,
            })),
          );
        },
      );
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeAddress, apiKey, isPlacesLoaded]);

  useEffect(() => {
    if (!location) {
      return;
    }

    const currentLocation: PlacePoint = {
      address: "Lokasi saya sekarang",
      lat: location.lat,
      lng: location.lng,
    };
    setPlace("origin", currentLocation);
  }, [location]);

  const setPlace = (field: LocationField, place: PlacePoint) => {
    if (field === "origin") {
      setValue("origin.address", place.address, { shouldDirty: true, shouldValidate: true });
      setValue("origin.lat", place.lat, { shouldDirty: true, shouldValidate: true });
      setValue("origin.lng", place.lng, { shouldDirty: true, shouldValidate: true });
      setOrigin(place);
      return;
    }

    setValue("destination.address", place.address, { shouldDirty: true, shouldValidate: true });
    setValue("destination.lat", place.lat, { shouldDirty: true, shouldValidate: true });
    setValue("destination.lng", place.lng, { shouldDirty: true, shouldValidate: true });
    setDestination(place);
  };

  const resolvePlaceId = async (field: LocationField, prediction: PlacePrediction) => {
    if (!isPlacesLoaded) {
      return;
    }

    setIsResolvingPlace(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ placeId: prediction.placeId });
      const result = response.results[0];
      const location = result?.geometry.location;
      if (!location) {
        return;
      }

      setPlace(field, {
        address: result.formatted_address || prediction.description,
        lat: location.lat(),
        lng: location.lng(),
      });
      setPredictions([]);
    } finally {
      setIsResolvingPlace(false);
    }
  };

  const resolveTypedPlace = async (place: PlacePoint): Promise<PlacePoint> => {
    if (!apiKey || !isPlacesLoaded || place.address === "Lokasi saya sekarang") {
      return place;
    }

    const geocoder = new google.maps.Geocoder();
    const response = await geocoder.geocode({
      address: place.address,
      componentRestrictions: { country: "ID" },
    });
    const result = response.results[0];
    const location = result?.geometry.location;

    if (!location) {
      return place;
    }

    return {
      address: result.formatted_address || place.address,
      lat: location.lat(),
      lng: location.lng(),
    };
  };

  const setTravelMode = (nextMode: TravelMode) => {
    setValue("travelMode", nextMode, { shouldDirty: true, shouldValidate: true });
    setMapTravelMode(nextMode);
    setProfileTravelMode(nextMode);
  };

  const onSubmit = async (values: RouteFormValues) => {
    setIsResolvingPlace(true);
    setSheetState("mid");

    try {
      const resolvedOrigin = await resolveTypedPlace(values.origin);
      const resolvedDestination = await resolveTypedPlace(values.destination);
      const request = {
        ...values,
        origin: resolvedOrigin,
        destination: resolvedDestination,
        conditions,
        familyMode,
      };
      setRouteRequest(request);
      setOrigin(resolvedOrigin);
      setDestination(resolvedDestination);

      const result = await routeAnalysis.mutateAsync({
        ...request,
        conditions,
      });
      const recommendedRoute = result.recommendedRouteId;
      setActiveRoute(recommendedRoute);
      setSheetState("expanded");
      await generate({
        routeAnalysisId: result.routeAnalysisId,
        routeId: recommendedRoute,
        origin: resolvedOrigin.address,
        destination: resolvedDestination.address,
        travelMode: request.travelMode,
        conditions,
      });
    } catch {
      setSheetState("mid");
    } finally {
      setIsResolvingPlace(false);
    }
  };

  return (
    <main className="map-workspace">
      <MapVisual
        destination={destination}
        origin={origin}
        routes={analyzedRoutes}
        selected={activeRoute}
        label={`Peta rute dari ${origin.address} ke ${destination.address}`}
      />

      <nav className="map-floating-nav" aria-label="Navigasi peta">
        <Link href="/" aria-label="Kembali ke beranda">
          <Home aria-hidden="true" />
        </Link>
        <Link href="/profile" aria-label="Buka profil kesehatan">
          <HeartPulse aria-hidden="true" />
        </Link>
        <Link href="/alerts" aria-label="Buka alert AQI">
          <Bell aria-hidden="true" />
        </Link>
      </nav>

      <form className="map-search-panel" aria-label="Pencarian rute" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="field-group">
          <label htmlFor="origin">Asal</label>
          <div className="input-with-icon">
            <Search aria-hidden="true" />
            <input
              id="origin"
              placeholder="Dari mana?"
              {...register("origin.address")}
              aria-describedby={errors.origin?.address ? "origin-error" : undefined}
              aria-invalid={Boolean(errors.origin?.address)}
              onFocus={() => setActiveLocationField("origin")}
            />
            <input type="hidden" {...register("origin.lat", { valueAsNumber: true })} />
            <input type="hidden" {...register("origin.lng", { valueAsNumber: true })} />
          </div>
          {errors.origin?.address ? (
            <p className="field-error" id="origin-error">
              {errors.origin.address.message}
            </p>
          ) : null}
        </div>
        <div className="field-group">
          <label htmlFor="destination">Tujuan</label>
          <div className="input-with-icon">
            <Search aria-hidden="true" />
            <input
              id="destination"
              placeholder="Mau ke mana?"
              {...register("destination.address")}
              aria-describedby={errors.destination?.address ? "destination-error" : undefined}
              aria-invalid={Boolean(errors.destination?.address)}
              onFocus={() => setActiveLocationField("destination")}
            />
            <input type="hidden" {...register("destination.lat", { valueAsNumber: true })} />
            <input type="hidden" {...register("destination.lng", { valueAsNumber: true })} />
          </div>
          {errors.destination?.address ? (
            <p className="field-error" id="destination-error">
              {errors.destination.address.message}
            </p>
          ) : null}
        </div>

        <input type="hidden" {...register("travelMode")} />
        <div className="segmented-control route-mode-control" role="group" aria-label="Mode perjalanan rute">
          <button
            aria-pressed={travelMode === "WALK"}
            className={travelMode === "WALK" ? "active" : ""}
            type="button"
            onClick={() => setTravelMode("WALK")}
          >
            <Footprints aria-hidden="true" />
            Jalan kaki
          </button>
          <button
            aria-pressed={travelMode === "BICYCLE"}
            className={travelMode === "BICYCLE" ? "active" : ""}
            type="button"
            onClick={() => setTravelMode("BICYCLE")}
          >
            <Bike aria-hidden="true" />
            Sepeda
          </button>
        </div>

        <div className="map-search-actions">
          <Button
            data-testid="search-route-btn"
            icon={Search}
            loading={routeAnalysis.isPending || isResolvingPlace}
            type="submit"
          >
            Analisis rute
          </Button>
          <IconButton
            disabled={isLocating}
            label={isLocating ? "Mengambil lokasi saat ini" : "Gunakan lokasi saat ini"}
            icon={LocateFixed}
            onClick={requestLocation}
          />
          <IconButton label="Filter kesehatan rute" icon={SlidersHorizontal} />
        </div>
        <div className="suggestion-list" aria-label={`Saran lokasi untuk ${activeLocationField}`}>
          {apiKey && isPlacesLoaded ? (
            predictions.length > 0 ? (
              predictions.map((prediction, index) => (
                <button
                  data-testid={`${activeLocationField}-suggestion-${index}`}
                  key={prediction.placeId}
                  type="button"
                  onClick={() => resolvePlaceId(activeLocationField, prediction)}
                >
                  <Search aria-hidden="true" />
                  <span>{prediction.description}</span>
                </button>
              ))
            ) : activeAddress.trim().length >= 3 ? (
              <span className="suggestion-empty">Tidak ada saran Google Places untuk input ini.</span>
            ) : null
          ) : (
            placeSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <button
                  data-testid={`${activeLocationField}-suggestion-${index}`}
                  key={suggestion.label}
                  type="button"
                  onClick={() =>
                    setPlace(activeLocationField, {
                      address: suggestion.label,
                      lat: suggestion.lat,
                      lng: suggestion.lng,
                    })
                  }
                >
                  <Icon aria-hidden="true" />
                  <span>{suggestion.label}</span>
                </button>
              );
            })
          )}
        </div>
        <div aria-live="polite" className="form-status">
          <span>Mode: {routeModeLabel(travelMode)}</span>
          {routeAnalysis.data?.source === "api" ? <span>Data real Google Routes dan AQI aktif.</span> : null}
          {routeAnalysis.data?.source === "mock" ? <span>Fallback mock aktif. Periksa konfigurasi provider.</span> : null}
        </div>
        {locationError ? (
          <p className="form-alert" role="alert">
            {locationError}
          </p>
        ) : null}
        {routeAnalysis.error ? (
          <p className="form-alert" role="alert">
            {getRouteErrorMessage(routeAnalysis.error)}
          </p>
        ) : null}
      </form>

      <aside className={`bottom-sheet bottom-sheet-${sheetState}`} aria-label="Hasil analisis rute">
        <div className="sheet-handle">
          <button type="button" aria-label="Tampilkan ringkas" onClick={() => setSheetState("collapsed")}>
            <span />
          </button>
        </div>
        <div className="sheet-topline">
          <div>
            <span className="eyebrow">Perbandingan rute</span>
            <h1>
              {origin.address} ke {destination.address}
            </h1>
          </div>
          <button
            className="sheet-close"
            type="button"
            aria-label="Tutup detail rute"
            onClick={() => setSheetState(sheetState === "collapsed" ? "mid" : "collapsed")}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="sheet-tabs" role="tablist" aria-label="Status panel rute">
          {(["collapsed", "mid", "expanded"] as const).map((state) => (
            <button
              aria-selected={sheetState === state}
              key={state}
              role="tab"
              type="button"
              className={sheetState === state ? "active" : ""}
              onClick={() => setSheetState(state)}
            >
              {state === "collapsed" ? "Ringkas" : state === "mid" ? "Bandingkan" : "Detail"}
            </button>
          ))}
        </div>

        <div className="route-choice-grid" data-testid="route-compare">
          {hasAnalysis ? analyzedRoutes.map((route) => {
            const routeId = toRouteChoiceId(route.id);
            return (
              <button
                className={`route-choice ${activeRoute === routeId ? "active" : ""}`}
                data-testid={routeId === "fastest" ? "fastest-route" : "healthiest-route"}
                key={route.id}
                type="button"
                onClick={() => {
                  setActiveRoute(routeId);
                  setSheetState("expanded");
                }}
              >
                <strong>{route.label}</strong>
                <span>{route.duration}</span>
                <em>Skor {route.score}</em>
              </button>
            );
          }) : <p className="empty-state">Hasil rute real akan muncul setelah analisis berhasil.</p>}
        </div>

        <div className="sheet-scroll">
          {hasAnalysis ? analyzedRoutes.map((route) => {
            const routeId = toRouteChoiceId(route.id);
            return (
              <div
                className="route-card-button"
                key={route.id}
                onClick={() => setActiveRoute(routeId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveRoute(routeId);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <RouteCard route={route} selected={activeRoute === routeId} />
              </div>
            );
          }) : null}

          {routeAnalysis.data?.routeAnalysisId ? (
            <LinkButton href={`/result/${routeAnalysis.data.routeAnalysisId}`} className="full-width">
              Buka detail rute
            </LinkButton>
          ) : null}

          <section className="ai-recommendation" aria-live="polite" data-testid="ai-recommendation">
            <span className="eyebrow">Rekomendasi AI</span>
            <p>{recommendation}</p>
          </section>

          <section className="sheet-detail-block">
            <div className="section-heading compact-heading">
              <span className="eyebrow">Detail segmen</span>
              <h2>{selected?.label ?? "Belum ada hasil"}</h2>
            </div>
            {selected ? <SegmentList segments={selected.segments} /> : <p className="form-help">Jalankan analisis untuk melihat segmen AQI real.</p>}
          </section>
        </div>
      </aside>
    </main>
  );
}
