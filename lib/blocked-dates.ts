import { sydneyDateKey } from "./format";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string) {
  if (!DATE_KEY.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day;
}

export function dateKeysInWindows(windows: { startAt: Date }[]) {
  return [...new Set(windows.map((window) => sydneyDateKey(window.startAt)))];
}

export function firstBlockedKey(keys: string[], blocked: Iterable<string>) {
  const set = blocked instanceof Set ? blocked : new Set(blocked);
  return keys.find((key) => set.has(key)) ?? null;
}
