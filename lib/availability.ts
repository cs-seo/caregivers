import { sydneyDateKey } from "./format";
import { WEEKLY_WINDOW_PRESETS } from "./weekly-windows";

export const WEEKLY_HOUR_PRESETS = WEEKLY_WINDOW_PRESETS.map((preset) => preset.label);

export function defaultWeeklyHours(specialties: string[]) {
  if (specialties.includes("babysitters")) return "Thu–Sun 5pm–midnight";
  if (specialties.includes("after-school-care")) return "Mon–Fri 3pm–7pm";
  if (specialties.includes("nannies")) return "Mon–Fri 8am–6pm";
  if (specialties.includes("nursing") || specialties.includes("aged-care")) return "Mon–Fri 7am–1pm";
  if (specialties.includes("disability-support") || specialties.includes("special-needs")) {
    return "Wed–Sun 9am–5pm";
  }
  if (specialties.includes("respite")) return "Fri–Mon 9am–5pm";
  return "Mon–Fri 9am–5pm";
}

export function summariseFortnight(
  days: { key: string; booked: boolean; blocked: boolean; closed?: boolean }[],
) {
  const free = days.filter((day) => !day.booked && !day.blocked && !day.closed);
  const booked = days.filter((day) => day.booked);
  const away = days.filter((day) => day.blocked && !day.booked);
  const closed = days.filter((day) => day.closed && !day.booked && !day.blocked);
  return {
    free: free.length,
    booked: booked.length,
    away: away.length,
    closed: closed.length,
    nextFree: free[0]?.key ?? null,
  };
}

export function fortnightLabel(summary: ReturnType<typeof summariseFortnight>) {
  const parts = [`${summary.free} free`];
  if (summary.booked) parts.push(`${summary.booked} booked`);
  if (summary.away) parts.push(`${summary.away} away`);
  if (summary.closed) parts.push(`${summary.closed} closed`);
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
