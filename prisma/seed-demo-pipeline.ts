import { PrismaClient } from "@prisma/client";
import { BOOKING_STATUS } from "../lib/constants";
import { DEMO_PORTRAITS } from "../lib/photos";
import { invoiceNumberMap, STATEMENT_STATUSES, australianFinancialYear } from "../lib/statement";
import { parseSydneyDateTimeLocal } from "../lib/format";
import { isUtcDateOnly } from "../lib/job-match";
import { composeBookingNotes } from "../lib/job-hire";
import { formatWeeklyHours, parseWeeklyHours } from "../lib/weekly-windows";

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

export async function seedDemoFundingRefs(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({
    where: { email: "family@careproof.com.au" },
    include: { familyProfile: true },
  });
  if (!family?.familyProfile) return 0;
  await prisma.familyProfile.update({
    where: { id: family.familyProfile.id },
    data: {
      ndisNumber: family.familyProfile.ndisNumber ?? "430 112 223",
      agedCareRef: family.familyProfile.agedCareRef ?? "HCP-NSW-88421",
    },
  });
  return 1;
}

export async function seedDemoBlockedDates(prisma: PrismaClient) {
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
  });
  const priya = await prisma.caregiverProfile.findUnique({
    where: { slug: "priya-nair-nanny-sydney" },
  });
  const rows = [
    ...(sarah
      ? [
          { caregiverId: sarah.id, dateKey: "2026-09-13", note: "Weekend off" },
          { caregiverId: sarah.id, dateKey: "2026-09-14", note: "Weekend off" },
        ]
      : []),
    ...(priya
      ? [{ caregiverId: priya.id, dateKey: "2026-09-07", note: "Day off — Instant Book paused" }]
      : []),
  ];
  let saved = 0;
  for (const day of rows) {
    await prisma.caregiverBlockedDate.upsert({
      where: { caregiverId_dateKey: { caregiverId: day.caregiverId, dateKey: day.dateKey } },
      update: { note: day.note },
      create: { caregiverId: day.caregiverId, dateKey: day.dateKey, note: day.note },
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

const READ_DEMO_BODIES = [
  "Hi Sarah — Mum is expecting you from 8am. The key is in the lockbox, code 2048.",
  "Thanks Alex. I’ll arrive at 7:50 and send a note after breakfast.",
  "Priya, school finishes at 3:10 today. Luca has swimming gear in the blue bag.",
];

const JAMES_UNREAD = "I can do Saturday. Let’s meet at Parramatta station at 9:50.";
const FAMILY_TO_SARAH_UNREAD = "Also please bring the blood pressure cuff from the hall cupboard.";

export async function seedDemoUnreadMessages(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const sarahUser = await prisma.user.findUnique({ where: { email: "carer@careproof.com.au" } });
  const jamesUser = await prisma.user.findUnique({ where: { email: "james.okafor@careproof.com.au" } });
  if (!family || !sarahUser || !jamesUser) return 0;

  await prisma.message.updateMany({
    where: {
      readAt: null,
      body: { notIn: [JAMES_UNREAD, FAMILY_TO_SARAH_UNREAD] },
      booking: {
        OR: [{ familyId: family.id }, { caregiver: { userId: sarahUser.id } }],
      },
    },
    data: { readAt: new Date("2026-09-06T10:00:00.000Z") },
  });
  await prisma.message.updateMany({
    where: { body: { in: [JAMES_UNREAD, FAMILY_TO_SARAH_UNREAD] } },
    data: { readAt: null },
  });

  const held = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: { startsWith: "DEMO_PIPELINE: weekday aged care" } },
  });
  const request = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: { startsWith: "DEMO_PIPELINE: weekend community access" } },
  });

  let created = 0;
  if (request && !(await prisma.message.findFirst({ where: { bookingId: request.id, body: JAMES_UNREAD } }))) {
    await prisma.message.create({
      data: { bookingId: request.id, senderId: jamesUser.id, body: JAMES_UNREAD },
    });
    created += 1;
  }
  if (held && !(await prisma.message.findFirst({ where: { bookingId: held.id, body: FAMILY_TO_SARAH_UNREAD } }))) {
    await prisma.message.create({
      data: { bookingId: held.id, senderId: family.id, body: FAMILY_TO_SARAH_UNREAD },
    });
    created += 1;
  }
  return created;
}

