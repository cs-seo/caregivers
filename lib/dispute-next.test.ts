import assert from "node:assert/strict";
import { test } from "node:test";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { disputeNextLinks, disputeNextNotice } from "./dispute-next";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { legalNextLinks, legalNextNotice } from "./legal-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";

test("disputeNextNotice names held funds without a count or resolve CTA", () => {
  assert.match(disputeNextNotice(true), /Funds stay held/);
  assert.match(disputeNextNotice(true), /invoice/);
  assert.match(disputeNextNotice(true), /escrow/);
  assert.match(disputeNextNotice(false), /remittance/);
  assert.doesNotMatch(disputeNextNotice(true), /\d+ open/);
  assert.doesNotMatch(disputeNextNotice(true), /Release/);
  assert.doesNotMatch(disputeNextNotice(true), /Refund/);
  assert.doesNotMatch(disputeNextNotice(true), /Publish/);
  assert.doesNotMatch(disputeNextNotice(true), /job=/);
  assert.notEqual(disputeNextNotice(true), invoiceNextNotice());
  assert.notEqual(disputeNextNotice(true), statementNextNotice(true));
  assert.notEqual(disputeNextNotice(true), comingUpNextNotice());
  assert.notEqual(disputeNextNotice(true), legalNextNotice());
});

test("disputeNextLinks go to the sit invoice and trust, not Release or Refund", () => {
  assert.deepEqual(disputeNextLinks({ isFamily: true, bookingId: "sit-1" }), [
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open the tax invoice" },
    { href: "/trust-and-safety", label: "How escrow and disputes work" },
  ]);
  assert.deepEqual(disputeNextLinks({ isFamily: false, bookingId: "sit-1" }), [
    { href: "/dashboard/bookings/sit-1/remittance", label: "Open the remittance" },
    { href: "/trust-and-safety", label: "How escrow and disputes work" },
  ]);
  assert.notDeepEqual(disputeNextLinks({ isFamily: true, bookingId: "sit-1" }), invoiceNextLinks(true));
  assert.notDeepEqual(
    disputeNextLinks({ isFamily: true, bookingId: "sit-1" }),
    statementNextLinks({ isFamily: true, bookingId: "sit-1" }),
  );
  assert.notDeepEqual(disputeNextLinks({ isFamily: true, bookingId: "sit-1" }), comingUpNextLinks());
  assert.notDeepEqual(disputeNextLinks({ isFamily: true, bookingId: "sit-1" }), legalNextLinks());
  assert.ok(!disputeNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href === "/dashboard/household"));
  assert.ok(!disputeNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href === "/post-a-job"));
  assert.ok(!disputeNextLinks({ isFamily: true, bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
