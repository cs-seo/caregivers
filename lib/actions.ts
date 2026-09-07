"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { clampNoticeHours, instantBookForStart, startIsInFuture } from "./availability";
import { dateKeysInWindows, firstBlockedKey, isDateKey } from "./blocked-dates";
import { normalizeFundingRef } from "./funding";
import { findSeriesOverlap } from "./booking-overlap";
import { BOOKING_STATUS, ROLES, UNPAID_BOOKING_STATUSES } from "./constants";
import { isAcceptedDemoCard, readDemoCard } from "./demo-card";
import { autoReleaseIfDue, holdPayment, refundPayment, releasePayment } from "./escrow";
import { parseSydneyDateTimeLocal, sydneyDateKey } from "./format";
import { quoteBooking } from "./money";
import { prisma } from "./prisma";
import { newCalendarToken } from "./calendar-feed";
import { handoverFromForm, handoverToDb, fillEmptyHandover, canFillFromHousehold } from "./handover";
import { sanitizePhotoUrl } from "./photos";
import { isSafeReviewReturnPath, sanitizeReviewReply, hasReviewReply } from "./reviews";
import { directoryStats } from "./queries";
import { filtersFromSearchHref, isSafeSearchHref, MAX_SAVED_SEARCHES } from "./saved-search";
import { requireRole, requireUser } from "./session";
import {
  canCounterProposal,
  canPassOnProposal,
  canRespondToCounter,
  canWithdrawProposal,
  composeBookingNotes,
  markRequestHired,
} from "./job-hire";
import {
  INVITE_STATUS,
  canCreateInvite,
  canUpdateInviteNote,
  canWithdrawInvite,
  isSafeInviteReturnPath,
  sanitizeInviteNote,
} from "./job-invite";
import {
  canSendJobMessage,
  isCarerInvolvedInJob,
  sanitizeJobMessage,
} from "./job-messages";
import { bookHref, canAttachJob, isJobSlug } from "./job-match";
import {
  firstSitOutsideHours,
  formatWeeklyHours,
  windowsFromForm,
} from "./weekly-windows";

function bookingFormHref(slug: string, formData: FormData, error?: string) {
  const rawStart = String(formData.get("startAt") ?? "");
  const start = /^\d{4}-\d{2}-\d{2}/.test(rawStart) ? rawStart.slice(0, 10) : "";
  const at = rawStart.includes("T") ? rawStart.slice(11, 16) : "";
  return bookHref(slug, { start, at, job: String(formData.get("job") ?? "").trim(), error });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");
  try {
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? ROLES.FAMILY);
  if (!name || !email || password.length < 8) {
    redirect("/register?error=invalid");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/register?error=exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role === ROLES.CAREGIVER ? ROLES.CAREGIVER : ROLES.FAMILY,
    },
  });

  if (user.role === ROLES.FAMILY) {
    await prisma.familyProfile.create({ data: { userId: user.id } });
  } else {
    const city = await prisma.city.findFirst({
      where: { slug: "sydney" },
      include: { state: true },
    });
    if (!city) throw new Error("Locations not seeded");
    await prisma.caregiverProfile.create({
      data: {
        userId: user.id,
        slug: `${slugify(name)}-${city.slug}-${Date.now().toString(36)}`,
        headline: "New carer on CareProof",
        bio: "Tell families about your experience, checks and the care you offer.",
        hourlyRateCents: 4000,
        yearsExperience: 1,
        suburb: city.name,
        cityId: city.id,
      },
    });
  }

  const afterSignup = user.role === ROLES.CAREGIVER ? "/dashboard/profile?welcome=1" : "/dashboard";
  try {
    await signIn("credentials", { email, password, redirectTo: afterSignup });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=credentials");
    }
    throw error;
  }
}

