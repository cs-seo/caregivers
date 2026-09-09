import assert from "node:assert/strict";
import { test } from "node:test";
import { isPaidFlash, paidBookingLinks, paidBookingNotice } from "./booking-paid";

test("isPaidFlash is only the post-pay query", () => {
  assert.equal(isPaidFlash("1"), true);
  assert.equal(isPaidFlash(["1"]), true);
  assert.equal(isPaidFlash("0"), false);
  assert.equal(isPaidFlash(undefined), false);
});

test("paidBookingNotice names escrow and handover state", () => {
  assert.match(
    paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: true }),
    /held in escrow/,
  );
  assert.match(
    paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: true }),
    /Handover is ready/,
  );
  assert.match(
    paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: false }),
    /Add handover/,
  );
  assert.doesNotMatch(paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: true }), /\d+ open/);
});

test("paidBookingLinks go to handover, calendar and messages", () => {
  assert.deepEqual(
    paidBookingLinks({ bookingId: "sit-1", handoverComplete: true }),
    [
      { href: "#handover", label: "Review handover" },
      { href: "/dashboard/bookings/sit-1/ics", label: "Add this sit to your calendar" },
      { href: "#messages", label: "Message the carer" },
    ],
  );
  assert.deepEqual(
    paidBookingLinks({
      bookingId: "sit-2",
      handoverComplete: false,
      isSeries: true,
      requestSlug: "midweek-respite-leichhardt",
    }).map((link) => [link.label, link.href]),
    [
      ["Add handover", "#handover"],
      ["Add the series to your calendar", "/dashboard/bookings/sit-2/ics?series=1"],
      ["Message the carer", "#messages"],
      ["Open the attached request", "/care-requests/midweek-respite-leichhardt"],
    ],
  );
});
