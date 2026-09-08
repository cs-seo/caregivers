import assert from "node:assert/strict";
import { test } from "node:test";
import { paidBookingLinks, paidBookingNotice } from "./booking-paid";
import { disputeNextLinks, disputeNextNotice } from "./dispute-next";
import { escrowHeldNextLinks, escrowHeldNextNotice } from "./escrow-held";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";

test("escrowHeldNextNotice names held funds without a count or confirm CTA", () => {
  assert.match(escrowHeldNextNotice(), /escrow/);
  assert.match(escrowHeldNextNotice(), /invoice/);
  assert.match(escrowHeldNextNotice(), /calendar/);
  assert.doesNotMatch(escrowHeldNextNotice(), /\d+ open/);
  assert.doesNotMatch(escrowHeldNextNotice(), /Confirm complete/);
  assert.doesNotMatch(escrowHeldNextNotice(), /Release/);
  assert.doesNotMatch(escrowHeldNextNotice(), /Instant Book/);
  assert.doesNotMatch(escrowHeldNextNotice(), /job=/);
  assert.notEqual(escrowHeldNextNotice(), invoiceNextNotice());
  assert.notEqual(escrowHeldNextNotice(), disputeNextNotice(true));
  assert.notEqual(
    escrowHeldNextNotice(),
    paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: true }),
  );
  assert.notEqual(escrowHeldNextNotice(), homeFamilyNotice());
});

test("escrowHeldNextLinks go to the sit invoice and ICS, not handover", () => {
  assert.deepEqual(escrowHeldNextLinks({ bookingId: "sit-1" }), [
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open the tax invoice" },
    { href: "/dashboard/bookings/sit-1/ics", label: "Add this sit to your calendar" },
  ]);
  assert.deepEqual(escrowHeldNextLinks({ bookingId: "sit-2", isSeries: true }), [
    { href: "/dashboard/bookings/sit-2/invoice", label: "Open the tax invoice" },
    { href: "/dashboard/bookings/sit-2/ics?series=1", label: "Add the series to your calendar" },
  ]);
  assert.notDeepEqual(escrowHeldNextLinks({ bookingId: "sit-1" }), invoiceNextLinks(true));
  assert.notDeepEqual(escrowHeldNextLinks({ bookingId: "sit-1" }), disputeNextLinks({ isFamily: true, bookingId: "sit-1" }));
  assert.notDeepEqual(escrowHeldNextLinks({ bookingId: "sit-1" }), paidBookingLinks({ bookingId: "sit-1", handoverComplete: true }));
  assert.notDeepEqual(escrowHeldNextLinks({ bookingId: "sit-1" }), homeFamilyLinks());
  assert.ok(!escrowHeldNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "#handover"));
  assert.ok(!escrowHeldNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "/post-a-job"));
  assert.ok(!escrowHeldNextLinks({ bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
