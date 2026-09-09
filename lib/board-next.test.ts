import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guideBoardLink, jobBoardListedLink, jobBoardListedNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { postJobNextLinks, postJobNextNotice } from "./post-job-next";
import { requestsNextLinks, requestsNextNotice } from "./requests-next";
import { boardNextLinks, boardNextNotice, boardNextShows } from "./board-next";

test("boardNextNotice names the board without a count or Instant Book", () => {
  assert.match(boardNextNotice(), /board/);
  assert.match(boardNextNotice(), /companion carers/);
  assert.match(boardNextNotice(), /disability support/);
  assert.doesNotMatch(boardNextNotice(), /\d+ open/);
  assert.doesNotMatch(boardNextNotice(), /Instant Book/);
  assert.doesNotMatch(boardNextNotice(), /Hire/);
  assert.doesNotMatch(boardNextNotice(), /job=/);
  assert.doesNotMatch(boardNextNotice(), /babysitters/);
  assert.doesNotMatch(boardNextNotice(), /nannies/);
  assert.notEqual(boardNextNotice(), jobBoardListedNotice());
  assert.notEqual(boardNextNotice(), caregiversNextNotice());
  assert.notEqual(boardNextNotice(), locationNextNotice());
  assert.notEqual(boardNextNotice(), requestsNextNotice());
  assert.notEqual(boardNextNotice(), familyStartNotice());
  assert.notEqual(boardNextNotice(), postJobNextNotice());
});

test("boardNextShows is a signed-in family on the unfiltered board", () => {
  assert.equal(boardNextShows({ isFamily: true, filtered: false }), true);
  assert.equal(boardNextShows({ isFamily: true, filtered: true }), false);
  assert.equal(boardNextShows({ isFamily: false, filtered: false }), false);
});

test("boardNextLinks go to companion carers and disability jobs, not post-a-job", () => {
  assert.deepEqual(boardNextLinks(), [
    { href: "/caregivers/companion-care", label: "Open companion carers" },
    { href: "/care-requests?specialty=disability-support", label: "See open disability support jobs" },
  ]);
  assert.notDeepEqual(boardNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(boardNextLinks(), locationNextLinks());
  assert.notDeepEqual(boardNextLinks(), familyStartLinks());
  assert.notDeepEqual(boardNextLinks(), postJobNextLinks());
  assert.notDeepEqual(
    boardNextLinks(),
    requestsNextLinks({ href: "/care-requests/weekday-aged-care-marrickville" }),
  );
  assert.notDeepEqual(
    boardNextLinks(),
    [jobBoardListedLink({ filters: {}, specialtyName: undefined, specialtyPlural: undefined })],
  );
  assert.notDeepEqual(boardNextLinks()[1], guideBoardLink({ slug: "disability-support", name: "Disability support" }));
  assert.ok(!boardNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!boardNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!boardNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|babysitters|nannies/i.test(link.label)));
});