const ALEX_HANDOVER = {
  handoverAccess: "Side gate lockbox 2048. Street parking after 6pm.",
  handoverCare: "Mum prefers tea before tablets. Blood pressure cuff is in the hall cupboard.",
  handoverEmergency: "Alex Martin 0400 111 222",
};

const PRIYA_HANDOVER = {
  handoverAccess: "Front door code 3910. Blue school bag on the hall hook.",
  handoverCare: "Luca finishes at 3:10. Swimming Fridays — gear in the blue bag. No nuts.",
  handoverEmergency: "Alex Martin 0400 111 222",
};

export async function seedDemoHandover(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({
    where: { email: "family@careproof.com.au" },
    include: { familyProfile: true },
  });
  if (!family?.familyProfile) return 0;

  await prisma.familyProfile.update({
    where: { id: family.familyProfile.id },
    data: {
      handoverAccess: family.familyProfile.handoverAccess ?? ALEX_HANDOVER.handoverAccess,
      handoverCare: family.familyProfile.handoverCare ?? ALEX_HANDOVER.handoverCare,
      handoverEmergency: family.familyProfile.handoverEmergency ?? ALEX_HANDOVER.handoverEmergency,
    },
  });

  const sarahSit = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: { startsWith: "DEMO_PIPELINE: weekday aged care" } },
  });
  if (sarahSit) {
    await prisma.booking.update({
      where: { id: sarahSit.id },
      data: ALEX_HANDOVER,
    });
  }

  const priyaWeeks = await prisma.booking.findMany({
    where: { familyId: family.id, notes: { startsWith: "DEMO_RECURRING:" } },
  });
  if (priyaWeeks.length) {
    await prisma.booking.updateMany({
      where: { id: { in: priyaWeeks.map((week) => week.id) } },
      data: PRIYA_HANDOVER,
    });
  }

  const priyaProgress = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: { startsWith: "DEMO_PIPELINE: after-school cover" } },
  });
  if (priyaProgress) {
    await prisma.booking.update({
      where: { id: priyaProgress.id },
      data: {
        handoverAccess: "School gate on Livingstone Rd",
        handoverCare: null,
        handoverEmergency: null,
      },
    });
  }

  return (sarahSit ? 1 : 0) + priyaWeeks.length + (priyaProgress ? 1 : 0);
}

export async function seedDemoInvoiceNumbers(prisma: PrismaClient) {
  const fy = australianFinancialYear();
  const rows = await prisma.booking.findMany({
    where: {
      status: { in: [...STATEMENT_STATUSES] },
      startAt: { gte: fy.startAt, lt: fy.endAt },
      payment: { isNot: null },
    },
    select: {
      id: true,
      startAt: true,
      status: true,
      payment: { select: { heldAt: true, invoiceNumber: true } },
    },
  });
  const peers = rows.map((row) => ({
    id: row.id,
    startAt: row.startAt,
    status: row.status,
    heldAt: row.payment?.heldAt ?? null,
    invoiceNumber: row.payment?.invoiceNumber ?? null,
  }));
  const numbers = invoiceNumberMap(peers);
  let stamped = 0;
  for (const peer of peers) {
    const invoiceNumber = numbers.get(peer.id);
    if (!invoiceNumber || peer.invoiceNumber) continue;
    const result = await prisma.payment.updateMany({
      where: { bookingId: peer.id, invoiceNumber: null },
      data: { invoiceNumber },
    });
    stamped += result.count;
  }
  return stamped;
}

const DEMO_REVIEW_REPLIES = [
  {
    slug: "maya-chen-nanny-melbourne",
    reply: "Thank you — the park photo was Luca's idea. Happy to Instant Book the next after-school.",
    repliedAt: new Date("2026-06-08T10:00:00+10:00"),
  },
  {
    slug: "chloe-bennett-aged-care-adelaide",
    reply: "Glad I could flag lunch. I'll keep the same routine if you book again.",
    repliedAt: new Date("2026-05-24T09:00:00+09:30"),
  },
] as const;

