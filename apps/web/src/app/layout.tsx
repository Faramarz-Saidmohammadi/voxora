import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Voxora — Governed voice infrastructure",
    template: "%s | Voxora",
  },
  description:
    "Multi-tenant voice accessibility infrastructure with provider-independent workflows, usage governance, and auditability.",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Voxora",
    description: "Voice infrastructure without the vendor lock-in.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07120f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
