import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarNextLinks, calendarNextNotice } from "./calendar-next";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { householdSavedLinks, householdSavedNotice } from "./household-saved";
import { statementNextLinks, statementNextNotice } from "./statement-next";

test("comingUpNextNotice names household and calendar without a count or save CTA", () => {
  assert.match(comingUpNextNotice(), /household defaults/);
  assert.match(comingUpNextNotice(), /Calendar/);
  assert.doesNotMatch(comingUpNextNotice(), /\d+ open/);
  assert.doesNotMatch(comingUpNextNotice(), /Use household/);
  assert.doesNotMatch(comingUpNextNotice(), /Save handover/);
  assert.doesNotMatch(comingUpNextNotice(), /secret link/);
  assert.doesNotMatch(comingUpNextNotice(), /job=/);
  assert.notEqual(comingUpNextNotice(), calendarNextNotice());
  assert.notEqual(comingUpNextNotice(), householdSavedNotice());
  assert.notEqual(comingUpNextNotice(), statementNextNotice(true));
});

test("comingUpNextLinks go to household and calendar subscribe, not coming-up", () => {
  assert.deepEqual(comingUpNextLinks(), [
    { href: "/dashboard/household", label: "Open household defaults" },
    { href: "/dashboard/calendar", label: "Subscribe your calendar" },
  ]);
  assert.notDeepEqual(comingUpNextLinks(), calendarNextLinks());
  assert.notDeepEqual(comingUpNextLinks(), householdSavedLinks());
  assert.notDeepEqual(comingUpNextLinks(), statementNextLinks({ isFamily: true, bookingId: "sit-1" }));
  assert.ok(!comingUpNextLinks().some((link) => link.href === "/dashboard#coming-up"));
  assert.ok(!comingUpNextLinks().some((link) => link.href === "/guides"));
  assert.ok(!comingUpNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!comingUpNextLinks().some((link) => link.href.includes("job=")));
});
