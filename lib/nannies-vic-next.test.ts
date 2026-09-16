import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSchoolVicNextLinks, afterSchoolVicNextNotice, afterSchoolVicNextShows } from "./after-school-vic-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { ipswichNextLinks, ipswichNextNotice } from "./ipswich-next";
import { nanniesVicNextLinks, nanniesVicNextNotice, nanniesVicNextShows } from "./nannies-vic-next";

test("nanniesVicNextNotice names unused Broken Hill and Queanbeyan paths without a count or Instant Book", () => {
  assert.match(nanniesVicNextNotice(), /Nannies/);
  assert.match(nanniesVicNextNotice(), /Victoria/);
  assert.match(nanniesVicNextNotice(), /Broken Hill/);
  assert.match(nanniesVicNextNotice(), /Queanbeyan/);
  assert.doesNotMatch(nanniesVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Hire/);
  assert.doesNotMatch(nanniesVicNextNotice(), /job=/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Ipswich/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Kalgoorlie/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Esperance/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Geraldton/);
  assert.doesNotMatch(nanniesVicNextNotice(), /Albany/);
  assert.notEqual(nanniesVicNextNotice(), afterSchoolVicNextNotice());
  assert.notEqual(nanniesVicNextNotice(), ipswichNextNotice());
});

test("nanniesVicNextShows is a signed-in family on VIC nannies only", () => {
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    nanniesVicNextShows({
      isFamily: false,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolVicNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nannies/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/nannies"), false);
});

test("nanniesVicNextLinks go to Broken Hill and Queanbeyan, not Ipswich or Geraldton", () => {
  assert.deepEqual(nanniesVicNextLinks(), [
    { href: "/locations/nsw/broken-hill", label: "Open Broken Hill locations" },
    { href: "/locations/nsw/queanbeyan", label: "Open Queanbeyan locations" },
  ]);
  assert.notDeepEqual(nanniesVicNextLinks(), afterSchoolVicNextLinks());
  assert.notDeepEqual(nanniesVicNextLinks(), ipswichNextLinks());
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/locations/qld/ipswich"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/locations/wa/kalgoorlie"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/locations/wa/esperance"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/caregivers/after-school-care/vic"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/locations/wa/geraldton"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/locations/wa/albany"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/caregivers/nannies"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/caregivers/nannies/vic/melbourne"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nanniesVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nanniesVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
