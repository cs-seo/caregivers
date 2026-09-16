import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareNextLinks, agedCareNextNotice } from "./aged-care-next";
import { byronBayNextLinks, byronBayNextNotice } from "./byron-bay-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import {
  directoryIsStateSpecialtyPath,
  housekeepingSaNextLinks,
  housekeepingSaNextNotice,
  housekeepingSaNextShows,
} from "./housekeeping-sa-next";
import { nanniesSaNextLinks, nanniesSaNextNotice, nanniesSaNextShows } from "./nannies-sa-next";
import {
  agedCareSaNextLinks,
  agedCareSaNextNotice,
  agedCareSaNextShows,
} from "./aged-care-sa-next";

test("agedCareSaNextNotice names unused Barossa and Southern Highlands paths without a count or Instant Book", () => {
  assert.match(agedCareSaNextNotice(), /Aged care/);
  assert.match(agedCareSaNextNotice(), /South Australia/);
  assert.match(agedCareSaNextNotice(), /Barossa/);
  assert.match(agedCareSaNextNotice(), /Southern Highlands/);
  assert.doesNotMatch(agedCareSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Hire/);
  assert.doesNotMatch(agedCareSaNextNotice(), /job=/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Byron Bay/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Margaret River/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Mornington Peninsula/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Goulburn/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Wangaratta/);
  assert.doesNotMatch(agedCareSaNextNotice(), /Sunshine Coast/);
  assert.notEqual(agedCareSaNextNotice(), agedCareNextNotice());
  assert.notEqual(agedCareSaNextNotice(), nanniesSaNextNotice());
  assert.notEqual(agedCareSaNextNotice(), byronBayNextNotice());
  assert.notEqual(agedCareSaNextNotice(), housekeepingSaNextNotice());
});

test("agedCareSaNextShows is a signed-in family on SA aged care only", () => {
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "nannies",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    agedCareSaNextShows({
      isFamily: false,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "aged-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/aged-care/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/aged-care/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/aged-care"), false);
});

test("agedCareSaNextLinks go to Barossa and Southern Highlands, not Byron Bay or Sunshine Coast", () => {
  assert.deepEqual(agedCareSaNextLinks(), [
    { href: "/locations/sa/barossa", label: "Open Barossa locations" },
    { href: "/locations/nsw/southern-highlands", label: "Open Southern Highlands locations" },
  ]);
  assert.notDeepEqual(agedCareSaNextLinks(), agedCareNextLinks());
  assert.notDeepEqual(agedCareSaNextLinks(), nanniesSaNextLinks());
  assert.notDeepEqual(agedCareSaNextLinks(), byronBayNextLinks());
  assert.notDeepEqual(agedCareSaNextLinks(), housekeepingSaNextLinks());
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/locations/nsw/byron-bay"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/locations/wa/margaret-river"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/locations/vic/mornington-peninsula"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/locations/nsw/goulburn"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/locations/vic/wangaratta"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/caregivers/aged-care/qld/sunshine-coast"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/caregivers/aged-care"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!agedCareSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!agedCareSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
