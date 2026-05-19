import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airu - Rute sehat berbasis kualitas udara",
  description: "Bandingkan rute tercepat dan rute yang lebih sehat berdasarkan AQI, panas, dan profil kesehatan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