export async function createBookingAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(bookingFormHref(String(formData.get("slug") ?? ""), formData))}`);

  const slug = String(formData.get("slug") ?? "");
  const specialtyId = String(formData.get("specialtyId") ?? "");
  const startAt = parseSydneyDateTimeLocal(String(formData.get("startAt") ?? ""));
  const hours = Number(formData.get("hours") ?? 0);
  const occasion = String(formData.get("occasion") ?? "").trim();
  const children = String(formData.get("children") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const weeks = Math.min(12, Math.max(1, Math.round(Number(formData.get("weeks") ?? 1) || 1)));
  const extras = [
    occasion ? `Occasion: ${occasion.replace(/-/g, " ")}` : "",
    children ? `Children: ${children}` : "",
    weeks > 1 ? `Standing weekly sit · ${weeks} weeks` : "",
  ].filter(Boolean);
  const notes = [extras.join(" · "), notesRaw].filter(Boolean).join("\n") || "";

  const caregiver = await prisma.caregiverProfile.findUnique({
    where: { slug },
    include: { specialties: true },
  });
  if (!caregiver) throw new Error("Carer not found");
  if (!specialtyId || Number.isNaN(startAt.getTime()) || hours < 1 || hours > 24 || !startIsInFuture(startAt)) {
    redirect(bookingFormHref(slug, formData, "invalid"));
  }

  const quote = quoteBooking(caregiver.hourlyRateCents, hours);
  const todayKey = sydneyDateKey(new Date());
  const awayToday = await prisma.caregiverBlockedDate.findFirst({
    where: { caregiverId: caregiver.id, dateKey: todayKey },
    select: { dateKey: true },
  });
  const liveInstant = instantBookForStart(
    caregiver.instantBook,
    awayToday ? [todayKey] : [],
    startAt,
    caregiver.noticeHours,
  );
  const status = liveInstant ? BOOKING_STATUS.AWAITING_PAYMENT : BOOKING_STATUS.PENDING_ACCEPTANCE;
  const groupId = weeks > 1 ? crypto.randomUUID() : null;
  const windows = Array.from({ length: weeks }, (_, index) => {
    const weekStart = new Date(startAt.getTime() + index * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + hours * 60 * 60 * 1000);
    return { startAt: weekStart, endAt: weekEnd };
  });
  const overlap = await findSeriesOverlap(caregiver.id, windows);
  if (overlap) {
    redirect(bookingFormHref(slug, formData, "overlap"));
  }
  const blockedRows = await prisma.caregiverBlockedDate.findMany({
    where: { caregiverId: caregiver.id, dateKey: { in: dateKeysInWindows(windows) } },
    select: { dateKey: true },
  });
  if (firstBlockedKey(dateKeysInWindows(windows), blockedRows.map((row) => row.dateKey))) {
    redirect(bookingFormHref(slug, formData, "blocked"));
  }
  const weeklyWindows = await prisma.caregiverWeeklyWindow.findMany({
    where: { caregiverId: caregiver.id },
    select: { weekday: true, startMin: true, endMin: true },
  });
  if (firstSitOutsideHours(weeklyWindows, windows)) {
    redirect(bookingFormHref(slug, formData, "hours"));
  }

  const jobSlug = String(formData.get("job") ?? "").trim();
  const attachJob =
    jobSlug && isJobSlug(jobSlug)
      ? await prisma.careRequest.findUnique({
          where: { slug: jobSlug },
          select: { id: true, slug: true, familyId: true, status: true },
        })
      : null;
  const attachJobId = attachJob && canAttachJob(attachJob, user.id) ? attachJob.id : null;

  const householdHandover = handoverToDb({
    handoverAccess: user.familyProfile?.handoverAccess ?? "",
    handoverCare: user.familyProfile?.handoverCare ?? "",
    handoverEmergency: user.familyProfile?.handoverEmergency ?? "",
  });

  const created = [];
  for (let index = 0; index < weeks; index += 1) {
    const weekStart = windows[index].startAt;
    const weekEnd = windows[index].endAt;
    const weekNotes =
      weeks > 1
        ? [`Week ${index + 1} of ${weeks}`, notes].filter(Boolean).join("\n")
        : notes;
    const booking = await prisma.booking.create({
      data: {
        familyId: user.id,
        caregiverId: caregiver.id,
        careRequestId: attachJobId,
        specialtyId,
        startAt: weekStart,
        endAt: weekEnd,
        notes: weekNotes || null,
        ...householdHandover,
        status,
        recurringGroupId: groupId,
        recurringIndex: index + 1,
        recurringTotal: weeks,
        hours: quote.hours,
        rateCents: quote.rateCents,
        subtotalCents: quote.subtotalCents,
        platformFeeCents: quote.platformFeeCents,
        gstCents: quote.gstCents,
        totalCents: quote.totalCents,
      },
    });
    created.push(booking);
  }

  if (attachJobId && attachJob) {
    await markRequestHired(attachJobId, caregiver.id);
    revalidatePath(`/care-requests/${attachJob.slug}`);
  }

  if (liveInstant) {
    for (const booking of created) {
      await holdPayment(booking.id);
    }
    revalidatePath("/dashboard");
    redirect(`/dashboard/bookings/${created[0].id}?paid=1`);
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/bookings/${created[0].id}`);
}

export async function payBookingAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  if (!isAcceptedDemoCard(readDemoCard(formData))) {
    redirect(`/dashboard/bookings/${booking.id}?error=card`);
  }
  await holdPayment(booking.id);
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  redirect(`/dashboard/bookings/${booking.id}?paid=1`);
}

export async function paySeriesAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id || !booking.recurringGroupId) {
    throw new Error("Not allowed");
  }
  if (!isAcceptedDemoCard(readDemoCard(formData))) {
    redirect(`/dashboard/bookings/${booking.id}?error=card`);
  }
  const weeks = await prisma.booking.findMany({
    where: { recurringGroupId: booking.recurringGroupId, status: BOOKING_STATUS.AWAITING_PAYMENT },
    orderBy: { recurringIndex: "asc" },
  });
  for (const week of weeks) {
    await holdPayment(week.id);
  }
  revalidatePath("/dashboard");
  redirect(`/dashboard/bookings/${booking.id}?paid=1`);
}

export async function acceptBookingAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.caregiverId !== user.caregiverProfile.id) {
    throw new Error("Not allowed");
  }
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.AWAITING_PAYMENT },
  });
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function acceptSeriesAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.caregiverId !== user.caregiverProfile.id || !booking.recurringGroupId) {
    throw new Error("Not allowed");
  }
  await prisma.booking.updateMany({
    where: { recurringGroupId: booking.recurringGroupId, status: BOOKING_STATUS.PENDING_ACCEPTANCE },
    data: { status: BOOKING_STATUS.AWAITING_PAYMENT },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function declineBookingAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.caregiverId !== user.caregiverProfile.id) {
    throw new Error("Not allowed");
  }
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.CANCELLED },
  });
  revalidatePath("/dashboard");
}

export async function declineSeriesAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.caregiverId !== user.caregiverProfile.id || !booking.recurringGroupId) {
    throw new Error("Not allowed");
  }
  await prisma.booking.updateMany({
    where: { recurringGroupId: booking.recurringGroupId, status: BOOKING_STATUS.PENDING_ACCEPTANCE },
    data: { status: BOOKING_STATUS.CANCELLED },
  });
  revalidatePath("/dashboard");
}

function isUnpaidStatus(status: string) {
  return (UNPAID_BOOKING_STATUSES as readonly string[]).includes(status);
}

