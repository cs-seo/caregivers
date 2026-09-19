import assert from "node:assert/strict";
import { test } from "node:test";
import { paidBookingLinks, paidBookingNotice } from "./booking-paid";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { escrowHeldNextLinks, escrowHeldNextNotice } from "./escrow-held";
import { inProgressNextLinks, inProgressNextNotice } from "./in-progress-next";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";

test("inProgressNextNotice names care underway without a count or confirm CTA", () => {
  assert.match(inProgressNextNotice(), /underway/);
  assert.match(inProgressNextNotice(), /Message the carer/);
  assert.match(inProgressNextNotice(), /invoice/);
  assert.doesNotMatch(inProgressNextNotice(), /\d+ open/);
  assert.doesNotMatch(inProgressNextNotice(), /Confirm complete/);
  assert.doesNotMatch(inProgressNextNotice(), /Use household/);
  assert.doesNotMatch(inProgressNextNotice(), /Save handover/);
  assert.doesNotMatch(inProgressNextNotice(), /Instant Book/);
  assert.doesNotMatch(inProgressNextNotice(), /job=/);
  assert.notEqual(inProgressNextNotice(), escrowHeldNextNotice());
  assert.notEqual(
    inProgressNextNotice(),
    paidBookingNotice({ carerName: "Priya Nair", handoverComplete: false }),
  );
  assert.notEqual(inProgressNextNotice(), comingUpNextNotice());
  assert.notEqual(inProgressNextNotice(), pendingAcceptanceNextNotice());
});

test("inProgressNextLinks go to messages and the sit invoice, not handover", () => {
  assert.deepEqual(inProgressNextLinks({ bookingId: "sit-1" }), [
    { href: "#messages", label: "Message the carer" },
    { href: "/dashboard/bookings/sit-1/invoice", label: "Open the tax invoice" },
  ]);
  assert.notDeepEqual(inProgressNextLinks({ bookingId: "sit-1" }), escrowHeldNextLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(
    inProgressNextLinks({ bookingId: "sit-1" }),
    paidBookingLinks({ bookingId: "sit-1", handoverComplete: false }),
  );
  assert.notDeepEqual(inProgressNextLinks({ bookingId: "sit-1" }), comingUpNextLinks());
  assert.notDeepEqual(inProgressNextLinks({ bookingId: "sit-1" }), pendingAcceptanceNextLinks({}));
  assert.ok(!inProgressNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "#handover"));
  assert.ok(!inProgressNextLinks({ bookingId: "sit-1" }).some((link) => link.href === "/dashboard/household"));
  assert.ok(!inProgressNextLinks({ bookingId: "sit-1" }).some((link) => link.href.includes("job=")));
});
