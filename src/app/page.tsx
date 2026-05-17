import { ArrowRight, Bell, HeartPulse, Leaf, MapPin, ShieldCheck, Wind } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { RouteCard } from "@/components/route-card";
import { routes } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell>
      <main>
        <section className="hero-section">
          <MapVisual label="Visual rute Airu dengan perbandingan rute sehat dan rute tercepat" />
          <div className="hero-overlay">
            <div className="hero-copy">
              <span className="eyebrow">Rute tercepat bukan selalu rute terbaik</span>
              <h1>Airu</h1>
              <p>
                Bandingkan rute harian berdasarkan durasi, AQI, panas, dan profil kesehatan sebelum mulai berjalan.
              </p>
              <div className="hero-actions">
                <LinkButton href="/map" trailing>
                  Rencanakan rute
                </LinkButton>
                <LinkButton href="/profile" variant="secondary" icon={HeartPulse}>
                  Atur profil
                </LinkButton>
              </div>
            </div>
          </div>
          <div className="hero-route-preview">
            <RouteCard route={routes[0]} selected href="/result/demo-route" />
          </div>
        </section>

        <section className="home-summary container">
          <article>
            <Leaf aria-hidden="true" />
            <h2>Skor sehat 0-100</h2>
            <p>AQI, keteduhan, panas, dan area hijau diringkas menjadi skor yang mudah dibandingkan.</p>
          </article>
          <article>
            <MapPin aria-hidden="true" />
            <h2>Segmen berwarna</h2>
            <p>Setiap bagian rute punya label Baik, Waspada, atau Berisiko. Tidak bergantung warna saja.</p>
          </article>
          <article>
            <Wind aria-hidden="true" />
            <h2>Rekomendasi sensitif</h2>
            <p>Profil asma, keluarga, dan threshold AQI mengubah prioritas rekomendasi.</p>
          </article>
          <article>
            <Bell aria-hidden="true" />
            <h2>Alert AQI</h2>
            <p>Peringatan membantu pengguna mengubah rute saat kualitas udara memburuk.</p>
          </article>
        </section>

        <section className="comparison-band">
          <div className="container comparison-grid">
            <div className="section-heading">
              <span className="eyebrow">Preview keputusan</span>
              <h2>Pilih lebih cepat, atau lebih aman untuk paru-paru.</h2>
              <p>
                Airu menampilkan tradeoff secara eksplisit: rute tercepat tetap tersedia, tetapi rute sehat diberi
                konteks yang jelas.
              </p>
              <LinkButton href="/map" variant="secondary" icon={ShieldCheck}>
                Buka peta
              </LinkButton>
            </div>
            <div className="route-stack">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} selected={route.recommended} href="/result/demo-route" />
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container cta-inner">
            <div>
              <span className="eyebrow">Mulai dari profil</span>
              <h2>Rute sehat lebih akurat saat Airu tahu sensitivitasmu.</h2>
            </div>
            <LinkButton href="/profile" icon={ArrowRight}>
              Lengkapi profil
            </LinkButton>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
