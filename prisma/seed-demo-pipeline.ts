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

async function main() {
  const prisma = new PrismaClient();
  const result = await seedDemoPipeline(prisma);
  console.log(`Demo pipeline bookings created: ${result.created}`);
  await prisma.$disconnect();
}

if (process.argv[1]?.includes("seed-demo-pipeline")) {
  main().catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
}
