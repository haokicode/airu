"use client";

import { useState } from "react";
import { Bell, Bike, Footprints, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui";
import { profileConditions } from "@/lib/mock-data";
import { useProfileStore } from "@/stores/profile-store";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const conditions = useProfileStore((state) => state.conditions);
  const travelMode = useProfileStore((state) => state.travelMode);
  const familyMode = useProfileStore((state) => state.familyMode);
  const alertAQIThreshold = useProfileStore((state) => state.alertAQIThreshold);
  const toggleCondition = useProfileStore((state) => state.toggleCondition);
  const setTravelMode = useProfileStore((state) => state.setTravelMode);
  const setFamilyMode = useProfileStore((state) => state.setFamilyMode);
  const setAlertAQIThreshold = useProfileStore((state) => state.setAlertAQIThreshold);

  return (
    <AppShell>
      <main className="profile-layout container">
        <section className="section-heading profile-heading">
          <span className="eyebrow">Profil kesehatan</span>
          <h1>Sesuaikan rekomendasi rute dengan sensitivitasmu.</h1>
          <p>
            Pengaturan ini menjadi input awal untuk penalti AQI, threshold alert, dan rekomendasi bahasa Indonesia dari
            AI.
          </p>
        </section>

        <section className="settings-grid">
          <div className="settings-panel">
            <div className="panel-heading">
              <SlidersHorizontal aria-hidden="true" />
              <div>
                <h2>Kondisi dan sensitivitas</h2>
                <p>Pilih semua kondisi yang relevan.</p>
              </div>
            </div>
            <div className="condition-grid">
              {profileConditions.map((condition) => {
                const Icon = condition.icon;
                const selected = conditions.includes(condition.id);
                return (
                  <button
                    aria-pressed={selected}
                    className={`condition-card ${selected ? "selected" : ""}`}
                    key={condition.id}
                    type="button"
                    onClick={() => {
                      setSaved(false);
                      toggleCondition(condition.id);
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <strong>{condition.label}</strong>
                    <span>{condition.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-panel">
            <div className="panel-heading">
              <Footprints aria-hidden="true" />
              <div>
                <h2>Mode perjalanan</h2>
                <p>Mode memengaruhi pilihan rute dan durasi.</p>
              </div>
            </div>
            <div className="segmented-control" role="group" aria-label="Mode perjalanan">
              <button
                aria-pressed={travelMode === "WALK"}
                className={travelMode === "WALK" ? "active" : ""}
                type="button"
                onClick={() => {
                  setSaved(false);
                  setTravelMode("WALK");
                }}
              >
                <Footprints aria-hidden="true" />
                Jalan kaki
              </button>
              <button
                aria-pressed={travelMode === "BICYCLE"}
                className={travelMode === "BICYCLE" ? "active" : ""}
                type="button"
                onClick={() => {
                  setSaved(false);
                  setTravelMode("BICYCLE");
                }}
              >
                <Bike aria-hidden="true" />
                Sepeda
              </button>
            </div>

            <div className="toggle-row">
              <div>
                <h3>Mode keluarga</h3>
                <p>Gunakan ambang risiko lebih ketat untuk anak kecil.</p>
              </div>
              <label className="switch" aria-label="Aktifkan mode keluarga">
                <input
                  checked={familyMode}
                  type="checkbox"
                  onChange={(event) => {
                    setSaved(false);
                    setFamilyMode(event.target.checked);
                  }}
                />
                <span />
              </label>
            </div>
          </div>

          <div className="settings-panel alert-settings">
            <div className="panel-heading">
              <Bell aria-hidden="true" />
              <div>
                <h2>Ambang peringatan AQI</h2>
                <p>Airu memberi peringatan saat AQI melewati nilai ini.</p>
              </div>
            </div>
            <label className="range-field" htmlFor="aqi-threshold">
              <span>AQI {alertAQIThreshold}</span>
              <input
                id="aqi-threshold"
                max="200"
                min="50"
                type="range"
                value={alertAQIThreshold}
                onChange={(event) => {
                  setSaved(false);
                  setAlertAQIThreshold(Number(event.target.value));
                }}
              />
            </label>
            <div className="threshold-scale" aria-hidden="true">
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
            </div>
          </div>

          <aside className="profile-summary">
            <ShieldCheck aria-hidden="true" />
            <span className="eyebrow">Ringkasan aktif</span>
            <h2>Rute dengan AQI tinggi akan diberi penalti lebih besar.</h2>
            <p>
              Untuk profil sensitif, segmen AQI di atas {alertAQIThreshold} akan muncul sebagai prioritas peringatan
              pada peta dan rekomendasi.
            </p>
            <div className="summary-meter" aria-label={`Sensitivitas profil ${conditions.length + 1} dari 5`}>
              <span style={{ width: `${Math.min(92, 40 + conditions.length * 12 + (familyMode ? 16 : 0))}%` }} />
            </div>
            <div className="profile-actions">
              <Button
                icon={Save}
                onClick={() => {
                  setSaved(true);
                }}
              >
                Simpan profil
              </Button>
              <LinkButton href="/map" variant="secondary">
                Lihat peta
              </LinkButton>
            </div>
            <p aria-live="polite" className="form-help">
              {saved ? "Profil disimpan di state lokal dan siap dipakai saat analisis rute." : null}
            </p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
