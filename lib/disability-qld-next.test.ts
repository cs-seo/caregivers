import assert from "node:assert/strict";
import { test } from "node:test";
import { cairnsNextLinks, cairnsNextNotice } from "./cairns-next";
import {
  companionCareQldNextLinks,
  companionCareQldNextNotice,
  companionCareQldNextShows,
} from "./companion-care-qld-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import {
  disabilityQldNextLinks,
  disabilityQldNextNotice,
  disabilityQldNextShows,
} from "./disability-qld-next";
import { disabilitySaNextLinks, disabilitySaNextNotice, disabilitySaNextShows } from "./disability-sa-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";

test("disabilityQldNextNotice names unused Gawler and Palmerston paths without a count or Instant Book", () => {
  assert.match(disabilityQldNextNotice(), /Disability support/);
  assert.match(disabilityQldNextNotice(), /Queensland/);
  assert.match(disabilityQldNextNotice(), /Gawler/);
  assert.match(disabilityQldNextNotice(), /Palmerston/);
  assert.doesNotMatch(disabilityQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Hire/);
  assert.doesNotMatch(disabilityQldNextNotice(), /job=/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Cairns/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Karratha/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Port Pirie/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Mount Isa/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Port Hedland/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Northam/);
  assert.doesNotMatch(disabilityQldNextNotice(), /Collie/);
  assert.notEqual(disabilityQldNextNotice(), cairnsNextNotice());
  assert.notEqual(disabilityQldNextNotice(), companionCareQldNextNotice());
  assert.notEqual(disabilityQldNextNotice(), disabilitySaNextNotice());
});

test("disabilityQldNextShows is a signed-in family on QLD disability support only", () => {
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "companion-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    disabilityQldNextShows({
      isFamily: false,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    companionCareQldNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/disability-support/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/disability-support/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/disability-support"), false);
});

test("disabilityQldNextLinks go to Gawler and Palmerston, not Cairns or Karratha", () => {
  assert.deepEqual(disabilityQldNextLinks(), [
    { href: "/locations/sa/gawler", label: "Open Gawler locations" },
    { href: "/locations/nt/palmerston", label: "Open Palmerston locations" },
  ]);
  assert.notDeepEqual(disabilityQldNextLinks(), cairnsNextLinks());
  assert.notDeepEqual(disabilityQldNextLinks(), companionCareQldNextLinks());
  assert.notDeepEqual(disabilityQldNextLinks(), disabilitySaNextLinks());
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/qld/cairns"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/wa/karratha"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/sa/port-pirie"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/caregivers/companion-care/qld"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/qld/mount-isa"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/wa/port-hedland"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/wa/northam"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/locations/wa/collie"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/caregivers/disability-support"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/caregivers/disability-support/qld/brisbane"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!disabilityQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!disabilityQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
