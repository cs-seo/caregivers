import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice, disabilityNextShows } from "./disability-next";
import { disabilitySaNextLinks, disabilitySaNextNotice, disabilitySaNextShows } from "./disability-sa-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { personalCareSaNextLinks, personalCareSaNextNotice, personalCareSaNextShows } from "./personal-care-sa-next";
import { termsNextLinks, termsNextNotice } from "./terms-next";

test("disabilitySaNextNotice names unused Northam and Collie paths without a count or Instant Book", () => {
  assert.match(disabilitySaNextNotice(), /Disability support/);
  assert.match(disabilitySaNextNotice(), /South Australia/);
  assert.match(disabilitySaNextNotice(), /Northam/);
  assert.match(disabilitySaNextNotice(), /Collie/);
  assert.doesNotMatch(disabilitySaNextNotice(), /\d+ open/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Instant Book/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Hire/);
  assert.doesNotMatch(disabilitySaNextNotice(), /job=/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Bairnsdale/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Castlemaine/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Warwick/);
  assert.doesNotMatch(disabilitySaNextNotice(), /Emerald/);
  assert.doesNotMatch(disabilitySaNextNotice(), /terms/);
  assert.notEqual(disabilitySaNextNotice(), termsNextNotice());
  assert.notEqual(disabilitySaNextNotice(), personalCareSaNextNotice());
  assert.notEqual(disabilitySaNextNotice(), disabilityNextNotice());
});

test("disabilitySaNextShows is a signed-in family on SA disability support only", () => {
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "wa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: false,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilityNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      specialtyPath: false,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/disability-support/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/disability-support/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/disability-support"), false);
});

test("disabilitySaNextLinks go to Northam and Collie, not Bairnsdale or Warwick", () => {
  assert.deepEqual(disabilitySaNextLinks(), [
    { href: "/locations/wa/northam", label: "Open Northam locations" },
    { href: "/locations/wa/collie", label: "Open Collie locations" },
  ]);
  assert.notDeepEqual(disabilitySaNextLinks(), termsNextLinks());
  assert.notDeepEqual(disabilitySaNextLinks(), personalCareSaNextLinks());
  assert.notDeepEqual(disabilitySaNextLinks(), disabilityNextLinks());
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/terms"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/locations/vic/bairnsdale"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/locations/vic/castlemaine"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/caregivers/personal-care/sa"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/locations/qld/warwick"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/locations/qld/emerald"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/caregivers/disability-support"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/caregivers/disability-support/wa"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!disabilitySaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!disabilitySaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
