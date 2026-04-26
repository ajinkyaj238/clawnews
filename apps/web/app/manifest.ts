import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f6f8f5",
    categories: ["news", "productivity"],
    description:
      "Daily event briefs with claims, source context, visible interests, and recent changes.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "any",
        src: "/icons/icon.svg",
        type: "image/svg+xml"
      },
      {
        purpose: "maskable",
        sizes: "any",
        src: "/icons/maskable-icon.svg",
        type: "image/svg+xml"
      }
    ],
    id: "/",
    name: "Clawnews",
    orientation: "portrait-primary",
    scope: "/",
    short_name: "Clawnews",
    start_url: "/",
    theme_color: "#0f766e"
  };
}
