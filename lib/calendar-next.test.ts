import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { householdSavedLinks, householdSavedNotice } from "./household-saved";
import { calendarNextLinks, calendarNextNotice } from "./calendar-next";

test("calendarNextNotice names the feed without a count or rotate CTA", () => {
  assert.match(calendarNextNotice(), /private feed/);
  assert.match(calendarNextNotice(), /Handover notes stay off/);
  assert.doesNotMatch(calendarNextNotice(), /\d+ open/);
  assert.doesNotMatch(calendarNextNotice(), /secret link/);
  assert.doesNotMatch(calendarNextNotice(), /job=/);
  assert.notEqual(calendarNextNotice(), householdSavedNotice());
  assert.notEqual(calendarNextNotice(), familyStartNotice());
});

test("calendarNextLinks go to Coming up handover and hiring guides", () => {
  assert.deepEqual(calendarNextLinks(), [
    { href: "/dashboard#coming-up", label: "See sits that still need handover" },
    { href: "/guides", label: "Read hiring guides" },
  ]);
  assert.notDeepEqual(calendarNextLinks(), householdSavedLinks());
  assert.notDeepEqual(calendarNextLinks(), familyStartLinks());
  assert.ok(!calendarNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!calendarNextLinks().some((link) => link.href === "/caregivers"));
});
