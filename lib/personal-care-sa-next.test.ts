import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nursingSaNextLinks, nursingSaNextNotice, nursingSaNextShows } from "./nursing-sa-next";
import { personalCareNextLinks, personalCareNextNotice, personalCareNextShows } from "./personal-care-next";
import {
  personalCareSaNextLinks,
  personalCareSaNextNotice,
  personalCareSaNextShows,
} from "./personal-care-sa-next";
import { privacyNextLinks, privacyNextNotice } from "./privacy-next";

test("personalCareSaNextNotice names unused Warwick and Emerald paths without a count or Instant Book", () => {
  assert.match(personalCareSaNextNotice(), /Personal care/);
  assert.match(personalCareSaNextNotice(), /South Australia/);
  assert.match(personalCareSaNextNotice(), /Warwick/);
  assert.match(personalCareSaNextNotice(), /Emerald/);
  assert.doesNotMatch(personalCareSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Hire/);
  assert.doesNotMatch(personalCareSaNextNotice(), /job=/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Naracoorte/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Berri/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Lithgow/);
  assert.doesNotMatch(personalCareSaNextNotice(), /Warragul/);
  assert.doesNotMatch(personalCareSaNextNotice(), /privacy/);
  assert.notEqual(personalCareSaNextNotice(), privacyNextNotice());
  assert.notEqual(personalCareSaNextNotice(), nursingSaNextNotice());
  assert.notEqual(personalCareSaNextNotice(), personalCareNextNotice());
});

test("personalCareSaNextShows is a signed-in family on SA personal care only", () => {
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    personalCareSaNextShows({
      isFamily: false,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nursingSaNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      specialtyPath: false,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/personal-care/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/personal-care/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/personal-care"), false);
});

test("personalCareSaNextLinks go to Warwick and Emerald, not Naracoorte or Lithgow", () => {
  assert.deepEqual(personalCareSaNextLinks(), [
    { href: "/locations/qld/warwick", label: "Open Warwick locations" },
    { href: "/locations/qld/emerald", label: "Open Emerald locations" },
  ]);
  assert.notDeepEqual(personalCareSaNextLinks(), privacyNextLinks());
  assert.notDeepEqual(personalCareSaNextLinks(), nursingSaNextLinks());
  assert.notDeepEqual(personalCareSaNextLinks(), personalCareNextLinks());
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/privacy"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/locations/sa/naracoorte"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/locations/sa/berri"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/locations/nsw/lithgow"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/locations/vic/warragul"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/caregivers/nursing/sa"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/caregivers/personal-care"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!personalCareSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!personalCareSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
