import assert from "node:assert/strict";
import { test } from "node:test";
import { jobBoardHref, jobBoardTitle, openRequestsNotice, parseJobBoardFilters } from "./job-board";

test("parseJobBoardFilters keeps safe city, state and specialty slugs", () => {
  assert.deepEqual(
    parseJobBoardFilters({ city: "sydney", specialty: "aged-care", fit: "1" }),
    { city: "sydney", state: undefined, specialty: "aged-care", fit: true },
  );
  assert.deepEqual(
    parseJobBoardFilters({ state: "nsw", specialty: "aged-care" }),
    { city: undefined, state: "nsw", specialty: "aged-care", fit: false },
  );
  assert.deepEqual(parseJobBoardFilters({ city: "../evil", specialty: "AGED CARE", state: "NSW" }), {
    city: undefined,
    state: undefined,
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
    jobBoardHref({ state: "nsw", specialty: "aged-care" }),
    "/care-requests?specialty=aged-care&state=nsw",
  );
  assert.equal(
    jobBoardHref({ city: "sydney", state: "nsw", specialty: "aged-care", fit: true }),
    "/care-requests?specialty=aged-care&city=sydney&fit=1",
  );
  assert.equal(jobBoardHref({ specialty: "aged-care" }), "/care-requests?specialty=aged-care");
  assert.equal(jobBoardHref(), "/care-requests");
});

test("jobBoardTitle and openRequestsNotice name the place and specialty", () => {
  assert.equal(jobBoardTitle("Aged care", "Sydney"), "Open aged care requests in Sydney");
  assert.equal(jobBoardTitle("Aged care", undefined, "New South Wales"), "Open aged care requests in New South Wales");
  assert.equal(jobBoardTitle("Aged care"), "Open aged care requests");
  assert.equal(jobBoardTitle(undefined, "Sydney"), "Open care requests in Sydney");
  assert.equal(jobBoardTitle(undefined, undefined, "New South Wales"), "Open care requests in New South Wales");
  assert.equal(jobBoardTitle(), "Open care requests");
  assert.equal(
    openRequestsNotice(1, "Sydney", "Aged care"),
    "1 open care request in Sydney for aged care",
  );
  assert.equal(
    openRequestsNotice(1, "New South Wales", "Aged care"),
    "1 open care request in New South Wales for aged care",
  );
  assert.equal(openRequestsNotice(2, "", "Aged care"), "2 open care requests for aged care");
});
