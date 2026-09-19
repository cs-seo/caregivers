import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { paidBookingLinks, paidBookingNotice } from "./booking-paid";
import {
  householdSavedLinks,
  householdSavedNotice,
  isHouseholdSavedFlash,
} from "./household-saved";

test("isHouseholdSavedFlash only treats saved=1 as the leftover", () => {
  assert.equal(isHouseholdSavedFlash("1"), true);
  assert.equal(isHouseholdSavedFlash(["1"]), true);
  assert.equal(isHouseholdSavedFlash("0"), false);
  assert.equal(isHouseholdSavedFlash("copied"), false);
  assert.equal(isHouseholdSavedFlash(undefined), false);
});

test("householdSavedNotice names defaults without a count or copy-onto-sits CTA", () => {
  assert.match(householdSavedNotice(), /Household saved/);
  assert.match(householdSavedNotice(), /handover defaults/);
  assert.doesNotMatch(householdSavedNotice(), /\d+ open/);
  assert.doesNotMatch(householdSavedNotice(), /Copy onto/);
  assert.doesNotMatch(householdSavedNotice(), /job=/);
  assert.notEqual(householdSavedNotice(), familyStartNotice());
  assert.notEqual(
    householdSavedNotice(),
    paidBookingNotice({ carerName: "Priya Nair", handoverComplete: false }),
  );
});

test("householdSavedLinks go to Coming up and the directory, not post-a-job", () => {
  assert.deepEqual(householdSavedLinks(), [
    { href: "/dashboard#coming-up", label: "Check upcoming sits" },
    { href: "/caregivers", label: "Browse verified carers" },
  ]);
  assert.notDeepEqual(householdSavedLinks(), familyStartLinks());
  assert.ok(!householdSavedLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(
    !paidBookingLinks({ bookingId: "demo", handoverComplete: false }).some((link) =>
      householdSavedLinks().some((saved) => saved.href === link.href && saved.label === link.label),
    ),
  );
});
