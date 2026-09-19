import { sydneyDateKey } from "./format";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type YearMonth = { year: number; month: number };

export type MonthCell = {
  key: string;
  day: number;
  inMonth: boolean;
};

export function sydneyYearMonth(now = new Date()): YearMonth {
  const key = sydneyDateKey(now);
  return { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) };
}

export function addMonths(value: YearMonth, delta: number): YearMonth {
  const date = new Date(Date.UTC(value.year, value.month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export function monthLabel(value: YearMonth) {
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(value.year, value.month - 1, 1)),
  );
}

export function monthGrid(value: YearMonth): MonthCell[] {
  const first = new Date(Date.UTC(value.year, value.month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(value.year, value.month, 0)).getUTCDate();
  const cells: MonthCell[] = [];

  for (let index = 0; index < lead; index += 1) {
    const date = new Date(Date.UTC(value.year, value.month - 1, 1 - (lead - index)));
    cells.push({
      key: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `${value.year}-${String(value.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
      inMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const [year, month, day] = cells[cells.length - 1].key.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + 1));
    cells.push({
      key: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: false,
    });
  }

  return cells;
}

export function isPastDateKey(dateKey: string, todayKey: string) {
  return dateKey < todayKey;
}
