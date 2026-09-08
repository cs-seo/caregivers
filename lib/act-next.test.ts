import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { ntNextLinks, ntNextNotice } from "./nt-next";
import { personalCareNextLinks, personalCareNextNotice } from "./personal-care-next";
import { respiteNextLinks, respiteNextNotice } from "./respite-next";
import { waNextLinks, waNextNotice } from "./wa-next";
import { actNextLinks, actNextNotice, actNextShows } from "./act-next";

test("actNextNotice names unused Canberra hubs without a count or Instant Book", () => {
  assert.match(actNextNotice(), /Australian Capital Territory/);
  assert.match(actNextNotice(), /Canberra/);
  assert.match(actNextNotice(), /babysitters/);
  assert.doesNotMatch(actNextNotice(), /\d+ open/);
  assert.doesNotMatch(actNextNotice(), /Instant Book/);
  assert.doesNotMatch(actNextNotice(), /Hire/);
  assert.doesNotMatch(actNextNotice(), /job=/);
  assert.doesNotMatch(actNextNotice(), /respite/);
  assert.doesNotMatch(actNextNotice(), /Townsville/);
  assert.doesNotMatch(actNextNotice(), /Ballarat/);
  assert.doesNotMatch(actNextNotice(), /Mandurah/);
  assert.doesNotMatch(actNextNotice(), /nannies/);
  assert.doesNotMatch(actNextNotice(), /personal care/);
  assert.doesNotMatch(actNextNotice(), /babysitter guide/);
  assert.notEqual(actNextNotice(), respiteNextNotice());
  assert.notEqual(actNextNotice(), waNextNotice());
  assert.notEqual(actNextNotice(), ntNextNotice());
  assert.notEqual(actNextNotice(), personalCareNextNotice());
  assert.notEqual(actNextNotice(), caregiversNextNotice());
  assert.notEqual(actNextNotice(), locationNextNotice());
  assert.notEqual(actNextNotice(), locationBoardNotice("Australian Capital Territory"));
  assert.notEqual(actNextNotice(), familyStartNotice());
});

test("actNextShows is a signed-in family on the ACT only", () => {
  assert.equal(actNextShows({ isFamily: true, stateSlug: "act" }), true);
  assert.equal(actNextShows({ isFamily: true, stateSlug: "wa" }), false);
  assert.equal(actNextShows({ isFamily: true, stateSlug: "nt" }), false);
  assert.equal(actNextShows({ isFamily: false, stateSlug: "act" }), false);
});

test("actNextLinks go to Canberra and ACT babysitters, not respite or Townsville", () => {
  assert.deepEqual(actNextLinks(), [
    { href: "/locations/act/canberra", label: "Open Canberra suburbs" },
    { href: "/caregivers/babysitters/act", label: "Browse babysitters in the ACT" },
  ]);
  assert.notDeepEqual(actNextLinks(), respiteNextLinks());
  assert.notDeepEqual(actNextLinks(), waNextLinks());
  assert.notDeepEqual(actNextLinks(), ntNextLinks());
  assert.notDeepEqual(actNextLinks(), personalCareNextLinks());
  assert.notDeepEqual(actNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(actNextLinks(), locationNextLinks());
  assert.notDeepEqual(actNextLinks(), familyStartLinks());
  assert.notDeepEqual(actNextLinks(), [
    locationBoardLink({ state: "act", stateName: "Australian Capital Territory" }),
  ]);
  assert.ok(!actNextLinks().some((link) => link.href === "/caregivers/respite/act"));
  assert.ok(!actNextLinks().some((link) => link.href === "/guides/hire-a-babysitter"));
  assert.ok(!actNextLinks().some((link) => link.href === "/caregivers/personal-care/qld/townsville"));
  assert.ok(!actNextLinks().some((link) => link.href === "/locations/vic/ballarat"));
  assert.ok(!actNextLinks().some((link) => link.href === "/locations/wa/mandurah"));
  assert.ok(!actNextLinks().some((link) => link.href === "/caregivers/nannies/wa"));
  assert.ok(!actNextLinks().some((link) => link.href === "/caregivers/babysitters"));
  assert.ok(!actNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!actNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!actNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
