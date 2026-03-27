import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Q-Shield — Parametric Income Insurance for Delivery Workers",
  description: "AI-powered income protection for Q-Commerce delivery workers",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  );
}
