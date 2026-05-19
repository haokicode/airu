"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LockKeyhole, Mail, MapPinned } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { loginFormSchema, type LoginFormValues } from "@/schemas/login-form";
import { useAuthStore } from "@/stores/auth-store";
import { auth } from "@/lib/firebase/client";
import { fetchJson } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);

    if (!auth) {
      setAuthError("Konfigurasi Firebase client belum lengkap. Cek variabel NEXT_PUBLIC_FIREBASE_* di .env.local.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await userCredential.user.getIdToken();

      // Set session cookie via API
      await fetchJson("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      setUser({
        id: userCredential.user.uid,
        email: userCredential.user.email ?? "",
        displayName: userCredential.user.displayName ?? "User Airu",
      });

      router.push("/profile");
    } catch (error) {
      console.error("Login failed:", error);
      setAuthError(getAuthErrorMessage(error));
    }
  };

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
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <label className="field-group" htmlFor="email">
              Email
              <span className="input-with-icon">
                <Mail aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={Boolean(errors.email)}
                />
              </span>
              {errors.email ? (
                <span className="field-error" id="email-error">
                  {errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="field-group" htmlFor="password">
              Password
              <span className="input-with-icon">
                <LockKeyhole aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={Boolean(errors.password)}
                />
              </span>
              {errors.password ? (
                <span className="field-error" id="password-error">
                  {errors.password.message}
                </span>
              ) : null}
            </label>
            <Button className="full-width" icon={MapPinned} loading={isSubmitting} type="submit">
              Masuk dan atur profil
            </Button>
            {authError ? (
              <p className="form-alert" role="alert">
                {authError}
              </p>
            ) : null}
            <LinkButton href="/map" variant="secondary" className="full-width">
              Lihat peta tanpa analisis
            </LinkButton>
          </form>
        </section>
      </main>
    </AppShell>
  );
}

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return "Login gagal. Coba lagi setelah koneksi dan konfigurasi Firebase dicek.";
  }

  switch (error.code) {
    case "auth/configuration-not-found":
      return "Firebase Authentication belum diaktifkan untuk project ini. Buka Firebase Console > Authentication > Get started, lalu aktifkan provider Email/Password.";
    case "auth/operation-not-allowed":
      return "Provider Email/Password belum aktif di Firebase Authentication.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email atau password tidak valid.";
    case "auth/unauthorized-domain":
      return "Domain localhost belum diizinkan di Firebase Authentication > Settings > Authorized domains.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan login. Tunggu beberapa menit, lalu coba lagi.";
    default:
      return `Login gagal: ${error.code}`;
  }
}
