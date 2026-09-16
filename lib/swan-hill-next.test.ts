import assert from "node:assert/strict";
import { test } from "node:test";
import { dalbyNextLinks, dalbyNextNotice, dalbyNextShows } from "./dalby-next";
import { housekeepingVicNextLinks, housekeepingVicNextNotice } from "./housekeeping-vic-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { swanHillNextLinks, swanHillNextNotice, swanHillNextShows } from "./swan-hill-next";

test("swanHillNextNotice names unused Benalla and Carnarvon paths without a count or Instant Book", () => {
  assert.match(swanHillNextNotice(), /Swan Hill/);
  assert.match(swanHillNextNotice(), /Benalla/);
  assert.match(swanHillNextNotice(), /Carnarvon/);
  assert.doesNotMatch(swanHillNextNotice(), /\d+ open/);
  assert.doesNotMatch(swanHillNextNotice(), /Instant Book/);
  assert.doesNotMatch(swanHillNextNotice(), /Hire/);
  assert.doesNotMatch(swanHillNextNotice(), /job=/);
  assert.doesNotMatch(swanHillNextNotice(), /Derby/);
  assert.doesNotMatch(swanHillNextNotice(), /New Norfolk/);
  assert.doesNotMatch(swanHillNextNotice(), /Dalby/);
  assert.doesNotMatch(swanHillNextNotice(), /Colac/);
  assert.doesNotMatch(swanHillNextNotice(), /Portland/);
  assert.notEqual(swanHillNextNotice(), housekeepingVicNextNotice());
  assert.notEqual(swanHillNextNotice(), dalbyNextNotice());
  assert.notEqual(swanHillNextNotice(), locationBoardNotice("Swan Hill"));
});

test("swanHillNextShows is a signed-in family on Swan Hill only", () => {
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "vic", citySlug: "swan-hill" }), true);
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "vic", citySlug: "benalla" }), false);
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "wa", citySlug: "carnarvon" }), false);
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "qld", citySlug: "dalby" }), false);
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "wa", citySlug: "derby" }), false);
  assert.equal(swanHillNextShows({ isFamily: false, stateSlug: "vic", citySlug: "swan-hill" }), false);
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "vic", citySlug: "swan-hill" }), false);
});

test("swanHillNextLinks go to Benalla and Carnarvon, not Derby or Dalby", () => {
  assert.deepEqual(swanHillNextLinks(), [
    { href: "/locations/vic/benalla", label: "Open Benalla locations" },
    { href: "/locations/wa/carnarvon", label: "Open Carnarvon locations" },
  ]);
  assert.notDeepEqual(swanHillNextLinks(), housekeepingVicNextLinks());
  assert.notDeepEqual(swanHillNextLinks(), dalbyNextLinks());
  assert.notDeepEqual(swanHillNextLinks(), [locationBoardLink({ city: "swan-hill", cityName: "Swan Hill" })]);
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/caregivers/housekeeping/vic"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/locations/wa/derby"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/locations/tas/new-norfolk"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/locations/qld/dalby"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/locations/vic/colac"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/locations/vic/portland"));
  assert.ok(!swanHillNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!swanHillNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!swanHillNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