async function redirectAfterSeriesCancel(groupId: string | null, fallbackId: string) {
  if (groupId) {
    const remaining = await prisma.booking.findFirst({
      where: {
        recurringGroupId: groupId,
        status: { notIn: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REFUNDED] },
      },
      orderBy: { recurringIndex: "asc" },
    });
    if (remaining) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/bookings/${remaining.id}?cancelled=1`);
    }
  }
  revalidatePath("/dashboard");
  if (fallbackId) {
    const stillOpen = await prisma.booking.findUnique({ where: { id: fallbackId } });
    if (stillOpen && stillOpen.status !== BOOKING_STATUS.CANCELLED && stillOpen.status !== BOOKING_STATUS.REFUNDED) {
      redirect(`/dashboard/bookings/${fallbackId}?cancelled=1`);
    }
  }
  redirect("/dashboard?cancelled=1");
}

export async function cancelUnpaidBookingAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  if (!isUnpaidStatus(booking.status)) {
    throw new Error("Only unpaid weeks can be cancelled here");
  }
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.CANCELLED },
  });
  await redirectAfterSeriesCancel(booking.recurringGroupId, booking.id);
}

export async function cancelRemainingSeriesAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id || !booking.recurringGroupId) {
    throw new Error("Not allowed");
  }
  await prisma.booking.updateMany({
    where: {
      recurringGroupId: booking.recurringGroupId,
      status: { in: [...UNPAID_BOOKING_STATUSES] },
    },
    data: { status: BOOKING_STATUS.CANCELLED },
  });
  await redirectAfterSeriesCancel(booking.recurringGroupId, booking.id);
}

export async function startBookingAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { caregiver: true },
  });
  if (!booking) throw new Error("Not found");
  const isParty =
    booking.familyId === user.id || booking.caregiver.userId === user.id;
  if (!isParty) throw new Error("Not allowed");
  if (booking.status !== BOOKING_STATUS.ESCROW_HELD) throw new Error("Funds must be in escrow");
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.IN_PROGRESS },
  });
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function confirmCompleteAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.PENDING_RELEASE },
  });
  await releasePayment(booking.id);
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  revalidatePath(`/caregiver/${booking.caregiverId}`);
  redirect(`/dashboard/bookings/${booking.id}?released=1`);
}

export async function releaseNowAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { caregiver: true },
  });
  if (!booking) throw new Error("Not found");
  const isFamily = booking.familyId === user.id;
  if (!isFamily) throw new Error("Not allowed");
  await releasePayment(booking.id);
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function disputeBookingAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { caregiver: true },
  });
  if (!booking) throw new Error("Not found");
  const isParty =
    booking.familyId === user.id || booking.caregiver.userId === user.id;
  if (!isParty) throw new Error("Not allowed");
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.DISPUTED },
  });
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function resolveDisputeAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const resolution = String(formData.get("resolution") ?? "release");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  if (resolution === "refund") {
    await refundPayment(booking.id);
  } else {
    await releasePayment(booking.id);
  }
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function createCareRequestAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login?callbackUrl=/post-a-job");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const specialtyId = String(formData.get("specialtyId") ?? "");
  const cityId = String(formData.get("cityId") ?? "");
  const budgetCents = Math.round(Number(formData.get("budget")) * 100);
  const dateKey = String(formData.get("startDate") ?? "");
  const clock = String(formData.get("startAt") ?? "08:00");
  const startDate = parseSydneyDateTimeLocal(`${dateKey}T${clock}`);
  const hoursEstimate = Number(formData.get("hoursEstimate") ?? 0);

  if (!title || !description || !specialtyId || !cityId || !budgetCents || Number.isNaN(startDate.getTime())) {
    redirect("/post-a-job?error=invalid");
  }

  let slug = slugify(title);
  const clash = await prisma.careRequest.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const request = await prisma.careRequest.create({
    data: {
      slug,
      familyId: user.id,
      specialtyId,
      cityId,
      title,
      description,
      budgetType: "hourly",
      budgetCents,
      startDate,
      hoursEstimate: hoursEstimate || null,
      status: "open",
    },
  });

  revalidatePath("/care-requests");
  redirect(`/care-requests/${request.slug}`);
}

export async function createProposalAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  const coverLetter = String(formData.get("coverLetter") ?? "").trim();
  const rateCents = Math.round(Number(formData.get("rate")) * 100);
  const request = await prisma.careRequest.findUnique({ where: { slug } });
  if (!request || request.status !== "open") throw new Error("Job is not open");
  if (!coverLetter || !rateCents) redirect(`/care-requests/${slug}?error=invalid`);
  const updating = Boolean(
    await prisma.proposal.findUnique({
      where: {
        careRequestId_caregiverId: {
          careRequestId: request.id,
          caregiverId: user.caregiverProfile.id,
        },
      },
      select: { id: true },
    }),
  );

  await prisma.proposal.upsert({
    where: {
      careRequestId_caregiverId: {
        careRequestId: request.id,
        caregiverId: user.caregiverProfile.id,
      },
    },
    create: {
      careRequestId: request.id,
      caregiverId: user.caregiverProfile.id,
      coverLetter,
      rateCents,
    },
    update: { coverLetter, rateCents, status: "pending", counterRateCents: null, counterNote: null },
  });
  await prisma.careRequestInvite.updateMany({
    where: {
      requestId: request.id,
      caregiverId: user.caregiverProfile.id,
      status: INVITE_STATUS.PENDING,
    },
    data: { status: INVITE_STATUS.APPLIED },
  });

  revalidatePath(`/care-requests/${slug}`);
  revalidatePath("/dashboard");
  redirect(`/care-requests/${slug}?${updating ? "updated" : "proposed"}=1`);
}

export async function inviteToJobAction(formData: FormData) {
  const nextRaw = String(formData.get("next") ?? "/dashboard");
  const next = isSafeInviteReturnPath(nextRaw) ? nextRaw : "/dashboard";
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);

  const caregiverId = String(formData.get("caregiverId") ?? "");
  const jobSlug = String(formData.get("job") ?? "").trim();
  if (!isJobSlug(jobSlug)) redirect(next);

  const [job, caregiver] = await Promise.all([
    prisma.careRequest.findUnique({
      where: { slug: jobSlug },
      include: {
        proposals: { where: { caregiverId }, select: { id: true } },
        invites: { where: { caregiverId }, select: { id: true, status: true } },
      },
    }),
    prisma.caregiverProfile.findUnique({ where: { id: caregiverId }, select: { id: true, slug: true } }),
  ]);
  if (!job || !caregiver || !canCreateInvite(job, user.id, job.invites[0], Boolean(job.proposals.length))) {
    redirect(next);
  }

  const note = sanitizeInviteNote(String(formData.get("note") ?? ""));
  await prisma.careRequestInvite.upsert({
    where: { requestId_caregiverId: { requestId: job.id, caregiverId: caregiver.id } },
    create: { requestId: job.id, caregiverId: caregiver.id, status: INVITE_STATUS.PENDING, note: note || null },
    update: { status: INVITE_STATUS.PENDING, note: note || null },
  });

  revalidatePath(next);
  revalidatePath(`/care-requests/${job.slug}`);
  revalidatePath(`/caregiver/${caregiver.slug}`);
  revalidatePath("/care-requests");
  revalidatePath("/dashboard");
}

export async function declineInviteAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const inviteId = String(formData.get("inviteId") ?? "");
  const invite = await prisma.careRequestInvite.findUnique({
    where: { id: inviteId },
    include: { request: { select: { slug: true } } },
  });
  if (!invite || invite.caregiverId !== user.caregiverProfile.id || invite.status !== INVITE_STATUS.PENDING) {
    redirect("/dashboard");
  }

  const reply = sanitizeInviteNote(String(formData.get("reply") ?? ""));
  await prisma.careRequestInvite.update({
    where: { id: invite.id },
    data: { status: INVITE_STATUS.DECLINED, reply: reply || null },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/care-requests/${invite.request.slug}`);
  revalidatePath("/care-requests");
}

