import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { PwaRegistrar } from "@/components/PwaRegistrar";

import "./globals.css";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clawnews"
  },
  applicationName: "Clawnews",
  description:
    "Daily event briefs with claims, source context, visible interests, and recent changes.",
  icons: {
    apple: "/icons/icon.svg",
    icon: "/icons/icon.svg",
    shortcut: "/icons/icon.svg"
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://clawnews.local"),
  title: {
    default: "Clawnews",
    template: "%s | Clawnews"
  }
};

export const viewport: Viewport = {
  colorScheme: "light",
  initialScale: 1,
  themeColor: "#0f766e",
  width: "device-width"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
