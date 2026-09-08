import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { geelongNextLinks, geelongNextNotice } from "./geelong-next";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { newcastleNextLinks, newcastleNextNotice, newcastleNextShows } from "./newcastle-next";

test("newcastleNextNotice names unused Newcastle specialties without a count or Instant Book", () => {
  assert.match(newcastleNextNotice(), /Newcastle/);
  assert.match(newcastleNextNotice(), /aged care/);
  assert.match(newcastleNextNotice(), /nannies/);
  assert.doesNotMatch(newcastleNextNotice(), /\d+ open/);
  assert.doesNotMatch(newcastleNextNotice(), /Instant Book/);
  assert.doesNotMatch(newcastleNextNotice(), /Hire/);
  assert.doesNotMatch(newcastleNextNotice(), /job=/);
  assert.doesNotMatch(newcastleNextNotice(), /Geelong/);
  assert.doesNotMatch(newcastleNextNotice(), /special needs/);
  assert.doesNotMatch(newcastleNextNotice(), /companion/);
  assert.doesNotMatch(newcastleNextNotice(), /Gold Coast/);
  assert.doesNotMatch(newcastleNextNotice(), /Sydney/);
  assert.notEqual(newcastleNextNotice(), geelongNextNotice());
  assert.notEqual(newcastleNextNotice(), locationNextNotice());
  assert.notEqual(newcastleNextNotice(), caregiversNextNotice());
  assert.notEqual(newcastleNextNotice(), guideNextNotice());
  assert.notEqual(newcastleNextNotice(), locationBoardNotice("Newcastle"));
});

test("newcastleNextShows is a signed-in family on Newcastle only", () => {
  assert.equal(newcastleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "newcastle" }), true);
  assert.equal(newcastleNextShows({ isFamily: true, stateSlug: "vic", citySlug: "geelong" }), false);
  assert.equal(newcastleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "sydney" }), false);
  assert.equal(newcastleNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "newcastle" }), false);
});

test("newcastleNextLinks go to Newcastle aged care and nannies, not Geelong or Sydney", () => {
  assert.deepEqual(newcastleNextLinks(), [
    { href: "/caregivers/aged-care/nsw/newcastle", label: "Browse aged care in Newcastle" },
    { href: "/caregivers/nannies/nsw/newcastle", label: "Browse nannies in Newcastle" },
  ]);
  assert.notDeepEqual(newcastleNextLinks(), geelongNextLinks());
  assert.notDeepEqual(newcastleNextLinks(), locationNextLinks());
  assert.notDeepEqual(newcastleNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(
    newcastleNextLinks(),
    guideNextLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.notDeepEqual(newcastleNextLinks(), [locationBoardLink({ city: "newcastle", cityName: "Newcastle" })]);
  assert.ok(!newcastleNextLinks().some((link) => link.href === "/caregivers/special-needs/vic/geelong"));
  assert.ok(!newcastleNextLinks().some((link) => link.href === "/caregivers/aged-care/nsw"));
  assert.ok(!newcastleNextLinks().some((link) => link.href === "/locations/nsw/sydney"));
  assert.ok(!newcastleNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!newcastleNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!newcastleNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
