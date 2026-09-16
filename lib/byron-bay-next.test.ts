import assert from "node:assert/strict";
import { test } from "node:test";
import { coffsHarbourNextLinks, coffsHarbourNextNotice } from "./coffs-harbour-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { nanniesSaNextLinks, nanniesSaNextNotice } from "./nannies-sa-next";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { byronBayNextLinks, byronBayNextNotice, byronBayNextShows } from "./byron-bay-next";

test("byronBayNextNotice names unused Margaret River and Mornington Peninsula paths without a count or Instant Book", () => {
  assert.match(byronBayNextNotice(), /Byron Bay/);
  assert.match(byronBayNextNotice(), /Margaret River/);
  assert.match(byronBayNextNotice(), /Mornington Peninsula/);
  assert.doesNotMatch(byronBayNextNotice(), /\d+ open/);
  assert.doesNotMatch(byronBayNextNotice(), /Instant Book/);
  assert.doesNotMatch(byronBayNextNotice(), /Hire/);
  assert.doesNotMatch(byronBayNextNotice(), /job=/);
  assert.doesNotMatch(byronBayNextNotice(), /Goulburn/);
  assert.doesNotMatch(byronBayNextNotice(), /Wangaratta/);
  assert.doesNotMatch(byronBayNextNotice(), /Wagga Wagga/);
  assert.doesNotMatch(byronBayNextNotice(), /Tamworth/);
  assert.doesNotMatch(byronBayNextNotice(), /Coffs Harbour/);
  assert.doesNotMatch(byronBayNextNotice(), /Hunter Valley/);
  assert.notEqual(byronBayNextNotice(), nanniesSaNextNotice());
  assert.notEqual(byronBayNextNotice(), coffsHarbourNextNotice());
  assert.notEqual(byronBayNextNotice(), perthNextNotice());
  assert.notEqual(byronBayNextNotice(), locationBoardNotice("Byron Bay"));
});

test("byronBayNextShows is a signed-in family on Byron Bay only", () => {
  assert.equal(byronBayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "byron-bay" }), true);
  assert.equal(byronBayNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "coffs-harbour" }), false);
  assert.equal(byronBayNextShows({ isFamily: true, stateSlug: "wa", citySlug: "margaret-river" }), false);
  assert.equal(byronBayNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "byron-bay" }), false);
});

test("byronBayNextLinks go to Margaret River and Mornington Peninsula, not Goulburn or Wagga Wagga", () => {
  assert.deepEqual(byronBayNextLinks(), [
    { href: "/locations/wa/margaret-river", label: "Open Margaret River locations" },
    { href: "/locations/vic/mornington-peninsula", label: "Open Mornington Peninsula locations" },
  ]);
  assert.notDeepEqual(byronBayNextLinks(), nanniesSaNextLinks());
  assert.notDeepEqual(byronBayNextLinks(), coffsHarbourNextLinks());
  assert.notDeepEqual(byronBayNextLinks(), perthNextLinks());
  assert.notDeepEqual(byronBayNextLinks(), [
    locationBoardLink({ city: "byron-bay", cityName: "Byron Bay" }),
  ]);
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/locations/nsw/goulburn"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/locations/vic/wangaratta"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/locations/nsw/wagga-wagga"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/locations/nsw/tamworth"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/locations/nsw/coffs-harbour"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/caregivers/nannies/sa"));
  assert.ok(!byronBayNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!byronBayNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!byronBayNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
