import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "Find verified carers, nannies and NDIS support workers across Australia. Payment is held in escrow until care is complete.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#0f3d38",
    lang: "en-AU",
    categories: ["health", "lifestyle", "medical"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
