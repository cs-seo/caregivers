import assert from "node:assert/strict";
import { test } from "node:test";
import { armidaleNextLinks, armidaleNextNotice, armidaleNextShows } from "./armidale-next";
import { babysittersQldNextLinks, babysittersQldNextNotice } from "./babysitters-qld-next";
import { bundabergNextLinks, bundabergNextNotice, bundabergNextShows } from "./bundaberg-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";

test("armidaleNextNotice names unused Mildura and Warrnambool paths without a count or Instant Book", () => {
  assert.match(armidaleNextNotice(), /Armidale/);
  assert.match(armidaleNextNotice(), /Mildura/);
  assert.match(armidaleNextNotice(), /Warrnambool/);
  assert.doesNotMatch(armidaleNextNotice(), /\d+ open/);
  assert.doesNotMatch(armidaleNextNotice(), /Instant Book/);
  assert.doesNotMatch(armidaleNextNotice(), /Hire/);
  assert.doesNotMatch(armidaleNextNotice(), /job=/);
  assert.doesNotMatch(armidaleNextNotice(), /Port Macquarie/);
  assert.doesNotMatch(armidaleNextNotice(), /Albury/);
  assert.doesNotMatch(armidaleNextNotice(), /Bundaberg/);
  assert.doesNotMatch(armidaleNextNotice(), /Orange/);
  assert.doesNotMatch(armidaleNextNotice(), /Burnie/);
  assert.notEqual(armidaleNextNotice(), babysittersQldNextNotice());
  assert.notEqual(armidaleNextNotice(), bundabergNextNotice());
  assert.notEqual(armidaleNextNotice(), locationBoardNotice("Armidale"));
});

test("armidaleNextShows is a signed-in family on Armidale only", () => {
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "armidale" }), true);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "orange" }), false);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "vic", citySlug: "mildura" }), false);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "vic", citySlug: "warrnambool" }), false);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "port-macquarie" }), false);
  assert.equal(armidaleNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "albury" }), false);
  assert.equal(armidaleNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "armidale" }), false);
  assert.equal(bundabergNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "armidale" }), false);
});

test("armidaleNextLinks go to Mildura and Warrnambool, not Port Macquarie or Bundaberg", () => {
  assert.deepEqual(armidaleNextLinks(), [
    { href: "/locations/vic/mildura", label: "Open Mildura locations" },
    { href: "/locations/vic/warrnambool", label: "Open Warrnambool locations" },
  ]);
  assert.notDeepEqual(armidaleNextLinks(), babysittersQldNextLinks());
  assert.notDeepEqual(armidaleNextLinks(), bundabergNextLinks());
  assert.notDeepEqual(armidaleNextLinks(), [locationBoardLink({ city: "armidale", cityName: "Armidale" })]);
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/caregivers/babysitters/qld"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/locations/nsw/port-macquarie"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/locations/nsw/albury"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/locations/qld/bundaberg"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/locations/nsw/orange"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/locations/tas/burnie"));
  assert.ok(!armidaleNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!armidaleNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!armidaleNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
