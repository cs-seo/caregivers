import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RELATED_JOB_LIMIT,
  relatedJobsBoardLink,
  relatedJobsNotice,
  relatedJobsTitle,
  relatedJobsWhere,
} from "./job-related";

test("relatedJobsTitle and notice name the city", () => {
  assert.equal(relatedJobsTitle("Sydney"), "Other open requests in Sydney");
  assert.match(relatedJobsNotice("Sydney"), /Sydney/);
  assert.match(relatedJobsNotice("Sydney"), /accepting proposals/);
});

test("relatedJobsWhere excludes this job and keeps only accepting sits in the city", () => {
  const now = new Date("2026-09-08T00:00:00+10:00");
  assert.deepEqual(relatedJobsWhere({ id: "job-1", cityId: "city-sydney" }, now), {
    status: "open",
    startDate: { gt: now },
    cityId: "city-sydney",
    id: { not: "job-1" },
  });
  assert.equal(RELATED_JOB_LIMIT, 3);
});

test("relatedJobsBoardLink points at the city job board", () => {
  assert.deepEqual(relatedJobsBoardLink({ slug: "sydney", name: "Sydney" }), {
    href: "/care-requests?city=sydney",
    label: "Browse every open request in Sydney",
  });
});
