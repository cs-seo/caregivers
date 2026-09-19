import assert from "node:assert/strict";
import { test } from "node:test";
import { householdSavedLinks, householdSavedNotice } from "./household-saved";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { paidBookingLinks, paidBookingNotice } from "./booking-paid";

test("invoiceNextNotice names reconciliation without a count or copy-onto-sits CTA", () => {
  assert.match(invoiceNextNotice(), /HCP or NDIS/);
  assert.match(invoiceNextNotice(), /financial-year statement/);
  assert.doesNotMatch(invoiceNextNotice(), /\d+ open/);
  assert.doesNotMatch(invoiceNextNotice(), /Copy onto/);
  assert.doesNotMatch(invoiceNextNotice(), /job=/);
  assert.notEqual(invoiceNextNotice(), householdSavedNotice());
  assert.notEqual(
    invoiceNextNotice(),
    paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: true }),
  );
});

test("invoiceNextLinks go to the FY statement and Household for families only", () => {
  assert.deepEqual(invoiceNextLinks(true), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
    { href: "/dashboard/household", label: "Check NDIS and My Aged Care refs" },
  ]);
  assert.deepEqual(invoiceNextLinks(false), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.notDeepEqual(invoiceNextLinks(true), householdSavedLinks());
  assert.ok(!invoiceNextLinks(true).some((link) => link.href === "/post-a-job"));
  assert.ok(
    !paidBookingLinks({ bookingId: "demo", handoverComplete: true }).some((link) =>
      invoiceNextLinks(true).some((next) => next.href === link.href && next.label === link.label),
    ),
  );
});
