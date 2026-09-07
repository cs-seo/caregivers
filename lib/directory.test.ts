import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryBasePath, emptyStateLinks, filterCurrent, parseFilters } from "./directory";

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

test("emptyStateLinks stay on the specialty city path", () => {
  const links = emptyStateLinks({
    specialty: "aged-care",
    state: "nsw",
    city: "sydney",
    availableOn: "2026-09-15",
    availableAt: "08:00",
    job: "weekday-aged-care-marrickville",
    page: 1,
    sort: "rating",
  });
  assert.equal(directoryBasePath({ specialty: "aged-care", state: "nsw", city: "sydney" }), "/caregivers/aged-care/nsw/sydney");
  assert.equal(
    links[0]?.href,
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&job=weekday-aged-care-marrickville",
  );
  assert.equal(links[1]?.href, "/caregivers/aged-care/nsw/sydney?job=weekday-aged-care-marrickville");
});
