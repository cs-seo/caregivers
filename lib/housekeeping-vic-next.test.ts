import assert from "node:assert/strict";
import { test } from "node:test";
import { dalbyNextLinks, dalbyNextNotice } from "./dalby-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { disabilitySaNextLinks, disabilitySaNextNotice, disabilitySaNextShows } from "./disability-sa-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import {
  housekeepingVicNextLinks,
  housekeepingVicNextNotice,
  housekeepingVicNextShows,
} from "./housekeeping-vic-next";

test("housekeepingVicNextNotice names unused Derby and New Norfolk paths without a count or Instant Book", () => {
  assert.match(housekeepingVicNextNotice(), /Housekeepers/);
  assert.match(housekeepingVicNextNotice(), /Victoria/);
  assert.match(housekeepingVicNextNotice(), /Derby/);
  assert.match(housekeepingVicNextNotice(), /New Norfolk/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Hire/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /job=/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Dalby/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Colac/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Portland/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Northam/);
  assert.doesNotMatch(housekeepingVicNextNotice(), /Collie/);
  assert.notEqual(housekeepingVicNextNotice(), dalbyNextNotice());
  assert.notEqual(housekeepingVicNextNotice(), disabilitySaNextNotice());
});

test("housekeepingVicNextShows is a signed-in family on VIC housekeepers only", () => {
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "disability-support",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: false,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    disabilitySaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/housekeeping/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping"), false);
});

test("housekeepingVicNextLinks go to Derby and New Norfolk, not Dalby or Northam", () => {
  assert.deepEqual(housekeepingVicNextLinks(), [
    { href: "/locations/wa/derby", label: "Open Derby locations" },
    { href: "/locations/tas/new-norfolk", label: "Open New Norfolk locations" },
  ]);
  assert.notDeepEqual(housekeepingVicNextLinks(), dalbyNextLinks());
  assert.notDeepEqual(housekeepingVicNextLinks(), disabilitySaNextLinks());
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/locations/qld/dalby"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/locations/vic/colac"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/locations/vic/portland"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/caregivers/disability-support/sa"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/locations/wa/northam"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/locations/wa/collie"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/caregivers/housekeeping"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!housekeepingVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!housekeepingVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
