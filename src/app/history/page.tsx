"use client";

import { CalendarDays, MapPinned, TrendingDown } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { useHistory } from "@/hooks/use-history";
import { history } from "@/lib/mock-data";

export default function HistoryPage() {
  const { data, isLoading } = useHistory();
  const routeHistory = data?.items ?? history;

  return (
    <AppShell>
      <main className="history-layout container">
        <section className="section-heading">
          <span className="eyebrow">Riwayat rute</span>
          <h1>Pantau paparan polusi dari perjalanan yang pernah dianalisis.</h1>
          <p>Riwayat membantu melihat apakah pilihan rute sehat benar-benar menurunkan paparan AQI tinggi.</p>
        </section>

        <section className="history-stats">
          <article>
            <TrendingDown aria-hidden="true" />
            <strong>18%</strong>
            <span>Paparan turun minggu ini</span>
          </article>
          <article>
            <CalendarDays aria-hidden="true" />
            <strong>6</strong>
            <span>Rute disimpan</span>
          </article>
          <article>
            <MapPinned aria-hidden="true" />
            <strong>72</strong>
            <span>Rata-rata AQI</span>
          </article>
        </section>

        <section className="history-grid">
          <div className="history-list">
            <p aria-live="polite" className="form-help">
              {isLoading ? "Memuat riwayat rute..." : data?.source === "mock" ? "Menampilkan riwayat mock." : null}
            </p>
            {routeHistory.map((item) => {
              const tone = item.score >= 70 ? "healthy" : item.score >= 40 ? "caution" : "danger";
              return (
                <Link href={`/result/${item.id}`} className="history-item" key={item.id}>
                  <div>
                    <h2>
                      {item.from} ke {item.to}
                    </h2>
                    <p>{item.date}</p>
                  </div>
                  <div className="history-meta">
                    <Badge tone={tone}>Skor {item.score}</Badge>
                    <span>AQI {item.aqi}</span>
                    <span>{item.duration}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <aside className="history-preview">
            <MapVisual compact selected="healthy" label="Preview rute dari riwayat" />
            <div className="history-preview-copy">
              <span className="eyebrow">Rute terakhir</span>
              <h2>Rumah ke Kantor</h2>
              <p>Rute sehat menurunkan paparan koridor AQI tinggi dibanding pilihan tercepat.</p>
              <LinkButton href="/result/demo-route" variant="secondary">
                Buka detail
              </LinkButton>
            </div>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
