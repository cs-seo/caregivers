import assert from "node:assert/strict";
import { test } from "node:test";
import {
  REVIEW_REPLY_LIMIT,
  canReplyToReview,
  canWriteReview,
  composeReviewDueAlert,
  hasReviewReply,
  isSafeReviewReturnPath,
  reviewsDueLabel,
  sanitizeReviewReply,
} from "./reviews";

test("sanitizeReviewReply trims and caps length", () => {
  assert.equal(sanitizeReviewReply("  Thanks  "), "Thanks");
  assert.equal(sanitizeReviewReply(`  ${"a".repeat(600)}  `).length, REVIEW_REPLY_LIMIT);
  assert.equal(sanitizeReviewReply("   "), "");
});

test("hasReviewReply ignores blank replies", () => {
  assert.equal(hasReviewReply({ reply: "Glad it helped." }), true);
  assert.equal(hasReviewReply({ reply: "   " }), false);
  assert.equal(hasReviewReply({ reply: null }), false);
  assert.equal(hasReviewReply(null), false);
});

test("canReplyToReview is only for the carer, once", () => {
  const review = { caregiverId: "carer-1", reply: null };
  assert.equal(canReplyToReview(review, "carer-1"), true);
  assert.equal(canReplyToReview(review, "other"), false);
  assert.equal(canReplyToReview({ ...review, reply: "Thanks" }, "carer-1"), false);
  assert.equal(canReplyToReview(null, "carer-1"), false);
});

test("isSafeReviewReturnPath allows booking and profile paths", () => {
  assert.equal(isSafeReviewReturnPath("/dashboard/bookings/abc"), true);
  assert.equal(isSafeReviewReturnPath("/caregiver/sarah-nguyen-aged-care-sydney"), true);
  assert.equal(isSafeReviewReturnPath("https://evil.example/caregiver/x"), false);
  assert.equal(isSafeReviewReturnPath("/caregivers"), false);
  assert.equal(isSafeReviewReturnPath("//evil"), false);
});

test("canWriteReview is only the family on a released sit without a review", () => {
  const booking = { familyId: "fam-1", status: "released", review: null };
  assert.equal(canWriteReview(booking, "fam-1"), true);
  assert.equal(canWriteReview(booking, "other"), false);
  assert.equal(canWriteReview({ ...booking, status: "escrow_held" }, "fam-1"), false);
  assert.equal(canWriteReview({ ...booking, review: { id: "r1" } }, "fam-1"), false);
  assert.equal(canWriteReview(null, "fam-1"), false);
});

test("reviewsDueLabel and composeReviewDueAlert describe outstanding sits", () => {
  assert.equal(reviewsDueLabel(0), "No sits waiting for a review");
  assert.equal(reviewsDueLabel(1), "1 sit is ready for a review");
  assert.equal(reviewsDueLabel(2), "2 sits are ready for a review");
  const digest = composeReviewDueAlert([
    {
      title: "Aged care with Sarah Nguyen",
      href: "/dashboard/bookings/leichhardt#review",
      when: "20 Aug 2026, 9:00 am",
    },
  ]);
  assert.equal(digest.hasDue, true);
  assert.equal(digest.subject, "CareProof: 1 sit is ready for a review");
  assert.match(digest.body, /Aged care with Sarah Nguyen/);
  assert.match(digest.body, /leichhardt#review/);
  assert.equal(composeReviewDueAlert([]).subject, "CareProof: no sits waiting for a review");
});
