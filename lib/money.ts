import { PLATFORM_FEE_BPS } from "./constants";

export function formatAud(cents: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);
}

export function quoteBooking(hourlyRateCents: number, hours: number) {
  const subtotalCents = Math.round(hourlyRateCents * hours);
  const platformFeeCents = Math.round((subtotalCents * PLATFORM_FEE_BPS) / 10_000);
  const gstCents = Math.round(subtotalCents / 11);
  const totalCents = subtotalCents + platformFeeCents;
  const caregiverPayoutCents = subtotalCents;
  return {
    rateCents: hourlyRateCents,
    hours,
    subtotalCents,
    platformFeeCents,
    gstCents,
    totalCents,
    caregiverPayoutCents,
  };
}

export function formatHours(hours: number) {
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}

export function quoteDaySit(hourlyRateCents: number) {
  return quoteBooking(hourlyRateCents, 8);
}

export function quoteOvernightSit(hourlyRateCents: number) {
  return quoteBooking(hourlyRateCents, 10);
}

export function quoteWeeklySeries(hourlyRateCents: number, hours: number, weeks: number) {
  const week = quoteBooking(hourlyRateCents, hours);
  const safeWeeks = Math.min(12, Math.max(1, Math.round(weeks)));
  return {
    ...week,
    weeks: safeWeeks,
    seriesSubtotalCents: week.subtotalCents * safeWeeks,
    seriesFeeCents: week.platformFeeCents * safeWeeks,
    seriesTotalCents: week.totalCents * safeWeeks,
  };
}
