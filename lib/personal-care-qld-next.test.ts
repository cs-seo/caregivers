import assert from "node:assert/strict";
import { test } from "node:test";
import { brisbaneNextLinks, brisbaneNextNotice } from "./brisbane-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nursingVicNextLinks, nursingVicNextNotice, nursingVicNextShows } from "./nursing-vic-next";
import {
  personalCareNextLinks,
  personalCareNextNotice,
  personalCareNextShows,
} from "./personal-care-next";
import {
  personalCareQldNextLinks,
  personalCareQldNextNotice,
  personalCareQldNextShows,
} from "./personal-care-qld-next";
import {
  personalCareSaNextLinks,
  personalCareSaNextNotice,
  personalCareSaNextShows,
} from "./personal-care-sa-next";

test("personalCareQldNextNotice names unused Moree and Ararat paths without a count or Instant Book", () => {
  assert.match(personalCareQldNextNotice(), /Personal care/);
  assert.match(personalCareQldNextNotice(), /Queensland/);
  assert.match(personalCareQldNextNotice(), /Moree/);
  assert.match(personalCareQldNextNotice(), /Ararat/);
  assert.doesNotMatch(personalCareQldNextNotice(), /\d+ open/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Instant Book/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Hire/);
  assert.doesNotMatch(personalCareQldNextNotice(), /job=/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Brisbane/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Melbourne/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Sydney/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Sunshine Coast/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Adelaide/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Townsville/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Ballarat/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Warwick/);
  assert.doesNotMatch(personalCareQldNextNotice(), /Emerald/);
  assert.notEqual(personalCareQldNextNotice(), brisbaneNextNotice());
  assert.notEqual(personalCareQldNextNotice(), nursingVicNextNotice());
  assert.notEqual(personalCareQldNextNotice(), personalCareSaNextNotice());
  assert.notEqual(personalCareQldNextNotice(), personalCareNextNotice());
});

test("personalCareQldNextShows is a signed-in family on QLD personal care only", () => {
  assert.equal(
    personalCareQldNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    personalCareQldNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    personalCareQldNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareQldNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    personalCareQldNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "qld",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    personalCareQldNextShows({
      isFamily: false,
      specialtySlug: "personal-care",
      stateSlug: "qld",
      stateSpecialtyPath: true,
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
    nursingVicNextShows({
      isFamily: true,
      specialtySlug: "personal-care",
      stateSlug: "qld",
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
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/personal-care/qld"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/personal-care/qld"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/personal-care"), false);
});

test("personalCareQldNextLinks go to Moree and Ararat, not Brisbane or Townsville", () => {
  assert.deepEqual(personalCareQldNextLinks(), [
    { href: "/locations/nsw/moree", label: "Open Moree locations" },
    { href: "/locations/vic/ararat", label: "Open Ararat locations" },
  ]);
  assert.notDeepEqual(personalCareQldNextLinks(), brisbaneNextLinks());
  assert.notDeepEqual(personalCareQldNextLinks(), nursingVicNextLinks());
  assert.notDeepEqual(personalCareQldNextLinks(), personalCareSaNextLinks());
  assert.notDeepEqual(personalCareQldNextLinks(), personalCareNextLinks());
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/qld/brisbane"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/vic/melbourne"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/nsw/sydney"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/caregivers/nursing/vic"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/qld/sunshine-coast"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/sa/adelaide"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/caregivers/personal-care"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/caregivers/personal-care/qld/townsville"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/vic/ballarat"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/qld/warwick"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/locations/qld/emerald"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!personalCareQldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!personalCareQldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
