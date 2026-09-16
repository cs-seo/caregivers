import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { housekeepingVicNextLinks, housekeepingVicNextNotice, housekeepingVicNextShows } from "./housekeeping-vic-next";
import { nanniesQldNextLinks, nanniesQldNextNotice, nanniesQldNextShows } from "./nannies-qld-next";
import { swanHillNextLinks, swanHillNextNotice } from "./swan-hill-next";

test("nanniesQldNextNotice names unused Katoomba and Devonport paths without a count or Instant Book", () => {
  assert.match(nanniesQldNextNotice(), /Nannies/);
  assert.match(nanniesQldNextNotice(), /Queensland/);
  assert.match(nanniesQldNextNotice(), /Katoomba/);
  assert.match(nanniesQldNextNotice(), /Devonport/);
  assert.doesNotMatch(nanniesQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Hire/);
  assert.doesNotMatch(nanniesQldNextNotice(), /job=/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Swan Hill/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Benalla/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Carnarvon/);
  assert.doesNotMatch(nanniesQldNextNotice(), /Derby/);
  assert.doesNotMatch(nanniesQldNextNotice(), /New Norfolk/);
  assert.notEqual(nanniesQldNextNotice(), swanHillNextNotice());
  assert.notEqual(nanniesQldNextNotice(), housekeepingVicNextNotice());
});

test("nanniesQldNextShows is a signed-in family on QLD nannies only", () => {
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    nanniesQldNextShows({
      isFamily: false,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nannies/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies"), false);
});

test("nanniesQldNextLinks go to Katoomba and Devonport, not Swan Hill or Derby", () => {
  assert.deepEqual(nanniesQldNextLinks(), [
    { href: "/locations/nsw/katoomba", label: "Open Katoomba locations" },
    { href: "/locations/tas/devonport", label: "Open Devonport locations" },
  ]);
  assert.notDeepEqual(nanniesQldNextLinks(), swanHillNextLinks());
  assert.notDeepEqual(nanniesQldNextLinks(), housekeepingVicNextLinks());
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/locations/vic/swan-hill"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/locations/vic/benalla"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/locations/wa/carnarvon"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/caregivers/housekeeping/vic"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/locations/wa/derby"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/locations/tas/new-norfolk"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/caregivers/nannies"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/caregivers/nannies/qld/gold-coast"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nanniesQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nanniesQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