export async function updateInviteNoteAction(formData: FormData) {
  const nextRaw = String(formData.get("next") ?? "/dashboard");
  const next = isSafeInviteReturnPath(nextRaw) ? nextRaw : "/dashboard";
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);

  const inviteId = String(formData.get("inviteId") ?? "");
  const invite = await prisma.careRequestInvite.findUnique({
    where: { id: inviteId },
    include: { request: { select: { slug: true, familyId: true, status: true } }, caregiver: { select: { slug: true } } },
  });
  if (!invite || !canUpdateInviteNote(invite, invite.request, user.id)) {
    redirect(next);
  }

  const note = sanitizeInviteNote(String(formData.get("note") ?? ""));
  await prisma.careRequestInvite.update({
    where: { id: invite.id },
    data: { note: note || null },
  });
  revalidatePath(next);
  revalidatePath(`/care-requests/${invite.request.slug}`);
  revalidatePath(`/caregiver/${invite.caregiver.slug}`);
  revalidatePath("/dashboard");
}

export async function withdrawInviteAction(formData: FormData) {
  const nextRaw = String(formData.get("next") ?? "/dashboard");
  const next = isSafeInviteReturnPath(nextRaw) ? nextRaw : "/dashboard";
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);

  const inviteId = String(formData.get("inviteId") ?? "");
  const invite = await prisma.careRequestInvite.findUnique({
    where: { id: inviteId },
    include: { request: { select: { slug: true, familyId: true, status: true } }, caregiver: { select: { slug: true } } },
  });
  if (!invite || !canWithdrawInvite(invite, invite.request, user.id)) {
    redirect(next);
  }

  await prisma.careRequestInvite.delete({ where: { id: invite.id } });
  revalidatePath(next);
  revalidatePath(`/care-requests/${invite.request.slug}`);
  revalidatePath(`/caregiver/${invite.caregiver.slug}`);
  revalidatePath("/care-requests");
  revalidatePath("/dashboard");
}

export async function withdrawProposalAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const proposalId = String(formData.get("proposalId") ?? "");
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { careRequest: { select: { slug: true, status: true } } },
  });
  if (!proposal || !canWithdrawProposal(proposal, user.caregiverProfile.id, proposal.careRequest.status)) {
    redirect("/dashboard");
  }

  await prisma.proposal.delete({ where: { id: proposal.id } });
  await prisma.careRequestInvite.updateMany({
    where: {
      requestId: proposal.careRequestId,
      caregiverId: proposal.caregiverId,
      status: INVITE_STATUS.APPLIED,
    },
    data: { status: INVITE_STATUS.PENDING },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/care-requests/${proposal.careRequest.slug}`);
  revalidatePath("/care-requests");
}

export async function passOnProposalAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const proposalId = String(formData.get("proposalId") ?? "");
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { careRequest: { select: { slug: true, familyId: true, status: true } } },
  });
  if (!proposal || !canPassOnProposal(proposal, proposal.careRequest, user.id)) {
    redirect(proposal ? `/care-requests/${proposal.careRequest.slug}` : "/dashboard");
  }

  const familyNote = sanitizeInviteNote(String(formData.get("familyNote") ?? ""));
  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "declined", familyNote: familyNote || null, counterRateCents: null, counterNote: null },
  });
  await prisma.careRequestInvite.updateMany({
    where: {
      requestId: proposal.careRequestId,
      caregiverId: proposal.caregiverId,
      status: INVITE_STATUS.APPLIED,
    },
    data: { status: INVITE_STATUS.DECLINED },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/care-requests/${proposal.careRequest.slug}`);
  revalidatePath("/care-requests");
  redirect(`/care-requests/${proposal.careRequest.slug}?passed=1`);
}

