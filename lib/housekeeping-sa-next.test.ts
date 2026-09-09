import assert from "node:assert/strict";
import { test } from "node:test";
import { bookNextLinks, bookNextNotice } from "./book-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { forCarersNextLinks, forCarersNextNotice } from "./for-carers-next";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { toowoombaNextLinks, toowoombaNextNotice } from "./toowoomba-next";
import {
  directoryIsStateSpecialtyPath,
  housekeepingSaNextLinks,
  housekeepingSaNextNotice,
  housekeepingSaNextShows,
} from "./housekeeping-sa-next";

test("housekeepingSaNextNotice names unused SA housekeeper paths without a count or Instant Book", () => {
  assert.match(housekeepingSaNextNotice(), /Housekeepers/);
  assert.match(housekeepingSaNextNotice(), /South Australia/);
  assert.match(housekeepingSaNextNotice(), /Port Lincoln/);
  assert.match(housekeepingSaNextNotice(), /Victor Harbor/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /\d+ open/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Instant Book/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Hire/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /job=/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Mackay/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Rockhampton/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Toowoomba/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Nowra/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Whyalla/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Perth/);
  assert.doesNotMatch(housekeepingSaNextNotice(), /Adelaide/);
  assert.notEqual(housekeepingSaNextNotice(), forCarersNextNotice());
  assert.notEqual(housekeepingSaNextNotice(), perthNextNotice());
  assert.notEqual(housekeepingSaNextNotice(), saNextNotice());
  assert.notEqual(housekeepingSaNextNotice(), toowoombaNextNotice());
  assert.notEqual(housekeepingSaNextNotice(), bookNextNotice());
  assert.notEqual(housekeepingSaNextNotice(), disabilityNextNotice());
});

test("housekeepingSaNextShows is a signed-in family on SA housekeepers only", () => {
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    true,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: true,
      jobAttached: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "wa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "nursing",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: true,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: false,
    }),
    false,
  );
  assert.equal(
    housekeepingSaNextShows({
      isFamily: false,
      specialtySlug: "housekeeping",
      stateSlug: "sa",
      stateSpecialtyPath: true,
    }),
    false,
  );
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping/sa"), true);
  assert.equal(directoryIsSpecialtyPath("/caregivers/housekeeping/sa"), false);
  assert.equal(directoryIsStateSpecialtyPath("/caregivers/housekeeping"), false);
});

test("housekeepingSaNextLinks go to Port Lincoln and Victor Harbor, not Mackay or Perth", () => {
  assert.deepEqual(housekeepingSaNextLinks(), [
    { href: "/locations/sa/port-lincoln", label: "Open Port Lincoln locations" },
    { href: "/locations/sa/victor-harbor", label: "Open Victor Harbor locations" },
  ]);
  assert.notDeepEqual(housekeepingSaNextLinks(), forCarersNextLinks());
  assert.notDeepEqual(housekeepingSaNextLinks(), perthNextLinks());
  assert.notDeepEqual(housekeepingSaNextLinks(), saNextLinks());
  assert.notDeepEqual(housekeepingSaNextLinks(), toowoombaNextLinks());
  assert.notDeepEqual(housekeepingSaNextLinks(), bookNextLinks());
  assert.notDeepEqual(housekeepingSaNextLinks(), disabilityNextLinks());
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/qld/mackay"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/qld/rockhampton"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/qld/toowoomba"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/nsw/nowra"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/sa/whyalla"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/locations/sa/adelaide"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/caregivers/housekeeping/wa/perth"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/caregivers/housekeeping"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!housekeepingSaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!housekeepingSaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
