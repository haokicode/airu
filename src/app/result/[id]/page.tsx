import { ArrowLeft, Download, Navigation, Share2 } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MapVisual } from "@/components/map-visual";
import { RouteCard } from "@/components/route-card";
import { SegmentList } from "@/components/segment-list";
import { Button, IconButton, LinkButton } from "@/components/ui";
import { routes } from "@/lib/mock-data";

export default function ResultPage() {
  const healthy = routes[0];
  const fastest = routes[1];

  return (
    <AppShell>
      <main className="result-layout container">
        <div className="page-actions">
          <Link href="/map" className="back-link">
            <ArrowLeft aria-hidden="true" />
            Kembali ke peta
          </Link>
          <div>
            <IconButton label="Bagikan rute" icon={Share2} />
            <IconButton label="Unduh ringkasan rute" icon={Download} />
          </div>
        </div>

        <section className="result-hero">
          <MapVisual selected="healthy" label="Detail rute sehat dari Tebet ke Sudirman" />
          <aside className="result-summary">
            <span className="eyebrow">Hasil analisis</span>
            <h1>Rute sehat direkomendasikan.</h1>
            <p>
              Tambahan 5 menit mengurangi paparan segmen AQI tinggi dan memberi jalur yang lebih teduh untuk profil
              sensitif.
            </p>
            <div className="result-metrics">
              <div>
                <strong>81</strong>
                <span>Skor sehat</span>
              </div>
              <div>
                <strong>28 min</strong>
                <span>Durasi</span>
              </div>
              <div>
                <strong>AQI 64</strong>
                <span>Sedang</span>
              </div>
            </div>
            <Button icon={Navigation}>Mulai rute sehat</Button>
          </aside>
        </section>

        <section className="result-content-grid">
          <div className="route-stack">
            <RouteCard route={healthy} selected />
            <RouteCard route={fastest} />
          </div>
          <aside className="ai-card" aria-live="polite">
            <span className="eyebrow">Rekomendasi AI</span>
            <h2>Berangkat lewat rute sehat.</h2>
            <p>
              Rute sehat lebih cocok untuk profil asma karena menghindari koridor lalu lintas berat. Gunakan masker jika
              harus melewati persimpangan padat dengan AQI 96, dan pertahankan kecepatan jalan santai saat panas
              meningkat.
            </p>
            <LinkButton href="/history" variant="secondary">
              Lihat riwayat
            </LinkButton>
          </aside>
        </section>

        <section className="segments-section">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Detail segmen</span>
            <h2>Bagian rute yang perlu diperhatikan</h2>
          </div>
          <SegmentList segments={healthy.segments} />
        </section>
      </main>
    </AppShell>
  );
}
