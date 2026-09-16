import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareSaNextLinks, agedCareSaNextNotice } from "./aged-care-sa-next";
import { byronBayNextLinks, byronBayNextNotice, byronBayNextShows } from "./byron-bay-next";
import { coffsHarbourNextLinks, coffsHarbourNextNotice } from "./coffs-harbour-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import {
  hunterValleyNextLinks,
  hunterValleyNextNotice,
  hunterValleyNextShows,
} from "./hunter-valley-next";

test("hunterValleyNextNotice names unused Yarra Valley and Adelaide Hills paths without a count or Instant Book", () => {
  assert.match(hunterValleyNextNotice(), /Hunter Valley/);
  assert.match(hunterValleyNextNotice(), /Yarra Valley/);
  assert.match(hunterValleyNextNotice(), /Adelaide Hills/);
  assert.doesNotMatch(hunterValleyNextNotice(), /\d+ open/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Instant Book/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Hire/);
  assert.doesNotMatch(hunterValleyNextNotice(), /job=/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Barossa/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Southern Highlands/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Byron Bay/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Margaret River/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Mornington Peninsula/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Goulburn/);
  assert.doesNotMatch(hunterValleyNextNotice(), /Wangaratta/);
  assert.notEqual(hunterValleyNextNotice(), agedCareSaNextNotice());
  assert.notEqual(hunterValleyNextNotice(), byronBayNextNotice());
  assert.notEqual(hunterValleyNextNotice(), coffsHarbourNextNotice());
  assert.notEqual(hunterValleyNextNotice(), locationBoardNotice("Hunter Valley"));
});

test("hunterValleyNextShows is a signed-in family on Hunter Valley only", () => {
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "hunter-valley" }), true);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "byron-bay" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "vic", citySlug: "yarra-valley" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "sa", citySlug: "adelaide-hills" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "sa", citySlug: "barossa" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "southern-highlands" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "hunter-valley" }), false);
  assert.equal(byronBayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "hunter-valley" }), false);
});

test("hunterValleyNextLinks go to Yarra Valley and Adelaide Hills, not Barossa or Byron Bay", () => {
  assert.deepEqual(hunterValleyNextLinks(), [
    { href: "/locations/vic/yarra-valley", label: "Open Yarra Valley locations" },
    { href: "/locations/sa/adelaide-hills", label: "Open Adelaide Hills locations" },
  ]);
  assert.notDeepEqual(hunterValleyNextLinks(), agedCareSaNextLinks());
  assert.notDeepEqual(hunterValleyNextLinks(), byronBayNextLinks());
  assert.notDeepEqual(hunterValleyNextLinks(), coffsHarbourNextLinks());
  assert.notDeepEqual(hunterValleyNextLinks(), [
    locationBoardLink({ city: "hunter-valley", cityName: "Hunter Valley" }),
  ]);
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/sa/barossa"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/nsw/southern-highlands"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/caregivers/aged-care/sa"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/nsw/byron-bay"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/wa/margaret-river"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/vic/mornington-peninsula"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/nsw/goulburn"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/locations/vic/wangaratta"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!hunterValleyNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!hunterValleyNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
