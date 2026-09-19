import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_VISA_PAN,
  digitsOnly,
  isAcceptedDemoCard,
  isExpiryCurrentOrFuture,
  isValidCvc,
  parseCardExpiry,
  sanitizeCardName,
} from "./demo-card";

const now = new Date("2026-09-07T00:00:00.000Z");

test("digitsOnly strips spaces and dashes", () => {
  assert.equal(digitsOnly("4242 4242-4242 4242"), DEMO_VISA_PAN);
});

test("parseCardExpiry reads MM/YY and MM/YYYY", () => {
  assert.deepEqual(parseCardExpiry("10/26"), { month: 10, year: 2026 });
  assert.deepEqual(parseCardExpiry("09 / 2027"), { month: 9, year: 2027 });
  assert.equal(parseCardExpiry("13/26"), null);
  assert.equal(parseCardExpiry("Sept"), null);
});

test("isExpiryCurrentOrFuture accepts this month and later", () => {
  assert.equal(isExpiryCurrentOrFuture({ month: 9, year: 2026 }, now), true);
  assert.equal(isExpiryCurrentOrFuture({ month: 10, year: 2026 }, now), true);
  assert.equal(isExpiryCurrentOrFuture({ month: 8, year: 2026 }, now), false);
});

test("isAcceptedDemoCard only takes the demo Visa with a name, CVC and future expiry", () => {
  const ok = {
    number: DEMO_VISA_PAN,
    expiry: "10/26",
    cvc: "123",
    name: "Alex Martin",
  };
  assert.equal(isAcceptedDemoCard(ok, now), true);
  assert.equal(isAcceptedDemoCard({ ...ok, number: "4000000000000002" }, now), false);
  assert.equal(isAcceptedDemoCard({ ...ok, expiry: "08/26" }, now), false);
  assert.equal(isAcceptedDemoCard({ ...ok, cvc: "12" }, now), false);
  assert.equal(isAcceptedDemoCard({ ...ok, name: "  " }, now), false);
  assert.equal(isValidCvc("123"), true);
  assert.equal(sanitizeCardName("  Alex   Martin  "), "Alex Martin");
});
