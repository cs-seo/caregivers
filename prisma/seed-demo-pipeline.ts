import { PrismaClient } from "@prisma/client";
import { BOOKING_STATUS } from "../lib/constants";

export async function seedDemoPipeline(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
    include: { specialties: true },
  });
  const priya = await prisma.caregiverProfile.findUnique({
    where: { slug: "priya-nair-nanny-sydney" },
    include: { specialties: true },
  });
  const james = await prisma.caregiverProfile.findUnique({
    where: { slug: "james-okafor-disability-support-sydney" },
    include: { specialties: true },
  });
  if (!family || !sarah || !priya || !james) return { created: 0 };

  const existing = await prisma.booking.count({
    where: {
      familyId: family.id,
      notes: { startsWith: "DEMO_PIPELINE:" },
    },
  });
  if (existing > 0) return { created: 0 };

  const quote = (rate: number, hours: number) => {
    const subtotal = rate * hours;
    const fee = Math.round(subtotal * 0.1);
    return {
      hours,
      rateCents: rate,
      subtotalCents: subtotal,
      platformFeeCents: fee,
      gstCents: Math.round(subtotal / 11),
      totalCents: subtotal + fee,
    };
  };

  const request = await prisma.booking.create({
    data: {
      familyId: family.id,
      caregiverId: james.id,
      specialtyId: james.specialties[0]?.specialtyId ?? sarah.specialties[0].specialtyId,
      startAt: new Date("2026-09-20T10:00:00+10:00"),
      endAt: new Date("2026-09-20T14:00:00+10:00"),
      notes: "DEMO_PIPELINE: weekend community access — waiting on James to accept.",
      status: BOOKING_STATUS.PENDING_ACCEPTANCE,
      ...quote(james.hourlyRateCents, 4),
    },
  });

  const held = await prisma.booking.create({
    data: {
      familyId: family.id,
      caregiverId: sarah.id,
      specialtyId: sarah.specialties[0].specialtyId,
      startAt: new Date("2026-09-12T08:00:00+10:00"),
      endAt: new Date("2026-09-12T12:00:00+10:00"),
      notes: "DEMO_PIPELINE: weekday aged care — funds in escrow.",
      status: BOOKING_STATUS.ESCROW_HELD,
      ...quote(sarah.hourlyRateCents, 4),
      payment: {
        create: {
          provider: "demo",
          amountCents: quote(sarah.hourlyRateCents, 4).totalCents,
          platformFeeCents: quote(sarah.hourlyRateCents, 4).platformFeeCents,
          caregiverPayoutCents: quote(sarah.hourlyRateCents, 4).subtotalCents,
          status: "held",
          heldAt: new Date(),
        },
      },
    },
  });

  const progress = await prisma.booking.create({
    data: {
      familyId: family.id,
      caregiverId: priya.id,
      specialtyId: priya.specialties[0].specialtyId,
      startAt: new Date("2026-09-06T15:00:00+10:00"),
      endAt: new Date("2026-09-06T19:00:00+10:00"),
      notes: "DEMO_PIPELINE: after-school cover — care in progress.",
      status: BOOKING_STATUS.IN_PROGRESS,
      ...quote(priya.hourlyRateCents, 4),
      payment: {
        create: {
          provider: "demo",
          amountCents: quote(priya.hourlyRateCents, 4).totalCents,
          platformFeeCents: quote(priya.hourlyRateCents, 4).platformFeeCents,
          caregiverPayoutCents: quote(priya.hourlyRateCents, 4).subtotalCents,
          status: "held",
          heldAt: new Date(),
        },
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        bookingId: held.id,
        senderId: family.id,
        body: "Hi Sarah — Mum is expecting you from 8am. The key is in the lockbox, code 2048.",
      },
      {
        bookingId: held.id,
        senderId: (await prisma.user.findUnique({ where: { email: "carer@careproof.com.au" } }))!.id,
        body: "Thanks Alex. I’ll arrive at 7:50 and send a note after breakfast.",
      },
      {
        bookingId: progress.id,
        senderId: family.id,
        body: "Priya, school finishes at 3:10 today. Luca has swimming gear in the blue bag.",
      },
    ],
  });

  return { created: 3, ids: [request.id, held.id, progress.id] };
}

