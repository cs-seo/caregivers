import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { respiteNextLinks, respiteNextNotice } from "./respite-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { ntNextLinks, ntNextNotice, ntNextShows } from "./nt-next";

test("ntNextNotice names Darwin hubs without a count or Instant Book", () => {
  assert.match(ntNextNotice(), /Northern Territory/);
  assert.match(ntNextNotice(), /Darwin/);
  assert.match(ntNextNotice(), /aged care/);
  assert.doesNotMatch(ntNextNotice(), /\d+ open/);
  assert.doesNotMatch(ntNextNotice(), /Instant Book/);
  assert.doesNotMatch(ntNextNotice(), /Hire/);
  assert.doesNotMatch(ntNextNotice(), /job=/);
  assert.doesNotMatch(ntNextNotice(), /ACT/);
  assert.doesNotMatch(ntNextNotice(), /respite/);
  assert.doesNotMatch(ntNextNotice(), /babysitter/);
  assert.doesNotMatch(ntNextNotice(), /Tasmania/);
  assert.doesNotMatch(ntNextNotice(), /nurses/);
  assert.doesNotMatch(ntNextNotice(), /Adelaide/);
  assert.doesNotMatch(ntNextNotice(), /New South Wales/);
  assert.notEqual(ntNextNotice(), saNextNotice());
  assert.notEqual(ntNextNotice(), qldNextNotice());
  assert.notEqual(ntNextNotice(), vicNextNotice());
  assert.notEqual(ntNextNotice(), locationNextNotice());
  assert.notEqual(ntNextNotice(), caregiversNextNotice());
  assert.notEqual(ntNextNotice(), locationBoardNotice("Northern Territory"));
  assert.notEqual(ntNextNotice(), familyStartNotice());
  assert.notEqual(ntNextNotice(), respiteNextNotice());
});

test("ntNextShows is a signed-in family on the Northern Territory only", () => {
  assert.equal(ntNextShows({ isFamily: true, stateSlug: "nt" }), true);
  assert.equal(ntNextShows({ isFamily: true, stateSlug: "sa" }), false);
  assert.equal(ntNextShows({ isFamily: true, stateSlug: "act" }), false);
  assert.equal(ntNextShows({ isFamily: true, stateSlug: "nsw" }), false);
  assert.equal(ntNextShows({ isFamily: false, stateSlug: "nt" }), false);
});

test("ntNextLinks go to Darwin suburbs and aged care in the NT, not ACT or NSW", () => {
  assert.deepEqual(ntNextLinks(), [
    { href: "/locations/nt/darwin", label: "Open Darwin suburbs" },
    { href: "/caregivers/aged-care/nt", label: "Browse aged care in the Northern Territory" },
  ]);
  assert.notDeepEqual(ntNextLinks(), saNextLinks());
  assert.notDeepEqual(ntNextLinks(), qldNextLinks());
  assert.notDeepEqual(ntNextLinks(), vicNextLinks());
  assert.notDeepEqual(ntNextLinks(), locationNextLinks());
  assert.notDeepEqual(ntNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(ntNextLinks(), familyStartLinks());
  assert.notDeepEqual(ntNextLinks(), respiteNextLinks());
  assert.notDeepEqual(ntNextLinks(), [locationBoardLink({ state: "nt", stateName: "Northern Territory" })]);
  assert.ok(!ntNextLinks().some((link) => link.href === "/caregivers/respite/act"));
  assert.ok(!ntNextLinks().some((link) => link.href === "/guides/hire-a-babysitter"));
  assert.ok(!ntNextLinks().some((link) => link.href === "/caregivers/aged-care/nsw"));
  assert.ok(!ntNextLinks().some((link) => link.href === "/locations/nsw/sydney"));
  assert.ok(!ntNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!ntNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!ntNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
