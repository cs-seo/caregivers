import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSchoolSaNextLinks, afterSchoolSaNextNotice } from "./after-school-sa-next";
import { hunterValleyNextLinks, hunterValleyNextNotice, hunterValleyNextShows } from "./hunter-valley-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { loginNextLinks, loginNextNotice } from "./login-next";
import { clareNextLinks, clareNextNotice, clareNextShows } from "./clare-next";

test("clareNextNotice names unused Huonville and Tennant Creek paths without a count or Instant Book", () => {
  assert.match(clareNextNotice(), /Clare/);
  assert.match(clareNextNotice(), /Huonville/);
  assert.match(clareNextNotice(), /Tennant Creek/);
  assert.doesNotMatch(clareNextNotice(), /\d+ open/);
  assert.doesNotMatch(clareNextNotice(), /Instant Book/);
  assert.doesNotMatch(clareNextNotice(), /Hire/);
  assert.doesNotMatch(clareNextNotice(), /job=/);
  assert.doesNotMatch(clareNextNotice(), /Ballina/);
  assert.doesNotMatch(clareNextNotice(), /Nelson Bay/);
  assert.doesNotMatch(clareNextNotice(), /Logan/);
  assert.doesNotMatch(clareNextNotice(), /Moreton Bay/);
  assert.doesNotMatch(clareNextNotice(), /Hunter Valley/);
  assert.doesNotMatch(clareNextNotice(), /Yarra Valley/);
  assert.doesNotMatch(clareNextNotice(), /Adelaide Hills/);
  assert.notEqual(clareNextNotice(), afterSchoolSaNextNotice());
  assert.notEqual(clareNextNotice(), hunterValleyNextNotice());
  assert.notEqual(clareNextNotice(), loginNextNotice());
  assert.notEqual(clareNextNotice(), locationBoardNotice("Clare"));
});

test("clareNextShows is a signed-in family on Clare only", () => {
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "sa", citySlug: "clare" }), true);
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "hunter-valley" }), false);
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "tas", citySlug: "huonville" }), false);
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "nt", citySlug: "tennant-creek" }), false);
  assert.equal(clareNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "ballina" }), false);
  assert.equal(clareNextShows({ isFamily: false, stateSlug: "sa", citySlug: "clare" }), false);
  assert.equal(hunterValleyNextShows({ isFamily: true, stateSlug: "sa", citySlug: "clare" }), false);
});

test("clareNextLinks go to Huonville and Tennant Creek, not Ballina or Hunter Valley", () => {
  assert.deepEqual(clareNextLinks(), [
    { href: "/locations/tas/huonville", label: "Open Huonville locations" },
    { href: "/locations/nt/tennant-creek", label: "Open Tennant Creek locations" },
  ]);
  assert.notDeepEqual(clareNextLinks(), afterSchoolSaNextLinks());
  assert.notDeepEqual(clareNextLinks(), hunterValleyNextLinks());
  assert.notDeepEqual(clareNextLinks(), loginNextLinks());
  assert.notDeepEqual(clareNextLinks(), [locationBoardLink({ city: "clare", cityName: "Clare" })]);
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/nsw/ballina"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/nsw/nelson-bay"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/caregivers/after-school-care/sa"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/qld/logan"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/qld/moreton-bay"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/nsw/hunter-valley"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/vic/yarra-valley"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/locations/sa/adelaide-hills"));
  assert.ok(!clareNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!clareNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!clareNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
