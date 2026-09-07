import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultSearchName, isSafeSearchHref, savedSearchHref } from "./saved-search";

test("savedSearchHref keeps path segments and drops page", () => {
  assert.equal(
    savedSearchHref("/caregivers/aged-care/nsw/sydney", {
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      availableOn: "2026-09-12",
      page: "2",
    }),
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-12",
  );
});

test("isSafeSearchHref only allows local caregiver directory paths", () => {
  assert.equal(isSafeSearchHref("/caregivers/nannies?instantBook=1"), true);
  assert.equal(isSafeSearchHref("https://evil.example/caregivers"), false);
  assert.equal(isSafeSearchHref("/dashboard"), false);
});

test("defaultSearchName adds needed-on and Instant Book", () => {
  assert.equal(
    defaultSearchName("Aged care carers in Sydney", { availableOn: "2026-09-12", instantBook: true }),
    "Aged care carers in Sydney · needed 12 Sept 2026 · Instant Book",
  );
});
