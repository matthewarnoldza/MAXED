import type { Metadata, Viewport } from "next";
import { Anton, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const archivo = Archivo({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAXED · Progressive Overload",
  description:
    "Brutalist-HUD strength-training logger. Log sets, chase PBs, and receive AI-generated workout plans that remember how you train.",
  applicationName: "MAXED",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MAXED",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${archivo.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
