import assert from "node:assert/strict";
import { test } from "node:test";
import { boardNextLinks, boardNextNotice } from "./board-next";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { forCarersHomeCta, forCarersHomeNotice } from "./for-carers";
import { profileCheckNextLinks, profileCheckNextNotice } from "./profile-check";
import { forCarersNextLinks, forCarersNextNotice, forCarersNextShows } from "./for-carers-next";

test("forCarersNextNotice names unused specialties without a count or Instant Book", () => {
  assert.match(forCarersNextNotice(), /written for carers/);
  assert.match(forCarersNextNotice(), /housekeeping/);
  assert.match(forCarersNextNotice(), /special needs/);
  assert.doesNotMatch(forCarersNextNotice(), /\d+ open/);
  assert.doesNotMatch(forCarersNextNotice(), /Instant Book/);
  assert.doesNotMatch(forCarersNextNotice(), /Hire/);
  assert.doesNotMatch(forCarersNextNotice(), /job=/);
  assert.doesNotMatch(forCarersNextNotice(), /after-school/);
  assert.doesNotMatch(forCarersNextNotice(), /Create a carer profile/);
  assert.notEqual(forCarersNextNotice(), forCarersHomeNotice());
  assert.notEqual(forCarersNextNotice(), familyStartNotice());
  assert.notEqual(forCarersNextNotice(), caregiversNextNotice());
  assert.notEqual(forCarersNextNotice(), profileCheckNextNotice());
  assert.notEqual(forCarersNextNotice(), boardNextNotice());
});

test("forCarersNextShows is only a signed-in family", () => {
  assert.equal(forCarersNextShows({ isFamily: true }), true);
  assert.equal(forCarersNextShows({ isFamily: false }), false);
});

test("forCarersNextLinks go to housekeeping and special needs, not register", () => {
  assert.deepEqual(forCarersNextLinks(), [
    { href: "/caregivers/housekeeping", label: "Open housekeeping carers" },
    { href: "/caregivers/special-needs", label: "Open special needs carers" },
  ]);
  assert.notDeepEqual(forCarersNextLinks(), familyStartLinks());
  assert.notDeepEqual(forCarersNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(forCarersNextLinks(), profileCheckNextLinks());
  assert.notDeepEqual(forCarersNextLinks(), boardNextLinks());
  assert.ok(!forCarersNextLinks().some((link) => link.href === "/register?role=carer"));
  assert.ok(!forCarersNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!forCarersNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!forCarersNextLinks().some((link) => link.label === forCarersHomeCta()));
  assert.ok(!forCarersNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Create a/i.test(link.label)));
});