export async function counterProposalAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const proposalId = String(formData.get("proposalId") ?? "");
  const counterRateCents = Math.round(Number(formData.get("counterRate")) * 100);
  const counterNote = sanitizeInviteNote(String(formData.get("counterNote") ?? ""));
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { careRequest: { select: { slug: true, familyId: true, status: true } } },
  });
  if (!proposal || !canCounterProposal(proposal, proposal.careRequest, user.id)) {
    redirect(proposal ? `/care-requests/${proposal.careRequest.slug}` : "/dashboard");
  }
  if (!counterRateCents || counterRateCents < 2000) {
    redirect(`/care-requests/${proposal.careRequest.slug}?error=counter`);
  }

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { counterRateCents, counterNote: counterNote || null },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/care-requests/${proposal.careRequest.slug}`);
  redirect(`/care-requests/${proposal.careRequest.slug}?countered=1`);
}

export async function respondToCounterAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const proposalId = String(formData.get("proposalId") ?? "");
  const accept = String(formData.get("accept") ?? "") === "1";
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { careRequest: { select: { slug: true, status: true } } },
  });
  if (!proposal || !canRespondToCounter(proposal, user.caregiverProfile.id, proposal.careRequest.status)) {
    redirect(proposal ? `/care-requests/${proposal.careRequest.slug}` : "/dashboard");
  }

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: accept
      ? { rateCents: proposal.counterRateCents ?? proposal.rateCents, counterRateCents: null, counterNote: null }
      : { counterRateCents: null, counterNote: null },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/care-requests/${proposal.careRequest.slug}`);
  redirect(`/care-requests/${proposal.careRequest.slug}?${accept ? "accepted" : "kept"}=1`);
}

export async function hireProposalAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const proposalId = String(formData.get("proposalId") ?? "");
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { careRequest: true, caregiver: true },
  });
  if (!proposal || proposal.careRequest.familyId !== user.id) {
    throw new Error("Not allowed");
  }
  if (proposal.careRequest.status !== "open") {
    throw new Error("Job is not open");
  }

  const hours = proposal.careRequest.hoursEstimate || 4;
  const quote = quoteBooking(proposal.rateCents, hours);
  const startAt = proposal.careRequest.startDate;
  const endAt = new Date(startAt.getTime() + hours * 60 * 60 * 1000);
  const welcomeNote = String(formData.get("welcomeNote") ?? "");

  const booking = await prisma.booking.create({
    data: {
      familyId: user.id,
      caregiverId: proposal.caregiverId,
      careRequestId: proposal.careRequestId,
      specialtyId: proposal.careRequest.specialtyId,
      startAt,
      endAt,
      notes: composeBookingNotes({ welcomeNote, coverLetter: proposal.coverLetter }),
      status: BOOKING_STATUS.AWAITING_PAYMENT,
      hours: quote.hours,
      rateCents: quote.rateCents,
      subtotalCents: quote.subtotalCents,
      platformFeeCents: quote.platformFeeCents,
      gstCents: quote.gstCents,
      totalCents: quote.totalCents,
    },
  });

  await markRequestHired(proposal.careRequestId, proposal.caregiverId);

  await holdPayment(booking.id);
  revalidatePath("/dashboard");
  redirect(`/dashboard/bookings/${booking.id}?paid=1`);
}

export async function createReviewAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true, caregiver: true },
  });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  if (booking.status !== BOOKING_STATUS.RELEASED) {
    throw new Error("Reviews are only available after payment is released");
  }
  if (booking.review) redirect(`/dashboard/bookings/${booking.id}`);
  if (rating < 1 || rating > 5 || !body) {
    redirect(`/dashboard/bookings/${booking.id}?error=review`);
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      authorId: user.id,
      caregiverId: booking.caregiverId,
      rating,
      body,
    },
  });

  const reviews = await prisma.review.findMany({
    where: { caregiverId: booking.caregiverId },
  });
  const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await prisma.caregiverProfile.update({
    where: { id: booking.caregiverId },
    data: {
      ratingAvg: Math.round(avg * 10) / 10,
      reviewCount: reviews.length,
    },
  });

  revalidatePath(`/caregiver/${booking.caregiver.slug}`);
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function replyToReviewAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const reviewId = String(formData.get("reviewId") ?? "");
  const reply = sanitizeReviewReply(String(formData.get("reply") ?? ""));
  const nextRaw = String(formData.get("next") ?? "");
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { caregiver: { select: { id: true, slug: true } } },
  });
  if (!review || review.caregiverId !== user.caregiverProfile.id) throw new Error("Not allowed");
  const dest = isSafeReviewReturnPath(nextRaw)
    ? nextRaw
    : `/dashboard/bookings/${review.bookingId}`;
  if (hasReviewReply(review)) redirect(dest);
  if (!reply) {
    const join = dest.includes("?") ? "&" : "?";
    redirect(`${dest}${join}error=reply`);
  }

  await prisma.review.update({
    where: { id: review.id },
    data: { reply, repliedAt: new Date() },
  });

  revalidatePath(`/caregiver/${review.caregiver.slug}`);
  revalidatePath(`/dashboard/bookings/${review.bookingId}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(dest);
}

export async function runAutoReleaseAction(bookingId: string) {
  await autoReleaseIfDue(bookingId);
}

export async function updateBookingHandoverAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const applySeries = formData.get("applySeries") === "1";
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, familyId: true, recurringGroupId: true },
  });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");

  const data = handoverToDb(handoverFromForm(formData));
  if (applySeries && booking.recurringGroupId) {
    await prisma.booking.updateMany({
      where: {
        familyId: user.id,
        recurringGroupId: booking.recurringGroupId,
        status: { notIn: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REFUNDED] },
      },
      data,
    });
  } else {
    await prisma.booking.update({ where: { id: booking.id }, data });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  redirect(`/dashboard/bookings/${booking.id}?handover=1#handover`);
}

