"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LockKeyhole, Mail, MapPinned } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button, LinkButton } from "@/components/ui";
import { MapVisual } from "@/components/map-visual";
import { loginFormSchema, type LoginFormValues } from "@/schemas/login-form";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "demo@airu.app",
      password: "airu-demo",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setUser({
      id: "demo-user",
      email: values.email,
      displayName: "Demo Airu",
    });
    setLoading(false);
    router.push("/profile");
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
            <LinkButton href="/map" variant="secondary" className="full-width">
              Lanjut sebagai tamu
            </LinkButton>
          </form>
        </section>
      </main>
    </AppShell>
  );
}
