import assert from "node:assert/strict";
import { test } from "node:test";
import { coffsHarbourNextLinks, coffsHarbourNextNotice } from "./coffs-harbour-next";
import { companionCareSaNextLinks, companionCareSaNextNotice, companionCareSaNextShows } from "./companion-care-sa-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import {
  directoryIsStateSpecialtyPath,
  housekeepingSaNextLinks,
  housekeepingSaNextNotice,
  housekeepingSaNextShows,
} from "./housekeeping-sa-next";
import { specialNeedsSaNextLinks, specialNeedsSaNextNotice } from "./special-needs-sa-next";
import { waNextLinks, waNextNotice } from "./wa-next";
import { nanniesSaNextLinks, nanniesSaNextNotice, nanniesSaNextShows } from "./nannies-sa-next";

test("nanniesSaNextNotice names unused Goulburn and Wangaratta paths without a count or Instant Book", () => {
  assert.match(nanniesSaNextNotice(), /Nannies/);
  assert.match(nanniesSaNextNotice(), /South Australia/);
  assert.match(nanniesSaNextNotice(), /Goulburn/);
  assert.match(nanniesSaNextNotice(), /Wangaratta/);
  assert.doesNotMatch(nanniesSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Hire/);
  assert.doesNotMatch(nanniesSaNextNotice(), /job=/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Coffs Harbour/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Wagga Wagga/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Tamworth/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Launceston/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Mount Gambier/);
  assert.doesNotMatch(nanniesSaNextNotice(), /Mandurah/);
  assert.notEqual(nanniesSaNextNotice(), companionCareSaNextNotice());
  assert.notEqual(nanniesSaNextNotice(), coffsHarbourNextNotice());
  assert.notEqual(nanniesSaNextNotice(), housekeepingSaNextNotice());
  assert.notEqual(nanniesSaNextNotice(), specialNeedsSaNextNotice());
  assert.notEqual(nanniesSaNextNotice(), waNextNotice());
});

test("nanniesSaNextShows is a signed-in family on SA nannies only", () => {
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "wa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: false,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nannies/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies"), false);
});

test("nanniesSaNextLinks go to Goulburn and Wangaratta, not Wagga Wagga or Tamworth", () => {
  assert.deepEqual(nanniesSaNextLinks(), [
    { href: "/locations/nsw/goulburn", label: "Open Goulburn locations" },
    { href: "/locations/vic/wangaratta", label: "Open Wangaratta locations" },
  ]);
  assert.notDeepEqual(nanniesSaNextLinks(), companionCareSaNextLinks());
  assert.notDeepEqual(nanniesSaNextLinks(), coffsHarbourNextLinks());
  assert.notDeepEqual(nanniesSaNextLinks(), housekeepingSaNextLinks());
  assert.notDeepEqual(nanniesSaNextLinks(), specialNeedsSaNextLinks());
  assert.notDeepEqual(nanniesSaNextLinks(), waNextLinks());
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/locations/nsw/coffs-harbour"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/locations/nsw/wagga-wagga"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/locations/nsw/tamworth"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/locations/tas/launceston"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/locations/sa/mount-gambier"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/caregivers/nannies/wa"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/caregivers/nannies"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nanniesSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nanniesSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
