import { addBlockedDateAction, removeBlockedDateAction } from "@/lib/actions";
import { sydneyDateKey } from "@/lib/format";
import {
  WEEKDAY_LABELS,
  addMonths,
  isPastDateKey,
  monthGrid,
  monthLabel,
  sydneyYearMonth,
} from "@/lib/month-calendar";

type DayState = { key: string; booked: boolean; blocked: boolean };

export function DaysOffCalendar({ days, now = new Date() }: { days: DayState[]; now?: Date }) {
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
              const muted = !cell.inMonth || past;
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
                          : `${cell.key} · open · mark away`
                    }
                    className={`w-full rounded-lg px-1 py-2 text-xs ${
                      blocked
                        ? "bg-stone-100 font-medium text-stone-700"
                        : booked
                          ? "bg-orange-50 font-medium text-clay"
                          : "bg-sage text-teal-deep hover:bg-sage/80"
                    } ${today ? "ring-1 ring-teal" : ""}`}
                  >
                    <span className="block">{cell.day}</span>
                    <span className="mt-0.5 block text-[10px] leading-tight">
                      {blocked ? "Away" : booked ? "Booked" : "Open"}
                    </span>
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