export async function seedDemoReviewReplies(prisma: PrismaClient) {
  let updated = 0;
  for (const item of DEMO_REVIEW_REPLIES) {
    const carer = await prisma.caregiverProfile.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });
    if (!carer) continue;
    const review = await prisma.review.findFirst({
      where: { caregiverId: carer.id, reply: null },
      orderBy: { createdAt: "desc" },
    });
    if (!review) continue;
    await prisma.review.update({
      where: { id: review.id },
      data: { reply: item.reply, repliedAt: item.repliedAt },
    });
    updated += 1;
  }
  return updated;
}

export async function seedDemoPortraits(prisma: PrismaClient) {
  let updated = 0;
  for (const item of DEMO_PORTRAITS) {
    const result = await prisma.caregiverProfile.updateMany({
      where: { slug: item.slug, photoUrl: null },
      data: { photoUrl: `/portraits/${item.file}` },
    });
    updated += result.count;
  }
  return updated;
}

export async function seedDemoNoticeHours(prisma: PrismaClient) {
  const rows = [
    { slug: "sarah-nguyen-aged-care-sydney", noticeHours: 12 },
    { slug: "priya-nair-nanny-sydney", noticeHours: 4 },
    { slug: "james-okafor-disability-support-sydney", noticeHours: 24 },
  ];
  let updated = 0;
  for (const row of rows) {
    const result = await prisma.caregiverProfile.updateMany({
      where: { slug: row.slug },
      data: { noticeHours: row.noticeHours },
    });
    updated += result.count;
  }
  return updated;
}

export async function seedDemoWeeklyWindows(prisma: PrismaClient) {
  const carers = await prisma.caregiverProfile.findMany({
    select: {
      id: true,
      weeklyHours: true,
      weeklyWindows: { select: { id: true }, take: 1 },
    },
  });
  let updated = 0;
  for (const carer of carers) {
    if (carer.weeklyWindows.length) continue;
    const windows = parseWeeklyHours(carer.weeklyHours);
    if (!windows.length) continue;
    await prisma.caregiverWeeklyWindow.createMany({
      data: windows.map((window) => ({
        caregiverId: carer.id,
        weekday: window.weekday,
        startMin: window.startMin,
        endMin: window.endMin,
      })),
    });
    const label = formatWeeklyHours(windows);
    if (label && label !== carer.weeklyHours) {
      await prisma.caregiverProfile.update({
        where: { id: carer.id },
        data: { weeklyHours: label },
      });
    }
    updated += 1;
  }
  return updated;
}

const LEICHHARDT_WELCOME = "Side gate is unlocked. Mum likes tea before the walk — kettle on the left.";
const LEICHHARDT_COVER = "I can cover Wednesday mornings in Leichhardt and already support a nearby client.";

