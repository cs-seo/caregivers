import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { newcastleNextLinks, newcastleNextNotice } from "./newcastle-next";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { shortlistNextLinks, shortlistNextNotice } from "./shortlist-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { shortlistPlacesLinks, shortlistPlacesNotice, shortlistPlacesShows } from "./shortlist-places";

test("shortlistPlacesNotice names unused Wollongong hubs without a count or Instant Book", () => {
  assert.match(shortlistPlacesNotice(), /saved roster/);
  assert.match(shortlistPlacesNotice(), /Wollongong/);
  assert.match(shortlistPlacesNotice(), /personal care/);
  assert.doesNotMatch(shortlistPlacesNotice(), /\d+ open/);
  assert.doesNotMatch(shortlistPlacesNotice(), /Instant Book/);
  assert.doesNotMatch(shortlistPlacesNotice(), /Hire/);
  assert.doesNotMatch(shortlistPlacesNotice(), /job=/);
  assert.doesNotMatch(shortlistPlacesNotice(), /Newcastle/);
  assert.doesNotMatch(shortlistPlacesNotice(), /aged care/);
  assert.doesNotMatch(shortlistPlacesNotice(), /nannies/);
  assert.doesNotMatch(shortlistPlacesNotice(), /Post a care request/);
  assert.doesNotMatch(shortlistPlacesNotice(), /Book someone/);
  assert.notEqual(shortlistPlacesNotice(), shortlistHireNotice());
  assert.notEqual(shortlistPlacesNotice(), shortlistNextNotice());
  assert.notEqual(shortlistPlacesNotice(), newcastleNextNotice());
  assert.notEqual(shortlistPlacesNotice(), vicNextNotice());
  assert.notEqual(shortlistPlacesNotice(), familyStartNotice());
});

test("shortlistPlacesShows is a roster with no job attached", () => {
  assert.equal(shortlistPlacesShows({ hasCarers: true, jobAttached: false }), true);
  assert.equal(shortlistPlacesShows({ hasCarers: true, jobAttached: true }), false);
  assert.equal(shortlistPlacesShows({ hasCarers: false, jobAttached: false }), false);
});

test("shortlistPlacesLinks go to Wollongong, not post-a-job or Newcastle", () => {
  assert.deepEqual(shortlistPlacesLinks(), [
    { href: "/locations/nsw/wollongong", label: "Open Wollongong suburbs" },
    { href: "/caregivers/personal-care/nsw/wollongong", label: "Browse personal care in Wollongong" },
  ]);
  assert.notDeepEqual(shortlistPlacesLinks(), shortlistHireLinks());
  assert.notDeepEqual(shortlistPlacesLinks(), shortlistNextLinks());
  assert.notDeepEqual(shortlistPlacesLinks(), newcastleNextLinks());
  assert.notDeepEqual(shortlistPlacesLinks(), vicNextLinks());
  assert.notDeepEqual(shortlistPlacesLinks(), familyStartLinks());
  assert.ok(!shortlistPlacesLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!shortlistPlacesLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!shortlistPlacesLinks().some((link) => link.href === "/caregivers/aged-care/nsw/newcastle"));
  assert.ok(!shortlistPlacesLinks().some((link) => link.href === "/caregivers/personal-care/vic"));
  assert.ok(!shortlistPlacesLinks().some((link) => link.href.includes("job=")));
  assert.ok(!shortlistPlacesLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
