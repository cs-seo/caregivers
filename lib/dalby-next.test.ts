import assert from "node:assert/strict";
import { test } from "node:test";
import { dalbyNextLinks, dalbyNextNotice, dalbyNextShows } from "./dalby-next";
import { disabilitySaNextLinks, disabilitySaNextNotice } from "./disability-sa-next";
import { gunnedahNextLinks, gunnedahNextNotice, gunnedahNextShows } from "./gunnedah-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { termsNextLinks, termsNextNotice } from "./terms-next";

test("dalbyNextNotice names unused Colac and Portland paths without a count or Instant Book", () => {
  assert.match(dalbyNextNotice(), /Dalby/);
  assert.match(dalbyNextNotice(), /Colac/);
  assert.match(dalbyNextNotice(), /Portland/);
  assert.doesNotMatch(dalbyNextNotice(), /\d+ open/);
  assert.doesNotMatch(dalbyNextNotice(), /Instant Book/);
  assert.doesNotMatch(dalbyNextNotice(), /Hire/);
  assert.doesNotMatch(dalbyNextNotice(), /job=/);
  assert.doesNotMatch(dalbyNextNotice(), /Northam/);
  assert.doesNotMatch(dalbyNextNotice(), /Collie/);
  assert.doesNotMatch(dalbyNextNotice(), /Bairnsdale/);
  assert.doesNotMatch(dalbyNextNotice(), /Castlemaine/);
  assert.doesNotMatch(dalbyNextNotice(), /Gunnedah/);
  assert.doesNotMatch(dalbyNextNotice(), /Yeppoon/);
  assert.notEqual(dalbyNextNotice(), disabilitySaNextNotice());
  assert.notEqual(dalbyNextNotice(), termsNextNotice());
  assert.notEqual(dalbyNextNotice(), gunnedahNextNotice());
  assert.notEqual(dalbyNextNotice(), locationBoardNotice("Dalby"));
});

test("dalbyNextShows is a signed-in family on Dalby only", () => {
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "qld", citySlug: "dalby" }), true);
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "qld", citySlug: "warwick" }), false);
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "vic", citySlug: "colac" }), false);
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "vic", citySlug: "portland" }), false);
  assert.equal(dalbyNextShows({ isFamily: true, stateSlug: "wa", citySlug: "northam" }), false);
  assert.equal(dalbyNextShows({ isFamily: false, stateSlug: "qld", citySlug: "dalby" }), false);
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "qld", citySlug: "dalby" }), false);
});

test("dalbyNextLinks go to Colac and Portland, not Northam or Gunnedah", () => {
  assert.deepEqual(dalbyNextLinks(), [
    { href: "/locations/vic/colac", label: "Open Colac locations" },
    { href: "/locations/vic/portland", label: "Open Portland locations" },
  ]);
  assert.notDeepEqual(dalbyNextLinks(), disabilitySaNextLinks());
  assert.notDeepEqual(dalbyNextLinks(), termsNextLinks());
  assert.notDeepEqual(dalbyNextLinks(), gunnedahNextLinks());
  assert.notDeepEqual(dalbyNextLinks(), [locationBoardLink({ city: "dalby", cityName: "Dalby" })]);
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/caregivers/disability-support/sa"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/locations/wa/northam"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/locations/wa/collie"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/terms"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/locations/vic/bairnsdale"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/locations/vic/castlemaine"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/locations/nsw/gunnedah"));
  assert.ok(!dalbyNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!dalbyNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!dalbyNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
