import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airu - Rute sehat berbasis kualitas udara",
  description: "Bandingkan rute tercepat dan rute yang lebih sehat berdasarkan AQI, panas, dan profil kesehatan.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
