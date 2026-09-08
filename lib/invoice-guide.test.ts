import assert from "node:assert/strict";
import { test } from "node:test";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { remittanceNextLinks, remittanceNextNotice } from "./remittance-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";
import { invoiceGuideLinks, invoiceGuideNotice } from "./invoice-guide";

test("invoiceGuideNotice names GST invoices without a count or pay CTA", () => {
  assert.match(invoiceGuideNotice(), /GST invoices/);
  assert.match(invoiceGuideNotice(), /financial-year statement/);
  assert.match(invoiceGuideNotice(), /tax invoice/);
  assert.doesNotMatch(invoiceGuideNotice(), /\d+ open/);
  assert.doesNotMatch(invoiceGuideNotice(), /Instant Book/);
  assert.doesNotMatch(invoiceGuideNotice(), /Confirm complete/);
  assert.doesNotMatch(invoiceGuideNotice(), /job=/);
  assert.notEqual(invoiceGuideNotice(), invoiceNextNotice());
  assert.notEqual(invoiceGuideNotice(), statementNextNotice(true));
  assert.notEqual(invoiceGuideNotice(), remittanceNextNotice());
  assert.notEqual(invoiceGuideNotice(), householdNextNotice());
});

test("invoiceGuideLinks go to the statement and a sit invoice, not household or CSV", () => {
  assert.deepEqual(invoiceGuideLinks({ bookingId: "sit-1" }), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open a tax invoice" },
  ]);
  assert.deepEqual(invoiceGuideLinks({}), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.notDeepEqual(invoiceGuideLinks({ bookingId: "sit-1" }), invoiceNextLinks(true));
  assert.notDeepEqual(
    invoiceGuideLinks({ bookingId: "sit-1" }),
    statementNextLinks({ isFamily: true, bookingId: "sit-1" }),
  );
  assert.notDeepEqual(invoiceGuideLinks({ bookingId: "sit-1" }), remittanceNextLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(invoiceGuideLinks({ bookingId: "sit-1" }), householdNextLinks());
  assert.ok(!invoiceGuideLinks({ bookingId: "sit-1" }).some((link) => link.href === "/dashboard/statement/csv"));
  assert.ok(!invoiceGuideLinks({ bookingId: "sit-1" }).some((link) => link.href === "/dashboard/household"));
  assert.ok(!invoiceGuideLinks({ bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
