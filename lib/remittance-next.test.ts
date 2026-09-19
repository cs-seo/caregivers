import assert from "node:assert/strict";
import { test } from "node:test";
import { disputeNextLinks, disputeNextNotice } from "./dispute-next";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { remittanceNextLinks, remittanceNextNotice } from "./remittance-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";

test("remittanceNextNotice names the matching invoice without a count or release CTA", () => {
  assert.match(remittanceNextNotice(), /same number/);
  assert.match(remittanceNextNotice(), /tax invoice/);
  assert.match(remittanceNextNotice(), /statement/);
  assert.doesNotMatch(remittanceNextNotice(), /\d+ open/);
  assert.doesNotMatch(remittanceNextNotice(), /Confirm complete/);
  assert.doesNotMatch(remittanceNextNotice(), /Release/);
  assert.doesNotMatch(remittanceNextNotice(), /Instant Book/);
  assert.doesNotMatch(remittanceNextNotice(), /job=/);
  assert.notEqual(remittanceNextNotice(), invoiceNextNotice());
  assert.notEqual(remittanceNextNotice(), statementNextNotice(true));
  assert.notEqual(remittanceNextNotice(), householdNextNotice());
  assert.notEqual(remittanceNextNotice(), disputeNextNotice(true));
});

test("remittanceNextLinks go to the sit invoice and statement, not household", () => {
  assert.deepEqual(remittanceNextLinks({ bookingId: "sit-1" }), [
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open the family tax invoice" },
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.notDeepEqual(remittanceNextLinks({ bookingId: "sit-1" }), invoiceNextLinks(true));
  assert.notDeepEqual(
    remittanceNextLinks({ bookingId: "sit-1" }),
    statementNextLinks({ isFamily: true, bookingId: "sit-1" }),
  );
  assert.notDeepEqual(remittanceNextLinks({ bookingId: "sit-1" }), householdNextLinks());
  assert.notDeepEqual(
    remittanceNextLinks({ bookingId: "sit-1" }),
    disputeNextLinks({ isFamily: true, bookingId: "sit-1" }),
  );
  assert.ok(!remittanceNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "/dashboard/household"));
  assert.ok(!remittanceNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "#handover"));
  assert.ok(!remittanceNextLinks({ bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
