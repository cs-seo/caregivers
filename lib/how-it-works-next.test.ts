import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { lismoreNextLinks, lismoreNextNotice } from "./lismore-next";
import { registerNextLinks, registerNextNotice } from "./register-next";
import { specialNeedsSaNextLinks, specialNeedsSaNextNotice } from "./special-needs-sa-next";
import { howItWorksNextLinks, howItWorksNextNotice, howItWorksNextShows } from "./how-it-works-next";

test("howItWorksNextNotice names unused Alice Springs and Broome paths without a count or Instant Book", () => {
  assert.match(howItWorksNextNotice(), /escrow/);
  assert.match(howItWorksNextNotice(), /Alice Springs/);
  assert.match(howItWorksNextNotice(), /Broome/);
  assert.doesNotMatch(howItWorksNextNotice(), /\d+ open/);
  assert.doesNotMatch(howItWorksNextNotice(), /Instant Book/);
  assert.doesNotMatch(howItWorksNextNotice(), /Hire/);
  assert.doesNotMatch(howItWorksNextNotice(), /job=/);
  assert.doesNotMatch(howItWorksNextNotice(), /Shepparton/);
  assert.doesNotMatch(howItWorksNextNotice(), /Hobart/);
  assert.doesNotMatch(howItWorksNextNotice(), /special-needs/);
  assert.doesNotMatch(howItWorksNextNotice(), /Lismore/);
  assert.doesNotMatch(howItWorksNextNotice(), /Bathurst/);
  assert.doesNotMatch(howItWorksNextNotice(), /Dubbo/);
  assert.doesNotMatch(howItWorksNextNotice(), /Port Lincoln/);
  assert.doesNotMatch(howItWorksNextNotice(), /Bendigo/);
  assert.notEqual(howItWorksNextNotice(), specialNeedsSaNextNotice());
  assert.notEqual(howItWorksNextNotice(), guidesIndexNextNotice());
  assert.notEqual(howItWorksNextNotice(), guideNextNotice());
  assert.notEqual(howItWorksNextNotice(), familyStartNotice());
  assert.notEqual(howItWorksNextNotice(), registerNextNotice());
  assert.notEqual(howItWorksNextNotice(), lismoreNextNotice());
});

test("howItWorksNextShows is only a signed-in family", () => {
  assert.equal(howItWorksNextShows({ isFamily: true }), true);
  assert.equal(howItWorksNextShows({ isFamily: false }), false);
});

test("howItWorksNextLinks go to Alice Springs and Broome, not Shepparton or Hobart", () => {
  assert.deepEqual(howItWorksNextLinks(), [
    { href: "/locations/nt/alice-springs", label: "Open Alice Springs locations" },
    { href: "/locations/wa/broome", label: "Open Broome locations" },
  ]);
  assert.notDeepEqual(howItWorksNextLinks(), specialNeedsSaNextLinks());
  assert.notDeepEqual(howItWorksNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(howItWorksNextLinks(), familyStartLinks());
  assert.notDeepEqual(howItWorksNextLinks(), registerNextLinks());
  assert.notDeepEqual(howItWorksNextLinks(), lismoreNextLinks());
  assert.notDeepEqual(
    howItWorksNextLinks(),
    guideNextLinks({
      specialtySlug: "nannies",
      specialtyPlural: "Nannies",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/locations/vic/shepparton"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/locations/tas/hobart"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/caregivers/special-needs/sa"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/locations/nsw/lismore"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/locations/nsw/bathurst"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/locations/nsw/dubbo"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/how-it-works"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!howItWorksNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!howItWorksNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
