import { BUSY_BOOKING_STATUSES } from "./booking-overlap";
import { sydneyDateKey, sydneyDayBounds } from "./format";

export function buildRoster<T extends { startAt: Date; status: string }>(
  bookings: T[],
  days = 14,
  now = new Date(),
  blockedKeys: Iterable<string> = [],
) {
  const todayKey = sydneyDateKey(now);
  const start = sydneyDayBounds(todayKey)?.startAt ?? now;
  const busy = new Map<string, T>();
  const blocked = new Set(blockedKeys);
  for (const booking of bookings) {
    if (!(BUSY_BOOKING_STATUSES as readonly string[]).includes(booking.status)) continue;
    const key = sydneyDateKey(booking.startAt);
    if (!busy.has(key)) busy.set(key, booking);
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start.getTime() + index * 24 * 60 * 60 * 1000);
    const key = sydneyDateKey(date);
    const label = new Intl.DateTimeFormat("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Australia/Sydney",
    }).format(date);
    return { key, label, booking: busy.get(key) ?? null, blocked: blocked.has(key) };
  });
}
