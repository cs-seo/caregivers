import assert from "node:assert/strict";
import { test } from "node:test";
import { filterCurrent, parseFilters } from "./directory";

test("parseFilters keeps a safe job slug and drops junk", () => {
  const filters = parseFilters({
    specialty: "aged-care",
    availableOn: "2026-09-15",
    availableAt: "08:00",
    job: "weekday-aged-care-marrickville",
  });
  assert.equal(filters.job, "weekday-aged-care-marrickville");
  assert.equal(parseFilters({ job: "../evil" }).job, undefined);
  assert.equal(
    filterCurrent(filters).job,
    "weekday-aged-care-marrickville",
  );
});
