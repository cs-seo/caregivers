import { BOOKING_STATUS } from "./constants";

export const COMING_UP_MS = 7 * 24 * 60 * 60 * 1000;

const CLOSED = new Set<string>([
  BOOKING_STATUS.CANCELLED,
  BOOKING_STATUS.REFUNDED,
  BOOKING_STATUS.RELEASED,
]);

export function isComingUp(
  booking: { startAt: Date; endAt: Date; status: string },
  now = new Date(),
  horizonMs = COMING_UP_MS,
) {
  if (CLOSED.has(booking.status)) return false;
  if (booking.endAt.getTime() <= now.getTime() && booking.status !== BOOKING_STATUS.IN_PROGRESS) {
    return false;
  }
  if (booking.status === BOOKING_STATUS.IN_PROGRESS) return true;
  if (booking.startAt.getTime() <= now.getTime() && booking.endAt.getTime() > now.getTime()) return true;
  return booking.startAt.getTime() > now.getTime() && booking.startAt.getTime() <= now.getTime() + horizonMs;
}

export function comingUpKind(
  booking: { startAt: Date; endAt: Date; status: string },
  now = new Date(),
): "now" | "soon" | "week" {
  if (booking.status === BOOKING_STATUS.IN_PROGRESS) return "now";
  if (booking.startAt.getTime() <= now.getTime() && booking.endAt.getTime() > now.getTime()) return "now";
  if (booking.startAt.getTime() <= now.getTime() + 48 * 60 * 60 * 1000) return "soon";
  return "week";
}

export function comingUpBookings<T extends { startAt: Date; endAt: Date; status: string }>(
  bookings: T[],
  now = new Date(),
  horizonMs = COMING_UP_MS,
) {
  return bookings
    .filter((booking) => isComingUp(booking, now, horizonMs))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}
