import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { featuredCarers } from "./data/featured-carers";
import { generateCarers } from "./data/generate-carers";
import { SUBURBS_BY_CITY, slugifySuburb } from "./data/suburbs";
import { insertCarer } from "./insert-carer";
import {
  seedDemoBlockedDates,
  seedDemoExpiringChecks,
  seedDemoFundingRefs,
  seedDemoPipeline,
  seedDemoRecurring,
  seedDemoSeriesActions,
  seedDemoShortlist,
  seedDemoHandover,
  seedDemoInvoiceNumbers,
  seedDemoSavedSearches,
  seedDemoUnreadMessages,
} from "./seed-demo-pipeline";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "CareProof123!";

const specialties = [
  {
    slug: "aged-care",
    name: "Aged care",
    pluralName: "Aged care carers",
    description:
      "In-home support for older Australians, including personal care, companionship and help around the house.",
    seoTitle: "Aged care carers across Australia",
    seoDescription:
      "Find verified aged care carers and home care workers in every Australian state and city. Compare experience, WWCC and rates.",
  },
  {
    slug: "nannies",
    name: "Nanny",
    pluralName: "Nannies",
    description: "Live-out and live-in nannies for ongoing childcare in your home.",
    seoTitle: "Nannies across Australia",
    seoDescription:
      "Hire verified nannies in Sydney, Melbourne, Brisbane and cities nationwide. Working with Children Checks and reviewed experience.",
  },
  {
    slug: "babysitters",
    name: "Babysitter",
    pluralName: "Babysitters",
    description: "Date nights, last-minute sits, overnight and holiday babysitting with WWCC and child first aid.",
    seoTitle: "Babysitters across Australia",
    seoDescription:
      "Book babysitters with verified Working with Children Checks in cities and regional centres across Australia.",
  },
  {
    slug: "disability-support",
    name: "Disability support",
    pluralName: "Disability support workers",
    description: "NDIS support workers for community access, personal care and in-home support.",
    seoTitle: "NDIS disability support workers across Australia",
    seoDescription:
      "Find NDIS-screened disability support workers in every state. Compare verified work history and hourly rates.",
  },
  {
    slug: "special-needs",
    name: "Special needs care",
    pluralName: "Special needs carers",
    description: "Carers experienced with autism, complex behaviour support and additional needs.",
    seoTitle: "Special needs carers across Australia",
    seoDescription:
      "Book special needs carers with verified experience supporting children and adults with additional needs.",
  },
  {
    slug: "housekeeping",
    name: "Housekeeping",
    pluralName: "Housekeepers",
    description: "Domestic assistance, cleaning and home organisation for families and older adults.",
    seoTitle: "Housekeepers across Australia",
    seoDescription:
      "Hire housekeepers and domestic assistants with police checks and reviewed client experience.",
  },
  {
    slug: "companion-care",
    name: "Companion care",
    pluralName: "Companion carers",
    description: "Social support, outings and company for older adults living at home.",
    seoTitle: "Companion carers across Australia",
    seoDescription:
      "Find companion carers for social visits, appointments and everyday company across Australian cities.",
  },
  {
    slug: "nursing",
    name: "Nursing",
    pluralName: "Nurses",
    description: "AHPRA-registered nurses for clinical in-home care, medication and complex needs.",
    seoTitle: "In-home nurses across Australia",
    seoDescription:
      "Book AHPRA-registered nurses for in-home clinical care. Compare registrations, specialties and rates.",
  },
  {
    slug: "respite",
    name: "Respite",
    pluralName: "Respite carers",
    description: "Short-term relief care so family carers can take a break.",
    seoTitle: "Respite carers across Australia",
    seoDescription:
      "Find respite carers for in-home and overnight relief across Australia, with verified experience.",
  },
  {
    slug: "after-school-care",
    name: "After-school care",
    pluralName: "After-school carers",
    description: "Pick-up, homework help and afternoon care until parents finish work.",
    seoTitle: "After-school carers across Australia",
    seoDescription:
      "Hire after-school carers and nannies for school pick-up and homework help in Australian cities.",
  },
  {
    slug: "personal-care",
    name: "Personal care",
    pluralName: "Personal care assistants",
    description: "Showering, dressing, mobility and daily living support at home.",
    seoTitle: "Personal care assistants across Australia",
    seoDescription:
      "Find personal care assistants for daily living support, with aged care and NDIS screening where required.",
  },
];

