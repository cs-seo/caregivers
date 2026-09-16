import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareVicNextLinks, agedCareVicNextNotice, agedCareVicNextShows } from "./aged-care-vic-next";
import { armidaleNextLinks, armidaleNextNotice } from "./armidale-next";
import { babysittersQldNextLinks, babysittersQldNextNotice, babysittersQldNextShows } from "./babysitters-qld-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";

test("agedCareVicNextNotice names unused Griffith and Taree paths without a count or Instant Book", () => {
  assert.match(agedCareVicNextNotice(), /Aged care/);
  assert.match(agedCareVicNextNotice(), /Victoria/);
  assert.match(agedCareVicNextNotice(), /Griffith/);
  assert.match(agedCareVicNextNotice(), /Taree/);
  assert.doesNotMatch(agedCareVicNextNotice(), /\d+ open/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Instant Book/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Hire/);
  assert.doesNotMatch(agedCareVicNextNotice(), /job=/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Armidale/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Mildura/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Warrnambool/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Port Macquarie/);
  assert.doesNotMatch(agedCareVicNextNotice(), /Albury/);
  assert.notEqual(agedCareVicNextNotice(), babysittersQldNextNotice());
  assert.notEqual(agedCareVicNextNotice(), armidaleNextNotice());
});

test("agedCareVicNextShows is a signed-in family on VIC aged care only", () => {
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    agedCareVicNextShows({
      isFamily: false,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersQldNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "vic",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/aged-care/vic"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/aged-care/vic"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/aged-care"), false);
});

test("agedCareVicNextLinks go to Griffith and Taree, not Armidale or Port Macquarie", () => {
  assert.deepEqual(agedCareVicNextLinks(), [
    { href: "/locations/nsw/griffith", label: "Open Griffith locations" },
    { href: "/locations/nsw/taree", label: "Open Taree locations" },
  ]);
  assert.notDeepEqual(agedCareVicNextLinks(), babysittersQldNextLinks());
  assert.notDeepEqual(agedCareVicNextLinks(), armidaleNextLinks());
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/locations/nsw/armidale"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/locations/vic/mildura"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/locations/vic/warrnambool"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/caregivers/babysitters/qld"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/locations/nsw/port-macquarie"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/locations/nsw/albury"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/caregivers/aged-care"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/caregivers/aged-care/vic/melbourne"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!agedCareVicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!agedCareVicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