export async function seedDemoHiredRequest(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
  });
  const elena = await prisma.caregiverProfile.findUnique({
    where: { slug: "elena-rossi-companion-care-sydney" },
  });
  const specialty = await prisma.specialty.findUnique({ where: { slug: "aged-care" } });
  const city = await prisma.city.findFirst({
    where: { slug: "sydney", state: { slug: "nsw" } },
  });
  if (!family || !sarah || !elena || !specialty || !city) return 0;

  const job = await prisma.careRequest.upsert({
    where: { slug: "midweek-respite-leichhardt" },
    create: {
      slug: "midweek-respite-leichhardt",
      familyId: family.id,
      specialtyId: specialty.id,
      cityId: city.id,
      title: "Midweek respite in Leichhardt",
      description:
        "One Wednesday morning sit so I can attend a specialist appointment. Mum is 79 and used to a quiet routine. Aged care screening preferred.",
      budgetType: "hourly",
      budgetCents: 5000,
      startDate: parseSydneyDateTimeLocal("2026-08-20T09:00"),
      hoursEstimate: 6,
      status: "hired",
    },
    update: { status: "hired", title: "Midweek respite in Leichhardt", specialtyId: specialty.id },
  });

  await prisma.proposal.upsert({
    where: { careRequestId_caregiverId: { careRequestId: job.id, caregiverId: sarah.id } },
    create: {
      careRequestId: job.id,
      caregiverId: sarah.id,
      coverLetter: LEICHHARDT_COVER,
      rateCents: 6800,
      status: "accepted",
    },
    update: { status: "accepted" },
  });
  await prisma.proposal.upsert({
    where: { careRequestId_caregiverId: { careRequestId: job.id, caregiverId: elena.id } },
    create: {
      careRequestId: job.id,
      caregiverId: elena.id,
      coverLetter: "Happy to do a standing Wednesday visit if you still need someone.",
      rateCents: 3900,
      status: "declined",
    },
    update: { status: "declined" },
  });

  const startAt = parseSydneyDateTimeLocal("2026-08-20T09:00");
  const hours = 6;
  const rateCents = sarah.hourlyRateCents;
  const subtotalCents = rateCents * hours;
  const platformFeeCents = Math.round(subtotalCents * 0.1);
  const notes = composeBookingNotes({ welcomeNote: LEICHHARDT_WELCOME, coverLetter: LEICHHARDT_COVER });
  const attached = await prisma.booking.findFirst({ where: { careRequestId: job.id } });
  if (!attached) {
    await prisma.booking.create({
      data: {
        familyId: family.id,
        caregiverId: sarah.id,
        careRequestId: job.id,
        specialtyId: specialty.id,
        startAt,
        endAt: new Date(startAt.getTime() + hours * 60 * 60 * 1000),
        notes,
        status: BOOKING_STATUS.RELEASED,
        hours,
        rateCents,
        subtotalCents,
        platformFeeCents,
        gstCents: Math.round(subtotalCents / 11),
        totalCents: subtotalCents + platformFeeCents,
        payment: {
          create: {
            provider: "demo",
            amountCents: subtotalCents + platformFeeCents,
            platformFeeCents,
            caregiverPayoutCents: subtotalCents,
            status: "released",
            heldAt: new Date("2026-08-19T10:00:00.000Z"),
            releasedAt: new Date("2026-08-21T10:00:00.000Z"),
          },
        },
      },
    });
  } else if (attached.notes !== notes) {
    await prisma.booking.update({ where: { id: attached.id }, data: { notes } });
  }
  return 1;
}

const ALEX_TO_JAMES_JOB = "Could you do 8:15 if 8am is tight? Mum is usually up by then.";
const JAMES_TO_ALEX_JOB = "Yes — 8:15 works on Mon/Wed/Fri. I’ll confirm once I see the week.";

export async function seedDemoJobMessages(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const jamesUser = await prisma.user.findUnique({ where: { email: "james.okafor@careproof.com.au" } });
  const james = await prisma.caregiverProfile.findUnique({
    where: { slug: "james-okafor-disability-support-sydney" },
  });
  const job = await prisma.careRequest.findUnique({
    where: { slug: "weekday-aged-care-marrickville" },
  });
  if (!family || !jamesUser || !james || !job || job.status !== "open") return 0;

  const existing = await prisma.careRequestMessage.findMany({
    where: { requestId: job.id, caregiverId: james.id },
    select: { body: true },
  });
  const have = new Set(existing.map((row) => row.body));
  let created = 0;
  if (!have.has(ALEX_TO_JAMES_JOB)) {
    await prisma.careRequestMessage.create({
      data: {
        requestId: job.id,
        caregiverId: james.id,
        senderId: family.id,
        body: ALEX_TO_JAMES_JOB,
        createdAt: new Date("2026-09-06T21:00:00.000Z"),
      },
    });
    created += 1;
  }
  if (!have.has(JAMES_TO_ALEX_JOB)) {
    await prisma.careRequestMessage.create({
      data: {
        requestId: job.id,
        caregiverId: james.id,
        senderId: jamesUser.id,
        body: JAMES_TO_ALEX_JOB,
        createdAt: new Date("2026-09-06T22:10:00.000Z"),
      },
    });
    created += 1;
  }
  return created;
}

