import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { isDemoMode } from "@/lib/demo-mode";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/login",
          "/register",
          "/forgot-password",
          "/api/",
          "/post-a-job",
          "/feed/",
          ...(!isDemoMode() ? ["/care-requests"] : []),
        ],
      },
    ],
    sitemap: [
      `${siteUrl()}/sitemap/static.xml`,
      `${siteUrl()}/sitemap/locations.xml`,
      `${siteUrl()}/sitemap/directories.xml`,
      `${siteUrl()}/sitemap/profiles.xml`,
    ],
  };
}
