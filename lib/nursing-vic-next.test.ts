import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nursingSaNextLinks, nursingSaNextNotice, nursingSaNextShows } from "./nursing-sa-next";
import { nursingVicNextLinks, nursingVicNextNotice, nursingVicNextShows } from "./nursing-vic-next";
import { rockhamptonNextLinks, rockhamptonNextNotice } from "./rockhampton-next";
import {
  specialNeedsQldNextLinks,
  specialNeedsQldNextNotice,
  specialNeedsQldNextShows,
} from "./special-needs-qld-next";

test("nursingVicNextNotice names unused Sunshine Coast and Adelaide paths without a count or Instant Book", () => {
  assert.match(nursingVicNextNotice(), /Nurses/);
  assert.match(nursingVicNextNotice(), /Victoria/);
  assert.match(nursingVicNextNotice(), /Sunshine Coast/);
  assert.match(nursingVicNextNotice(), /Adelaide/);
  assert.doesNotMatch(nursingVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(nursingVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(nursingVicNextNotice(), /Hire/);
  assert.doesNotMatch(nursingVicNextNotice(), /job=/);
  assert.doesNotMatch(nursingVicNextNotice(), /Rockhampton/);
  assert.doesNotMatch(nursingVicNextNotice(), /Central Coast/);
  assert.doesNotMatch(nursingVicNextNotice(), /Canberra/);
  assert.doesNotMatch(nursingVicNextNotice(), /Bendigo/);
  assert.doesNotMatch(nursingVicNextNotice(), /Wollongong/);
  assert.doesNotMatch(nursingVicNextNotice(), /Lithgow/);
  assert.doesNotMatch(nursingVicNextNotice(), /Warragul/);
  assert.notEqual(nursingVicNextNotice(), rockhamptonNextNotice());
  assert.notEqual(nursingVicNextNotice(), specialNeedsQldNextNotice());
  assert.notEqual(nursingVicNextNotice(), nursingSaNextNotice());
});

test("nursingVicNextShows is a signed-in family on VIC nursing only", () => {
  assert.equal(
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "special-needs",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    nursingVicNextShows({
      isFamily: false,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    specialNeedsQldNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nursing/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nursing/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nursing"), false);
});

test("nursingVicNextLinks go to Sunshine Coast and Adelaide, not Rockhampton or Bendigo", () => {
  assert.deepEqual(nursingVicNextLinks(), [
    { href: "/locations/qld/sunshine-coast", label: "Open Sunshine Coast locations" },
    { href: "/locations/sa/adelaide", label: "Open Adelaide locations" },
  ]);
  assert.notDeepEqual(nursingVicNextLinks(), rockhamptonNextLinks());
  assert.notDeepEqual(nursingVicNextLinks(), specialNeedsQldNextLinks());
  assert.notDeepEqual(nursingVicNextLinks(), nursingSaNextLinks());
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/qld/rockhampton"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/nsw/central-coast"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/act/canberra"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/caregivers/special-needs/qld"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/nsw/wollongong"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/nsw/lithgow"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/locations/vic/warragul"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/caregivers/nursing"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/caregivers/nursing/vic/melbourne"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nursingVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nursingVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
