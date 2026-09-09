import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guestBrowseLinks, guestBrowseNotice } from "./guest-browse";
import { householdSavedLinks } from "./household-saved";
import { legalNextLinks, legalNextNotice } from "./legal-next";

test("legalNextNotice names browse and the board without a count or post-a-job", () => {
  assert.match(legalNextNotice(), /escrow and checks/);
  assert.match(legalNextNotice(), /Browse verified carers/);
  assert.match(legalNextNotice(), /open care requests/);
  assert.doesNotMatch(legalNextNotice(), /\d+ open/);
  assert.doesNotMatch(legalNextNotice(), /post a request/);
  assert.doesNotMatch(legalNextNotice(), /job=/);
  assert.notEqual(legalNextNotice(), familyStartNotice());
  assert.notEqual(legalNextNotice(), guestBrowseNotice());
});

test("legalNextLinks go to the directory and job board, not post-a-job", () => {
  assert.deepEqual(legalNextLinks(), [
    { href: "/caregivers", label: "Browse verified carers" },
    { href: "/care-requests", label: "Open care requests" },
  ]);
  assert.notDeepEqual(legalNextLinks(), familyStartLinks());
  assert.notDeepEqual(legalNextLinks(), guestBrowseLinks());
  assert.notDeepEqual(legalNextLinks(), householdSavedLinks());
  assert.ok(!legalNextLinks().some((link) => link.href === "/post-a-job"));
});