const ELENA_NORWOOD_NOTE = "Could you cover two overnight sits in Norwood this month?";
const ELENA_NORWOOD_REPLY = "I only work mornings in Leichhardt that week — overnight Adelaide is too far.";
const CHLOE_NORWOOD_NOTE = "We need someone who can stay both nights this month.";
const LARA_COUNTER_NOTE = "Two nights is a long sit — $38 works if you can do both.";

const ELENA_AWAITING_NOTE =
  "DEMO_AWAITING_PAY: Wednesday companion sit in Leichhardt — Elena accepted, waiting for escrow.";

export async function seedDemoProposalAlerts(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({
    where: { email: "family@careproof.com.au" },
    include: { familyProfile: true },
  });
  if (!family?.familyProfile) return 0;
  if (family.familyProfile.proposalAlertedAt) return 0;
  await prisma.familyProfile.update({
    where: { id: family.familyProfile.id },
    data: {
      proposalAlertsOn: true,
      lastProposalAlertedCount: 0,
      proposalAlertedAt: new Date("2026-09-01T00:00:00.000Z"),
    },
  });
  return 1;
}

export async function seedDemoInviteAlerts(prisma: PrismaClient) {
  const james = await prisma.caregiverProfile.findUnique({
    where: { slug: "james-okafor-disability-support-sydney" },
  });
  if (!james) return 0;
  if (james.inviteAlertedAt) return 0;
  await prisma.caregiverProfile.update({
    where: { id: james.id },
    data: {
      inviteAlertsOn: true,
      lastInviteAlertedCount: 0,
      inviteAlertedAt: new Date("2026-09-01T00:00:00.000Z"),
    },
  });
  return 1;
}

export async function seedDemoJobAlerts(prisma: PrismaClient) {
  const sarah = await prisma.caregiverProfile.findUnique({
    where: { slug: "sarah-nguyen-aged-care-sydney" },
  });
  if (!sarah) return 0;
  if (sarah.jobAlertedAt) return 0;
  await prisma.caregiverProfile.update({
    where: { id: sarah.id },
    data: {
      jobAlertsOn: true,
      lastJobAlertedCount: 0,
      jobAlertedAt: new Date("2026-09-01T00:00:00.000Z"),
    },
  });
  return 1;
}

export async function seedDemoAwaitingPay(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const elena = await prisma.caregiverProfile.findUnique({
    where: { slug: "elena-rossi-companion-care-sydney" },
    include: { specialties: true },
  });
  if (!family || !elena || !elena.specialties[0]) return 0;
  const existing = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: ELENA_AWAITING_NOTE },
  });
  if (existing) return 0;

  const hours = 3;
  const subtotal = elena.hourlyRateCents * hours;
  const fee = Math.round(subtotal * 0.1);
  await prisma.booking.create({
    data: {
      familyId: family.id,
      caregiverId: elena.id,
      specialtyId: elena.specialties[0].specialtyId,
      startAt: parseSydneyDateTimeLocal("2026-09-16T10:00"),
      endAt: parseSydneyDateTimeLocal("2026-09-16T13:00"),
      notes: ELENA_AWAITING_NOTE,
      status: BOOKING_STATUS.AWAITING_PAYMENT,
      hours,
      rateCents: elena.hourlyRateCents,
      subtotalCents: subtotal,
      platformFeeCents: fee,
      gstCents: Math.round(subtotal / 11),
      totalCents: subtotal + fee,
    },
  });
  return 1;
}

const CHLOE_DISPUTE_NOTE =
  "DEMO_DISPUTE: Friday aged care in Norwood — disputed, auto-release paused.";

