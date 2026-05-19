"use client";

import { AlertTriangle, BellRing, MapPinned } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, LinkButton } from "@/components/ui";
import { useAQICurrent } from "@/hooks/use-aqi-current";
import { alerts } from "@/lib/mock-data";

export default function AlertsPage() {
  const { data: currentAQI, isLoading } = useAQICurrent({ lat: -6.2146, lng: 106.8217 });

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
            {alerts.map((alert) => {
              const tone = alert.status === "Berisiko" ? "danger" : alert.status === "Membaik" ? "healthy" : "caution";
              return (
                <article className={`alert-item ${alert.unread ? "unread" : ""}`} key={alert.id}>
                  <div className="alert-icon">
                    {alert.status === "Berisiko" ? (
                      <AlertTriangle aria-hidden="true" />
                    ) : (
                      <BellRing aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div className="alert-title-row">
                      <h2>{alert.title}</h2>
                      <Badge tone={tone}>{alert.status}</Badge>
                    </div>
                    <p>{alert.description}</p>
                    <div className="metric-grid compact">
                      <span>AQI {alert.aqi}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </article>
              );
            })}
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
