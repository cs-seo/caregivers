import assert from "node:assert/strict";
import { test } from "node:test";
import { isRequestedFlash, requestedBookingLinks, requestedBookingNotice } from "./booking-requested";

test("isRequestedFlash is only the request-to-book query", () => {
  assert.equal(isRequestedFlash("1"), true);
  assert.equal(isRequestedFlash(["1"]), true);
  assert.equal(isRequestedFlash("0"), false);
  assert.equal(isRequestedFlash(undefined), false);
});

test("requestedBookingNotice names accept-then-pay and handover", () => {
  assert.match(
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false }),
    /Request sent/,
  );
  assert.match(
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false }),
    /accept before you pay/,
  );
  assert.match(
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false }),
    /Add handover/,
  );
  assert.match(
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: true }),
    /Handover is ready/,
  );
  assert.doesNotMatch(
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false }),
    /\d+ open/,
  );
});

test("requestedBookingLinks go to handover, messages and profile", () => {
  assert.deepEqual(requestedBookingLinks({ caregiverSlug: "james-okafor-disability-sydney", handoverComplete: false }), [
    { href: "#handover", label: "Add handover" },
    { href: "#messages", label: "Message the carer" },
    { href: "/caregiver/james-okafor-disability-sydney", label: "View their profile" },
  ]);
  assert.deepEqual(
    requestedBookingLinks({
      caregiverSlug: "sarah-nguyen-aged-care-sydney",
      handoverComplete: true,
      requestSlug: "weekday-aged-care-marrickville",
    }).map((link) => [link.label, link.href]),
    [
      ["Review handover", "#handover"],
      ["Message the carer", "#messages"],
      ["View their profile", "/caregiver/sarah-nguyen-aged-care-sydney"],
      ["Open the attached request", "/care-requests/weekday-aged-care-marrickville"],
    ],
  );
});
