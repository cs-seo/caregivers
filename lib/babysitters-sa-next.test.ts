import assert from "node:assert/strict";
import { test } from "node:test";
import { afterSchoolSaNextLinks, afterSchoolSaNextNotice, afterSchoolSaNextShows } from "./after-school-sa-next";
import { clareNextLinks, clareNextNotice } from "./clare-next";
import { directoryIsSpecialtyPath } from "./disability-next";
import { directoryIsStateSpecialtyPath } from "./housekeeping-sa-next";
import { nanniesSaNextLinks, nanniesSaNextNotice, nanniesSaNextShows } from "./nannies-sa-next";
import {
  babysittersSaNextLinks,
  babysittersSaNextNotice,
  babysittersSaNextShows,
} from "./babysitters-sa-next";

test("babysittersSaNextNotice names unused Parkes and Cowra paths without a count or Instant Book", () => {
  assert.match(babysittersSaNextNotice(), /Babysitters/);
  assert.match(babysittersSaNextNotice(), /South Australia/);
  assert.match(babysittersSaNextNotice(), /Parkes/);
  assert.match(babysittersSaNextNotice(), /Cowra/);
  assert.doesNotMatch(babysittersSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Hire/);
  assert.doesNotMatch(babysittersSaNextNotice(), /job=/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Clare/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Huonville/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Tennant Creek/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Ballina/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Nelson Bay/);
  assert.doesNotMatch(babysittersSaNextNotice(), /Logan/);
  assert.notEqual(babysittersSaNextNotice(), afterSchoolSaNextNotice());
  assert.notEqual(babysittersSaNextNotice(), nanniesSaNextNotice());
  assert.notEqual(babysittersSaNextNotice(), clareNextNotice());
});

test("babysittersSaNextShows is a signed-in family on SA babysitters only", () => {
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "qld",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "after-school-care",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    babysittersSaNextShows({
      isFamily: false,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    afterSchoolSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    nanniesSaNextShows({
      isFamily: true,
      specialtySlug: "babysitters",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/babysitters/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/babysitters"), false);
});

test("babysittersSaNextLinks go to Parkes and Cowra, not Clare or Ballina", () => {
  assert.deepEqual(babysittersSaNextLinks(), [
    { href: "/locations/nsw/parkes", label: "Open Parkes locations" },
    { href: "/locations/nsw/cowra", label: "Open Cowra locations" },
  ]);
  assert.notDeepEqual(babysittersSaNextLinks(), afterSchoolSaNextLinks());
  assert.notDeepEqual(babysittersSaNextLinks(), nanniesSaNextLinks());
  assert.notDeepEqual(babysittersSaNextLinks(), clareNextLinks());
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/sa/clare"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/tas/huonville"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/nt/tennant-creek"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/nsw/ballina"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/nsw/nelson-bay"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/caregivers/after-school-care/sa"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/locations/qld/logan"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/caregivers/babysitters"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!babysittersSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!babysittersSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
