import assert from "node:assert/strict";
import { test } from "node:test";
import { quoteBooking, quoteWeeklySeries } from "./money";

test("quoteBooking adds 10% on top of the advertised rate", () => {
  const quote = quoteBooking(4200, 4);
  assert.equal(quote.subtotalCents, 16800);
  assert.equal(quote.platformFeeCents, 1680);
  assert.equal(quote.totalCents, 18480);
  assert.equal(quote.gstCents, 1527);
  assert.equal(quote.caregiverPayoutCents, 16800);
});

test("quoteWeeklySeries multiplies each week into its own escrow total", () => {
  const series = quoteWeeklySeries(4200, 4, 4);
  assert.equal(series.weeks, 4);
  assert.equal(series.seriesTotalCents, 73920);
});
