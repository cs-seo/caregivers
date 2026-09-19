import assert from "node:assert/strict";
import { test } from "node:test";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { mackayNextLinks, mackayNextNotice, mackayNextShows } from "./mackay-next";
import { rockhamptonNextLinks, rockhamptonNextNotice, rockhamptonNextShows } from "./rockhampton-next";
import { specialNeedsQldNextLinks, specialNeedsQldNextNotice } from "./special-needs-qld-next";

test("rockhamptonNextNotice names unused Central Coast and Canberra paths without a count or Instant Book", () => {
  assert.match(rockhamptonNextNotice(), /Rockhampton/);
  assert.match(rockhamptonNextNotice(), /Central Coast/);
  assert.match(rockhamptonNextNotice(), /Canberra/);
  assert.doesNotMatch(rockhamptonNextNotice(), /\d+ open/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Instant Book/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Hire/);
  assert.doesNotMatch(rockhamptonNextNotice(), /job=/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Bendigo/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Wollongong/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Mackay/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Ballarat/);
  assert.doesNotMatch(rockhamptonNextNotice(), /Darwin/);
  assert.notEqual(rockhamptonNextNotice(), specialNeedsQldNextNotice());
  assert.notEqual(rockhamptonNextNotice(), mackayNextNotice());
  assert.notEqual(rockhamptonNextNotice(), locationBoardNotice("Rockhampton"));
});

test("rockhamptonNextShows is a signed-in family on Rockhampton only", () => {
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "qld", citySlug: "rockhampton" }), true);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "qld", citySlug: "mackay" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "vic", citySlug: "bendigo" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "wollongong" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "central-coast" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "act", citySlug: "canberra" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: false, stateSlug: "qld", citySlug: "rockhampton" }), false);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "rockhampton" }), false);
});

test("rockhamptonNextLinks go to Central Coast and Canberra, not Bendigo or Mackay", () => {
  assert.deepEqual(rockhamptonNextLinks(), [
    { href: "/locations/nsw/central-coast", label: "Open Central Coast locations" },
    { href: "/locations/act/canberra", label: "Open Canberra locations" },
  ]);
  assert.notDeepEqual(rockhamptonNextLinks(), specialNeedsQldNextLinks());
  assert.notDeepEqual(rockhamptonNextLinks(), mackayNextLinks());
  assert.notDeepEqual(rockhamptonNextLinks(), [locationBoardLink({ city: "rockhampton", cityName: "Rockhampton" })]);
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/caregivers/special-needs/qld"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/locations/nsw/wollongong"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/locations/qld/mackay"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/locations/vic/ballarat"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/locations/nt/darwin"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!rockhamptonNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!rockhamptonNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
