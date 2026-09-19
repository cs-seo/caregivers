import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryFiltersNoIndex, directoryLandingNoIndex, marketplacePageNoIndex } from "./launch-seo";

test("directoryFiltersNoIndex keeps clean specialty URLs indexable", () => {
  assert.equal(directoryFiltersNoIndex({ specialty: "nannies", page: 1, sort: "rating" }), false);
});

test("directoryFiltersNoIndex blocks filter and paging variants", () => {
  assert.equal(directoryFiltersNoIndex({ q: "bondi" }), true);
  assert.equal(directoryFiltersNoIndex({ instantBook: true }), true);
  assert.equal(directoryFiltersNoIndex({ availableOn: "2026-09-20" }), true);
  assert.equal(directoryFiltersNoIndex({ page: 2 }), true);
  assert.equal(directoryFiltersNoIndex({ sort: "rate" }), true);
  assert.equal(directoryFiltersNoIndex({ job: "weekday-aged-care-marrickville" }), true);
});

test("directoryLandingNoIndex hides empty suburb hubs only when demo is off", () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  assert.equal(directoryLandingNoIndex({ specialty: "nannies" }, true), true);
  assert.equal(directoryLandingNoIndex({ specialty: "nannies" }, false), false);
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  assert.equal(directoryLandingNoIndex({ specialty: "nannies" }, true), false);
  assert.equal(marketplacePageNoIndex(), false);
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  assert.equal(marketplacePageNoIndex(), true);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
});
