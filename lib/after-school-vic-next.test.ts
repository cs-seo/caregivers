import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSchoolVicNextLinks, afterSchoolVicNextNotice, afterSchoolVicNextShows } from "./after-school-vic-next";
import { agedCareVicNextLinks, agedCareVicNextNotice, agedCareVicNextShows } from "./aged-care-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { herveyBayNextLinks, herveyBayNextNotice } from "./hervey-bay-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";

test("afterSchoolVicNextNotice names unused Geraldton and Albany paths without a count or Instant Book", () => {
  assert.match(afterSchoolVicNextNotice(), /After-school/);
  assert.match(afterSchoolVicNextNotice(), /Victoria/);
  assert.match(afterSchoolVicNextNotice(), /Geraldton/);
  assert.match(afterSchoolVicNextNotice(), /Albany/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Hire/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /job=/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Hervey Bay/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Bunbury/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Ulverstone/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Griffith/);
  assert.doesNotMatch(afterSchoolVicNextNotice(), /Taree/);
  assert.notEqual(afterSchoolVicNextNotice(), agedCareVicNextNotice());
  assert.notEqual(afterSchoolVicNextNotice(), herveyBayNextNotice());
});

test("afterSchoolVicNextShows is a signed-in family on VIC after-school care only", () => {
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: false,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/after-school-care/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/after-school-care/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/after-school-care"), false);
});

test("afterSchoolVicNextLinks go to Geraldton and Albany, not Hervey Bay or Griffith", () => {
  assert.deepEqual(afterSchoolVicNextLinks(), [
    { href: "/locations/wa/geraldton", label: "Open Geraldton locations" },
    { href: "/locations/wa/albany", label: "Open Albany locations" },
  ]);
  assert.notDeepEqual(afterSchoolVicNextLinks(), agedCareVicNextLinks());
  assert.notDeepEqual(afterSchoolVicNextLinks(), herveyBayNextLinks());
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/locations/qld/hervey-bay"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/locations/wa/bunbury"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/locations/tas/ulverstone"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/caregivers/aged-care/vic"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/locations/nsw/griffith"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/locations/nsw/taree"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/caregivers/after-school-care/vic/melbourne"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!afterSchoolVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!afterSchoolVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
