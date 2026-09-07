import assert from "node:assert/strict";
import { test } from "node:test";
import {
  REVIEW_REPLY_LIMIT,
  canReplyToReview,
  hasReviewReply,
  isSafeReviewReturnPath,
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