export async function seedDemoRecurring(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const priya = await prisma.caregiverProfile.findUnique({
    where: { slug: "priya-nair-nanny-sydney" },
    include: { specialties: true },
  });
  if (!family || !priya) return 0;
  const existing = await prisma.booking.count({
    where: { familyId: family.id, notes: { startsWith: "DEMO_RECURRING:" } },
  });
  if (existing > 0) return 0;

  const hours = 4;
  const subtotal = priya.hourlyRateCents * hours;
  const fee = Math.round(subtotal * 0.1);
  const quote = {
    hours,
    rateCents: priya.hourlyRateCents,
    subtotalCents: subtotal,
    platformFeeCents: fee,
    gstCents: Math.round(subtotal / 11),
    totalCents: subtotal + fee,
  };
  const groupId = "demo-recurring-priya-fridays";
  const firstFriday = new Date("2026-09-11T17:00:00+10:00");
  let created = 0;
  for (let index = 0; index < 4; index += 1) {
    const startAt = new Date(firstFriday.getTime() + index * 7 * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + hours * 60 * 60 * 1000);
    await prisma.booking.create({
      data: {
        familyId: family.id,
        caregiverId: priya.id,
        specialtyId: priya.specialties[0].specialtyId,
        startAt,
        endAt,
        notes: `DEMO_RECURRING: standing Friday after-school · week ${index + 1} of 4`,
        status: BOOKING_STATUS.ESCROW_HELD,
        recurringGroupId: groupId,
        recurringIndex: index + 1,
        recurringTotal: 4,
        ...quote,
        payment: {
          create: {
            provider: "demo",
            amountCents: quote.totalCents,
            platformFeeCents: quote.platformFeeCents,
            caregiverPayoutCents: quote.subtotalCents,
            status: "held",
            heldAt: new Date(),
          },
        },
      },
    });
    created += 1;
  }
  return created;
}

export async function seedDemoBlockedDates(prisma: PrismaClient) {
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
  });
  if (!sarah) return 0;
  const days = [
    { dateKey: "2026-09-13", note: "Weekend off" },
    { dateKey: "2026-09-14", note: "Weekend off" },
  ];
  let saved = 0;
  for (const day of days) {
    await prisma.caregiverBlockedDate.upsert({
      where: { caregiverId_dateKey: { caregiverId: sarah.id, dateKey: day.dateKey } },
      update: {},
      create: { caregiverId: sarah.id, dateKey: day.dateKey, note: day.note },
    });
    saved += 1;
  }
  return saved;
}

export async function seedDemoSeriesActions(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const james = await prisma.caregiverProfile.findUnique({
    where: { slug: "james-okafor-disability-support-sydney" },
    include: { specialties: true },
  });
  if (!family || !james) return 0;
  const existing = await prisma.booking.count({
    where: { familyId: family.id, notes: { startsWith: "DEMO_SERIES:" } },
  });
  if (existing > 0) return 0;

  const hours = 4;
  const subtotal = james.hourlyRateCents * hours;
  const fee = Math.round(subtotal * 0.1);
  const quote = {
    hours,
    rateCents: james.hourlyRateCents,
    subtotalCents: subtotal,
    platformFeeCents: fee,
    gstCents: Math.round(subtotal / 11),
    totalCents: subtotal + fee,
  };
  const groupId = "demo-series-james-saturdays";
  const first = new Date("2026-10-10T10:00:00+10:00");
  let created = 0;
  for (let index = 0; index < 3; index += 1) {
    const startAt = new Date(first.getTime() + index * 7 * 24 * 60 * 60 * 1000);
    await prisma.booking.create({
      data: {
        familyId: family.id,
        caregiverId: james.id,
        specialtyId: james.specialties[0].specialtyId,
        startAt,
        endAt: new Date(startAt.getTime() + hours * 60 * 60 * 1000),
        notes: `DEMO_SERIES: Saturday community access · week ${index + 1} of 3`,
        status: BOOKING_STATUS.PENDING_ACCEPTANCE,
        recurringGroupId: groupId,
        recurringIndex: index + 1,
        recurringTotal: 3,
        ...quote,
      },
    });
    created += 1;
  }
  return created;
}

export async function seedDemoExpiringChecks(prisma: PrismaClient) {
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
    include: { credentials: true },
  });
  const firstAid = sarah?.credentials.find((item) => item.type === "first_aid");
  if (!firstAid) return 0;
  await prisma.credential.update({
    where: { id: firstAid.id },
    data: { expiresAt: new Date("2026-09-25T00:00:00.000Z") },
  });
  return 1;
}

export async function seedDemoShortlist(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  if (!family) return 0;
  const slugs = [
    "sarah-nguyen-aged-care-sydney",
    "priya-nair-nanny-sydney",
    "james-okafor-disability-support-sydney",
  ];
  const carers = await prisma.caregiverProfile.findMany({ where: { slug: { in: slugs } } });
  let saved = 0;
  for (const carer of carers) {
    await prisma.shortlist.upsert({
      where: { familyId_caregiverId: { familyId: family.id, caregiverId: carer.id } },
      update: {},
      create: { familyId: family.id, caregiverId: carer.id },
    });
    saved += 1;
  }
  return saved;
}

async function main() {
  const prisma = new PrismaClient();
  const result = await seedDemoPipeline(prisma);
  const saved = await seedDemoShortlist(prisma);
  const recurring = await seedDemoRecurring(prisma);
  const expiring = await seedDemoExpiringChecks(prisma);
  const series = await seedDemoSeriesActions(prisma);
  const blocked = await seedDemoBlockedDates(prisma);
  console.log(
    `Demo pipeline bookings created: ${result.created}; shortlist ${saved}; recurring ${recurring}; expiring ${expiring}; series ${series}; blocked ${blocked}`,
  );
  await prisma.$disconnect();
}

if (process.argv[1]?.includes("seed-demo-pipeline")) {
  main().catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
}
