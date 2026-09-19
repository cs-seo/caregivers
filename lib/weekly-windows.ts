import { sydneyDateKey } from "./format";

export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type WeeklyWindow = {
  weekday: number;
  startMin: number;
  endMin: number;
};

const DAY_INDEX: Record<string, number> = {
  mon: 0,
  monday: 0,
  tue: 1,
  tues: 1,
  tuesday: 1,
  wed: 2,
  wednesday: 2,
  thu: 3,
  thur: 3,
  thurs: 3,
  thursday: 3,
  fri: 4,
  friday: 4,
  sat: 5,
  saturday: 5,
  sun: 6,
  sunday: 6,
};

const DAY_TOKEN = "mon(?:day)?|tue(?:s(?:day)?)?|wed(?:nesday)?|thu(?:rs?(?:day)?)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?";
const SKIP_PART = /^(overnight by arrangement|school-holiday days|evenings if booked by 4pm|by arrangement)$/i;

export function expandDayRange(from: number, to: number) {
  const days: number[] = [];
  let day = from;
  for (let i = 0; i < 7; i += 1) {
    days.push(day);
    if (day === to) break;
    day = (day + 1) % 7;
  }
  return days;
}

export function weekdayFromDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

export function previousWeekday(weekday: number) {
  return (weekday + 6) % 7;
}

export function minutesToClock(minutes: number, asEnd = false) {
  const wrapped = minutes % 1440;
  if (asEnd && (minutes === 1440 || (minutes >= 1440 && wrapped === 0))) return "midnight";
  if (!asEnd && wrapped === 0 && minutes === 0) return "midnight";
  const hour = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "am" : "pm";
  return minute ? `${hour12}:${String(minute).padStart(2, "0")}${suffix}` : `${hour12}${suffix}`;
}

