import type { MetadataRoute } from "next";
import { HIRE_GUIDES } from "@/lib/seo-content";
import { siteUrl } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [specialties, states, suburbs, carers, jobs] = await Promise.all([
    prisma.specialty.findMany(),
    prisma.state.findMany({ include: { cities: true } }),
    prisma.suburb.findMany({ include: { city: { include: { state: true } } } }),
    prisma.caregiverProfile.findMany({ select: { slug: true, lastActiveAt: true } }),
    prisma.careRequest.findMany({ select: { slug: true, createdAt: true } }),
  ]);

  const staticRoutes = [
    "",
    "/caregivers",
    "/care-requests",
    "/how-it-works",
    "/for-carers",
    "/trust-and-safety",
    "/guides",
    "/locations",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const guideRoutes = HIRE_GUIDES.map((guide) => ({
    url: `${base}/guides/${guide.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const locationHubs = [
    ...states.map((state) => ({
      url: `${base}/locations/${state.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...states.flatMap((state) =>
      state.cities.map((city) => ({
        url: `${base}/locations/${state.slug}/${city.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ),
  ];

  const specialtyRoutes: MetadataRoute.Sitemap = specialties.flatMap((specialty) => {
    const pages: MetadataRoute.Sitemap = [
      {
        url: `${base}/caregivers/${specialty.slug}`,
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
    for (const state of states) {
      pages.push({
        url: `${base}/caregivers/${specialty.slug}/${state.slug}`,
        changeFrequency: "daily",
        priority: 0.8,
      });
      for (const city of state.cities) {
        pages.push({
          url: `${base}/caregivers/${specialty.slug}/${state.slug}/${city.slug}`,
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }
    for (const suburb of suburbs) {
      pages.push({
        url: `${base}/caregivers/${specialty.slug}/${suburb.city.state.slug}/${suburb.city.slug}/${suburb.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    return pages;
  });

  return [
    ...staticRoutes,
    ...guideRoutes,
    ...locationHubs,
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
