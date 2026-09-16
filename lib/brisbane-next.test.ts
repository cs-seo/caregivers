import assert from "node:assert/strict";
import { test } from "node:test";
import { brisbaneNextLinks, brisbaneNextNotice, brisbaneNextShows } from "./brisbane-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { nursingVicNextLinks, nursingVicNextNotice } from "./nursing-vic-next";
import { rockhamptonNextLinks, rockhamptonNextNotice, rockhamptonNextShows } from "./rockhampton-next";

test("brisbaneNextNotice names unused Melbourne and Sydney paths without a count or Instant Book", () => {
  assert.match(brisbaneNextNotice(), /Brisbane/);
  assert.match(brisbaneNextNotice(), /Melbourne/);
  assert.match(brisbaneNextNotice(), /Sydney/);
  assert.doesNotMatch(brisbaneNextNotice(), /\d+ open/);
  assert.doesNotMatch(brisbaneNextNotice(), /Instant Book/);
  assert.doesNotMatch(brisbaneNextNotice(), /Hire/);
  assert.doesNotMatch(brisbaneNextNotice(), /job=/);
  assert.doesNotMatch(brisbaneNextNotice(), /Sunshine Coast/);
  assert.doesNotMatch(brisbaneNextNotice(), /Adelaide/);
  assert.doesNotMatch(brisbaneNextNotice(), /Rockhampton/);
  assert.doesNotMatch(brisbaneNextNotice(), /Central Coast/);
  assert.doesNotMatch(brisbaneNextNotice(), /Canberra/);
  assert.notEqual(brisbaneNextNotice(), nursingVicNextNotice());
  assert.notEqual(brisbaneNextNotice(), rockhamptonNextNotice());
  assert.notEqual(brisbaneNextNotice(), locationNextNotice());
  assert.notEqual(brisbaneNextNotice(), locationBoardNotice("Brisbane"));
});

test("brisbaneNextShows is a signed-in family on Brisbane only", () => {
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "brisbane" }), true);
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "rockhampton" }), false);
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "qld", citySlug: "sunshine-coast" }), false);
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "sa", citySlug: "adelaide" }), false);
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "vic", citySlug: "melbourne" }), false);
  assert.equal(brisbaneNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "sydney" }), false);
  assert.equal(brisbaneNextShows({ isFamily: false, stateSlug: "qld", citySlug: "brisbane" }), false);
  assert.equal(rockhamptonNextShows({ isFamily: true, stateSlug: "qld", citySlug: "brisbane" }), false);
});

test("brisbaneNextLinks go to Melbourne and Sydney, not Sunshine Coast or Rockhampton", () => {
  assert.deepEqual(brisbaneNextLinks(), [
    { href: "/locations/vic/melbourne", label: "Open Melbourne locations" },
    { href: "/locations/nsw/sydney", label: "Open Sydney locations" },
  ]);
  assert.notDeepEqual(brisbaneNextLinks(), nursingVicNextLinks());
  assert.notDeepEqual(brisbaneNextLinks(), rockhamptonNextLinks());
  assert.notDeepEqual(brisbaneNextLinks(), locationNextLinks());
  assert.notDeepEqual(brisbaneNextLinks(), [locationBoardLink({ city: "brisbane", cityName: "Brisbane" })]);
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/caregivers/nursing/vic"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/locations/qld/sunshine-coast"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/locations/sa/adelaide"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/locations/qld/rockhampton"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/locations/nsw/central-coast"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/locations/act/canberra"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/caregivers/nannies"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!brisbaneNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!brisbaneNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
