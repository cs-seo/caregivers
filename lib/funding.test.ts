import assert from "node:assert/strict";
import { test } from "node:test";
import { fundingLines, normalizeFundingRef } from "./funding";

test("normalizeFundingRef trims and caps length", () => {
  assert.equal(normalizeFundingRef("  430  112  223  "), "430 112 223");
  assert.equal(normalizeFundingRef(""), null);
  assert.equal(normalizeFundingRef("x".repeat(50))?.length, 40);
});

test("fundingLines prints NDIS and My Aged Care refs", () => {
  assert.deepEqual(
    fundingLines({ ndisNumber: "430 112 223", agedCareRef: "HCP-NSW-88421" }),
    ["NDIS 430 112 223", "My Aged Care HCP-NSW-88421"],
  );
  assert.deepEqual(fundingLines({}), []);
});
