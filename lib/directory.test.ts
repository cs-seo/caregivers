import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryBasePath, directoryJobEmptyLinks, directoryJobEmptyNotice, directoryListedPostLink, directoryListedPostNotice, emptyStateLinks, filterCurrent, parseFilters } from "./directory";

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

test("directoryJobEmptyLinks add shortlist and request recovery when a job is attached", () => {
  const filters = {
    specialty: "aged-care" as const,
    state: "nsw",
    city: "sydney",
    availableOn: "2026-09-15",
    availableAt: "08:00",
    job: "weekday-aged-care-marrickville",
    page: 1,
    sort: "rating" as const,
  };
  const job = {
    jobSlug: "weekday-aged-care-marrickville",
    jobTitle: "Weekday aged care for Mum in Marrickville",
    shortlistCount: 3,
  };
  const links = directoryJobEmptyLinks(filters, job);
  assert.deepEqual(
    links.slice(0, 3).map((link) => [link.label, link.href]),
    [
      [
        "Compare carers on your shortlist for this request",
        "/dashboard/shortlist?job=weekday-aged-care-marrickville",
      ],
      ["Back to your request", "/care-requests/weekday-aged-care-marrickville"],
      [
        "Browse without attaching to this request",
        "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&availableAt=08%3A00",
      ],
    ],
  );
  assert.equal(
    links.find((link) => link.label === "Search any time that day")?.href,
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&job=weekday-aged-care-marrickville",
  );
  assert.equal(directoryJobEmptyLinks(filters, { ...job, shortlistCount: 0 })[0]?.label, "Back to your request");
  assert.equal(directoryJobEmptyLinks(filters)[0]?.href, emptyStateLinks(filters)[0]?.href);
  assert.match(directoryJobEmptyNotice(job.jobTitle), /Marrickville/);
  assert.doesNotMatch(directoryJobEmptyNotice(job.jobTitle), /\d+ open/);
});

test("directoryListedPostLink prefills post-a-job from listed specialty and city", () => {
  assert.deepEqual(directoryListedPostLink({ specialty: "aged-care", city: "sydney" }), {
    href: "/post-a-job?specialty=aged-care&city=sydney",
    label: "Post a care request",
  });
  assert.deepEqual(directoryListedPostLink({ specialty: "nannies" }), {
    href: "/post-a-job?specialty=nannies",
    label: "Post a care request",
  });
  assert.equal(directoryListedPostLink({}), null);
  assert.match(directoryListedPostNotice(), /Post a request/);
  assert.doesNotMatch(directoryListedPostNotice(), /\d+ open/);
});
