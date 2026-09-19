import type { MetadataRoute } from "next";
import { HIRE_GUIDES } from "@/lib/seo-content";
import { isDemoMode, publicCarerWhere, publicJobWhere } from "@/lib/demo-mode";
import { siteUrl } from "@/lib/constants";
import { crawlStaticPaths } from "@/lib/crawl-links";
import { acceptingJobWhere } from "@/lib/job-status";
import { prisma } from "@/lib/prisma";
import { slugifySuburb } from "@/prisma/data/suburbs";

export const dynamic = "force-dynamic";

export async function generateSitemaps() {
  return [{ id: "static" }, { id: "locations" }, { id: "directories" }, { id: "profiles" }];
}

export default async function sitemap({
  id,
}: {
  id: string | Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await id;
  const base = siteUrl();
  const empty = { specialties: [], states: [], suburbs: [], carers: [], jobs: [], listedSuburbs: [] as ListedSuburb[] };
  const data = await Promise.all([
    prisma.specialty.findMany(),
    prisma.state.findMany({ include: { cities: true } }),
    prisma.suburb.findMany({ include: { city: { include: { state: true } } } }),
    isDemoMode()
      ? prisma.caregiverProfile.findMany({ select: { slug: true, lastActiveAt: true } })
      : prisma.caregiverProfile.findMany({
          where: publicCarerWhere(),
          select: { slug: true, lastActiveAt: true },
        }),
    isDemoMode()
      ? prisma.careRequest.findMany({
          where: { OR: [{ status: "hired" }, acceptingJobWhere()] },
          select: { slug: true, createdAt: true },
        })
      : prisma.careRequest.findMany({
          where: { AND: [publicJobWhere(), { OR: [{ status: "hired" }, acceptingJobWhere()] }] },
          select: { slug: true, createdAt: true },
        }),
    isDemoMode()
      ? Promise.resolve([] as ListedSuburb[])
      : listedPublicSuburbs(),
  ])
    .then(([specialtyRows, stateRows, suburbRows, carerRows, jobRows, listed]) => ({
      specialties: specialtyRows,
      states: stateRows,
      suburbs: suburbRows,
      carers: carerRows,
      jobs: jobRows,
      listedSuburbs: listed,
    }))
    .catch(() => empty);

  if (sitemapId === "static") {
    const now = new Date();
    const staticPaths = crawlStaticPaths().filter((path) => isDemoMode() || path !== "/care-requests");
    return [
      ...staticPaths.map((path) => ({
        url: `${base}${path || "/"}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: path === "" ? 1 : 0.8,
      })),
      ...HIRE_GUIDES.map((guide) => ({
        url: `${base}/guides/${guide.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  }

  if (sitemapId === "locations") {
    const now = new Date();
    return [
      ...data.states.map((state) => ({
        url: `${base}/locations/${state.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...data.states.flatMap((state) =>
        state.cities.map((city) => ({
          url: `${base}/locations/${state.slug}/${city.slug}`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        })),
      ),
    ];
  }

  if (sitemapId === "directories") {
    const now = new Date();
    const suburbSet = isDemoMode()
      ? null
      : new Set(data.listedSuburbs.map((row) => `${row.specialty}:${row.state}:${row.city}:${row.suburb}`));
    const pages: MetadataRoute.Sitemap = [];
    for (const specialty of data.specialties) {
      pages.push({
        url: `${base}/caregivers/${specialty.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      });
      for (const state of data.states) {
        pages.push({
          url: `${base}/caregivers/${specialty.slug}/${state.slug}`,
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.8,
        });
        for (const city of state.cities) {
          pages.push({
            url: `${base}/caregivers/${specialty.slug}/${state.slug}/${city.slug}`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
          });
        }
      }
      for (const suburb of data.suburbs) {
        const key = `${specialty.slug}:${suburb.city.state.slug}:${suburb.city.slug}:${suburb.slug}`;
        if (suburbSet && !suburbSet.has(key)) continue;
        pages.push({
          url: `${base}/caregivers/${specialty.slug}/${suburb.city.state.slug}/${suburb.city.slug}/${suburb.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
    return pages;
  }

  return [
    ...data.carers.map((carer) => ({
      url: `${base}/caregiver/${carer.slug}`,
      lastModified: carer.lastActiveAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(isDemoMode()
      ? data.jobs.map((job) => ({
          url: `${base}/care-requests/${job.slug}`,
          lastModified: job.createdAt,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }))
      : []),
  ];
}

type ListedSuburb = { specialty: string; state: string; city: string; suburb: string };

async function listedPublicSuburbs(): Promise<ListedSuburb[]> {
  const carers = await prisma.caregiverProfile.findMany({
    where: publicCarerWhere(),
    select: {
      suburb: true,
      city: { select: { slug: true, state: { select: { slug: true } } } },
      specialties: { select: { specialty: { select: { slug: true } } } },
    },
  });
  const rows: ListedSuburb[] = [];
  for (const carer of carers) {
    const suburbSlug = slugifySuburb(carer.suburb);
    for (const row of carer.specialties) {
      rows.push({
        specialty: row.specialty.slug,
        state: carer.city.state.slug,
        city: carer.city.slug,
        suburb: suburbSlug,
      });
    }
  }
  return rows;
}
