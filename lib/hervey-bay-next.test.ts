import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareVicNextLinks, agedCareVicNextNotice } from "./aged-care-vic-next";
import { armidaleNextLinks, armidaleNextNotice, armidaleNextShows } from "./armidale-next";
import { herveyBayNextLinks, herveyBayNextNotice, herveyBayNextShows } from "./hervey-bay-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";

test("herveyBayNextNotice names unused Bunbury and Ulverstone paths without a count or Instant Book", () => {
  assert.match(herveyBayNextNotice(), /Hervey Bay/);
  assert.match(herveyBayNextNotice(), /Bunbury/);
  assert.match(herveyBayNextNotice(), /Ulverstone/);
  assert.doesNotMatch(herveyBayNextNotice(), /\d+ open/);
  assert.doesNotMatch(herveyBayNextNotice(), /Instant Book/);
  assert.doesNotMatch(herveyBayNextNotice(), /Hire/);
  assert.doesNotMatch(herveyBayNextNotice(), /job=/);
  assert.doesNotMatch(herveyBayNextNotice(), /Griffith/);
  assert.doesNotMatch(herveyBayNextNotice(), /Taree/);
  assert.doesNotMatch(herveyBayNextNotice(), /Armidale/);
  assert.doesNotMatch(herveyBayNextNotice(), /Mildura/);
  assert.doesNotMatch(herveyBayNextNotice(), /Warrnambool/);
  assert.notEqual(herveyBayNextNotice(), agedCareVicNextNotice());
  assert.notEqual(herveyBayNextNotice(), armidaleNextNotice());
  assert.notEqual(herveyBayNextNotice(), locationBoardNotice("Hervey Bay"));
});

test("herveyBayNextShows is a signed-in family on Hervey Bay only", () => {
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "hervey-bay" }), true);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "bundaberg" }), false);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "wa", citySlug: "bunbury" }), false);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "tas", citySlug: "ulverstone" }), false);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "griffith" }), false);
  assert.equal(herveyBayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "taree" }), false);
  assert.equal(herveyBayNextShows({ isFamily: false, stateSlug: "qld", citySlug: "hervey-bay" }), false);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "qld", citySlug: "hervey-bay" }), false);
});

test("herveyBayNextLinks go to Bunbury and Ulverstone, not Griffith or Armidale", () => {
  assert.deepEqual(herveyBayNextLinks(), [
    { href: "/locations/wa/bunbury", label: "Open Bunbury locations" },
    { href: "/locations/tas/ulverstone", label: "Open Ulverstone locations" },
  ]);
  assert.notDeepEqual(herveyBayNextLinks(), agedCareVicNextLinks());
  assert.notDeepEqual(herveyBayNextLinks(), armidaleNextLinks());
  assert.notDeepEqual(herveyBayNextLinks(), [locationBoardLink({ city: "hervey-bay", cityName: "Hervey Bay" })]);
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/caregivers/aged-care/vic"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/locations/nsw/griffith"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/locations/nsw/taree"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/locations/nsw/armidale"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/locations/vic/mildura"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/locations/vic/warrnambool"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!herveyBayNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!herveyBayNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