export function minutesToInput(minutes: number) {
  const wrapped = minutes % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

export function parseClockToMinutes(raw: string, asEnd = false) {
  const value = raw.trim().toLowerCase().replace(/\./g, ":");
  if (!value) return null;
  if (value === "midnight" || value === "mid-night") return asEnd ? 1440 : 0;
  if (value === "noon" || value === "midday") return 12 * 60;
  const twelve = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/.exec(value);
  if (twelve) {
    let hour = Number(twelve[1]);
    const minute = Number(twelve[2] ?? 0);
    if (hour < 1 || hour > 12 || minute > 59) return null;
    const suffix = twelve[3];
    if (suffix === "am") hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
    const total = hour * 60 + minute;
    return asEnd && total === 0 ? 1440 : total;
  }
  const twentyFour = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (twentyFour) {
    const hour = Number(twentyFour[1]);
    const minute = Number(twentyFour[2]);
    if (hour > 23 || minute > 59) return null;
    const total = hour * 60 + minute;
    return asEnd && total === 0 ? 1440 : total;
  }
  return null;
}

function clampWindow(window: WeeklyWindow): WeeklyWindow | null {
  if (window.weekday < 0 || window.weekday > 6) return null;
  if (!Number.isInteger(window.startMin) || !Number.isInteger(window.endMin)) return null;
  if (window.startMin < 0 || window.startMin > 1439) return null;
  let endMin = window.endMin;
  if (endMin <= window.startMin) endMin += 1440;
  if (endMin - window.startMin < 30 || endMin > window.startMin + 1440 || endMin > 2880) return null;
  return { weekday: window.weekday, startMin: window.startMin, endMin };
}

export function normalizeWindows(input: WeeklyWindow[]) {
  const valid = input.map(clampWindow).filter((row): row is WeeklyWindow => Boolean(row));
  valid.sort((a, b) => a.weekday - b.weekday || a.startMin - b.startMin || a.endMin - b.endMin);
  const merged: WeeklyWindow[] = [];
  for (const row of valid) {
    const last = merged[merged.length - 1];
    if (last && last.weekday === row.weekday && row.startMin <= last.endMin) {
      last.endMin = Math.max(last.endMin, row.endMin);
      continue;
    }
    merged.push({ ...row });
  }
  return merged.slice(0, 14);
}

function parseDayToken(raw: string) {
  return DAY_INDEX[raw.toLowerCase()] ?? null;
}

export function parseDayNames(text: string) {
  const days = new Set<number>();
  const range = new RegExp(`(${DAY_TOKEN})\\s*[–—-]\\s*(${DAY_TOKEN})`, "gi");
  let match: RegExpExecArray | null;
  const consumed: number[] = [];
  while ((match = range.exec(text))) {
    const from = parseDayToken(match[1]);
    const to = parseDayToken(match[2]);
    if (from == null || to == null) continue;
    for (const day of expandDayRange(from, to)) days.add(day);
    consumed.push(match.index, match.index + match[0].length);
  }
  const single = new RegExp(`(${DAY_TOKEN})`, "gi");
  while ((match = single.exec(text))) {
    const inside = consumed.some((start, index) => index % 2 === 0 && match!.index >= start && match!.index < consumed[index + 1]);
    if (inside) continue;
    const day = parseDayToken(match[1]);
    if (day != null) days.add(day);
  }
  return [...days].sort((a, b) => a - b);
}

function windowsForDays(days: number[], startMin: number, endMin: number) {
  return normalizeWindows(days.map((weekday) => ({ weekday, startMin, endMin })));
}

function parseTimeRange(text: string): { startMin: number; endMin: number } | null {
  const match = /(.+?)\s*[–—-]\s*(.+)/.exec(text.trim());
  if (!match) return null;
  const startMin = parseClockToMinutes(match[1], false);
  const endMin = parseClockToMinutes(match[2], true);
  if (startMin == null || endMin == null) return null;
  return { startMin, endMin: endMin <= startMin ? endMin + 1440 : endMin };
}

function firstTimeIndex(text: string) {
  const match = /\d|midnight|noon|midday/i.exec(text);
  return match ? match.index : -1;
}

function parseHoursPart(part: string): WeeklyWindow[] {
  const trimmed = part.trim().replace(/,$/, "").replace(/\s+/g, " ");
  if (!trimmed || SKIP_PART.test(trimmed)) return [];

  let overnight = false;
  let text = trimmed.replace(/,?\s*overnight by arrangement/i, "").trim();
  if (!text) return [];
  const leadingOvernight = /^(?:overnight(?:s)?)\s+(.*)$/i.exec(text);
  const trailingOvernight = /^(.*?)\s+overnight(?:s)?$/i.exec(text);
  if (leadingOvernight) {
    overnight = true;
    text = leadingOvernight[1].trim();
  } else if (trailingOvernight && firstTimeIndex(trailingOvernight[1]) < 0) {
    overnight = true;
    text = trailingOvernight[1].trim();
  }

  if (/weekend days/i.test(text)) {
    return windowsForDays([5, 6], 9 * 60, 17 * 60);
  }

  if (/mornings?$/i.test(text)) {
    const days = parseDayNames(text.replace(/mornings?$/i, ""));
    return windowsForDays(days.length ? days : [5], 8 * 60, 12 * 60);
  }

  if (/evenings?$/i.test(text) && firstTimeIndex(text) < 0) {
    const days = parseDayNames(text.replace(/evenings?$/i, ""));
    return windowsForDays(days.length ? days : [4, 5], 17 * 60, 21 * 60);
  }

  const timeAt = firstTimeIndex(text);
  const dayText = timeAt >= 0 ? text.slice(0, timeAt) : text;
  const timeText = timeAt >= 0 ? text.slice(timeAt) : "";
  const days = parseDayNames(dayText);
  if (!days.length) return [];

  if (overnight && !timeText) {
    return windowsForDays(days, 19 * 60, 7 * 60 + 1440);
  }

  const times = timeText ? parseTimeRange(timeText) : { startMin: 9 * 60, endMin: 17 * 60 };
  if (!times) return [];
  return windowsForDays(days, times.startMin, times.endMin);
}

export function parseWeeklyHours(text?: string | null) {
  if (!text) return [];
  return normalizeWindows(text.split(/[·|]|\n/).flatMap(parseHoursPart));
}

function formatDaySpan(days: number[]) {
  if (days.length === 1) return WEEKDAY_NAMES[days[0]];
  const consecutive = days.every((day, index) => index === 0 || day === (days[index - 1] + 1) % 7 || (days[index - 1] === 6 && day === 0));
  const wraps = days[0] !== 0 && days.includes(0);
  if (consecutive && days.length > 1) {
    if (wraps) return `${WEEKDAY_NAMES[days[0]]}–${WEEKDAY_NAMES[days[days.length - 1]]}`;
    return `${WEEKDAY_NAMES[days[0]]}–${WEEKDAY_NAMES[days[days.length - 1]]}`;
  }
  return days.map((day) => WEEKDAY_NAMES[day]).join(", ");
}

export function formatWeeklyHours(windows: WeeklyWindow[]) {
  const rows = normalizeWindows(windows);
  if (!rows.length) return "";
  const groups: { days: number[]; startMin: number; endMin: number }[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    const nextDay = last ? (last.days[last.days.length - 1] + 1) % 7 : null;
    if (last && last.startMin === row.startMin && last.endMin === row.endMin && nextDay === row.weekday) {
      last.days.push(row.weekday);
      continue;
    }
    groups.push({ days: [row.weekday], startMin: row.startMin, endMin: row.endMin });
  }
  return groups
    .map((group) => `${formatDaySpan(group.days)} ${minutesToClock(group.startMin)}–${minutesToClock(group.endMin, true)}`)
    .join(" · ")
    .slice(0, 120);
}

function rangeWindows(from: number, to: number, startMin: number, endMin: number) {
  return windowsForDays(expandDayRange(from, to), startMin, endMin);
}

export const WEEKLY_WINDOW_PRESETS = [
  { label: "Thu–Sun 5pm–midnight", windows: rangeWindows(3, 6, 17 * 60, 24 * 60) },
  { label: "Mon–Fri 3pm–7pm", windows: rangeWindows(0, 4, 15 * 60, 19 * 60) },
  { label: "Mon–Fri 8am–6pm", windows: rangeWindows(0, 4, 8 * 60, 18 * 60) },
  { label: "Mon–Fri 7am–1pm", windows: rangeWindows(0, 4, 7 * 60, 13 * 60) },
  { label: "Wed–Sun 9am–5pm", windows: rangeWindows(2, 6, 9 * 60, 17 * 60) },
  { label: "Fri–Mon 9am–5pm", windows: rangeWindows(4, 0, 9 * 60, 17 * 60) },
] as const;

export function windowsFromForm(values: string[]) {
  const parsed = values.map((value) => {
    const match = /^(\d):(\d{1,4}):(\d{1,4})$/.exec(value.trim());
    if (!match) return null;
    return { weekday: Number(match[1]), startMin: Number(match[2]), endMin: Number(match[3]) };
  });
  if (parsed.some((row) => row == null) && values.some(Boolean)) return { ok: false as const, windows: [] };
  return { ok: true as const, windows: normalizeWindows(parsed.filter((row): row is WeeklyWindow => Boolean(row))) };
}

export function windowToken(window: WeeklyWindow) {
  return `${window.weekday}:${window.startMin}:${window.endMin}`;
}

export function isWeekdayOpen(windows: WeeklyWindow[], weekday: number) {
  if (!windows.length) return true;
  if (windows.some((row) => row.weekday === weekday)) return true;
  return windows.some((row) => row.weekday === previousWeekday(weekday) && row.endMin > 1440);
}

export function isDateClosed(windows: WeeklyWindow[], dateKey: string) {
  if (!windows.length) return false;
  return !isWeekdayOpen(windows, weekdayFromDateKey(dateKey));
}

export function weeklyOpenWhere(dateKey: string) {
  const weekday = weekdayFromDateKey(dateKey);
  return {
    OR: [
      { weeklyWindows: { none: {} } },
      { weeklyWindows: { some: { weekday } } },
      { weeklyWindows: { some: { weekday: previousWeekday(weekday), endMin: { gt: 1440 } } } },
    ],
  };
}

export function parseTimeParam(value: string | undefined | null) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec((value ?? "").trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isOpenAtMinutes(windows: WeeklyWindow[], dateKey: string, startMin: number) {
  if (!windows.length) return true;
  const weekday = weekdayFromDateKey(dateKey);
  if (windows.some((row) => row.weekday === weekday && startMin >= row.startMin && startMin < row.endMin)) {
    return true;
  }
  const overnightMin = startMin + 1440;
  return windows.some(
    (row) => row.weekday === previousWeekday(weekday) && overnightMin >= row.startMin && overnightMin < row.endMin,
  );
}

export function weeklyOpenAtWhere(dateKey: string, startMin: number) {
  const weekday = weekdayFromDateKey(dateKey);
  const overnightMin = startMin + 1440;
  return {
    OR: [
      { weeklyWindows: { none: {} } },
      {
        weeklyWindows: {
          some: {
            weekday,
            startMin: { lte: startMin },
            endMin: { gt: startMin },
          },
        },
      },
      {
        weeklyWindows: {
          some: {
            weekday: previousWeekday(weekday),
            startMin: { lte: overnightMin },
            endMin: { gt: overnightMin },
          },
        },
      },
    ],
  };
}

export function sydneyMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return hour * 60 + minute;
}

export function sitStartsInUsualHours(windows: WeeklyWindow[], startAt: Date, endAt: Date) {
  if (!windows.length) return true;
  if (!(endAt.getTime() > startAt.getTime())) return false;
  return isOpenAtMinutes(windows, sydneyDateKey(startAt), sydneyMinutes(startAt));
}

export function firstSitOutsideHours(windows: WeeklyWindow[], sits: { startAt: Date; endAt: Date }[]) {
  return sits.find((sit) => !sitStartsInUsualHours(windows, sit.startAt, sit.endAt)) ?? null;
}

export function suggestedStartLocal(dateKey: string, windows: WeeklyWindow[]) {
  const weekday = weekdayFromDateKey(dateKey);
  const same = windows
    .filter((row) => row.weekday === weekday)
    .sort((a, b) => a.startMin - b.startMin)[0];
  if (same) return `${dateKey}T${minutesToInput(same.startMin)}`;
  const overnight = windows.find((row) => row.weekday === previousWeekday(weekday) && row.endMin > 1440);
  if (overnight) return `${dateKey}T00:00`;
  return `${dateKey}T17:00`;
}

export function slotsFromWindows(windows: WeeklyWindow[]) {
  const slots: { start: string; end: string }[][] = WEEKDAY_NAMES.map(() => []);
  for (const row of normalizeWindows(windows)) {
    slots[row.weekday].push({
      start: minutesToInput(row.startMin),
      end: minutesToInput(row.endMin),
    });
  }
  return slots;
}
