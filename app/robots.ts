import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/register", "/api/", "/post-a-job", "/feed/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
