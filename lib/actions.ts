"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { findSeriesOverlap } from "./booking-overlap";
import { BOOKING_STATUS, ROLES } from "./constants";
import { autoReleaseIfDue, holdPayment, refundPayment, releasePayment } from "./escrow";
import { quoteBooking } from "./money";
import { prisma } from "./prisma";
import { requireRole, requireUser } from "./session";

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
  if (!user) redirect(`/login?callbackUrl=/caregiver/${formData.get("slug")}/book`);

  const slug = String(formData.get("slug") ?? "");
  const specialtyId = String(formData.get("specialtyId") ?? "");
  const startAt = new Date(String(formData.get("startAt") ?? ""));
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
  if (!specialtyId || Number.isNaN(startAt.getTime()) || hours < 1 || hours > 24) {
    redirect(`/caregiver/${slug}/book?error=invalid`);
  }

  const quote = quoteBooking(caregiver.hourlyRateCents, hours);
  const status = caregiver.instantBook
    ? BOOKING_STATUS.AWAITING_PAYMENT
    : BOOKING_STATUS.PENDING_ACCEPTANCE;
  const groupId = weeks > 1 ? crypto.randomUUID() : null;
  const windows = Array.from({ length: weeks }, (_, index) => {
    const weekStart = new Date(startAt.getTime() + index * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + hours * 60 * 60 * 1000);
    return { startAt: weekStart, endAt: weekEnd };
  });
  const overlap = await findSeriesOverlap(caregiver.id, windows);
  if (overlap) {
    redirect(`/caregiver/${slug}/book?error=overlap`);
  }

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
        specialtyId,
        startAt: weekStart,
        endAt: weekEnd,
        notes: weekNotes || null,
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

  if (caregiver.instantBook) {
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
  await holdPayment(booking.id);
  revalidatePath(`/dashboard/bookings/${booking.id}`);
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
  const startDate = new Date(String(formData.get("startDate") ?? ""));
  const hoursEstimate = Number(formData.get("hoursEstimate") ?? 0);

  if (!title || !description || !specialtyId || !cityId || !budgetCents) {
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
    update: { coverLetter, rateCents, status: "pending" },
  });

  revalidatePath(`/care-requests/${slug}`);
  redirect(`/care-requests/${slug}?proposed=1`);
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

  const hours = proposal.careRequest.hoursEstimate || 4;
  const quote = quoteBooking(proposal.rateCents, hours);
  const startAt = proposal.careRequest.startDate;
  const endAt = new Date(startAt.getTime() + hours * 60 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      familyId: user.id,
      caregiverId: proposal.caregiverId,
      careRequestId: proposal.careRequestId,
      specialtyId: proposal.careRequest.specialtyId,
      startAt,
      endAt,
      notes: proposal.coverLetter,
      status: BOOKING_STATUS.AWAITING_PAYMENT,
      hours: quote.hours,
      rateCents: quote.rateCents,
      subtotalCents: quote.subtotalCents,
      platformFeeCents: quote.platformFeeCents,
      gstCents: quote.gstCents,
      totalCents: quote.totalCents,
    },
  });

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "accepted" },
  });
  await prisma.careRequest.update({
    where: { id: proposal.careRequestId },
    data: { status: "hired" },
  });

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
}

export async function runAutoReleaseAction(bookingId: string) {
  await autoReleaseIfDue(bookingId);
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
  const availabilityNote = String(formData.get("availabilityNote") ?? "").trim().slice(0, 240);
  const weeklyHours = String(formData.get("weeklyHours") ?? "").trim().slice(0, 120);

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
        availabilityNote: availabilityNote || null,
        weeklyHours: weeklyHours || null,
        lastActiveAt: new Date(),
      },
    });
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
      },
    });
  } else {
    await prisma.familyProfile.create({
      data: {
        userId: user.id,
        suburb: suburb || null,
        cityId: cityId || null,
        bio: bio || null,
      },
    });
  }
  revalidatePath("/dashboard/household");
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
