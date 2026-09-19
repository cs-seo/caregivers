import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultWeeklyHours } from "../lib/availability";
import { formatWeeklyHours, parseWeeklyHours } from "../lib/weekly-windows";
import { featuredCarers } from "./data/featured-carers";
import { insertCarer } from "./insert-carer";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "CareProof123!";

async function backfillWeeklyHours() {
  const missing = await prisma.caregiverProfile.findMany({
    where: { weeklyHours: null },
    select: {
      id: true,
      specialties: { select: { specialty: { select: { slug: true } } } },
    },
  });
  let updated = 0;
  for (const profile of missing) {
    const hours = defaultWeeklyHours(profile.specialties.map((item) => item.specialty.slug));
    const windows = parseWeeklyHours(hours);
    await prisma.caregiverProfile.update({
      where: { id: profile.id },
      data: { weeklyHours: formatWeeklyHours(windows) || hours },
    });
    if (windows.length) {
      await prisma.caregiverWeeklyWindow.createMany({
        data: windows.map((window) => ({
          caregiverId: profile.id,
          weekday: window.weekday,
          startMin: window.startMin,
          endMin: window.endMin,
        })),
      });
    }
    updated += 1;
  }
  return updated;
}

async function main() {
  const [specialties, cities, existing] = await Promise.all([
    prisma.specialty.findMany(),
    prisma.city.findMany({ include: { state: true } }),
    prisma.user.findMany({ select: { email: true } }),
  ]);
  const specBySlug = Object.fromEntries(specialties.map((item) => [item.slug, item]));
  const cityByKey = Object.fromEntries(cities.map((city) => [`${city.state.slug}:${city.slug}`, city.id]));
  const emails = new Set(existing.map((user) => user.email));
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.specialty.updateMany({
    where: { slug: "babysitters" },
    data: {
      description: "Date nights, last-minute sits, overnight and holiday babysitting with WWCC and child first aid.",
      seoDescription:
        "Book babysitters with verified Working with Children Checks for date nights, last-minute sits and overnight care across Australia.",
    },
  });

  let created = 0;
  let synced = 0;
  for (const carer of featuredCarers) {
    if (emails.has(carer.email)) {
      if (carer.weeklyHours) {
        const windows = parseWeeklyHours(carer.weeklyHours);
        const profile = await prisma.caregiverProfile.findFirst({
          where: { user: { email: carer.email } },
          select: { id: true },
        });
        if (profile) {
          await prisma.caregiverProfile.update({
            where: { id: profile.id },
            data: {
              weeklyHours: formatWeeklyHours(windows) || carer.weeklyHours,
              ...(carer.noticeHours != null ? { noticeHours: carer.noticeHours } : {}),
            },
          });
          await prisma.caregiverWeeklyWindow.deleteMany({ where: { caregiverId: profile.id } });
          if (windows.length) {
            await prisma.caregiverWeeklyWindow.createMany({
              data: windows.map((window) => ({
                caregiverId: profile.id,
                weekday: window.weekday,
                startMin: window.startMin,
                endMin: window.endMin,
              })),
            });
          }
          synced += 1;
        }
      }
      continue;
    }
    const cityId = cityByKey[`${carer.state}:${carer.city}`];
    if (!cityId) {
      console.warn(`Skipping ${carer.email}: missing city ${carer.state}/${carer.city}`);
      continue;
    }
    await insertCarer(prisma, carer, passwordHash, specBySlug, cityId);
    created += 1;
    console.log(`Inserted ${carer.name}`);
  }
  const backfilled = await backfillWeeklyHours();
  console.log(`Featured carers added: ${created}; hours synced: ${synced}; hours backfilled: ${backfilled}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
