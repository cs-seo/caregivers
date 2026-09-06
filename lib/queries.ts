import { prisma } from "./prisma";
import { computeTrustScore } from "./trust";

export const caregiverCardInclude = {
  user: { select: { name: true } },
  city: { include: { state: true } },
  specialties: { include: { specialty: true } },
  credentials: true,
  workHistory: true,
} as const;

export type CaregiverCard = Awaited<
  ReturnType<typeof prisma.caregiverProfile.findMany<{ include: typeof caregiverCardInclude }>>
>[number];

export function withTrust<T extends CaregiverCard>(profile: T) {
  const score = computeTrustScore({
    credentials: profile.credentials,
    workHistory: profile.workHistory,
    ratingAvg: profile.ratingAvg,
    reviewCount: profile.reviewCount,
    completedJobs: profile.completedJobs,
    verifiedHours: profile.verifiedHours,
    abn: profile.abn,
  });
  return { ...profile, trustScore: score };
}

export async function getSpecialties() {
  try {
    return await prisma.specialty.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export async function getStates() {
  try {
    return await prisma.state.findMany({
      include: { cities: { orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getSpecialty(slug: string) {
  return prisma.specialty.findUnique({ where: { slug } });
}

export async function getState(slug: string) {
  return prisma.state.findUnique({
    where: { slug },
    include: { cities: { orderBy: { name: "asc" } } },
  });
}

export async function getCity(stateSlug: string, citySlug: string) {
  return prisma.city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: { state: true, suburbs: { orderBy: { name: "asc" } } },
  });
}

export async function getSuburb(stateSlug: string, citySlug: string, suburbSlug: string) {
  return prisma.suburb.findFirst({
    where: {
      slug: suburbSlug,
      city: { slug: citySlug, state: { slug: stateSlug } },
    },
    include: { city: { include: { state: true, suburbs: { orderBy: { name: "asc" } } } } },
  });
}

export type DirectoryFilters = {
  specialty?: string;
  state?: string;
  city?: string;
  suburb?: string;
  q?: string;
  instantBook?: boolean;
  wwcc?: boolean;
  ndis?: boolean;
  minRating?: number;
  minYears?: number;
  availableNow?: boolean;
  page?: number;
  sort?: "rating" | "rate" | "experience";
};

function caregiverOrderBy(filters: DirectoryFilters) {
  if (filters.sort === "rate") return [{ hourlyRateCents: "asc" as const }, { ratingAvg: "desc" as const }];
  if (filters.sort === "experience") return [{ yearsExperience: "desc" as const }, { ratingAvg: "desc" as const }];
  return [{ ratingAvg: "desc" as const }, { completedJobs: "desc" as const }];
}

function caregiverWhere(filters: DirectoryFilters) {
  return {
    ...(filters.q
      ? {
          OR: [
            { user: { name: { contains: filters.q } } },
            { headline: { contains: filters.q } },
            { suburb: { contains: filters.q } },
          ],
        }
      : {}),
    ...(filters.specialty
      ? { specialties: { some: { specialty: { slug: filters.specialty } } } }
      : {}),
    ...(filters.state ? { city: { state: { slug: filters.state } } } : {}),
    ...(filters.city ? { city: { slug: filters.city } } : {}),
    ...(filters.suburb ? { suburb: { contains: filters.suburb } } : {}),
    ...(filters.instantBook ? { instantBook: true } : {}),
    ...(filters.availableNow ? { availableNow: true } : {}),
    ...(filters.minRating ? { ratingAvg: { gte: filters.minRating } } : {}),
    ...(filters.minYears ? { yearsExperience: { gte: filters.minYears } } : {}),
    ...(filters.wwcc
      ? { credentials: { some: { type: "wwcc", verified: true } } }
      : {}),
    ...(filters.ndis
      ? { credentials: { some: { type: "ndis_screening", verified: true } } }
      : {}),
  };
}

export const DIRECTORY_PAGE_SIZE = 12;

export async function searchCaregivers(filters: DirectoryFilters, take = 60) {
  const caregivers = await prisma.caregiverProfile.findMany({
    where: caregiverWhere(filters),
    include: caregiverCardInclude,
    orderBy: caregiverOrderBy(filters),
    take,
  });
  return caregivers.map(withTrust);
}

export async function searchCaregiversPage(filters: DirectoryFilters, pageSize = DIRECTORY_PAGE_SIZE) {
  const page = Math.max(1, filters.page ?? 1);
  const where = caregiverWhere(filters);
  const [rows, total] = await Promise.all([
    prisma.caregiverProfile.findMany({
      where,
      include: caregiverCardInclude,
      orderBy: caregiverOrderBy(filters),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.caregiverProfile.count({ where }),
  ]);
  return {
    caregivers: rows.map(withTrust),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function directoryStats(filters: DirectoryFilters) {
  const where = caregiverWhere(filters);
  const [count, agg, reviewed] = await Promise.all([
    prisma.caregiverProfile.count({ where }),
    prisma.caregiverProfile.aggregate({
      where,
      _avg: { hourlyRateCents: true },
    }),
    prisma.caregiverProfile.aggregate({
      where: { ...where, reviewCount: { gt: 0 } },
      _avg: { ratingAvg: true },
    }),
  ]);
  return {
    count,
    avgRateCents: Math.round(agg._avg.hourlyRateCents ?? 0),
    avgRating: reviewed._avg.ratingAvg ?? 0,
  };
}

export async function searchSuburbOrCity(filters: DirectoryFilters) {
  if (!filters.suburb) {
    const caregivers = await searchCaregivers(filters);
    return { caregivers, nearby: false };
  }
  const exact = await searchCaregivers(filters);
  if (exact.length > 0) return { caregivers: exact, nearby: false };
  const { suburb: _suburb, ...rest } = filters;
  const nearby = await searchCaregivers(rest);
  return { caregivers: nearby, nearby: true };
}

export async function getCaregiverBySlug(slug: string) {
  const profile = await prisma.caregiverProfile.findUnique({
    where: { slug },
    include: {
      ...caregiverCardInclude,
      reviews: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!profile) return null;
  return withTrust(profile);
}

export async function similarCaregivers(profileId: string, cityId: string, specialtyIds: string[]) {
  const results = await prisma.caregiverProfile.findMany({
    where: {
      id: { not: profileId },
      OR: [
        { cityId },
        { specialties: { some: { specialtyId: { in: specialtyIds } } } },
      ],
    },
    include: caregiverCardInclude,
    take: 4,
    orderBy: { ratingAvg: "desc" },
  });
  return results.map(withTrust);
}
