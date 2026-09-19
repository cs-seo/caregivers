import assert from "node:assert/strict";
import { test } from "node:test";
import { paidBookingNotice } from "./booking-paid";
import { requestedBookingNotice } from "./booking-requested";
import { bookingSubmitLinks, bookingSubmitNotice } from "./booking-submit";

test("bookingSubmitNotice splits Instant Book pay-now from request-to-book", () => {
  assert.match(bookingSubmitNotice({ instantBook: true }), /Instant Book confirms this sit now/);
  assert.match(bookingSubmitNotice({ instantBook: true }), /pay into escrow on the next screen/);
  assert.match(bookingSubmitNotice({ instantBook: false }), /This is a request/);
  assert.match(bookingSubmitNotice({ instantBook: false }), /accepts before you pay/);
  assert.doesNotMatch(bookingSubmitNotice({ instantBook: true }), /Request sent/);
  assert.doesNotMatch(bookingSubmitNotice({ instantBook: false }), /Request sent/);
  assert.doesNotMatch(bookingSubmitNotice({ instantBook: true }), /Payment collected/);
  assert.doesNotMatch(bookingSubmitNotice({ instantBook: false }), /\d+ open/);
});

test("bookingSubmitNotice stays distinct from post-submit flashes", () => {
  const submit = bookingSubmitNotice({ instantBook: false });
  const requested = requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false });
  const paid = paidBookingNotice({ carerName: "Sarah Nguyen", handoverComplete: false });
  assert.notEqual(submit, requested);
  assert.notEqual(submit, paid);
  assert.doesNotMatch(submit, /Request sent/);
  assert.doesNotMatch(bookingSubmitNotice({ instantBook: true }), /held in escrow/);
});

test("bookingSubmitLinks go to profile, how it works and trust", () => {
  assert.deepEqual(bookingSubmitLinks({ caregiverSlug: "james-okafor-disability-support-sydney" }), [
    { href: "/caregiver/james-okafor-disability-support-sydney", label: "Back to their profile" },
    { href: "/how-it-works", label: "How booking and escrow work" },
    { href: "/trust-and-safety", label: "Trust and payments" },
  ]);
});
