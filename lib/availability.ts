import { sydneyDateKey } from "./format";

export const WEEKLY_HOUR_PRESETS = [
  "Thu–Sun 5pm–midnight",
  "Mon–Fri 3pm–7pm",
  "Mon–Fri 8am–6pm",
  "Mon–Fri 7am–1pm",
  "Wed–Sun 9am–5pm",
  "Fri–Mon, overnight by arrangement",
] as const;

export function defaultWeeklyHours(specialties: string[]) {
  if (specialties.includes("babysitters")) return "Thu–Sun 5pm–midnight";
  if (specialties.includes("after-school-care")) return "Mon–Fri 3pm–7pm";
  if (specialties.includes("nannies")) return "Mon–Fri 8am–6pm";
  if (specialties.includes("nursing") || specialties.includes("aged-care")) return "Mon–Fri 7am–1pm";
  if (specialties.includes("disability-support") || specialties.includes("special-needs")) {
    return "Wed–Sun 9am–5pm";
  }
  if (specialties.includes("respite")) return "Fri–Mon, overnight by arrangement";
  return "Mon–Fri 9am–5pm";
}

export function summariseFortnight(days: { key: string; booked: boolean; blocked: boolean }[]) {
  const free = days.filter((day) => !day.booked && !day.blocked);
  const booked = days.filter((day) => day.booked);
  const away = days.filter((day) => day.blocked && !day.booked);
  return {
    free: free.length,
    booked: booked.length,
    away: away.length,
    nextFree: free[0]?.key ?? null,
  };
}

export function fortnightLabel(summary: ReturnType<typeof summariseFortnight>) {
  const parts = [`${summary.free} free`];
  if (summary.booked) parts.push(`${summary.booked} booked`);
  if (summary.away) parts.push(`${summary.away} away`);
  return parts.join(" · ");
}

export function isAwayToday(blockedKeys: Iterable<string>, now = new Date()) {
  const today = sydneyDateKey(now);
  const set = blockedKeys instanceof Set ? blockedKeys : new Set(blockedKeys);
  return set.has(today);
}

export function isInstantBookLive(instantBook: boolean, blockedKeys: Iterable<string>, now = new Date()) {
  return instantBook && !isAwayToday(blockedKeys, now);
}

export function weeklyHourChips(weeklyHours?: string | null) {
  if (!weeklyHours) return [];
  return weeklyHours
    .split(/[·|]|\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}
