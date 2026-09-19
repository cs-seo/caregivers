import { PrismaClient } from "@prisma/client";
import { CITIES_BY_STATE } from "./data/cities";
import { SUBURBS_BY_CITY, slugifySuburb } from "./data/suburbs";

const prisma = new PrismaClient();

async function main() {
  const states = await prisma.state.findMany();
  const stateBySlug = new Map(states.map((state) => [state.slug, state]));
  let citiesCreated = 0;

  for (const [stateSlug, cities] of Object.entries(CITIES_BY_STATE)) {
    const state = stateBySlug.get(stateSlug);
    if (!state) continue;
    for (const city of cities) {
      const existing = await prisma.city.findFirst({
        where: { stateId: state.id, slug: city.slug },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.city.create({
        data: {
          slug: city.slug,
          name: city.name,
          stateId: state.id,
          lat: city.lat,
          lng: city.lng,
          seoTitle: `Carers in ${city.name}, ${state.abbrev}`,
          seoDescription: `Verified carers in ${city.name}, ${state.name}. Browse aged care, nannies, NDIS support workers and more on CareProof.`,
        },
      });
      citiesCreated += 1;
    }
  }

  const cityRows = await prisma.city.findMany({ include: { state: true } });
  const byKey = new Map(cityRows.map((city) => [`${city.state.slug}:${city.slug}`, city.id]));
  let suburbsUpserted = 0;

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
        suburbsUpserted += 1;
      }
    }
  }

  console.log(`Created ${citiesCreated} cities. Upserted ${suburbsUpserted} suburbs.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
