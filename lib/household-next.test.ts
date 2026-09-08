import assert from "node:assert/strict";
import { test } from "node:test";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { declinedNextLinks, declinedNextNotice } from "./declined-next";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { householdSavedLinks, householdSavedNotice } from "./household-saved";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";

test("householdNextNotice names funding refs without a count or save CTA", () => {
  assert.match(householdNextNotice(), /NDIS/);
  assert.match(householdNextNotice(), /statement/);
  assert.match(householdNextNotice(), /saved/);
  assert.doesNotMatch(householdNextNotice(), /\d+ open/);
  assert.doesNotMatch(householdNextNotice(), /Save household/);
  assert.doesNotMatch(householdNextNotice(), /Copy onto/);
  assert.doesNotMatch(householdNextNotice(), /Instant Book/);
  assert.doesNotMatch(householdNextNotice(), /job=/);
  assert.notEqual(householdNextNotice(), householdSavedNotice());
  assert.notEqual(householdNextNotice(), comingUpNextNotice());
  assert.notEqual(householdNextNotice(), invoiceNextNotice());
  assert.notEqual(householdNextNotice(), statementNextNotice(true));
  assert.notEqual(householdNextNotice(), declinedNextNotice());
});

test("householdNextLinks go to the statement and shortlist, not coming-up", () => {
  assert.deepEqual(householdNextLinks(), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(householdNextLinks(), householdSavedLinks());
  assert.notDeepEqual(householdNextLinks(), comingUpNextLinks());
  assert.notDeepEqual(householdNextLinks(), invoiceNextLinks(true));
  assert.notDeepEqual(householdNextLinks(), statementNextLinks({ isFamily: true, bookingId: "sit-1" }));
  assert.notDeepEqual(householdNextLinks(), declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }));
  assert.ok(!householdNextLinks().some((link) => link.href === "/dashboard#coming-up"));
  assert.ok(!householdNextLinks().some((link) => link.href === "/dashboard/household"));
  assert.ok(!householdNextLinks().some((link) => link.href.includes("job=")));
});