const HANDOVER_SKIP_STATUSES = [
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.REFUNDED,
  BOOKING_STATUS.RELEASED,
];

export async function applyHouseholdHandoverAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const applySeries = formData.get("applySeries") === "1";
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      familyId: true,
      recurringGroupId: true,
      handoverAccess: true,
      handoverCare: true,
      handoverEmergency: true,
    },
  });
  if (!booking || booking.familyId !== user.id) throw new Error("Not allowed");
  if (!canFillFromHousehold(booking, user.familyProfile)) {
    redirect(`/dashboard/bookings/${booking.id}#handover`);
  }

  const targets =
    applySeries && booking.recurringGroupId
      ? await prisma.booking.findMany({
          where: {
            familyId: user.id,
            recurringGroupId: booking.recurringGroupId,
            status: { notIn: [...HANDOVER_SKIP_STATUSES] },
          },
          select: {
            id: true,
            handoverAccess: true,
            handoverCare: true,
            handoverEmergency: true,
          },
        })
      : [booking];

  for (const target of targets) {
    if (!canFillFromHousehold(target, user.familyProfile)) continue;
    await prisma.booking.update({
      where: { id: target.id },
      data: handoverToDb(fillEmptyHandover(target, user.familyProfile)),
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/household");
  revalidatePath(`/dashboard/bookings/${booking.id}`);
  redirect(`/dashboard/bookings/${booking.id}?handover=household#handover`);
}

export async function applyHouseholdToUpcomingAction(_formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  if (!canFillFromHousehold({}, user.familyProfile)) {
    redirect("/dashboard/household");
  }
  const bookings = await prisma.booking.findMany({
    where: {
      familyId: user.id,
      status: { notIn: [...HANDOVER_SKIP_STATUSES] },
    },
    select: {
      id: true,
      handoverAccess: true,
      handoverCare: true,
      handoverEmergency: true,
    },
  });
  let copied = 0;
  for (const booking of bookings) {
    if (!canFillFromHousehold(booking, user.familyProfile)) continue;
    await prisma.booking.update({
      where: { id: booking.id },
      data: handoverToDb(fillEmptyHandover(booking, user.familyProfile)),
    });
    copied += 1;
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/household");
  redirect(`/dashboard/household?copied=${copied}`);
}

export async function sendJobMessageAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const slug = String(formData.get("slug") ?? "");
  const caregiverId = String(formData.get("caregiverId") ?? "");
  const body = sanitizeJobMessage(String(formData.get("body") ?? ""));
  const job = await prisma.careRequest.findUnique({
    where: { slug },
    include: {
      invites: { where: { caregiverId }, select: { id: true } },
      proposals: { where: { caregiverId }, select: { id: true } },
      bookings: { where: { caregiverId }, select: { id: true }, take: 1 },
    },
  });
  const caregiver = await prisma.caregiverProfile.findUnique({
    where: { id: caregiverId },
    select: { id: true, userId: true },
  });
  const involved = isCarerInvolvedInJob({
    caregiverId,
    invited: Boolean(job?.invites.length),
    proposed: Boolean(job?.proposals.length),
    hiredCaregiverId: job?.bookings[0]?.id ? caregiverId : null,
  });
  if (
    !job ||
    !caregiver ||
    !canSendJobMessage({
      job,
      viewerId: user.id,
      viewerCaregiverId: user.caregiverProfile?.id,
      threadCaregiverId: caregiver.id,
      involved,
    })
  ) {
    redirect(slug ? `/care-requests/${slug}` : "/dashboard");
  }
  if (!body) redirect(`/care-requests/${job.slug}?error=message`);

  await prisma.careRequestMessage.create({
    data: {
      requestId: job.id,
      caregiverId: caregiver.id,
      senderId: user.id,
      body,
    },
  });
  revalidatePath(`/care-requests/${job.slug}`);
  revalidatePath("/dashboard");
  redirect(`/care-requests/${job.slug}?sent=1`);
}

export async function sendMessageAction(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const bookingId = String(formData.get("bookingId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { caregiver: true },
  });
  if (!booking) throw new Error("Not found");
  const isParty = booking.familyId === user.id || booking.caregiver.userId === user.id;
  if (!isParty) throw new Error("Not allowed");
  if (!body) redirect(`/dashboard/bookings/${booking.id}?error=message`);

  await prisma.message.create({
    data: { bookingId: booking.id, senderId: user.id, body },
  });
  revalidatePath(`/dashboard/bookings/${booking.id}`);
}

export async function updateCaregiverProfileAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");

  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const suburb = String(formData.get("suburb") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "");
  const abn = String(formData.get("abn") ?? "").trim();
  const hourlyRateAud = Number(formData.get("hourlyRateAud") ?? 0);
  const yearsExperience = Number(formData.get("yearsExperience") ?? 0);
  const specialtyIds = formData.getAll("specialtyId").map(String).filter(Boolean);
  const instantBook = formData.get("instantBook") === "1";
  const availableNow = formData.get("availableNow") === "1";
  const noticeHours = clampNoticeHours(formData.get("noticeHours") ?? 4);
  if (noticeHours == null) redirect("/dashboard/profile?error=notice");
  const availabilityNote = String(formData.get("availabilityNote") ?? "").trim().slice(0, 240);
  const weeklyParsed = windowsFromForm(formData.getAll("weeklyWindow").map(String));
  if (!weeklyParsed.ok) redirect("/dashboard/profile?error=hours");
  const weeklyHours = formatWeeklyHours(weeklyParsed.windows) || null;
  const photoRaw = String(formData.get("photoUrl") ?? "").trim();
  const photoUrl = photoRaw ? sanitizePhotoUrl(photoRaw) : null;
  if (photoRaw && !photoUrl) redirect("/dashboard/profile?error=photo");

  if (!headline || !bio || !suburb || !cityId || hourlyRateAud < 20 || yearsExperience < 0) {
    redirect("/dashboard/profile?error=invalid");
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) redirect("/dashboard/profile?error=invalid");

  await prisma.$transaction(async (tx) => {
    await tx.caregiverProfile.update({
      where: { id: user.caregiverProfile!.id },
      data: {
        headline,
        bio,
        suburb,
        cityId,
        abn: abn || null,
        hourlyRateCents: Math.round(hourlyRateAud * 100),
        yearsExperience: Math.round(yearsExperience),
        instantBook,
        availableNow,
        noticeHours,
        availabilityNote: availabilityNote || null,
        weeklyHours,
        photoUrl,
        lastActiveAt: new Date(),
      },
    });
    await tx.caregiverWeeklyWindow.deleteMany({ where: { caregiverId: user.caregiverProfile!.id } });
    if (weeklyParsed.windows.length) {
      await tx.caregiverWeeklyWindow.createMany({
        data: weeklyParsed.windows.map((window) => ({
          caregiverId: user.caregiverProfile!.id,
          weekday: window.weekday,
          startMin: window.startMin,
          endMin: window.endMin,
        })),
      });
    }
    await tx.caregiverSpecialty.deleteMany({ where: { caregiverId: user.caregiverProfile!.id } });
    if (specialtyIds.length) {
      await tx.caregiverSpecialty.createMany({
        data: specialtyIds.map((specialtyId) => ({
          caregiverId: user.caregiverProfile!.id,
          specialtyId,
        })),
      });
    }
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
  revalidatePath("/caregivers");
  redirect("/dashboard/profile?saved=1");
}

export async function addBlockedDateAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const dateKey = String(formData.get("dateKey") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 80);
  if (!isDateKey(dateKey)) redirect("/dashboard/profile?error=invalid");
  await prisma.caregiverBlockedDate.upsert({
    where: { caregiverId_dateKey: { caregiverId: user.caregiverProfile.id, dateKey } },
    update: { note: note || null },
    create: { caregiverId: user.caregiverProfile.id, dateKey, note: note || null },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
  revalidatePath("/caregivers");
  revalidatePath("/dashboard");
}

export async function removeBlockedDateAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const dateKey = String(formData.get("dateKey") ?? "").trim();
  if (!isDateKey(dateKey)) redirect("/dashboard/profile?error=invalid");
  await prisma.caregiverBlockedDate.deleteMany({
    where: { caregiverId: user.caregiverProfile.id, dateKey },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
  revalidatePath("/caregivers");
  revalidatePath("/dashboard");
}

export async function addCredentialAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const type = String(formData.get("type") ?? "");
  const number = String(formData.get("number") ?? "").trim();
  const issuingState = String(formData.get("issuingState") ?? "").trim();
  const expiresAtRaw = String(formData.get("expiresAt") ?? "");
  if (!type) redirect("/dashboard/profile?error=credential");

  await prisma.credential.create({
    data: {
      caregiverId: user.caregiverProfile.id,
      type,
      number: number || null,
      issuingState: issuingState || null,
      expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : null,
      verified: false,
    },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
}

export async function removeCredentialAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const id = String(formData.get("credentialId") ?? "");
  await prisma.credential.deleteMany({
    where: { id, caregiverId: user.caregiverProfile.id },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
}

export async function addWorkHistoryAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const employer = String(formData.get("employer") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const duties = String(formData.get("duties") ?? "").trim();
  const hours = Number(formData.get("hours") ?? 0);
  const startDate = new Date(String(formData.get("startDate") ?? ""));
  const endRaw = String(formData.get("endDate") ?? "");
  if (!employer || !title || !duties || Number.isNaN(startDate.getTime())) {
    redirect("/dashboard/profile?error=work");
  }

  await prisma.workHistory.create({
    data: {
      caregiverId: user.caregiverProfile.id,
      employer,
      title,
      duties,
      hours: Number.isFinite(hours) ? Math.max(0, Math.round(hours)) : 0,
      startDate,
      endDate: endRaw ? new Date(endRaw) : null,
      verification: "unverified",
    },
  });

  const hoursSum = await prisma.workHistory.aggregate({
    where: { caregiverId: user.caregiverProfile.id },
    _sum: { hours: true },
  });
  await prisma.caregiverProfile.update({
    where: { id: user.caregiverProfile.id },
    data: { verifiedHours: hoursSum._sum.hours ?? 0 },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
}

export async function updateFamilyProfileAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login");
  const suburb = String(formData.get("suburb") ?? "").trim();
  const cityId = String(formData.get("cityId") ?? "");
  const bio = String(formData.get("bio") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const ndisNumber = normalizeFundingRef(String(formData.get("ndisNumber") ?? ""));
  const agedCareRef = normalizeFundingRef(String(formData.get("agedCareRef") ?? ""));
  const handover = handoverToDb(handoverFromForm(formData));

  await prisma.user.update({
    where: { id: user.id },
    data: { phone: phone || null },
  });
  if (user.familyProfile) {
    await prisma.familyProfile.update({
      where: { id: user.familyProfile.id },
      data: {
        suburb: suburb || null,
        cityId: cityId || null,
        bio: bio || null,
        ndisNumber,
        agedCareRef,
        ...handover,
      },
    });
  } else {
    await prisma.familyProfile.create({
      data: {
        userId: user.id,
        suburb: suburb || null,
        cityId: cityId || null,
        bio: bio || null,
        ndisNumber,
        agedCareRef,
        ...handover,
      },
    });
  }
  revalidatePath("/dashboard/household");
  revalidatePath("/dashboard/statement");
  redirect("/dashboard/household?saved=1");
}

export async function removeWorkHistoryAction(formData: FormData) {
  const user = await requireRole(ROLES.CAREGIVER);
  if (!user?.caregiverProfile) redirect("/login");
  const id = String(formData.get("workId") ?? "");
  await prisma.workHistory.deleteMany({
    where: { id, caregiverId: user.caregiverProfile.id },
  });
  const hoursSum = await prisma.workHistory.aggregate({
    where: { caregiverId: user.caregiverProfile.id },
    _sum: { hours: true },
  });
  await prisma.caregiverProfile.update({
    where: { id: user.caregiverProfile.id },
    data: { verifiedHours: hoursSum._sum.hours ?? 0 },
  });
  revalidatePath("/dashboard/profile");
  revalidatePath(`/caregiver/${user.caregiverProfile.slug}`);
}

export async function toggleShortlistAction(formData: FormData) {
  const next = String(formData.get("next") ?? "/dashboard/shortlist");
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);

  const caregiverId = String(formData.get("caregiverId") ?? "");
  const caregiver = await prisma.caregiverProfile.findUnique({
    where: { id: caregiverId },
    select: { id: true, slug: true },
  });
  if (!caregiver) redirect(next);

  const existing = await prisma.shortlist.findUnique({
    where: { familyId_caregiverId: { familyId: user.id, caregiverId: caregiver.id } },
  });
  if (existing) {
    await prisma.shortlist.delete({ where: { id: existing.id } });
  } else {
    await prisma.shortlist.create({ data: { familyId: user.id, caregiverId: caregiver.id } });
  }

  revalidatePath(next);
  revalidatePath("/dashboard/shortlist");
  revalidatePath("/");
  revalidatePath(`/caregiver/${caregiver.slug}`);
  revalidatePath("/caregivers");
  revalidatePath("/dashboard");
}

export async function saveSearchAction(formData: FormData) {
  const href = String(formData.get("href") ?? "");
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const next = isSafeSearchHref(href) ? href : "/caregivers";
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(next)}`);
  if (!isSafeSearchHref(href) || !name) redirect(next);

  const existing = await prisma.savedSearch.findUnique({
    where: { familyId_href: { familyId: user.id, href } },
  });
  const filters = filtersFromSearchHref(href);
  const matches = filters ? (await directoryStats(filters)).count : 0;
  if (existing) {
    await prisma.savedSearch.update({
      where: { id: existing.id },
      data: { name, lastSeenCount: matches, seenAt: new Date() },
    });
    revalidatePath("/dashboard");
    return;
  }
  const count = await prisma.savedSearch.count({ where: { familyId: user.id } });
  if (count >= MAX_SAVED_SEARCHES) redirect(`${next}${next.includes("?") ? "&" : "?"}error=saved-limit`);

  await prisma.savedSearch.create({
    data: { familyId: user.id, name, href, lastSeenCount: matches, seenAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath(next);
}

export async function deleteSavedSearchAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login?callbackUrl=/dashboard");
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  await prisma.savedSearch.deleteMany({ where: { id, familyId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath(next);
}

function savedSearchReturnPath(raw: string) {
  if (raw === "/dashboard" || raw === "/dashboard/alerts" || raw.startsWith("/dashboard?")) return raw;
  return "/dashboard";
}

export async function toggleSavedSearchAlertsAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login?callbackUrl=/dashboard");
  const id = String(formData.get("id") ?? "");
  const next = savedSearchReturnPath(String(formData.get("next") ?? "/dashboard"));
  const alertsOn = String(formData.get("alertsOn") ?? "") === "1";
  await prisma.savedSearch.updateMany({ where: { id, familyId: user.id }, data: { alertsOn } });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alerts");
  redirect(next);
}

export async function markSavedSearchAlertSentAction(formData: FormData) {
  const user = await requireRole(ROLES.FAMILY);
  if (!user) redirect("/login?callbackUrl=/dashboard/alerts");
  const id = String(formData.get("id") ?? "");
  const next = savedSearchReturnPath(String(formData.get("next") ?? "/dashboard/alerts"));
  const search = await prisma.savedSearch.findFirst({ where: { id, familyId: user.id } });
  if (!search) redirect(next);
  const filters = filtersFromSearchHref(search.href);
  const matches = filters ? (await directoryStats(filters)).count : 0;
  await prisma.savedSearch.update({
    where: { id: search.id },
    data: { lastAlertedCount: matches, alertedAt: new Date() },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alerts");
  redirect(`${next}${next.includes("?") ? "&" : "?"}sent=1`);
}

export async function rotateCalendarFeedAction() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/calendar");
  await prisma.calendarFeed.upsert({
    where: { userId: user.id },
    update: { token: newCalendarToken() },
    create: { userId: user.id, token: newCalendarToken() },
  });
  revalidatePath("/dashboard/calendar");
}
