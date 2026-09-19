import assert from "node:assert/strict";
import { test } from "node:test";
import { ANALYTICS_EVENTS, analyticsEnabled, resolveAnalyticsConfig } from "./analytics";

test("resolveAnalyticsConfig is a no-op when nothing is configured", () => {
  const config = resolveAnalyticsConfig({ gaId: undefined, plausibleDomain: undefined });
  assert.equal(config.provider, null);
  assert.equal(analyticsEnabled(config), false);
});

test("resolveAnalyticsConfig treats blank strings as unset", () => {
  const config = resolveAnalyticsConfig({ gaId: "   ", plausibleDomain: "" });
  assert.equal(config.provider, null);
});

test("resolveAnalyticsConfig enables GA4 when a measurement id is set", () => {
  const config = resolveAnalyticsConfig({ gaId: "G-ABC123", plausibleDomain: undefined });
  assert.equal(config.provider, "ga4");
  assert.equal(config.gaId, "G-ABC123");
  assert.equal(analyticsEnabled(config), true);
});

test("resolveAnalyticsConfig enables Plausible when a domain is set", () => {
  const config = resolveAnalyticsConfig({ gaId: undefined, plausibleDomain: "caregiver.com.au" });
  assert.equal(config.provider, "plausible");
  assert.equal(config.plausibleDomain, "caregiver.com.au");
});

test("GA4 takes precedence when both providers are configured", () => {
  const config = resolveAnalyticsConfig({ gaId: "G-XYZ", plausibleDomain: "caregiver.com.au" });
  assert.equal(config.provider, "ga4");
});

test("conversion event names stay stable and unique", () => {
  const values = Object.values(ANALYTICS_EVENTS);
  assert.equal(new Set(values).size, values.length);
  assert.ok(values.includes("booking_paid"));
  assert.ok(values.includes("search_performed"));
});
