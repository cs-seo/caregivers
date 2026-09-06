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
  return prisma.specialty.findMany({ orderBy: { name: "asc" } });
}

export async function getStates() {
  return prisma.state.findMany({
    include: { cities: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });
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
};

export async function searchCaregivers(filters: DirectoryFilters, take = 60) {
  const caregivers = await prisma.caregiverProfile.findMany({
    where: {
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
    },
    include: caregiverCardInclude,
    orderBy: [{ ratingAvg: "desc" }, { completedJobs: "desc" }],
    take,
  });
  return caregivers.map(withTrust);
}

export async function directoryStats(
  filters: Pick<DirectoryFilters, "specialty" | "state" | "city" | "suburb">,
) {
  const where = {
    ...(filters.specialty
      ? { specialties: { some: { specialty: { slug: filters.specialty } } } }
      : {}),
    ...(filters.state ? { city: { state: { slug: filters.state } } } : {}),
      ...(filters.city ? { city: { slug: filters.city } } : {}),
      ...(filters.suburb ? { suburb: { contains: filters.suburb } } : {}),
  };
  const [count, agg] = await Promise.all([
    prisma.caregiverProfile.count({ where }),
    prisma.caregiverProfile.aggregate({
      where,
      _avg: { hourlyRateCents: true, ratingAvg: true },
    }),
  ]);
  return {
    count,
    avgRateCents: Math.round(agg._avg.hourlyRateCents ?? 0),
    avgRating: agg._avg.ratingAvg ?? 0,
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
