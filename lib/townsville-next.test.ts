import assert from "node:assert/strict";
import { test } from "node:test";
import { cairnsNextLinks, cairnsNextNotice, cairnsNextShows } from "./cairns-next";
import { disabilityQldNextLinks, disabilityQldNextNotice } from "./disability-qld-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { townsvilleNextLinks, townsvilleNextNotice, townsvilleNextShows } from "./townsville-next";

test("townsvilleNextNotice names unused Katherine and Whyalla paths without a count or Instant Book", () => {
  assert.match(townsvilleNextNotice(), /Townsville/);
  assert.match(townsvilleNextNotice(), /Katherine/);
  assert.match(townsvilleNextNotice(), /Whyalla/);
  assert.doesNotMatch(townsvilleNextNotice(), /\d+ open/);
  assert.doesNotMatch(townsvilleNextNotice(), /Instant Book/);
  assert.doesNotMatch(townsvilleNextNotice(), /Hire/);
  assert.doesNotMatch(townsvilleNextNotice(), /job=/);
  assert.doesNotMatch(townsvilleNextNotice(), /Gawler/);
  assert.doesNotMatch(townsvilleNextNotice(), /Palmerston/);
  assert.doesNotMatch(townsvilleNextNotice(), /Cairns/);
  assert.doesNotMatch(townsvilleNextNotice(), /Karratha/);
  assert.doesNotMatch(townsvilleNextNotice(), /Port Pirie/);
  assert.notEqual(townsvilleNextNotice(), disabilityQldNextNotice());
  assert.notEqual(townsvilleNextNotice(), cairnsNextNotice());
  assert.notEqual(townsvilleNextNotice(), locationBoardNotice("Townsville"));
});

test("townsvilleNextShows is a signed-in family on Townsville only", () => {
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "qld", citySlug: "townsville" }), true);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "qld", citySlug: "cairns" }), false);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "sa", citySlug: "gawler" }), false);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "nt", citySlug: "palmerston" }), false);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "nt", citySlug: "katherine" }), false);
  assert.equal(townsvilleNextShows({ isFamily: true, stateSlug: "sa", citySlug: "whyalla" }), false);
  assert.equal(townsvilleNextShows({ isFamily: false, stateSlug: "qld", citySlug: "townsville" }), false);
  assert.equal(cairnsNextShows({ isFamily: true, stateSlug: "qld", citySlug: "townsville" }), false);
});

test("townsvilleNextLinks go to Katherine and Whyalla, not Gawler or Cairns", () => {
  assert.deepEqual(townsvilleNextLinks(), [
    { href: "/locations/nt/katherine", label: "Open Katherine locations" },
    { href: "/locations/sa/whyalla", label: "Open Whyalla locations" },
  ]);
  assert.notDeepEqual(townsvilleNextLinks(), disabilityQldNextLinks());
  assert.notDeepEqual(townsvilleNextLinks(), cairnsNextLinks());
  assert.notDeepEqual(townsvilleNextLinks(), [locationBoardLink({ city: "townsville", cityName: "Townsville" })]);
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/caregivers/disability-support/qld"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/locations/sa/gawler"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/locations/nt/palmerston"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/locations/qld/cairns"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/locations/wa/karratha"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/locations/sa/port-pirie"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!townsvilleNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!townsvilleNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
