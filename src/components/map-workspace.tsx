"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, HeartPulse, Home, LocateFixed, Search, SlidersHorizontal, X } from "lucide-react";
import { placeSuggestions, routes } from "@/lib/mock-data";
import { Button, IconButton, LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { RouteCard } from "@/components/route-card";
import { SegmentList } from "@/components/segment-list";

type SheetState = "collapsed" | "mid" | "expanded";
type SelectedRoute = "healthy" | "fastest";

export function MapWorkspace() {
  const [sheetState, setSheetState] = useState<SheetState>("mid");
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute>("healthy");
  const selected = useMemo(() => routes.find((route) => route.id === selectedRoute) ?? routes[0], [selectedRoute]);

  return (
    <main className="map-workspace">
      <MapVisual selected={selectedRoute} label="Peta rute dari Tebet ke Sudirman" />

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

      <section className="map-search-panel" aria-label="Pencarian rute">
        <div className="field-group">
          <label htmlFor="origin">Asal</label>
          <div className="input-with-icon">
            <Search aria-hidden="true" />
            <input id="origin" defaultValue="Rumah, Tebet" />
          </div>
        </div>
        <div className="field-group">
          <label htmlFor="destination">Tujuan</label>
          <div className="input-with-icon">
            <Search aria-hidden="true" />
            <input id="destination" defaultValue="Kantor, Sudirman" />
          </div>
        </div>
        <div className="map-search-actions">
          <Button icon={Search} onClick={() => setSheetState("mid")}>
            Analisis rute
          </Button>
          <IconButton label="Gunakan lokasi saat ini" icon={LocateFixed} />
          <IconButton label="Filter kesehatan rute" icon={SlidersHorizontal} />
        </div>
        <div className="suggestion-list" aria-label="Saran lokasi">
          {placeSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <button key={suggestion.label} type="button">
                <Icon aria-hidden="true" />
                <span>{suggestion.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className={`bottom-sheet bottom-sheet-${sheetState}`} aria-label="Hasil analisis rute">
        <div className="sheet-handle">
          <button type="button" aria-label="Tampilkan ringkas" onClick={() => setSheetState("collapsed")}>
            <span />
          </button>
        </div>
        <div className="sheet-topline">
          <div>
            <span className="eyebrow">Perbandingan rute</span>
            <h1>Tebet ke Sudirman</h1>
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
              key={state}
              type="button"
              className={sheetState === state ? "active" : ""}
              onClick={() => setSheetState(state)}
            >
              {state === "collapsed" ? "Ringkas" : state === "mid" ? "Bandingkan" : "Detail"}
            </button>
          ))}
        </div>

        <div className="route-choice-grid">
          {routes.map((route) => (
            <button
              className={`route-choice ${selectedRoute === route.id ? "active" : ""}`}
              key={route.id}
              type="button"
              onClick={() => {
                setSelectedRoute(route.id as SelectedRoute);
                setSheetState("expanded");
              }}
            >
              <strong>{route.label}</strong>
              <span>{route.duration}</span>
              <em>Skor {route.score}</em>
            </button>
          ))}
        </div>

        <div className="sheet-scroll">
          {routes.map((route) => (
            <div
              className="route-card-button"
              key={route.id}
              onClick={() => setSelectedRoute(route.id as SelectedRoute)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedRoute(route.id as SelectedRoute);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <RouteCard route={route} selected={selectedRoute === route.id} />
            </div>
          ))}

          <LinkButton href="/result/demo-route" className="full-width">
            Buka detail rute
          </LinkButton>

          <section className="ai-recommendation" aria-live="polite">
            <span className="eyebrow">Rekomendasi AI</span>
            <p>
              Pilih rute sehat untuk perjalanan siang ini. Durasi bertambah 5 menit, tetapi paparan AQI tinggi turun
              signifikan dan segmen teduh lebih panjang.
            </p>
          </section>

          <section className="sheet-detail-block">
            <div className="section-heading compact-heading">
              <span className="eyebrow">Detail segmen</span>
              <h2>{selected.label}</h2>
            </div>
            <SegmentList segments={selected.segments} />
          </section>
        </div>
      </aside>
    </main>
  );
}
