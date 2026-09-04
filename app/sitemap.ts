import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [specialties, states, carers, jobs] = await Promise.all([
    prisma.specialty.findMany(),
    prisma.state.findMany({ include: { cities: true } }),
    prisma.caregiverProfile.findMany({ select: { slug: true, lastActiveAt: true } }),
    prisma.careRequest.findMany({ select: { slug: true, createdAt: true } }),
  ]);

  const staticRoutes = ["", "/caregivers", "/care-requests", "/how-it-works", "/for-carers", "/trust-and-safety"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      changeFrequency: "daily" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const specialtyRoutes = specialties.flatMap((specialty) => {
    const pages = [
      {
        url: `${base}/caregivers/${specialty.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ];
    for (const state of states) {
      pages.push({
        url: `${base}/caregivers/${specialty.slug}/${state.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
      for (const city of state.cities) {
        pages.push({
          url: `${base}/caregivers/${specialty.slug}/${state.slug}/${city.slug}`,
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
    return pages;
  });

  return [
    ...staticRoutes,
    ...specialtyRoutes,
    ...carers.map((carer) => ({
      url: `${base}/caregiver/${carer.slug}`,
      lastModified: carer.lastActiveAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...jobs.map((job) => ({
      url: `${base}/care-requests/${job.slug}`,
      lastModified: job.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
