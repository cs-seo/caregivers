import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateCarers } from "./data/generate-carers";
import { insertCarer } from "./insert-carer";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "CareProof123!";
const COUNT = 480;

async function main() {
  const [specialties, cities, existingUsers, existingSlugs] = await Promise.all([
    prisma.specialty.findMany(),
    prisma.city.findMany({ include: { state: true } }),
    prisma.user.findMany({ select: { email: true } }),
    prisma.caregiverProfile.findMany({ select: { slug: true } }),
  ]);

  if (specialties.length === 0 || cities.length === 0) {
    throw new Error("Run the main seed first so specialties and cities exist.");
  }

  const specBySlug = Object.fromEntries(specialties.map((item) => [item.slug, item]));
  const cityByKey = Object.fromEntries(cities.map((city) => [`${city.state.slug}:${city.slug}`, city.id]));
  const emails = new Set(existingUsers.map((user) => user.email));
  const slugs = new Set(existingSlugs.map((profile) => profile.slug));
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const generated = generateCarers(COUNT).filter(
    (carer) => !emails.has(carer.email) && !slugs.has(carer.slug) && cityByKey[`${carer.state}:${carer.city}`],
  );

  let created = 0;
  const newProfileIds: string[] = [];
  for (const carer of generated) {
    const cityId = cityByKey[`${carer.state}:${carer.city}`];
    const user = await insertCarer(prisma, carer, passwordHash, specBySlug, cityId);
    if (user.caregiverProfile) newProfileIds.push(user.caregiverProfile.id);
    created += 1;
    if (created % 50 === 0) console.log(`Created ${created}/${generated.length}...`);
  }

  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const agedCare = specBySlug["aged-care"] ?? specialties[0];
  if (family && newProfileIds.length > 0) {
    const reviewCount = Math.min(90, newProfileIds.length);
    for (let i = 0; i < reviewCount; i += 2) {
      const caregiverId = newProfileIds[i];
      const profile = await prisma.caregiverProfile.findUnique({ where: { id: caregiverId } });
      if (!profile) continue;
      const hours = 4;
      const subtotal = profile.hourlyRateCents * hours;
      const fee = Math.round(subtotal * 0.1);
      const start = new Date("2026-05-01T09:00:00+10:00");
      start.setDate(start.getDate() + i);
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
      const booking = await prisma.booking.create({
        data: {
          familyId: family.id,
          caregiverId,
          specialtyId: agedCare.id,
          startAt: start,
          endAt: end,
          hours,
          rateCents: profile.hourlyRateCents,
          subtotalCents: subtotal,
          platformFeeCents: fee,
          gstCents: Math.round(subtotal / 11),
          totalCents: subtotal + fee,
          status: "released",
          payment: {
            create: {
              provider: "demo",
              amountCents: subtotal + fee,
              platformFeeCents: fee,
              caregiverPayoutCents: subtotal,
              status: "released",
              heldAt: start,
              releasedAt: end,
            },
          },
        },
      });
      const rating = 4 + (i % 2);
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          authorId: family.id,
          caregiverId,
          rating,
          body: "Reliable, on time, and left a clear handover. Would book again through CareProof.",
        },
      });
      await prisma.caregiverProfile.update({
        where: { id: caregiverId },
        data: { ratingAvg: rating, reviewCount: 1, completedJobs: 1 },
      });
    }
  }

  const total = await prisma.caregiverProfile.count();
  console.log(`Added ${created} carers. Directory now has ${total} profiles.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
