import type { PrismaClient } from "@prisma/client";
import type { GeneratedCarer } from "./data/generate-carers";

function addMonths(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

export async function insertCarer(
  prisma: PrismaClient,
  carer: GeneratedCarer,
  passwordHash: string,
  specBySlug: Record<string, { id: string }>,
  cityId: string,
) {
  const verifiedHours = carer.work.reduce((sum, role) => sum + role.hours, 0);
  return prisma.user.create({
    data: {
      email: carer.email,
      passwordHash,
      name: carer.name,
      phone: carer.phone,
      role: "CAREGIVER",
      caregiverProfile: {
        create: {
          slug: carer.slug,
          headline: carer.headline,
          bio: carer.bio,
          hourlyRateCents: carer.hourlyRateCents,
          yearsExperience: carer.yearsExperience,
          suburb: carer.suburb,
          cityId,
          abn: carer.abn,
          instantBook: carer.instantBook,
          availableNow: carer.availableNow,
          lastActiveAt: new Date(),
          verifiedHours,
          specialties: {
            create: carer.specialties
              .filter((slug) => specBySlug[slug])
              .map((slug) => ({ specialtyId: specBySlug[slug].id })),
          },
          credentials: {
            create: carer.credentials.map((credential) => ({
              type: credential.type,
              issuingState: credential.issuingState,
              expiresAt: addMonths(credential.months),
              verified: true,
              verifiedAt: new Date("2025-11-01"),
            })),
          },
          workHistory: {
            create: carer.work.map((role) => ({
              employer: role.employer,
              title: role.title,
              startDate: new Date(role.start),
              endDate: role.end ? new Date(role.end) : null,
              duties: role.duties,
              verification: role.verification,
              hours: role.hours,
            })),
          },
        },
      },
    },
    include: { caregiverProfile: true },
  });
}
