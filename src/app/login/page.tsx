import { LockKeyhole, Mail, MapPinned } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";

export default function LoginPage() {
  return (
    <AppShell>
      <main className="auth-layout container">
        <section className="auth-visual">
          <MapVisual compact label="Preview peta setelah login" />
          <div className="auth-visual-caption">
            <span className="eyebrow">Sinkronisasi aman</span>
            <h1>Simpan profil dan riwayat perjalanan.</h1>
            <p>Login dibutuhkan untuk menyimpan preferensi kesehatan, alert AQI, dan rute yang pernah dianalisis.</p>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="login-title">
          <span className="eyebrow">Masuk ke Airu</span>
          <h1 id="login-title">Lanjutkan perjalanan sehatmu.</h1>
          <form>
            <label className="field-group" htmlFor="email">
              Email
              <span className="input-with-icon">
                <Mail aria-hidden="true" />
                <input id="email" type="email" defaultValue="demo@airu.app" autoComplete="email" />
              </span>
            </label>
            <label className="field-group" htmlFor="password">
              Password
              <span className="input-with-icon">
                <LockKeyhole aria-hidden="true" />
                <input id="password" type="password" defaultValue="airu-demo" autoComplete="current-password" />
              </span>
            </label>
            <LinkButton href="/profile" className="full-width" icon={MapPinned}>
              Masuk dan atur profil
            </LinkButton>
            <LinkButton href="/map" variant="secondary" className="full-width">
              Lanjut sebagai tamu
            </LinkButton>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
