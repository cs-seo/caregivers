import assert from "node:assert/strict";
import { test } from "node:test";
import { WEEKLY_HOUR_PRESETS, defaultWeeklyHours, fortnightLabel, summariseFortnight, weeklyHourChips } from "./availability";

test("weekly hour presets include the babysitting evening pattern", () => {
  assert.ok(WEEKLY_HOUR_PRESETS.includes("Thu–Sun 5pm–midnight"));
});

test("defaultWeeklyHours prefers babysitting evenings", () => {
  assert.equal(defaultWeeklyHours(["babysitters", "nannies"]), "Thu–Sun 5pm–midnight");
});

test("weeklyHourChips splits usual hours on a middle dot", () => {
  assert.deepEqual(weeklyHourChips("Mon–Fri 3pm–7pm · Sat mornings"), ["Mon–Fri 3pm–7pm", "Sat mornings"]);
});

test("summariseFortnight counts free, booked and away days", () => {
  const summary = summariseFortnight([
    { key: "2026-09-12", booked: true, blocked: false },
    { key: "2026-09-13", booked: false, blocked: true },
    { key: "2026-09-14", booked: false, blocked: true },
    { key: "2026-09-15", booked: false, blocked: false },
  ]);
  assert.equal(summary.free, 1);
  assert.equal(summary.booked, 1);
  assert.equal(summary.away, 2);
  assert.equal(summary.nextFree, "2026-09-15");
  assert.equal(fortnightLabel(summary), "1 free · 1 booked · 2 away");
});
