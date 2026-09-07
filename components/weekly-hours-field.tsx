"use client";

import { useMemo, useState } from "react";
import {
  WEEKDAY_NAMES,
  WEEKLY_WINDOW_PRESETS,
  formatWeeklyHours,
  parseClockToMinutes,
  slotsFromWindows,
  windowToken,
  type WeeklyWindow,
} from "@/lib/weekly-windows";

function slotsToWindows(slots: { start: string; end: string }[][]) {
  const rows: WeeklyWindow[] = [];
  slots.forEach((daySlots, weekday) => {
    for (const slot of daySlots) {
      if (!slot.start || !slot.end) continue;
      const startMin = parseClockToMinutes(slot.start);
      const endMin = parseClockToMinutes(slot.end, true);
      if (startMin == null || endMin == null) continue;
      rows.push({ weekday, startMin, endMin });
    }
  });
  return rows;
}

export function WeeklyHoursField({ windows = [] }: { windows?: WeeklyWindow[] }) {
  const [slots, setSlots] = useState(() => slotsFromWindows(windows));
  const parsed = useMemo(() => slotsToWindows(slots), [slots]);
  const summary = formatWeeklyHours(parsed);

  function setDay(weekday: number, next: { start: string; end: string }[]) {
    setSlots((current) => current.map((day, index) => (index === weekday ? next : day)));
  }

  return (
    <fieldset className="text-sm">
      <legend className="mb-1 font-medium">Usual weekly hours</legend>
      <p className="mb-3 text-xs text-stone-500">
        Families can book a start time inside these windows. Days you leave blank show as closed. For overnight sits,
        set an end earlier than the start — 7:00pm to 7:00am counts as ending the next morning.
      </p>
      {parsed.map((window) => (
        <input key={windowToken(window)} type="hidden" name="weeklyWindow" value={windowToken(window)} />
      ))}
      <div className="space-y-2">
        {WEEKDAY_NAMES.map((label, weekday) => (
          <div key={label} className="rounded-xl border border-line p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-ink">{label}</span>
              <button
                type="button"
                className="text-xs font-medium text-teal"
                onClick={() => {
                  if (slots[weekday].length >= 2) return;
                  setDay(weekday, [...slots[weekday], { start: "09:00", end: "17:00" }]);
                }}
              >
                {slots[weekday].length ? "Add window" : "Open"}
              </button>
            </div>
            {slots[weekday].length === 0 ? (
              <p className="mt-1 text-xs text-stone-500">Closed</p>
            ) : (
              <div className="mt-2 space-y-2">
                {slots[weekday].map((slot, index) => {
                  const startMin = parseClockToMinutes(slot.start);
                  const endMin = parseClockToMinutes(slot.end, true);
                  const nextDay = startMin != null && endMin != null && endMin <= startMin;
                  return (
                    <div key={`${label}-${index}`} className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(event) => {
                          setDay(
                            weekday,
                            slots[weekday].map((row, rowIndex) =>
                              rowIndex === index ? { ...row, start: event.target.value } : row,
                            ),
                          );
                        }}
                        className="rounded-lg border border-line px-2 py-1"
                      />
                      <span className="text-stone-400">–</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(event) => {
                          setDay(
                            weekday,
                            slots[weekday].map((row, rowIndex) =>
                              rowIndex === index ? { ...row, end: event.target.value } : row,
                            ),
                          );
                        }}
                        className="rounded-lg border border-line px-2 py-1"
                      />
                      {nextDay ? <span className="text-xs text-teal-deep">next day</span> : null}
                      <button
                        type="button"
                        className="text-xs text-clay"
                        onClick={() => setDay(weekday, slots[weekday].filter((_, rowIndex) => rowIndex !== index))}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-teal-deep">
        {summary || "No usual hours set — every day stays open unless you mark it away."}
      </p>
      <span className="mt-2 flex flex-wrap gap-2">
        {WEEKLY_WINDOW_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="rounded-full bg-sage px-3 py-1 text-xs text-teal-deep"
            onClick={() => setSlots(slotsFromWindows([...preset.windows]))}
          >
            {preset.label}
          </button>
        ))}
      </span>
    </fieldset>
  );
}
