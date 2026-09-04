import { PrismaClient } from "@prisma/client";
import { SUBURBS_BY_CITY, slugifySuburb } from "./data/suburbs";

const prisma = new PrismaClient();

async function main() {
  const cities = await prisma.city.findMany({ include: { state: true } });
  const byKey = new Map(cities.map((city) => [`${city.state.slug}:${city.slug}`, city.id]));
  let created = 0;

  for (const [stateSlug, cityMap] of Object.entries(SUBURBS_BY_CITY)) {
    for (const [citySlug, names] of Object.entries(cityMap)) {
      const cityId = byKey.get(`${stateSlug}:${citySlug}`);
      if (!cityId) continue;
      for (const name of new Set(names)) {
        const slug = slugifySuburb(name);
        await prisma.suburb.upsert({
          where: { cityId_slug: { cityId, slug } },
          update: { name },
          create: { cityId, slug, name },
        });
        created += 1;
      }
    }
  }

  console.log(`Upserted ${created} suburbs.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
