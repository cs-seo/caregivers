import assert from "node:assert/strict";
import { test } from "node:test";
import { jobBoardHref, jobBoardTitle, openRequestsNotice, parseJobBoardFilters } from "./job-board";

test("parseJobBoardFilters keeps safe city and specialty slugs", () => {
  assert.deepEqual(
    parseJobBoardFilters({ city: "sydney", specialty: "aged-care", fit: "1" }),
    { city: "sydney", specialty: "aged-care", fit: true },
  );
  assert.deepEqual(parseJobBoardFilters({ city: "../evil", specialty: "AGED CARE" }), {
    city: undefined,
    specialty: undefined,
    fit: false,
  });
});

test("jobBoardHref builds a filtered board URL", () => {
  assert.equal(
    jobBoardHref({ city: "sydney", specialty: "aged-care" }),
    "/care-requests?specialty=aged-care&city=sydney",
  );
  assert.equal(
    jobBoardHref({ city: "sydney", specialty: "aged-care", fit: true }),
    "/care-requests?specialty=aged-care&city=sydney&fit=1",
  );
  assert.equal(jobBoardHref(), "/care-requests");
});

test("jobBoardTitle and openRequestsNotice name the city and specialty", () => {
  assert.equal(jobBoardTitle("Aged care", "Sydney"), "Open aged care requests in Sydney");
  assert.equal(jobBoardTitle("Aged care"), "Open aged care requests");
  assert.equal(jobBoardTitle(undefined, "Sydney"), "Open care requests in Sydney");
  assert.equal(jobBoardTitle(), "Open care requests");
  assert.equal(
    openRequestsNotice(1, "Sydney", "Aged care"),
    "1 open care request in Sydney for aged care",
  );
  assert.equal(
    openRequestsNotice(2, "Adelaide", "Respite"),
    "2 open care requests in Adelaide for respite",
  );
});
