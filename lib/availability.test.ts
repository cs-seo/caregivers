import assert from "node:assert/strict";
import { test } from "node:test";
import {
  WEEKLY_HOUR_PRESETS,
  clampNoticeHours,
  defaultNoticeHours,
  defaultWeeklyHours,
  fortnightLabel,
  instantBookForStart,
  instantBookNoticeOk,
  isAwayToday,
  isInstantBookLive,
  noticeLabel,
  startIsInFuture,
  summariseFortnight,
  weeklyHourChips,
} from "./availability";

test("weekly hour presets include the babysitting evening pattern", () => {
  assert.ok(WEEKLY_HOUR_PRESETS.includes("Thu–Sun 5pm–midnight"));
});

test("defaultWeeklyHours prefers babysitting evenings", () => {
  assert.equal(defaultWeeklyHours(["babysitters", "nannies"]), "Thu–Sun 5pm–midnight");
});

test("weeklyHourChips splits usual hours on a middle dot", () => {
  assert.deepEqual(weeklyHourChips("Mon–Fri 3pm–7pm · Sat mornings"), ["Mon–Fri 3pm–7pm", "Sat mornings"]);
});

test("summariseFortnight counts free, booked, away and closed days", () => {
  const summary = summariseFortnight([
    { key: "2026-09-12", booked: true, blocked: false },
    { key: "2026-09-13", booked: false, blocked: true },
    { key: "2026-09-14", booked: false, blocked: true },
    { key: "2026-09-15", booked: false, blocked: false },
    { key: "2026-09-16", booked: false, blocked: false, closed: true },
  ]);
  assert.equal(summary.free, 1);
  assert.equal(summary.booked, 1);
  assert.equal(summary.away, 2);
  assert.equal(summary.closed, 1);
  assert.equal(summary.nextFree, "2026-09-15");
  assert.equal(fortnightLabel(summary), "1 free · 1 booked · 2 away · 1 closed");
});

test("isInstantBookLive pauses Instant Book while today is a day off", () => {
  const now = new Date("2026-09-07T02:00:00.000Z");
  assert.equal(isAwayToday(["2026-09-07"], now), true);
  assert.equal(isInstantBookLive(true, ["2026-09-07"], now), false);
  assert.equal(isInstantBookLive(true, ["2026-09-13"], now), true);
  assert.equal(isInstantBookLive(false, [], now), false);
});

test("defaultNoticeHours is shorter for babysitting than aged care", () => {
  assert.equal(defaultNoticeHours(["babysitters"]), 2);
  assert.equal(defaultNoticeHours(["aged-care", "nursing"]), 12);
  assert.equal(defaultNoticeHours(["disability-support"]), 24);
  assert.equal(clampNoticeHours(4), 4);
  assert.equal(clampNoticeHours(80), null);
  assert.equal(noticeLabel(12), "12 hours’ notice for Instant Book");
  assert.equal(noticeLabel(24), "24 hours’ notice for Instant Book");
});

test("Instant Book falls back when the start is inside the notice window", () => {
  const now = new Date("2026-09-07T10:00:00.000Z");
  const inTwoHours = new Date("2026-09-07T12:00:00.000Z");
  const inTwoDays = new Date("2026-09-09T10:00:00.000Z");
  assert.equal(startIsInFuture(inTwoHours, now), true);
  assert.equal(startIsInFuture(new Date("2026-09-07T09:00:00.000Z"), now), false);
  assert.equal(instantBookNoticeOk(12, inTwoHours, now), false);
  assert.equal(instantBookNoticeOk(12, inTwoDays, now), true);
  assert.equal(instantBookForStart(true, [], inTwoHours, 12, now), false);
  assert.equal(instantBookForStart(true, [], inTwoDays, 12, now), true);
  assert.equal(instantBookForStart(true, ["2026-09-07"], inTwoDays, 12, now), false);
});
