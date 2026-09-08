import assert from "node:assert/strict";
import { test } from "node:test";
import { forCarersNextLinks, forCarersNextNotice } from "./for-carers-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { ntNextLinks, ntNextNotice } from "./nt-next";
import { profileCheckNextLinks, profileCheckNextNotice } from "./profile-check";
import { perthNextLinks, perthNextNotice, perthNextShows } from "./perth-next";

test("perthNextNotice names unused Perth specialties without a count or Instant Book", () => {
  assert.match(perthNextNotice(), /Perth/);
  assert.match(perthNextNotice(), /after-school/);
  assert.match(perthNextNotice(), /housekeepers/);
  assert.doesNotMatch(perthNextNotice(), /\d+ open/);
  assert.doesNotMatch(perthNextNotice(), /Instant Book/);
  assert.doesNotMatch(perthNextNotice(), /Hire/);
  assert.doesNotMatch(perthNextNotice(), /job=/);
  assert.doesNotMatch(perthNextNotice(), /Darwin/);
  assert.doesNotMatch(perthNextNotice(), /Northern Territory/);
  assert.doesNotMatch(perthNextNotice(), /aged care/);
  assert.doesNotMatch(perthNextNotice(), /nannies/);
  assert.doesNotMatch(perthNextNotice(), /companion/);
  assert.notEqual(perthNextNotice(), ntNextNotice());
  assert.notEqual(perthNextNotice(), locationNextNotice());
  assert.notEqual(perthNextNotice(), forCarersNextNotice());
  assert.notEqual(perthNextNotice(), profileCheckNextNotice());
  assert.notEqual(perthNextNotice(), locationBoardNotice("Perth"));
});

test("perthNextShows is a signed-in family on Perth only", () => {
  assert.equal(perthNextShows({ isFamily: true, stateSlug: "wa", citySlug: "perth" }), true);
  assert.equal(perthNextShows({ isFamily: true, stateSlug: "nt", citySlug: "darwin" }), false);
  assert.equal(perthNextShows({ isFamily: true, stateSlug: "wa", citySlug: "fremantle" }), false);
  assert.equal(perthNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "sydney" }), false);
  assert.equal(perthNextShows({ isFamily: false, stateSlug: "wa", citySlug: "perth" }), false);
});

test("perthNextLinks go to Perth after-school and housekeeping, not Darwin or national lists", () => {
  assert.deepEqual(perthNextLinks(), [
    { href: "/caregivers/after-school-care/wa/perth", label: "Browse after-school carers in Perth" },
    { href: "/caregivers/housekeeping/wa/perth", label: "Browse housekeepers in Perth" },
  ]);
  assert.notDeepEqual(perthNextLinks(), ntNextLinks());
  assert.notDeepEqual(perthNextLinks(), locationNextLinks());
  assert.notDeepEqual(perthNextLinks(), forCarersNextLinks());
  assert.notDeepEqual(perthNextLinks(), profileCheckNextLinks());
  assert.notDeepEqual(perthNextLinks(), [locationBoardLink({ city: "perth", cityName: "Perth" })]);
  assert.ok(!perthNextLinks().some((link) => link.href === "/locations/nt/darwin"));
  assert.ok(!perthNextLinks().some((link) => link.href === "/caregivers/aged-care/nt"));
  assert.ok(!perthNextLinks().some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(!perthNextLinks().some((link) => link.href === "/caregivers/housekeeping"));
  assert.ok(!perthNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!perthNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!perthNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
