import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { featuredCarers } from "./data/featured-carers";
import { insertCarer } from "./insert-carer";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "CareProof123!";

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
  for (const carer of featuredCarers) {
    if (emails.has(carer.email)) continue;
    const cityId = cityByKey[`${carer.state}:${carer.city}`];
    if (!cityId) {
      console.warn(`Skipping ${carer.email}: missing city ${carer.state}/${carer.city}`);
      continue;
    }
    await insertCarer(prisma, carer, passwordHash, specBySlug, cityId);
    created += 1;
    console.log(`Inserted ${carer.name}`);
  }
  console.log(`Featured carers added: ${created}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
