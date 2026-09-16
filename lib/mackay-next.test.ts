import assert from "node:assert/strict";
import { test } from "node:test";
import { companionCareVicNextLinks, companionCareVicNextNotice } from "./companion-care-vic-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { mackayNextLinks, mackayNextNotice, mackayNextShows } from "./mackay-next";
import { townsvilleNextLinks, townsvilleNextNotice, townsvilleNextShows } from "./townsville-next";

test("mackayNextNotice names unused Ballarat and Darwin paths without a count or Instant Book", () => {
  assert.match(mackayNextNotice(), /Mackay/);
  assert.match(mackayNextNotice(), /Ballarat/);
  assert.match(mackayNextNotice(), /Darwin/);
  assert.doesNotMatch(mackayNextNotice(), /\d+ open/);
  assert.doesNotMatch(mackayNextNotice(), /Instant Book/);
  assert.doesNotMatch(mackayNextNotice(), /Hire/);
  assert.doesNotMatch(mackayNextNotice(), /job=/);
  assert.doesNotMatch(mackayNextNotice(), /Nowra/);
  assert.doesNotMatch(mackayNextNotice(), /Mandurah/);
  assert.doesNotMatch(mackayNextNotice(), /Townsville/);
  assert.doesNotMatch(mackayNextNotice(), /Katherine/);
  assert.doesNotMatch(mackayNextNotice(), /Whyalla/);
  assert.notEqual(mackayNextNotice(), companionCareVicNextNotice());
  assert.notEqual(mackayNextNotice(), townsvilleNextNotice());
  assert.notEqual(mackayNextNotice(), locationBoardNotice("Mackay"));
});

test("mackayNextShows is a signed-in family on Mackay only", () => {
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "mackay" }), true);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "qld", citySlug: "townsville" }), false);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "nowra" }), false);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "wa", citySlug: "mandurah" }), false);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "vic", citySlug: "ballarat" }), false);
  assert.equal(mackayNextShows({ isFamily: true, stateSlug: "nt", citySlug: "darwin" }), false);
  assert.equal(mackayNextShows({ isFamily: false, stateSlug: "qld", citySlug: "mackay" }), false);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "qld", citySlug: "mackay" }), false);
});

test("mackayNextLinks go to Ballarat and Darwin, not Nowra or Townsville", () => {
  assert.deepEqual(mackayNextLinks(), [
    { href: "/locations/vic/ballarat", label: "Open Ballarat locations" },
    { href: "/locations/nt/darwin", label: "Open Darwin locations" },
  ]);
  assert.notDeepEqual(mackayNextLinks(), companionCareVicNextLinks());
  assert.notDeepEqual(mackayNextLinks(), townsvilleNextLinks());
  assert.notDeepEqual(mackayNextLinks(), [locationBoardLink({ city: "mackay", cityName: "Mackay" })]);
  assert.ok(!mackayNextLinks().some((link) => link.href === "/caregivers/companion-care/vic"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/locations/nsw/nowra"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/locations/wa/mandurah"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/locations/qld/townsville"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/locations/nt/katherine"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/locations/sa/whyalla"));
  assert.ok(!mackayNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!mackayNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!mackayNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