export async function seedDemoDispute(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const chloe = await prisma.caregiverProfile.findUnique({
    where: { slug: "chloe-bennett-aged-care-adelaide" },
    include: { specialties: true },
  });
  if (!family || !chloe || !chloe.specialties[0]) return 0;
  const existing = await prisma.booking.findFirst({
    where: { familyId: family.id, notes: CHLOE_DISPUTE_NOTE },
  });
  if (existing) {
    if (existing.status !== BOOKING_STATUS.DISPUTED) {
      await prisma.booking.update({ where: { id: existing.id }, data: { status: BOOKING_STATUS.DISPUTED } });
    }
    return 1;
  }

  const hours = 3;
  const subtotal = chloe.hourlyRateCents * hours;
  const fee = Math.round(subtotal * 0.1);
  const quote = {
    hours,
    rateCents: chloe.hourlyRateCents,
    subtotalCents: subtotal,
    platformFeeCents: fee,
    gstCents: Math.round(subtotal / 11),
    totalCents: subtotal + fee,
  };
  await prisma.booking.create({
    data: {
      familyId: family.id,
      caregiverId: chloe.id,
      specialtyId: chloe.specialties[0].specialtyId,
      startAt: parseSydneyDateTimeLocal("2026-08-28T10:00"),
      endAt: parseSydneyDateTimeLocal("2026-08-28T13:00"),
      notes: CHLOE_DISPUTE_NOTE,
      status: BOOKING_STATUS.DISPUTED,
      ...quote,
      payment: {
        create: {
          provider: "demo",
          amountCents: quote.totalCents,
          platformFeeCents: quote.platformFeeCents,
          caregiverPayoutCents: quote.subtotalCents,
          status: "held",
          heldAt: parseSydneyDateTimeLocal("2026-08-28T09:00"),
        },
      },
    },
  });
  return 1;
}

export async function seedDemoPassOn(prisma: PrismaClient) {
  const elena = await prisma.caregiverProfile.findUnique({
    where: { slug: "elena-rossi-companion-care-sydney" },
  });
  const chloe = await prisma.caregiverProfile.findUnique({
    where: { slug: "chloe-bennett-aged-care-adelaide" },
  });
  const lara = await prisma.caregiverProfile.findUnique({
    where: { slug: "lara-schmidt-companion-care-adelaide" },
  });
  const job = await prisma.careRequest.findUnique({
    where: { slug: "overnight-respite-adelaide" },
  });
  if (!elena || !chloe || !lara || !job || job.status !== "open") return 0;

  let changed = 0;
  const invite = await prisma.careRequestInvite.findUnique({
    where: { requestId_caregiverId: { requestId: job.id, caregiverId: elena.id } },
  });
  if (!invite) {
    await prisma.careRequestInvite.create({
      data: {
        requestId: job.id,
        caregiverId: elena.id,
        status: "declined",
        note: ELENA_NORWOOD_NOTE,
        reply: ELENA_NORWOOD_REPLY,
      },
    });
    changed += 1;
  } else if (invite.status !== "declined" || !invite.reply) {
    await prisma.careRequestInvite.update({
      where: { id: invite.id },
      data: { status: "declined", note: invite.note ?? ELENA_NORWOOD_NOTE, reply: ELENA_NORWOOD_REPLY },
    });
    changed += 1;
  }

  const proposal = await prisma.proposal.findUnique({
    where: { careRequestId_caregiverId: { careRequestId: job.id, caregiverId: chloe.id } },
  });
  if (!proposal) {
    await prisma.proposal.create({
      data: {
        careRequestId: job.id,
        caregiverId: chloe.id,
        coverLetter: "I live in Adelaide and can do overnight respite. Aged care screening is current.",
        rateCents: 5000,
        status: "declined",
        familyNote: CHLOE_NORWOOD_NOTE,
      },
    });
    changed += 1;
  } else if (proposal.status !== "declined" || !proposal.familyNote) {
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: { status: "declined", familyNote: proposal.familyNote ?? CHLOE_NORWOOD_NOTE },
    });
    changed += 1;
  }

  const laraProposal = await prisma.proposal.findUnique({
    where: { careRequestId_caregiverId: { careRequestId: job.id, caregiverId: lara.id } },
  });
  if (!laraProposal) {
    await prisma.proposal.create({
      data: {
        careRequestId: job.id,
        caregiverId: lara.id,
        coverLetter: "I am in Glenelg and can do companion overnight sits. Aged care screening is current.",
        rateCents: 4200,
        status: "pending",
        counterRateCents: 3800,
        counterNote: LARA_COUNTER_NOTE,
      },
    });
    changed += 1;
  } else if (laraProposal.status === "pending" && laraProposal.counterRateCents == null) {
    await prisma.proposal.update({
      where: { id: laraProposal.id },
      data: { counterRateCents: 3800, counterNote: laraProposal.counterNote ?? LARA_COUNTER_NOTE },
    });
    changed += 1;
  }
  return changed;
}

