import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAXED · Progressive Overload",
    short_name: "MAXED",
    description: "Brutalist-HUD strength-training logger with an AI memory layer.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
