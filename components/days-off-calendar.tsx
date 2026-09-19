import Link from "next/link";
import { addBlockedDateAction, removeBlockedDateAction } from "@/lib/actions";
import { sydneyDateKey } from "@/lib/format";
import { bookHref, isJobSlug } from "@/lib/job-match";
import {
  WEEKDAY_LABELS,
  addMonths,
  isPastDateKey,
  monthGrid,
  monthLabel,
  sydneyYearMonth,
} from "@/lib/month-calendar";

type DayState = { key: string; booked: boolean; blocked: boolean; closed?: boolean };

export function DaysOffCalendar({
  days,
  now = new Date(),
  bookSlug,
  bookJob,
  bookAt,
}: {
  days: DayState[];
  now?: Date;
  bookSlug?: string;
  bookJob?: string;
  bookAt?: string;
}) {
  const todayKey = sydneyDateKey(now);
  const current = sydneyYearMonth(now);
  const months = [current, addMonths(current, 1)];
  const byKey = new Map(days.map((day) => [day.key, day]));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {months.map((month) => (
        <div key={`${month.year}-${month.month}`}>
          <h3 className="text-sm font-semibold text-ink">{monthLabel(month)}</h3>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-stone-500">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {monthGrid(month).map((cell) => {
              const info = byKey.get(cell.key);
              const past = isPastDateKey(cell.key, todayKey);
              const today = cell.key === todayKey;
              const blocked = info?.blocked ?? false;
              const booked = info?.booked ?? false;
              const closed = info?.closed ?? false;
              const muted = !cell.inMonth || past;
              const tone = blocked
                ? "bg-stone-100 font-medium text-stone-700"
                : booked
                  ? "bg-orange-50 font-medium text-clay"
                  : closed
                    ? "bg-stone-50 text-stone-500"
                    : "bg-sage text-teal-deep hover:bg-sage/80";
              const label = blocked ? "Away" : booked ? "Booked" : closed ? "Closed" : bookSlug ? "Free" : "Open";
              if (muted) {
                return (
                  <div
                    key={cell.key}
                    className={`rounded-lg px-1 py-2 text-center text-xs ${
                      cell.inMonth ? "text-stone-400" : "text-stone-300"
                    }`}
                  >
                    {cell.day}
                  </div>
                );
              }
              if (bookSlug) {
                if (blocked || booked || closed) {
                  return (
                    <div
                      key={cell.key}
                      className={`rounded-lg px-1 py-2 text-center text-xs ${tone} ${today ? "ring-1 ring-teal" : ""}`}
                    >
                      <span className="block">{cell.day}</span>
                      <span className="mt-0.5 block text-[10px] leading-tight">{label}</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={cell.key}
                    href={bookHref(bookSlug, {
                      start: cell.key,
                      at: bookAt && /^([01]\d|2[0-3]):([0-5]\d)$/.test(bookAt) ? bookAt : undefined,
                      job: bookJob && isJobSlug(bookJob) ? bookJob : undefined,
                    })}
                    title={`${cell.key} · free · book`}
                    className={`block rounded-lg px-1 py-2 text-center text-xs no-underline ${tone} ${today ? "ring-1 ring-teal" : ""}`}
                  >
                    <span className="block">{cell.day}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight">{label}</span>
                  </Link>
                );
              }
              return (
                <form
                  key={cell.key}
                  action={blocked ? removeBlockedDateAction : addBlockedDateAction}
                >
                  <input type="hidden" name="dateKey" value={cell.key} />
                  <button
                    type="submit"
                    title={
                      blocked
                        ? `${cell.key} · away · click to clear`
                        : booked
                          ? `${cell.key} · booked · mark away`
                          : closed
                            ? `${cell.key} · closed · mark away`
                            : `${cell.key} · open · mark away`
                    }
                    className={`w-full rounded-lg px-1 py-2 text-xs ${tone} ${today ? "ring-1 ring-teal" : ""}`}
                  >
                    <span className="block">{cell.day}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight">{label}</span>
                  </button>
                </form>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