const states = [
  { slug: "nsw", name: "New South Wales", abbrev: "NSW" },
  { slug: "vic", name: "Victoria", abbrev: "VIC" },
  { slug: "qld", name: "Queensland", abbrev: "QLD" },
  { slug: "wa", name: "Western Australia", abbrev: "WA" },
  { slug: "sa", name: "South Australia", abbrev: "SA" },
  { slug: "tas", name: "Tasmania", abbrev: "TAS" },
  { slug: "act", name: "Australian Capital Territory", abbrev: "ACT" },
  { slug: "nt", name: "Northern Territory", abbrev: "NT" },
];

const citiesByState: Record<string, { slug: string; name: string; lat: number; lng: number }[]> = {
  nsw: [
    { slug: "sydney", name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { slug: "newcastle", name: "Newcastle", lat: -32.9283, lng: 151.7817 },
    { slug: "wollongong", name: "Wollongong", lat: -34.4278, lng: 150.8931 },
    { slug: "central-coast", name: "Central Coast", lat: -33.4267, lng: 151.3417 },
    { slug: "coffs-harbour", name: "Coffs Harbour", lat: -30.2963, lng: 153.1135 },
    { slug: "wagga-wagga", name: "Wagga Wagga", lat: -35.1082, lng: 147.3598 },
    { slug: "albury", name: "Albury", lat: -36.0737, lng: 146.9135 },
    { slug: "tamworth", name: "Tamworth", lat: -31.0927, lng: 150.9271 },
    { slug: "port-macquarie", name: "Port Macquarie", lat: -31.4333, lng: 152.9 },
    { slug: "orange", name: "Orange", lat: -33.2833, lng: 149.1 },
    { slug: "dubbo", name: "Dubbo", lat: -32.2569, lng: 148.6011 },
    { slug: "bathurst", name: "Bathurst", lat: -33.419, lng: 149.577 },
    { slug: "lismore", name: "Lismore", lat: -28.809, lng: 153.278 },
    { slug: "nowra", name: "Nowra", lat: -34.873, lng: 150.603 },
  ],
  vic: [
    { slug: "melbourne", name: "Melbourne", lat: -37.8136, lng: 144.9631 },
    { slug: "geelong", name: "Geelong", lat: -38.1499, lng: 144.3617 },
    { slug: "ballarat", name: "Ballarat", lat: -37.5622, lng: 143.8503 },
    { slug: "bendigo", name: "Bendigo", lat: -36.757, lng: 144.279 },
    { slug: "shepparton", name: "Shepparton", lat: -36.3833, lng: 145.4 },
    { slug: "mildura", name: "Mildura", lat: -34.188, lng: 142.158 },
    { slug: "warrnambool", name: "Warrnambool", lat: -38.381, lng: 142.488 },
    { slug: "wodonga", name: "Wodonga", lat: -36.121, lng: 146.888 },
    { slug: "traralgon", name: "Traralgon", lat: -38.196, lng: 146.54 },
  ],
  qld: [
    { slug: "brisbane", name: "Brisbane", lat: -27.4698, lng: 153.0251 },
    { slug: "gold-coast", name: "Gold Coast", lat: -28.0167, lng: 153.4 },
    { slug: "sunshine-coast", name: "Sunshine Coast", lat: -26.65, lng: 153.0667 },
    { slug: "townsville", name: "Townsville", lat: -19.259, lng: 146.817 },
    { slug: "cairns", name: "Cairns", lat: -16.9186, lng: 145.7781 },
    { slug: "toowoomba", name: "Toowoomba", lat: -27.5598, lng: 151.9507 },
    { slug: "mackay", name: "Mackay", lat: -21.1411, lng: 149.186 },
    { slug: "rockhampton", name: "Rockhampton", lat: -23.378, lng: 150.51 },
    { slug: "bundaberg", name: "Bundaberg", lat: -24.866, lng: 152.349 },
    { slug: "hervey-bay", name: "Hervey Bay", lat: -25.288, lng: 152.838 },
  ],
  wa: [
    { slug: "perth", name: "Perth", lat: -31.9505, lng: 115.8605 },
    { slug: "mandurah", name: "Mandurah", lat: -32.5269, lng: 115.7217 },
    { slug: "bunbury", name: "Bunbury", lat: -33.327, lng: 115.641 },
    { slug: "geraldton", name: "Geraldton", lat: -28.774, lng: 114.609 },
    { slug: "albany", name: "Albany", lat: -35.027, lng: 117.884 },
    { slug: "kalgoorlie", name: "Kalgoorlie", lat: -30.749, lng: 121.466 },
    { slug: "broome", name: "Broome", lat: -17.961, lng: 122.236 },
    { slug: "busselton", name: "Busselton", lat: -33.653, lng: 115.345 },
  ],
  sa: [
    { slug: "adelaide", name: "Adelaide", lat: -34.9285, lng: 138.6007 },
    { slug: "mount-gambier", name: "Mount Gambier", lat: -37.828, lng: 140.782 },
    { slug: "whyalla", name: "Whyalla", lat: -33.034, lng: 137.584 },
    { slug: "murray-bridge", name: "Murray Bridge", lat: -35.12, lng: 139.267 },
    { slug: "port-lincoln", name: "Port Lincoln", lat: -34.727, lng: 135.856 },
    { slug: "victor-harbor", name: "Victor Harbor", lat: -35.55, lng: 138.617 },
  ],
  tas: [
    { slug: "hobart", name: "Hobart", lat: -42.8821, lng: 147.3272 },
    { slug: "launceston", name: "Launceston", lat: -41.433, lng: 147.144 },
    { slug: "devonport", name: "Devonport", lat: -41.18, lng: 146.35 },
    { slug: "burnie", name: "Burnie", lat: -41.055, lng: 145.907 },
  ],
  act: [{ slug: "canberra", name: "Canberra", lat: -35.2809, lng: 149.13 }],
  nt: [
    { slug: "darwin", name: "Darwin", lat: -12.4634, lng: 130.8456 },
    { slug: "alice-springs", name: "Alice Springs", lat: -23.698, lng: 133.881 },
    { slug: "palmerston", name: "Palmerston", lat: -12.481, lng: 130.983 },
  ],
};

async function main() {
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.careRequest.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.workHistory.deleteMany();
  await prisma.caregiverSpecialty.deleteMany();
  await prisma.caregiverProfile.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.suburb.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.specialty.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const specialtyRecords = [];
  for (const spec of specialties) {
    specialtyRecords.push(await prisma.specialty.create({ data: spec }));
  }
  const specBySlug = Object.fromEntries(specialtyRecords.map((s) => [s.slug, s]));

  const stateRecords = [];
  for (const state of states) {
    stateRecords.push(
      await prisma.state.create({
        data: {
          ...state,
          seoTitle: `Carers in ${state.name}`,
          seoDescription: `Find verified carers, nannies and support workers across ${state.name}. Compare experience, checks and rates on CareProof.`,
        },
      }),
    );
  }
  const stateBySlug = Object.fromEntries(stateRecords.map((s) => [s.slug, s]));

  const cityRecords: { key: string; id: string }[] = [];
  for (const [stateSlug, cities] of Object.entries(citiesByState)) {
    const state = stateBySlug[stateSlug];
    for (const city of cities) {
      const created = await prisma.city.create({
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
      cityRecords.push({ key: `${stateSlug}:${city.slug}`, id: created.id });
    }
  }
  const cityId = (state: string, city: string) => {
    const found = cityRecords.find((c) => c.key === `${state}:${city}`);
    if (!found) throw new Error(`Missing city ${state}/${city}`);
    return found.id;
  };

  let suburbCount = 0;
  for (const [stateSlug, cities] of Object.entries(SUBURBS_BY_CITY)) {
    for (const [citySlug, names] of Object.entries(cities)) {
      const id = cityRecords.find((c) => c.key === `${stateSlug}:${citySlug}`)?.id;
      if (!id) continue;
      const unique = [...new Set(names)];
      await prisma.suburb.createMany({
        data: unique.map((name) => ({
          name,
          slug: slugifySuburb(name),
          cityId: id,
        })),
      });
      suburbCount += unique.length;
    }
  }

  const familyUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "family@careproof.com.au",
        passwordHash,
        name: "Alex Martin",
        phone: "0400 111 222",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Marrickville",
            cityId: cityId("nsw", "sydney"),
            bio: "Looking after Mum at home in Marrickville. We need reliable weekday cover.",
            ndisNumber: "430 112 223",
            agedCareRef: "HCP-NSW-88421",
            handoverAccess: "Side gate lockbox 2048. Street parking after 6pm.",
            handoverCare: "Mum prefers tea before tablets. Blood pressure cuff is in the hall cupboard.",
            handoverEmergency: "Alex Martin 0400 111 222",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "family2@careproof.com.au",
        passwordHash,
        name: "Jess and Sam Clarke",
        phone: "0400 333 444",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Brunswick",
            cityId: cityId("vic", "melbourne"),
            bio: "Two kids under 8. We need after-school and occasional Saturday nights.",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "family3@careproof.com.au",
        passwordHash,
        name: "David Okonkwo",
        phone: "0400 555 666",
        role: "FAMILY",
        familyProfile: {
          create: {
            suburb: "Chermside",
            cityId: cityId("qld", "brisbane"),
            bio: "NDIS plan manager for my brother. Looking for weekend community access.",
          },
        },
      },
    }),
  ]);

  const carerProfiles = [];
  for (const carer of featuredCarers) {
    const created = await insertCarer(
      prisma,
      carer,
      passwordHash,
      specBySlug,
      cityId(carer.state, carer.city),
    );
    carerProfiles.push(created);
  }

  const handmadeEmails = new Set(featuredCarers.map((carer) => carer.email));
  let generatedCount = 0;
  for (const carer of generateCarers(480)) {
    if (handmadeEmails.has(carer.email)) continue;
    try {
      await insertCarer(prisma, carer, passwordHash, specBySlug, cityId(carer.state, carer.city));
      generatedCount += 1;
    } catch {
      // Skip location mismatches from the generator.
    }
  }

  const sarah = carerProfiles.find((u) => u.email === "carer@careproof.com.au")!.caregiverProfile!;
  const priya = carerProfiles.find((u) => u.email === "priya.nair@careproof.com.au")!.caregiverProfile!;
  const maya = carerProfiles.find((u) => u.email === "maya.chen@careproof.com.au")!.caregiverProfile!;
  const daniel = carerProfiles.find((u) => u.email === "daniel.kemp@careproof.com.au")!.caregiverProfile!;
  const chloe = carerProfiles.find((u) => u.email === "chloe.bennett@careproof.com.au")!.caregiverProfile!;
  const william = carerProfiles.find((u) => u.email === "william.park@careproof.com.au")!.caregiverProfile!;

  const requests = await Promise.all([
    prisma.careRequest.create({
      data: {
        slug: "weekday-aged-care-marrickville",
        familyId: familyUsers[0].id,
        specialtyId: specBySlug["aged-care"].id,
        cityId: cityId("nsw", "sydney"),
        title: "Weekday aged care for Mum in Marrickville",
        description:
          "Looking for a verified carer 3 mornings a week (Mon/Wed/Fri, 8am–12pm) to help with showering, breakfast and a short walk. Mum is 82, mobile with a stick, and likes a quiet routine. WWCC not required; aged care screening and police check preferred.",
        budgetType: "hourly",
        budgetCents: 6500,
        startDate: new Date("2026-09-15"),
        hoursEstimate: 12,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "after-school-nanny-brunswick",
        familyId: familyUsers[1].id,
        specialtyId: specBySlug["after-school-care"].id,
        cityId: cityId("vic", "melbourne"),
        title: "After-school nanny in Brunswick, two children",
        description:
          "Pick-up from Brunswick South Primary at 3.20pm, homework, snacks and dinner by 6.30pm. Tuesday–Thursday. WWCC Victoria essential. Our kids are 6 and 8.",
        budgetType: "hourly",
        budgetCents: 4400,
        startDate: new Date("2026-09-22"),
        hoursEstimate: 10,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "ndis-weekend-community-access-brisbane",
        familyId: familyUsers[2].id,
        specialtyId: specBySlug["disability-support"].id,
        cityId: cityId("qld", "brisbane"),
        title: "NDIS weekend community access in north Brisbane",
        description:
          "Saturday community access for my brother (26, intellectual disability). Bowling, markets or a swim, then home. NDIS screening and Blue Card required. Own reliable car preferred.",
        budgetType: "hourly",
        budgetCents: 5400,
        startDate: new Date("2026-09-20"),
        hoursEstimate: 6,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "overnight-respite-adelaide",
        familyId: familyUsers[0].id,
        specialtyId: specBySlug["respite"].id,
        cityId: cityId("sa", "adelaide"),
        title: "Overnight respite in Norwood this month",
        description:
          "Need two overnight sits so I can stay with family interstate. Client is 79, lives alone, no overnight behaviours of concern. Must have aged care screening.",
        budgetType: "hourly",
        budgetCents: 4800,
        startDate: new Date("2026-09-18"),
        hoursEstimate: 16,
        status: "open",
      },
    }),
    prisma.careRequest.create({
      data: {
        slug: "saturday-babysitter-sydney",
        familyId: familyUsers[1].id,
        specialtyId: specBySlug["babysitters"].id,
        cityId: cityId("nsw", "sydney"),
        title: "Saturday night babysitter in Bondi",
        description:
          "Two children (4 and 7), 6pm–11pm most Saturdays. Dinner is leftover, bedtime 7.30/8. WWCC required.",
        budgetType: "hourly",
        budgetCents: 4000,
        startDate: new Date("2026-09-12"),
        hoursEstimate: 5,
        status: "open",
      },
    }),
  ]);

  await prisma.proposal.createMany({
    data: [
      {
        careRequestId: requests[0].id,
        caregiverId: sarah.id,
        coverLetter:
          "I live in Marrickville and already support a nearby client. I can do Mon/Wed/Fri mornings and I am an RN if Mum's needs change.",
        rateCents: 6800,
        status: "pending",
      },
      {
        careRequestId: requests[1].id,
        caregiverId: maya.id,
        coverLetter:
          "I pick up from nearby schools already and can start the week of 22 September. WWCC Victoria current.",
        rateCents: 4500,
        status: "pending",
      },
      {
        careRequestId: requests[2].id,
        caregiverId: daniel.id,
        coverLetter:
          "I have a car, NDIS screening and a Blue Card. Saturdays 9–3 are free. Happy to plan a simple community access routine.",
        rateCents: 5300,
        status: "pending",
      },
      {
        careRequestId: requests[4].id,
        caregiverId: priya.id,
        coverLetter:
          "I am five minutes from Bondi and do regular Saturday nights. WWCC NSW current.",
        rateCents: 4200,
        status: "pending",
      },
    ],
  });

  const releasedStart = new Date("2026-07-12T08:00:00+10:00");
  const releasedEnd = new Date("2026-07-12T16:00:00+10:00");
  const booking1 = await prisma.booking.create({
    data: {
      familyId: familyUsers[0].id,
      caregiverId: sarah.id,
      specialtyId: specBySlug["aged-care"].id,
      startAt: releasedStart,
      endAt: releasedEnd,
      hours: 8,
      rateCents: 6800,
      subtotalCents: 54400,
      platformFeeCents: 5440,
      gstCents: 4945,
      totalCents: 59840,
      notes: "First Saturday cover while we were interstate.",
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 59840,
          platformFeeCents: 5440,
          caregiverPayoutCents: 54400,
          status: "released",
          heldAt: releasedStart,
          releasedAt: new Date("2026-07-15T10:00:00+10:00"),
        },
      },
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      familyId: familyUsers[1].id,
      caregiverId: maya.id,
      specialtyId: specBySlug["nannies"].id,
      startAt: new Date("2026-06-04T15:00:00+10:00"),
      endAt: new Date("2026-06-04T19:00:00+10:00"),
      hours: 4,
      rateCents: 4500,
      subtotalCents: 18000,
      platformFeeCents: 1800,
      gstCents: 1636,
      totalCents: 19800,
      notes: "Thursday after-school trial.",
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 19800,
          platformFeeCents: 1800,
          caregiverPayoutCents: 18000,
          status: "released",
          heldAt: new Date("2026-06-03T12:00:00+10:00"),
          releasedAt: new Date("2026-06-07T09:00:00+10:00"),
        },
      },
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      familyId: familyUsers[0].id,
      caregiverId: chloe.id,
      specialtyId: specBySlug["aged-care"].id,
      startAt: new Date("2026-05-20T09:00:00+09:30"),
      endAt: new Date("2026-05-20T15:00:00+09:30"),
      hours: 6,
      rateCents: 4400,
      subtotalCents: 26400,
      platformFeeCents: 2640,
      gstCents: 2400,
      totalCents: 29040,
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 29040,
          platformFeeCents: 2640,
          caregiverPayoutCents: 26400,
          status: "released",
          heldAt: new Date("2026-05-19T10:00:00+09:30"),
          releasedAt: new Date("2026-05-23T10:00:00+09:30"),
        },
      },
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      familyId: familyUsers[1].id,
      caregiverId: william.id,
      specialtyId: specBySlug["respite"].id,
      startAt: new Date("2026-04-11T20:00:00+10:00"),
      endAt: new Date("2026-04-12T07:00:00+10:00"),
      hours: 11,
      rateCents: 5600,
      subtotalCents: 61600,
      platformFeeCents: 6160,
      gstCents: 5600,
      totalCents: 67760,
      status: "released",
      payment: {
        create: {
          provider: "demo",
          amountCents: 67760,
          platformFeeCents: 6160,
          caregiverPayoutCents: 61600,
          status: "released",
          heldAt: new Date("2026-04-10T12:00:00+10:00"),
          releasedAt: new Date("2026-04-15T09:00:00+10:00"),
        },
      },
    },
  });

  await prisma.review.createMany({
    data: [
      {
        bookingId: booking1.id,
        authorId: familyUsers[0].id,
        caregiverId: sarah.id,
        rating: 5,
        body: "Sarah was exactly what we needed — clinical, kind, and she left a clear note for the next morning. Mum asked when she was coming back.",
      },
      {
        bookingId: booking2.id,
        authorId: familyUsers[1].id,
        caregiverId: maya.id,
        rating: 5,
        body: "Kids were settled, homework done, and Maya messaged a photo from the park. Instant book again without thinking.",
      },
      {
        bookingId: booking3.id,
        authorId: familyUsers[0].id,
        caregiverId: chloe.id,
        rating: 5,
        body: "Thoughtful companion visit. Chloe noticed Mum hadn't been eating lunch and flagged it without fuss.",
      },
      {
        bookingId: booking4.id,
        authorId: familyUsers[1].id,
        caregiverId: william.id,
        rating: 4,
        body: "Overnight respite went smoothly. We actually slept. Would book again for long weekends.",
      },
    ],
  });

  async function refreshAggregates(caregiverId: string) {
    const reviews = await prisma.review.findMany({ where: { caregiverId } });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await prisma.caregiverProfile.update({
      where: { id: caregiverId },
      data: {
        ratingAvg: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
        completedJobs: reviews.length,
      },
    });
  }

  await refreshAggregates(sarah.id);
  await refreshAggregates(maya.id);
  await refreshAggregates(chloe.id);
  await refreshAggregates(william.id);

  const alreadyReviewed = new Set([sarah.id, maya.id, chloe.id, william.id]);
  const reviewNotes = [
    "Reliable, on time, and left a clear handover. Would book again through CareProof.",
    "Calm, prepared, and easy to message. The profile checks matched what we saw in person.",
    "Settled in quickly and kept notes we could share with the rest of the family.",
    "Professional from the first visit. Escrow booking made the admin simple.",
  ];
  for (const [index, user] of carerProfiles.entries()) {
    const profile = user.caregiverProfile;
    if (!profile || alreadyReviewed.has(profile.id)) continue;
    const hours = 4;
    const subtotal = profile.hourlyRateCents * hours;
    const fee = Math.round(subtotal * 0.1);
    const start = new Date("2026-03-02T09:00:00+10:00");
    start.setDate(start.getDate() + index);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    const family = familyUsers[index % familyUsers.length];
    const specialtySlug = featuredCarers[index]?.specialties[0] ?? "aged-care";
    const booking = await prisma.booking.create({
      data: {
        familyId: family.id,
        caregiverId: profile.id,
        specialtyId: specBySlug[specialtySlug].id,
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
    await prisma.review.create({
      data: {
        bookingId: booking.id,
        authorId: family.id,
        caregiverId: profile.id,
        rating: 4 + (index % 2),
        body: reviewNotes[index % reviewNotes.length],
      },
    });
    await refreshAggregates(profile.id);
  }

  const pipeline = await seedDemoPipeline(prisma);
  const shortlisted = await seedDemoShortlist(prisma);
  const recurring = await seedDemoRecurring(prisma);
  const expiring = await seedDemoExpiringChecks(prisma);
  const series = await seedDemoSeriesActions(prisma);
  const blocked = await seedDemoBlockedDates(prisma);
  const funding = await seedDemoFundingRefs(prisma);
  const unread = await seedDemoUnreadMessages(prisma);
  const searches = await seedDemoSavedSearches(prisma);
  const handover = await seedDemoHandover(prisma);
  const invoices = await seedDemoInvoiceNumbers(prisma);
  console.log(
    `Seeded ${carerProfiles.length} featured carers + ${generatedCount} generated profiles, ${familyUsers.length} families, ${requests.length} jobs, ${suburbCount} suburbs, ${pipeline.created} live demo bookings, ${shortlisted} shortlisted, ${recurring} recurring weeks, ${expiring} expiring checks, ${series} series weeks, ${blocked} days off, ${funding} funding refs, ${unread} unread messages, ${searches} saved searches, ${handover} handover notes, ${invoices} invoice numbers.`,
  );
  console.log("Demo logins: family@careproof.com.au / carer@careproof.com.au / CareProof123!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
