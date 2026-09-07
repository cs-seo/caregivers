import { BOOKING_STATUS, PAYMENT_STATUS, AUTO_RELEASE_HOURS, WORK_VERIFICATION } from "./constants";
import { formatDateTime } from "./format";
import { persistMissingInvoiceNumbers } from "./invoice-peers";
import { prisma } from "./prisma";
import { getStripe, stripeEnabled } from "./stripe";

export function paymentProvider() {
  return stripeEnabled() ? "stripe" : "demo";
}

export async function holdPayment(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, caregiver: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (
    booking.status !== BOOKING_STATUS.AWAITING_PAYMENT &&
    booking.status !== BOOKING_STATUS.PENDING_ACCEPTANCE
  ) {
    throw new Error("Booking is not awaiting payment");
  }

  let stripePaymentIntentId: string | undefined;
  const stripe = getStripe();
  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: booking.totalCents,
      currency: "aud",
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId: booking.id },
      description: `CareProof escrow for booking ${booking.id}`,
    });
    stripePaymentIntentId = intent.id;
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      provider: paymentProvider(),
      stripePaymentIntentId,
      amountCents: booking.totalCents,
      platformFeeCents: booking.platformFeeCents,
      caregiverPayoutCents: booking.subtotalCents,
      status: PAYMENT_STATUS.HELD,
      heldAt: new Date(),
    },
    update: {
      status: PAYMENT_STATUS.HELD,
      heldAt: new Date(),
      stripePaymentIntentId,
    },
  });

  const now = new Date();
  const nextStatus =
    booking.startAt <= now ? BOOKING_STATUS.IN_PROGRESS : BOOKING_STATUS.ESCROW_HELD;

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: nextStatus },
  });

  if (!payment.invoiceNumber) {
    await persistMissingInvoiceNumbers();
  }

  return payment;
}

export async function releasePayment(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, caregiver: { include: { user: true } }, specialty: true },
  });
  if (!booking?.payment) throw new Error("No escrow payment to release");
  if (booking.payment.status === PAYMENT_STATUS.RELEASED) return booking.payment;
  if (
    booking.status !== BOOKING_STATUS.PENDING_RELEASE &&
    booking.status !== BOOKING_STATUS.IN_PROGRESS &&
    booking.status !== BOOKING_STATUS.ESCROW_HELD &&
    booking.status !== BOOKING_STATUS.DISPUTED
  ) {
    throw new Error("Booking is not ready for release");
  }

  let stripeTransferId: string | undefined;
  const stripe = getStripe();
  if (stripe && booking.caregiver.stripeAccountId) {
    const transfer = await stripe.transfers.create({
      amount: booking.payment.caregiverPayoutCents,
      currency: "aud",
      destination: booking.caregiver.stripeAccountId,
      metadata: { bookingId: booking.id },
    });
    stripeTransferId = transfer.id;
  }

  const payment = await prisma.payment.update({
    where: { id: booking.payment.id },
    data: {
      status: PAYMENT_STATUS.RELEASED,
      releasedAt: new Date(),
      stripeTransferId,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.RELEASED },
  });

  await prisma.caregiverProfile.update({
    where: { id: booking.caregiverId },
    data: {
      completedJobs: { increment: 1 },
      verifiedHours: { increment: Math.round(booking.hours) },
    },
  });

  await prisma.workHistory.create({
    data: {
      caregiverId: booking.caregiverId,
      employer: "CareProof family booking",
      title: `${booking.specialty.name} — completed booking`,
      startDate: booking.startAt,
      endDate: booking.endAt,
      duties: `Platform-verified ${booking.specialty.name.toLowerCase()} completed through CareProof escrow.`,
      verification: WORK_VERIFICATION.PLATFORM_COMPLETED,
      hours: Math.round(booking.hours),
    },
  });

  return payment;
}

export async function refundPayment(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking?.payment) throw new Error("No payment to refund");

  const stripe = getStripe();
  if (stripe && booking.payment.stripePaymentIntentId) {
    await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentIntentId,
    });
  }

  await prisma.payment.update({
    where: { id: booking.payment.id },
    data: { status: PAYMENT_STATUS.REFUNDED },
  });
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.REFUNDED },
  });
}

const AUTO_RELEASE_MS = AUTO_RELEASE_HOURS * 60 * 60 * 1000;

export function shouldAutoRelease(endAt: Date, now = new Date()) {
  return now.getTime() - endAt.getTime() >= AUTO_RELEASE_MS;
}

export function autoReleaseAt(endAt: Date) {
  return new Date(endAt.getTime() + AUTO_RELEASE_MS);
}

export function msUntilAutoRelease(endAt: Date, now = new Date()) {
  return autoReleaseAt(endAt).getTime() - now.getTime();
}

export function isAutoReleasePaused(status: string) {
  return status === BOOKING_STATUS.DISPUTED;
}

export function showsAutoReleaseNotice(status: string) {
  return (
    status === BOOKING_STATUS.ESCROW_HELD ||
    status === BOOKING_STATUS.IN_PROGRESS ||
    status === BOOKING_STATUS.PENDING_RELEASE
  );
}

export function autoReleasePausedLabel() {
  return "Auto-release is paused while this sit is in dispute. Funds stay in escrow until you release them to the carer or refund the family.";
}

export function disputePauseBanner(items: { carerName: string }[]) {
  if (!items.length) return null;
  if (items.length === 1) {
    return `Auto-release is paused on the sit with ${items[0].carerName} while it is in dispute.`;
  }
  return `Auto-release is paused on ${items.length} disputed sits.`;
}

export function canAutoRelease(
  booking: { status: string; endAt: Date; payment?: { status: string } | null },
  now = new Date(),
) {
  if (isAutoReleasePaused(booking.status)) return false;
  if (booking.payment?.status !== PAYMENT_STATUS.HELD) return false;
  if (!showsAutoReleaseNotice(booking.status)) return false;
  return shouldAutoRelease(booking.endAt, now);
}

export function autoReleaseLabel(endAt: Date, now = new Date()) {
  const due = autoReleaseAt(endAt);
  const when = formatDateTime(due);
  if (now.getTime() < endAt.getTime()) {
    return `If nobody confirms or disputes, funds auto-release 72 hours after the sit ends — ${when}.`;
  }
  if (shouldAutoRelease(endAt, now)) {
    return "This sit is due to auto-release now.";
  }
  const hours = msUntilAutoRelease(endAt, now) / (60 * 60 * 1000);
  const remaining =
    hours >= 48
      ? `${Math.round(hours / 24)} ${Math.round(hours / 24) === 1 ? "day" : "days"}`
      : hours < 1.5
        ? "about 1 hour"
        : `${Math.round(hours)} hours`;
  return `If nobody confirms or disputes, funds auto-release in ${remaining} (${when}).`;
}

export async function autoReleaseIfDue(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });
  if (!booking) return null;
  if (!canAutoRelease(booking)) return null;
  return releasePayment(booking.id);
}