export async function seedDemoInvites(prisma: PrismaClient) {
  const james = await prisma.caregiverProfile.findUnique({
    where: { slug: "james-okafor-disability-support-sydney" },
  });
  const job = await prisma.careRequest.findUnique({
    where: { slug: "weekday-aged-care-marrickville" },
  });
  if (!james || !job || job.status !== "open") return 0;
  const note =
    "Mum is in Marrickville and we need weekday mornings. Happy to be flexible if 8am is tight.";
  const existing = await prisma.careRequestInvite.findUnique({
    where: { requestId_caregiverId: { requestId: job.id, caregiverId: james.id } },
  });
  if (existing) {
    if (!existing.note) {
      await prisma.careRequestInvite.update({ where: { id: existing.id }, data: { note } });
    }
    return existing.status === "pending" ? 1 : 0;
  }
  await prisma.careRequestInvite.create({
    data: { requestId: job.id, caregiverId: james.id, status: "pending", note },
  });
  return 1;
}

export async function seedDemoExpiredJob(prisma: PrismaClient) {
  const slug = "sunday-companion-newtown";
  const startDate = parseSydneyDateTimeLocal("2026-09-06T09:00");
  const existing = await prisma.careRequest.findUnique({ where: { slug } });
  if (existing) {
    if (existing.startDate.getTime() !== startDate.getTime() || existing.status !== "open") {
      await prisma.careRequest.update({ where: { slug }, data: { startDate, status: "open" } });
    }
    return 1;
  }
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  const specialty = await prisma.specialty.findUnique({ where: { slug: "companion-care" } });
  const city = await prisma.city.findFirst({
    where: { slug: "sydney", state: { slug: "nsw" } },
  });
  if (!family || !specialty || !city) return 0;
  await prisma.careRequest.create({
    data: {
      slug,
      familyId: family.id,
      specialtyId: specialty.id,
      cityId: city.id,
      title: "Sunday companion sit in Newtown",
      description:
        "One Sunday morning companion visit in Newtown — tea, a short walk around the park, and company while I was interstate. The sit has already started.",
      budgetType: "hourly",
      budgetCents: 4500,
      startDate,
      hoursEstimate: 3,
      status: "open",
    },
  });
  return 1;
}

export async function seedDemoJobStarts(prisma: PrismaClient) {
  const times: Record<string, Date> = {
    "weekday-aged-care-marrickville": parseSydneyDateTimeLocal("2026-09-15T08:00"),
    "after-school-nanny-brunswick": parseSydneyDateTimeLocal("2026-09-22T15:20"),
    "ndis-weekend-community-access-brisbane": parseSydneyDateTimeLocal("2026-09-20T10:00"),
    "overnight-respite-adelaide": parseSydneyDateTimeLocal("2026-09-18T18:00"),
    "saturday-babysitter-sydney": parseSydneyDateTimeLocal("2026-09-12T18:00"),
    "sunday-companion-newtown": parseSydneyDateTimeLocal("2026-09-06T09:00"),
  };
  let updated = 0;
  for (const [slug, startDate] of Object.entries(times)) {
    const job = await prisma.careRequest.findUnique({ where: { slug } });
    if (!job) continue;
    if (!isUtcDateOnly(job.startDate) && job.startDate.getTime() === startDate.getTime()) continue;
    await prisma.careRequest.update({ where: { slug }, data: { startDate } });
    updated += 1;
  }
  return updated;
}

