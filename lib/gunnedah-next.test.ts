import assert from "node:assert/strict";
import { test } from "node:test";
import { babysittersSaNextLinks, babysittersSaNextNotice } from "./babysitters-sa-next";
import { clareNextLinks, clareNextNotice, clareNextShows } from "./clare-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { gunnedahNextLinks, gunnedahNextNotice, gunnedahNextShows } from "./gunnedah-next";

test("gunnedahNextNotice names unused Yeppoon and Kingaroy paths without a count or Instant Book", () => {
  assert.match(gunnedahNextNotice(), /Gunnedah/);
  assert.match(gunnedahNextNotice(), /Yeppoon/);
  assert.match(gunnedahNextNotice(), /Kingaroy/);
  assert.doesNotMatch(gunnedahNextNotice(), /\d+ open/);
  assert.doesNotMatch(gunnedahNextNotice(), /Instant Book/);
  assert.doesNotMatch(gunnedahNextNotice(), /Hire/);
  assert.doesNotMatch(gunnedahNextNotice(), /job=/);
  assert.doesNotMatch(gunnedahNextNotice(), /Parkes/);
  assert.doesNotMatch(gunnedahNextNotice(), /Cowra/);
  assert.doesNotMatch(gunnedahNextNotice(), /Clare/);
  assert.doesNotMatch(gunnedahNextNotice(), /Huonville/);
  assert.doesNotMatch(gunnedahNextNotice(), /Tennant Creek/);
  assert.doesNotMatch(gunnedahNextNotice(), /Ballina/);
  assert.doesNotMatch(gunnedahNextNotice(), /Logan/);
  assert.notEqual(gunnedahNextNotice(), babysittersSaNextNotice());
  assert.notEqual(gunnedahNextNotice(), clareNextNotice());
  assert.notEqual(gunnedahNextNotice(), locationBoardNotice("Gunnedah"));
});

test("gunnedahNextShows is a signed-in family on Gunnedah only", () => {
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "gunnedah" }), true);
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "parkes" }), false);
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "qld", citySlug: "yeppoon" }), false);
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "qld", citySlug: "kingaroy" }), false);
  assert.equal(gunnedahNextShows({ isFamily: true, stateSlug: "sa", citySlug: "clare" }), false);
  assert.equal(gunnedahNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "gunnedah" }), false);
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "gunnedah" }), false);
});

test("gunnedahNextLinks go to Yeppoon and Kingaroy, not Parkes or Clare", () => {
  assert.deepEqual(gunnedahNextLinks(), [
    { href: "/locations/qld/yeppoon", label: "Open Yeppoon locations" },
    { href: "/locations/qld/kingaroy", label: "Open Kingaroy locations" },
  ]);
  assert.notDeepEqual(gunnedahNextLinks(), babysittersSaNextLinks());
  assert.notDeepEqual(gunnedahNextLinks(), clareNextLinks());
  assert.notDeepEqual(gunnedahNextLinks(), [locationBoardLink({ city: "gunnedah", cityName: "Gunnedah" })]);
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/nsw/parkes"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/nsw/cowra"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/caregivers/babysitters/sa"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/sa/clare"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/tas/huonville"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/nt/tennant-creek"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/nsw/ballina"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/locations/qld/logan"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!gunnedahNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!gunnedahNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
