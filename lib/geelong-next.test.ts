import assert from "node:assert/strict";
import { test } from "node:test";
import { boardNextLinks, boardNextNotice } from "./board-next";
import { forCarersNextLinks, forCarersNextNotice } from "./for-carers-next";
import { goldCoastNextLinks, goldCoastNextNotice } from "./gold-coast-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { geelongNextLinks, geelongNextNotice, geelongNextShows } from "./geelong-next";

test("geelongNextNotice names unused Geelong specialties without a count or Instant Book", () => {
  assert.match(geelongNextNotice(), /Geelong/);
  assert.match(geelongNextNotice(), /special needs/);
  assert.match(geelongNextNotice(), /companion carers/);
  assert.doesNotMatch(geelongNextNotice(), /\d+ open/);
  assert.doesNotMatch(geelongNextNotice(), /Instant Book/);
  assert.doesNotMatch(geelongNextNotice(), /Hire/);
  assert.doesNotMatch(geelongNextNotice(), /job=/);
  assert.doesNotMatch(geelongNextNotice(), /Gold Coast/);
  assert.doesNotMatch(geelongNextNotice(), /nannies/);
  assert.doesNotMatch(geelongNextNotice(), /babysitters/);
  assert.doesNotMatch(geelongNextNotice(), /Perth/);
  assert.doesNotMatch(geelongNextNotice(), /Melbourne/);
  assert.notEqual(geelongNextNotice(), goldCoastNextNotice());
  assert.notEqual(geelongNextNotice(), perthNextNotice());
  assert.notEqual(geelongNextNotice(), vicNextNotice());
  assert.notEqual(geelongNextNotice(), forCarersNextNotice());
  assert.notEqual(geelongNextNotice(), boardNextNotice());
  assert.notEqual(geelongNextNotice(), locationBoardNotice("Geelong"));
});

test("geelongNextShows is a signed-in family on Geelong only", () => {
  assert.equal(geelongNextShows({ isFamily: true, stateSlug: "vic", citySlug: "geelong" }), true);
  assert.equal(geelongNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gold-coast" }), false);
  assert.equal(geelongNextShows({ isFamily: true, stateSlug: "vic", citySlug: "melbourne" }), false);
  assert.equal(geelongNextShows({ isFamily: false, stateSlug: "vic", citySlug: "geelong" }), false);
});

test("geelongNextLinks go to Geelong special needs and companion carers, not Gold Coast", () => {
  assert.deepEqual(geelongNextLinks(), [
    { href: "/caregivers/special-needs/vic/geelong", label: "Browse special needs in Geelong" },
    { href: "/caregivers/companion-care/vic/geelong", label: "Browse companion carers in Geelong" },
  ]);
  assert.notDeepEqual(geelongNextLinks(), goldCoastNextLinks());
  assert.notDeepEqual(geelongNextLinks(), perthNextLinks());
  assert.notDeepEqual(geelongNextLinks(), vicNextLinks());
  assert.notDeepEqual(geelongNextLinks(), forCarersNextLinks());
  assert.notDeepEqual(geelongNextLinks(), boardNextLinks());
  assert.notDeepEqual(geelongNextLinks(), [locationBoardLink({ city: "geelong", cityName: "Geelong" })]);
  assert.ok(!geelongNextLinks().some((link) => link.href === "/caregivers/nannies/qld/gold-coast"));
  assert.ok(!geelongNextLinks().some((link) => link.href === "/caregivers/special-needs"));
  assert.ok(!geelongNextLinks().some((link) => link.href === "/caregivers/companion-care"));
  assert.ok(!geelongNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!geelongNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!geelongNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
