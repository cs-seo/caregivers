import assert from "node:assert/strict";
import { test } from "node:test";
import { bundabergNextLinks, bundabergNextNotice, bundabergNextShows } from "./bundaberg-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { nanniesQldNextLinks, nanniesQldNextNotice } from "./nannies-qld-next";
import { swanHillNextLinks, swanHillNextNotice, swanHillNextShows } from "./swan-hill-next";

test("bundabergNextNotice names unused Orange and Burnie paths without a count or Instant Book", () => {
  assert.match(bundabergNextNotice(), /Bundaberg/);
  assert.match(bundabergNextNotice(), /Orange/);
  assert.match(bundabergNextNotice(), /Burnie/);
  assert.doesNotMatch(bundabergNextNotice(), /\d+ open/);
  assert.doesNotMatch(bundabergNextNotice(), /Instant Book/);
  assert.doesNotMatch(bundabergNextNotice(), /Hire/);
  assert.doesNotMatch(bundabergNextNotice(), /job=/);
  assert.doesNotMatch(bundabergNextNotice(), /Katoomba/);
  assert.doesNotMatch(bundabergNextNotice(), /Devonport/);
  assert.doesNotMatch(bundabergNextNotice(), /Swan Hill/);
  assert.doesNotMatch(bundabergNextNotice(), /Benalla/);
  assert.doesNotMatch(bundabergNextNotice(), /Carnarvon/);
  assert.notEqual(bundabergNextNotice(), nanniesQldNextNotice());
  assert.notEqual(bundabergNextNotice(), swanHillNextNotice());
  assert.notEqual(bundabergNextNotice(), locationBoardNotice("Bundaberg"));
});

test("bundabergNextShows is a signed-in family on Bundaberg only", () => {
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "qld", citySlug: "bundaberg" }), true);
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "qld", citySlug: "dalby" }), false);
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "orange" }), false);
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "tas", citySlug: "burnie" }), false);
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "katoomba" }), false);
  assert.equal(bundabergNextShows({ isFamily: false, stateSlug: "qld", citySlug: "bundaberg" }), false);
  assert.equal(swanHillNextShows({ isFamily: true, stateSlug: "qld", citySlug: "bundaberg" }), false);
});

test("bundabergNextLinks go to Orange and Burnie, not Katoomba or Swan Hill", () => {
  assert.deepEqual(bundabergNextLinks(), [
    { href: "/locations/nsw/orange", label: "Open Orange locations" },
    { href: "/locations/tas/burnie", label: "Open Burnie locations" },
  ]);
  assert.notDeepEqual(bundabergNextLinks(), nanniesQldNextLinks());
  assert.notDeepEqual(bundabergNextLinks(), swanHillNextLinks());
  assert.notDeepEqual(bundabergNextLinks(), [locationBoardLink({ city: "bundaberg", cityName: "Bundaberg" })]);
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/caregivers/nannies/qld"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/locations/nsw/katoomba"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/locations/tas/devonport"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/locations/vic/swan-hill"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/locations/vic/benalla"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/locations/wa/carnarvon"));
  assert.ok(!bundabergNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!bundabergNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!bundabergNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
