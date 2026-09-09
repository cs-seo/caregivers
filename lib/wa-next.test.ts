import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareNextLinks, agedCareNextNotice } from "./aged-care-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { ntNextLinks, ntNextNotice } from "./nt-next";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { waNextLinks, waNextNotice, waNextShows } from "./wa-next";

test("waNextNotice names unused Mandurah hubs without a count or Instant Book", () => {
  assert.match(waNextNotice(), /Western Australia/);
  assert.match(waNextNotice(), /Mandurah/);
  assert.match(waNextNotice(), /nannies/);
  assert.doesNotMatch(waNextNotice(), /\d+ open/);
  assert.doesNotMatch(waNextNotice(), /Instant Book/);
  assert.doesNotMatch(waNextNotice(), /Hire/);
  assert.doesNotMatch(waNextNotice(), /job=/);
  assert.doesNotMatch(waNextNotice(), /Perth/);
  assert.doesNotMatch(waNextNotice(), /Sunshine Coast/);
  assert.doesNotMatch(waNextNotice(), /Cairns/);
  assert.doesNotMatch(waNextNotice(), /aged care/);
  assert.doesNotMatch(waNextNotice(), /after-school/);
  assert.doesNotMatch(waNextNotice(), /housekeep/);
  assert.doesNotMatch(waNextNotice(), /Wollongong/);
  assert.notEqual(waNextNotice(), perthNextNotice());
  assert.notEqual(waNextNotice(), vicNextNotice());
  assert.notEqual(waNextNotice(), qldNextNotice());
  assert.notEqual(waNextNotice(), saNextNotice());
  assert.notEqual(waNextNotice(), ntNextNotice());
  assert.notEqual(waNextNotice(), agedCareNextNotice());
  assert.notEqual(waNextNotice(), locationNextNotice());
  assert.notEqual(waNextNotice(), locationBoardNotice("Western Australia"));
  assert.notEqual(waNextNotice(), familyStartNotice());
});

test("waNextShows is a signed-in family on Western Australia only", () => {
  assert.equal(waNextShows({ isFamily: true, stateSlug: "wa" }), true);
  assert.equal(waNextShows({ isFamily: true, stateSlug: "vic" }), false);
  assert.equal(waNextShows({ isFamily: true, stateSlug: "nt" }), false);
  assert.equal(waNextShows({ isFamily: false, stateSlug: "wa" }), false);
});

test("waNextLinks go to Mandurah and WA nannies, not Perth or Sunshine Coast", () => {
  assert.deepEqual(waNextLinks(), [
    { href: "/locations/wa/mandurah", label: "Open Mandurah suburbs" },
    { href: "/caregivers/nannies/wa", label: "Browse nannies in Western Australia" },
  ]);
  assert.notDeepEqual(waNextLinks(), perthNextLinks());
  assert.notDeepEqual(waNextLinks(), vicNextLinks());
  assert.notDeepEqual(waNextLinks(), qldNextLinks());
  assert.notDeepEqual(waNextLinks(), saNextLinks());
  assert.notDeepEqual(waNextLinks(), ntNextLinks());
  assert.notDeepEqual(waNextLinks(), agedCareNextLinks());
  assert.notDeepEqual(waNextLinks(), locationNextLinks());
  assert.notDeepEqual(waNextLinks(), familyStartLinks());
  assert.notDeepEqual(waNextLinks(), [locationBoardLink({ state: "wa", stateName: "Western Australia" })]);
  assert.ok(!waNextLinks().some((link) => link.href === "/locations/wa/perth"));
  assert.ok(!waNextLinks().some((link) => link.href === "/caregivers/after-school-care/wa/perth"));
  assert.ok(!waNextLinks().some((link) => link.href === "/caregivers/housekeeping/wa/perth"));
  assert.ok(!waNextLinks().some((link) => link.href === "/caregivers/aged-care/wa"));
  assert.ok(!waNextLinks().some((link) => link.href === "/caregivers/disability-support/wa"));
  assert.ok(!waNextLinks().some((link) => link.href === "/caregivers/aged-care/qld/sunshine-coast"));
  assert.ok(!waNextLinks().some((link) => link.href === "/locations/qld/cairns"));
  assert.ok(!waNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!waNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!waNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
