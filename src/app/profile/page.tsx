import { Bell, Bike, Footprints, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui";
import { profileConditions } from "@/lib/mock-data";

export default function ProfilePage() {
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
                return (
                  <button className={`condition-card ${condition.selected ? "selected" : ""}`} key={condition.id}>
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
              <button className="active" type="button">
                <Footprints aria-hidden="true" />
                Jalan kaki
              </button>
              <button type="button">
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
                <input type="checkbox" />
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
              <span>AQI 110</span>
              <input id="aqi-threshold" type="range" min="50" max="200" defaultValue="110" />
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
              Untuk profil sensitif, segmen AQI di atas 100 akan muncul sebagai prioritas peringatan pada peta dan
              rekomendasi.
            </p>
            <div className="summary-meter">
              <span style={{ width: "72%" }} />
            </div>
            <div className="profile-actions">
              <Button icon={Save}>Simpan profil</Button>
              <LinkButton href="/map" variant="secondary">
                Lihat peta
              </LinkButton>
            </div>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
