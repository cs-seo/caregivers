import { test } from "node:test";
import assert from "node:assert/strict";
import { rateLimit, resetRateLimit } from "./rate-limit";

test("allows requests up to the limit then blocks", () => {
  resetRateLimit();
  const opts = { limit: 3, windowMs: 1000, now: 1000 };
  assert.equal(rateLimit("a", opts).ok, true);
  assert.equal(rateLimit("a", opts).ok, true);
  const third = rateLimit("a", opts);
  assert.equal(third.ok, true);
  assert.equal(third.remaining, 0);
  const fourth = rateLimit("a", opts);
  assert.equal(fourth.ok, false);
  assert.equal(fourth.remaining, 0);
  assert.ok(fourth.retryAfterMs > 0);
});

test("keys are isolated from each other", () => {
  resetRateLimit();
  const opts = { limit: 1, windowMs: 1000, now: 5000 };
  assert.equal(rateLimit("family-a", opts).ok, true);
  assert.equal(rateLimit("family-a", opts).ok, false);
  // A different key (e.g. another user/IP) is unaffected.
  assert.equal(rateLimit("family-b", opts).ok, true);
});

test("window slides so old hits expire", () => {
  resetRateLimit();
  assert.equal(rateLimit("s", { limit: 2, windowMs: 1000, now: 0 }).ok, true);
  assert.equal(rateLimit("s", { limit: 2, windowMs: 1000, now: 500 }).ok, true);
  // Third hit within the window is blocked.
  assert.equal(rateLimit("s", { limit: 2, windowMs: 1000, now: 900 }).ok, false);
  // After the first hit ages out, a new hit is allowed again.
  assert.equal(rateLimit("s", { limit: 2, windowMs: 1000, now: 1600 }).ok, true);
});

test("retryAfter reflects when the oldest hit leaves the window", () => {
  resetRateLimit();
  rateLimit("r", { limit: 1, windowMs: 1000, now: 1000 });
  const blocked = rateLimit("r", { limit: 1, windowMs: 1000, now: 1400 });
  assert.equal(blocked.ok, false);
  // oldest hit at 1000 leaves window at 2000, now is 1400 => 600ms.
  assert.equal(blocked.retryAfterMs, 600);
});
