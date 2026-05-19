"use client";

import { AlertTriangle, BellRing, MapPinned } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, LinkButton } from "@/components/ui";
import { useAQICurrent } from "@/hooks/use-aqi-current";
import { useProfileStore } from "@/stores/profile-store";

export default function AlertsPage() {
  const alertAQIThreshold = useProfileStore((state) => state.alertAQIThreshold);
  const { data: currentAQI, error, isLoading } = useAQICurrent({ lat: -6.2146, lng: 106.8217 });
  const isRisky = currentAQI ? currentAQI.aqi >= alertAQIThreshold : false;
  const tone = isRisky ? "danger" : currentAQI && currentAQI.aqi < 70 ? "healthy" : "caution";

  return (
    <AppShell>
      <main className="list-layout container">
        <section className="section-heading">
          <span className="eyebrow">Peringatan kualitas udara</span>
          <h1>Alert terbaru untuk lokasi dan rute yang kamu pantau.</h1>
          <p>Setiap alert memakai label teks agar tetap jelas tanpa bergantung warna.</p>
        </section>

        <section className="list-grid-layout">
          <div className="alert-list">
            {currentAQI ? (
                <article className={`alert-item ${isRisky ? "unread" : ""}`}>
                  <div className="alert-icon">
                    {isRisky ? (
                      <AlertTriangle aria-hidden="true" />
                    ) : (
                      <BellRing aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div className="alert-title-row">
                      <h2>AQI Sudirman {currentAQI.aqi}</h2>
                      <Badge tone={tone}>{isRisky ? "Berisiko" : currentAQI.category}</Badge>
                    </div>
                    <p>
                      Data AQI real dari provider aktif. Ambang profil kamu saat ini AQI {alertAQIThreshold}.
                    </p>
                    <div className="metric-grid compact">
                      <span>PM2.5 {currentAQI.pm25} ug/m3</span>
                      <span>{new Date(currentAQI.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </article>
            ) : (
              <p className="empty-state" aria-live="polite">
                {isLoading
                  ? "Memuat AQI real..."
                  : error
                    ? "AQI real belum bisa dimuat. Pastikan sudah login dan Google Air Quality API aktif."
                    : "Belum ada data AQI."}
              </p>
            )}
          </div>

          <aside className="alert-detail-panel">
            <MapPinned aria-hidden="true" />
            <span className="eyebrow">Rekomendasi saat ini</span>
            <h2>
              {currentAQI
                ? `AQI saat ini ${currentAQI.aqi} (${currentAQI.category}) di sekitar Sudirman.`
                : "Hindari koridor Sudirman utama sampai AQI turun."}
            </h2>
            <p>
              Gunakan rute alternatif yang melewati area taman atau tunggu pembaruan AQI berikutnya jika perjalanan tidak
              mendesak.
            </p>
            <p aria-live="polite" className="form-help">
              {isLoading ? "Memuat AQI terbaru..." : currentAQI ? `PM2.5 ${currentAQI.pm25} ug/m3.` : null}
            </p>
            <LinkButton href="/map" variant="secondary">
              Cari rute lain
            </LinkButton>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
