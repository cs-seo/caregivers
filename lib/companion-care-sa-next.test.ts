import assert from "node:assert/strict";
import { test } from "node:test";
import { boardNextLinks, boardNextNotice } from "./board-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { geelongNextLinks, geelongNextNotice } from "./geelong-next";
import {
  directoryIsStateSpecialtyPath,
  housekeepingSaNextLinks,
  housekeepingSaNextNotice,
  housekeepingSaNextShows,
} from "./housekeeping-sa-next";
import { howItWorksNextLinks, howItWorksNextNotice } from "./how-it-works-next";
import { specialNeedsSaNextLinks, specialNeedsSaNextNotice, specialNeedsSaNextShows } from "./special-needs-sa-next";
import {
  companionCareSaNextLinks,
  companionCareSaNextNotice,
  companionCareSaNextShows,
} from "./companion-care-sa-next";

test("companionCareSaNextNotice names unused Launceston and Mount Gambier paths without a count or Instant Book", () => {
  assert.match(companionCareSaNextNotice(), /Companion carers/);
  assert.match(companionCareSaNextNotice(), /South Australia/);
  assert.match(companionCareSaNextNotice(), /Launceston/);
  assert.match(companionCareSaNextNotice(), /Mount Gambier/);
  assert.doesNotMatch(companionCareSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Hire/);
  assert.doesNotMatch(companionCareSaNextNotice(), /job=/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Alice Springs/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Broome/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Shepparton/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Hobart/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Port Lincoln/);
  assert.doesNotMatch(companionCareSaNextNotice(), /Geelong/);
  assert.notEqual(companionCareSaNextNotice(), howItWorksNextNotice());
  assert.notEqual(companionCareSaNextNotice(), specialNeedsSaNextNotice());
  assert.notEqual(companionCareSaNextNotice(), housekeepingSaNextNotice());
  assert.notEqual(companionCareSaNextNotice(), geelongNextNotice());
  assert.notEqual(companionCareSaNextNotice(), boardNextNotice());
});

test("companionCareSaNextShows is a signed-in family on SA companion care only", () => {
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: false,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/companion-care/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/companion-care"), false);
});

test("companionCareSaNextLinks go to Launceston and Mount Gambier, not Alice Springs or Shepparton", () => {
  assert.deepEqual(companionCareSaNextLinks(), [
    { href: "/locations/tas/launceston", label: "Open Launceston locations" },
    { href: "/locations/sa/mount-gambier", label: "Open Mount Gambier locations" },
  ]);
  assert.notDeepEqual(companionCareSaNextLinks(), howItWorksNextLinks());
  assert.notDeepEqual(companionCareSaNextLinks(), specialNeedsSaNextLinks());
  assert.notDeepEqual(companionCareSaNextLinks(), housekeepingSaNextLinks());
  assert.notDeepEqual(companionCareSaNextLinks(), geelongNextLinks());
  assert.notDeepEqual(companionCareSaNextLinks(), boardNextLinks());
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/locations/nt/alice-springs"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/locations/wa/broome"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/how-it-works"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/locations/vic/shepparton"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/locations/tas/hobart"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/caregivers/companion-care/vic/geelong"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/caregivers/companion-care"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!companionCareSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!companionCareSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