export async function seedDemoSavedSearches(prisma: PrismaClient) {
  const family = await prisma.user.findUnique({ where: { email: "family@careproof.com.au" } });
  if (!family) return 0;
  await prisma.savedSearch.deleteMany({
    where: {
      familyId: family.id,
      href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-12",
    },
  });
  const rows = [
    {
      name: "Aged care in Sydney · needed 15 Sept 2026",
      href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15",
      unseen: true,
    },
    { name: "Instant Book nannies", href: "/caregivers/nannies?instantBook=1", unseen: false },
  ];
  let saved = 0;
  for (const row of rows) {
    const existing = await prisma.savedSearch.findUnique({
      where: { familyId_href: { familyId: family.id, href: row.href } },
    });
    if (existing) {
      await prisma.savedSearch.update({
        where: { id: existing.id },
        data: {
          name: row.name,
          alertsOn: true,
          ...(row.unseen
            ? { lastAlertedCount: 20, alertedAt: new Date("2026-09-01T00:00:00.000Z") }
            : { lastAlertedCount: 999, alertedAt: new Date("2026-09-01T00:00:00.000Z") }),
          ...(row.unseen && !existing.seenAt
            ? { lastSeenCount: 0, seenAt: null }
            : !row.unseen && !existing.seenAt
              ? { lastSeenCount: 999, seenAt: new Date("2026-09-01T00:00:00.000Z") }
              : {}),
        },
      });
    } else {
      await prisma.savedSearch.create({
        data: {
          familyId: family.id,
          name: row.name,
          href: row.href,
          lastSeenCount: row.unseen ? 0 : 999,
          seenAt: row.unseen ? null : new Date("2026-09-01T00:00:00.000Z"),
          alertsOn: true,
          lastAlertedCount: row.unseen ? 20 : 999,
          alertedAt: new Date("2026-09-01T00:00:00.000Z"),
        },
      });
    }
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
  const funding = await seedDemoFundingRefs(prisma);
  const unread = await seedDemoUnreadMessages(prisma);
  const searches = await seedDemoSavedSearches(prisma);
  const handover = await seedDemoHandover(prisma);
  const invoices = await seedDemoInvoiceNumbers(prisma);
  const replies = await seedDemoReviewReplies(prisma);
  const portraits = await seedDemoPortraits(prisma);
  const weekly = await seedDemoWeeklyWindows(prisma);
  const notice = await seedDemoNoticeHours(prisma);
  const jobStarts = await seedDemoJobStarts(prisma);
  const expired = await seedDemoExpiredJob(prisma);
  const hired = await seedDemoHiredRequest(prisma);
  const invites = await seedDemoInvites(prisma);
  const jobMessages = await seedDemoJobMessages(prisma);
  const passOn = await seedDemoPassOn(prisma);
  const awaitingPay = await seedDemoAwaitingPay(prisma);
  const dispute = await seedDemoDispute(prisma);
  const jobAlerts = await seedDemoJobAlerts(prisma);
  const proposalAlerts = await seedDemoProposalAlerts(prisma);
  const inviteAlerts = await seedDemoInviteAlerts(prisma);
  console.log(
    `Demo pipeline bookings created: ${result.created}; shortlist ${saved}; recurring ${recurring}; expiring ${expiring}; series ${series}; blocked ${blocked}; funding ${funding}; unread ${unread}; searches ${searches}; handover ${handover}; invoices ${invoices}; replies ${replies}; portraits ${portraits}; weekly ${weekly}; notice ${notice}; jobStarts ${jobStarts}; expired ${expired}; hired ${hired}; invites ${invites}; jobMessages ${jobMessages}; passOn ${passOn}; awaitingPay ${awaitingPay}; dispute ${dispute}; jobAlerts ${jobAlerts}; proposalAlerts ${proposalAlerts}; inviteAlerts ${inviteAlerts}`,
  );
  await prisma.$disconnect();
}

if (process.argv[1]?.includes("seed-demo-pipeline")) {
  main().catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
}
