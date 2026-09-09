import assert from "node:assert/strict";
import { test } from "node:test";
import { companionCareSaNextLinks, companionCareSaNextNotice } from "./companion-care-sa-next";
import { howItWorksNextLinks, howItWorksNextNotice } from "./how-it-works-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { lismoreNextLinks, lismoreNextNotice } from "./lismore-next";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { toowoombaNextLinks, toowoombaNextNotice } from "./toowoomba-next";
import { coffsHarbourNextLinks, coffsHarbourNextNotice, coffsHarbourNextShows } from "./coffs-harbour-next";

test("coffsHarbourNextNotice names unused NSW city hubs without a count or Instant Book", () => {
  assert.match(coffsHarbourNextNotice(), /Coffs Harbour/);
  assert.match(coffsHarbourNextNotice(), /Wagga Wagga/);
  assert.match(coffsHarbourNextNotice(), /Tamworth/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /\d+ open/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Instant Book/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Hire/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /job=/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Launceston/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Mount Gambier/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Alice Springs/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Broome/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Lismore/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Bathurst/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Dubbo/);
  assert.doesNotMatch(coffsHarbourNextNotice(), /Shepparton/);
  assert.notEqual(coffsHarbourNextNotice(), companionCareSaNextNotice());
  assert.notEqual(coffsHarbourNextNotice(), howItWorksNextNotice());
  assert.notEqual(coffsHarbourNextNotice(), lismoreNextNotice());
  assert.notEqual(coffsHarbourNextNotice(), toowoombaNextNotice());
  assert.notEqual(coffsHarbourNextNotice(), locationNextNotice());
  assert.notEqual(coffsHarbourNextNotice(), locationBoardNotice("Coffs Harbour"));
});

test("coffsHarbourNextShows is a signed-in family on Coffs Harbour only", () => {
  assert.equal(
    coffsHarbourNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "coffs-harbour" }),
    true,
  );
  assert.equal(coffsHarbourNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "lismore" }), false);
  assert.equal(coffsHarbourNextShows({ isFamily: true, stateSlug: "qld", citySlug: "toowoomba" }), false);
  assert.equal(
    coffsHarbourNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "coffs-harbour" }),
    false,
  );
});

test("coffsHarbourNextLinks go to Wagga Wagga and Tamworth, not Launceston or Lismore", () => {
  assert.deepEqual(coffsHarbourNextLinks(), [
    { href: "/locations/nsw/wagga-wagga", label: "Open Wagga Wagga locations" },
    { href: "/locations/nsw/tamworth", label: "Open Tamworth locations" },
  ]);
  assert.notDeepEqual(coffsHarbourNextLinks(), companionCareSaNextLinks());
  assert.notDeepEqual(coffsHarbourNextLinks(), howItWorksNextLinks());
  assert.notDeepEqual(coffsHarbourNextLinks(), lismoreNextLinks());
  assert.notDeepEqual(coffsHarbourNextLinks(), toowoombaNextLinks());
  assert.notDeepEqual(coffsHarbourNextLinks(), locationNextLinks());
  assert.notDeepEqual(coffsHarbourNextLinks(), [
    locationBoardLink({ city: "coffs-harbour", cityName: "Coffs Harbour" }),
  ]);
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/tas/launceston"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/sa/mount-gambier"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/nt/alice-springs"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/wa/broome"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/nsw/lismore"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/nsw/bathurst"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/locations/nsw/dubbo"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/caregivers/companion-care/sa"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!coffsHarbourNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!coffsHarbourNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
