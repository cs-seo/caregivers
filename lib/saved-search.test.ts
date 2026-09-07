import assert from "node:assert/strict";
import { test } from "node:test";
import {
  defaultSearchName,
  filtersFromSearchHref,
  isSafeSearchHref,
  savedSearchDelta,
  savedSearchDeltaLabel,
  savedSearchHref,
} from "./saved-search";

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
  assert.equal(
    defaultSearchName("Aged care carers in Sydney", { availableOn: "2026-09-15", availableAt: "08:00" }),
    "Aged care carers in Sydney · needed 15 Sept 2026, 8:00 am",
  );
});

test("filtersFromSearchHref reads path segments and query flags", () => {
  const filters = filtersFromSearchHref("/caregivers/aged-care/nsw/sydney?availableOn=2026-09-12&availableAt=08:00");
  assert.equal(filters?.specialty, "aged-care");
  assert.equal(filters?.state, "nsw");
  assert.equal(filters?.city, "sydney");
  assert.equal(filters?.availableOn, "2026-09-12");
  assert.equal(filters?.availableAt, "08:00");
  const nannies = filtersFromSearchHref("/caregivers/nannies?instantBook=1");
  assert.equal(nannies?.specialty, "nannies");
  assert.equal(nannies?.instantBook, true);
  assert.equal(filtersFromSearchHref("/dashboard"), null);
});

test("savedSearchDelta treats a never-opened search as all new", () => {
  const unseen = savedSearchDelta(8, 0, null);
  assert.deepEqual(unseen, { current: 8, newCount: 8, unseen: true });
  assert.equal(savedSearchDeltaLabel(unseen), "8 carers · not opened yet");
  const grown = savedSearchDelta(10, 7, new Date("2026-09-01"));
  assert.equal(grown.newCount, 3);
  assert.equal(savedSearchDeltaLabel(grown), "10 carers · 3 new");
  assert.equal(savedSearchDeltaLabel(savedSearchDelta(7, 7, new Date("2026-09-01"))), "7 carers");
});
