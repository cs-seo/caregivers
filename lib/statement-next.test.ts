import assert from "node:assert/strict";
import { test } from "node:test";
import { householdSavedLinks, householdSavedNotice } from "./household-saved";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { postJobNextLinks, postJobNextNotice } from "./post-job-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";

test("statementNextNotice names the CSV without a count or household CTA", () => {
  assert.match(statementNextNotice(true), /HCP or NDIS/);
  assert.match(statementNextNotice(true), /CSV/);
  assert.match(statementNextNotice(true), /invoice/);
  assert.match(statementNextNotice(false), /remittance/);
  assert.doesNotMatch(statementNextNotice(true), /\d+ open/);
  assert.doesNotMatch(statementNextNotice(true), /Copy onto/);
  assert.doesNotMatch(statementNextNotice(true), /household/);
  assert.doesNotMatch(statementNextNotice(true), /job=/);
  assert.notEqual(statementNextNotice(true), invoiceNextNotice());
  assert.notEqual(statementNextNotice(true), householdSavedNotice());
  assert.notEqual(statementNextNotice(true), postJobNextNotice());
});

test("statementNextLinks go to the CSV and a sit invoice, not Household", () => {
  assert.deepEqual(statementNextLinks({ isFamily: true, bookingId: "sit-1" }), [
    { href: "/dashboard/statement/csv", label: "Download the CSV" },
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open a tax invoice" },
  ]);
  assert.deepEqual(statementNextLinks({ isFamily: false, bookingId: "sit-1" }), [
    { href: "/dashboard/statement/csv", label: "Download the CSV" },
    { href: "/dashboard/bookings/sit-1/remittance", label: "Open a remittance" },
  ]);
  assert.deepEqual(statementNextLinks({ isFamily: true }), [
    { href: "/dashboard/statement/csv", label: "Download the CSV" },
  ]);
  assert.notDeepEqual(statementNextLinks({ isFamily: true, bookingId: "sit-1" }), invoiceNextLinks(true));
  assert.notDeepEqual(statementNextLinks({ isFamily: true, bookingId: "sit-1" }), householdSavedLinks());
  assert.notDeepEqual(statementNextLinks({ isFamily: true, bookingId: "sit-1" }), postJobNextLinks());
  assert.ok(!statementNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href === "/dashboard/household"));
  assert.ok(!statementNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href === "/post-a-job"));
  assert.ok(!statementNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
