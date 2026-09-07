"use client";

import { WEEKLY_HOUR_PRESETS } from "@/lib/availability";

export function WeeklyHoursField({ defaultValue }: { defaultValue: string }) {
  return (
    <label className="block text-sm">
      Usual weekly hours
      <input
        name="weeklyHours"
        maxLength={120}
        defaultValue={defaultValue}
        placeholder="Thu–Sun 5pm–midnight"
        className="mt-1 w-full rounded-lg border border-line px-3 py-2"
      />
      <span className="mt-2 flex flex-wrap gap-2">
        {WEEKLY_HOUR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="rounded-full bg-sage px-3 py-1 text-xs text-teal-deep"
            onClick={(event) => {
              const form = event.currentTarget.form;
              const input = form?.elements.namedItem("weeklyHours");
              if (input instanceof HTMLInputElement) input.value = preset;
            }}
          >
            {preset}
          </button>
        ))}
      </span>
    </label>
  );
}
