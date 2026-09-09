import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { goldCoastNextLinks, goldCoastNextNotice, goldCoastNextShows } from "./gold-coast-next";

test("goldCoastNextNotice names unused Gold Coast specialties without a count or Instant Book", () => {
  assert.match(goldCoastNextNotice(), /Gold Coast/);
  assert.match(goldCoastNextNotice(), /nannies/);
  assert.match(goldCoastNextNotice(), /babysitters/);
  assert.doesNotMatch(goldCoastNextNotice(), /\d+ open/);
  assert.doesNotMatch(goldCoastNextNotice(), /Instant Book/);
  assert.doesNotMatch(goldCoastNextNotice(), /Hire/);
  assert.doesNotMatch(goldCoastNextNotice(), /job=/);
  assert.doesNotMatch(goldCoastNextNotice(), /Perth/);
  assert.doesNotMatch(goldCoastNextNotice(), /after-school/);
  assert.doesNotMatch(goldCoastNextNotice(), /housekeepers/);
  assert.doesNotMatch(goldCoastNextNotice(), /Brisbane/);
  assert.doesNotMatch(goldCoastNextNotice(), /nurses/);
  assert.notEqual(goldCoastNextNotice(), perthNextNotice());
  assert.notEqual(goldCoastNextNotice(), qldNextNotice());
  assert.notEqual(goldCoastNextNotice(), locationNextNotice());
  assert.notEqual(goldCoastNextNotice(), caregiversNextNotice());
  assert.notEqual(goldCoastNextNotice(), locationBoardNotice("Gold Coast"));
});

test("goldCoastNextShows is a signed-in family on the Gold Coast only", () => {
  assert.equal(goldCoastNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gold-coast" }), true);
  assert.equal(goldCoastNextShows({ isFamily: true, stateSlug: "wa", citySlug: "perth" }), false);
  assert.equal(goldCoastNextShows({ isFamily: true, stateSlug: "qld", citySlug: "brisbane" }), false);
  assert.equal(goldCoastNextShows({ isFamily: false, stateSlug: "qld", citySlug: "gold-coast" }), false);
});

test("goldCoastNextLinks go to Gold Coast nannies and babysitters, not Perth or national lists", () => {
  assert.deepEqual(goldCoastNextLinks(), [
    { href: "/caregivers/nannies/qld/gold-coast", label: "Browse nannies on the Gold Coast" },
    { href: "/caregivers/babysitters/qld/gold-coast", label: "Browse babysitters on the Gold Coast" },
  ]);
  assert.notDeepEqual(goldCoastNextLinks(), perthNextLinks());
  assert.notDeepEqual(goldCoastNextLinks(), qldNextLinks());
  assert.notDeepEqual(goldCoastNextLinks(), locationNextLinks());
  assert.notDeepEqual(goldCoastNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(goldCoastNextLinks(), [locationBoardLink({ city: "gold-coast", cityName: "Gold Coast" })]);
  assert.ok(!goldCoastNextLinks().some((link) => link.href === "/caregivers/after-school-care/wa/perth"));
  assert.ok(!goldCoastNextLinks().some((link) => link.href === "/caregivers/housekeeping/wa/perth"));
  assert.ok(!goldCoastNextLinks().some((link) => link.href === "/caregivers/nannies"));
  assert.ok(!goldCoastNextLinks().some((link) => link.href === "/caregivers/babysitters"));
  assert.ok(!goldCoastNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!goldCoastNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!goldCoastNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
