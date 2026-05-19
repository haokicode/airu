import { notFound } from "next/navigation";
import { ArrowLeft, Download, Navigation, Share2 } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { MapVisual } from "@/components/map-visual";
import { RouteCard } from "@/components/route-card";
import { SegmentList } from "@/components/segment-list";
import { Button, IconButton, LinkButton } from "@/components/ui";
import { getAdminDb } from "@/lib/firebase/admin";
import type { RouteAnalysisResult } from "@/lib/airu-types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ResultPage({ params }: Props) {
  const { id } = await params;

  if (id === "demo-route") {
    // Handle demo route for preview/testing
    const { routes: mockRoutes } = await import("@/lib/mock-data");
    return <ResultView id="demo" result={{
      routes: mockRoutes,
      recommendedRouteId: "healthy",
      summary: "Ini adalah rute demo untuk pengujian UI.",
      source: "mock",
      analyzedAt: new Date().toISOString()
    }} />;
  }

  const db = getAdminDb();
  if (!db) {
    return notFound();
  }

  const doc = await db.collection("routes").doc(id).get();
  if (!doc.exists) {
    return notFound();
  }

  const data = doc.data() as RouteAnalysisResult;
  return <ResultView id={id} result={data} />;
}

function ResultView({ id, result }: { id: string; result: RouteAnalysisResult }) {
  const healthy = result.routes.find((r) => r.id === "healthy") ?? result.routes[0];
  const fastest = result.routes.find((r) => r.id === "fastest") ?? result.routes[1];

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
          <MapVisual
            destination={result.destination}
            origin={result.origin}
            selected="healthy"
            routes={result.routes}
            label={`Detail rute dari ${id}`}
          />
          <aside className="result-summary">
            <span className="eyebrow">Hasil analisis</span>
            <h1>{result.recommendedRouteId === "healthy" ? "Rute sehat direkomendasikan." : "Rute tercepat dipilih."}</h1>
            <p>{result.summary}</p>
            <div className="result-metrics">
              <div>
                <strong>{healthy.score}</strong>
                <span>Skor sehat</span>
              </div>
              <div>
                <strong>{healthy.duration}</strong>
                <span>Durasi</span>
              </div>
              <div>
                <strong>AQI {healthy.aqi}</strong>
                <span>{healthy.aqiLabel}</span>
              </div>
            </div>
            <Button icon={Navigation}>Mulai rute sehat</Button>
          </aside>
        </section>

        <section className="result-content-grid">
          <div className="route-stack">
            <RouteCard route={healthy} selected={result.recommendedRouteId === "healthy"} />
            {fastest && <RouteCard route={fastest} selected={result.recommendedRouteId === "fastest"} />}
          </div>
          <aside className="ai-card" aria-live="polite">
            <span className="eyebrow">Rekomendasi AI</span>
            <h2>{result.recommendedRouteId === "healthy" ? "Berangkat lewat rute sehat." : "Rute tercepat tersedia."}</h2>
            <p>
              {result.aiRecommendation ?? "Gunakan detail segmen di bawah untuk melihat titik-titik dengan paparan polusi tinggi atau area yang kurang teduh."}
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
