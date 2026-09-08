import assert from "node:assert/strict";
import { test } from "node:test";
import { awaitingPayNextLinks, awaitingPayNextNotice } from "./awaiting-pay";
import { requestedBookingLinks, requestedBookingNotice } from "./booking-requested";
import { escrowHeldNextLinks, escrowHeldNextNotice } from "./escrow-held";
import { inProgressNextLinks, inProgressNextNotice } from "./in-progress-next";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";

test("awaitingPayNextNotice names accepted-before-pay without a count or pay CTA", () => {
  assert.match(awaitingPayNextNotice(), /accepted/);
  assert.match(awaitingPayNextNotice(), /profile/);
  assert.match(awaitingPayNextNotice(), /calendar/);
  assert.doesNotMatch(awaitingPayNextNotice(), /\d+ open/);
  assert.doesNotMatch(awaitingPayNextNotice(), /Pay into escrow/);
  assert.doesNotMatch(awaitingPayNextNotice(), /Confirm complete/);
  assert.doesNotMatch(awaitingPayNextNotice(), /Instant Book/);
  assert.doesNotMatch(awaitingPayNextNotice(), /job=/);
  assert.notEqual(awaitingPayNextNotice(), pendingAcceptanceNextNotice());
  assert.notEqual(
    awaitingPayNextNotice(),
    requestedBookingNotice({ carerName: "Elena Rossi", handoverComplete: false }),
  );
  assert.notEqual(awaitingPayNextNotice(), escrowHeldNextNotice());
  assert.notEqual(awaitingPayNextNotice(), inProgressNextNotice());
});

test("awaitingPayNextLinks go to the carer profile and ICS, not handover", () => {
  assert.deepEqual(awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }), [
    { href: "/caregiver/elena-rossi-companion-care-sydney", label: "View their profile" },
    { href: "/dashboard/bookings/sit-1/ics", label: "Add this sit to your calendar" },
  ]);
  assert.notDeepEqual(
    awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }),
    requestedBookingLinks({
      caregiverSlug: "elena-rossi-companion-care-sydney",
      handoverComplete: false,
    }),
  );
  assert.notDeepEqual(
    awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }),
    escrowHeldNextLinks({ bookingId: "sit-1" }),
  );
  assert.notDeepEqual(
    awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }),
    inProgressNextLinks({ bookingId: "sit-1" }),
  );
  assert.notDeepEqual(
    awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }),
    pendingAcceptanceNextLinks({}),
  );
  assert.ok(
    !awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }).some(
      (link) => link.href === "#handover",
    ),
  );
  assert.ok(
    !awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "sit-1" }).some((link) =>
      link.href.includes("job="),
    ),
  );
});
