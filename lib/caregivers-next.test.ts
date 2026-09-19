import assert from "node:assert/strict";
import { test } from "node:test";
import { directoryBoardLink, directoryBoardNotice } from "./directory";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import {
  caregiversNextLinks,
  caregiversNextNotice,
  caregiversNextShows,
  directoryIsNationalPath,
} from "./caregivers-next";

test("caregiversNextNotice names babysitters without a count or Instant Book", () => {
  assert.match(caregiversNextNotice(), /every specialty/);
  assert.match(caregiversNextNotice(), /babysitters/);
  assert.match(caregiversNextNotice(), /New South Wales/);
  assert.doesNotMatch(caregiversNextNotice(), /\d+ open/);
  assert.doesNotMatch(caregiversNextNotice(), /Instant Book/);
  assert.doesNotMatch(caregiversNextNotice(), /Hire/);
  assert.doesNotMatch(caregiversNextNotice(), /job=/);
  assert.doesNotMatch(caregiversNextNotice(), /nannies/);
  assert.notEqual(caregiversNextNotice(), locationNextNotice());
  assert.notEqual(caregiversNextNotice(), directoryBoardNotice());
  assert.notEqual(caregiversNextNotice(), familyStartNotice());
  assert.notEqual(caregiversNextNotice(), guideNextNotice());
  assert.notEqual(caregiversNextNotice(), suburbNextNotice());
});

test("directoryIsNationalPath is only the Australia-wide carers list", () => {
  assert.equal(directoryIsNationalPath("/caregivers"), true);
  assert.equal(directoryIsNationalPath("/caregivers/babysitters"), false);
  assert.equal(directoryIsNationalPath("/caregivers/aged-care/nsw"), false);
  assert.equal(directoryIsNationalPath("/caregivers/aged-care/nsw/sydney/marrickville"), false);
  assert.equal(directoryIsNationalPath("/locations"), false);
});

test("caregiversNextShows is family, national path, no job, and no specialty filter", () => {
  assert.equal(caregiversNextShows({ isFamily: true, nationalPath: true }), true);
  assert.equal(caregiversNextShows({ isFamily: true, nationalPath: true, jobAttached: true }), false);
  assert.equal(caregiversNextShows({ isFamily: true, nationalPath: true, specialtyFilter: true }), false);
  assert.equal(caregiversNextShows({ isFamily: false, nationalPath: true }), false);
  assert.equal(caregiversNextShows({ isFamily: true, nationalPath: false }), false);
});

test("caregiversNextLinks go to babysitters and NSW cities, not post-a-job", () => {
  assert.deepEqual(caregiversNextLinks(), [
    { href: "/caregivers/babysitters", label: "Browse babysitters Australia-wide" },
    { href: "/locations/nsw", label: "Open New South Wales cities" },
  ]);
  assert.notDeepEqual(caregiversNextLinks(), locationNextLinks());
  assert.notDeepEqual(caregiversNextLinks(), familyStartLinks());
  assert.notDeepEqual(caregiversNextLinks(), [directoryBoardLink()]);
  assert.notDeepEqual(
    caregiversNextLinks(),
    guideNextLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.notDeepEqual(
    caregiversNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.ok(!caregiversNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!caregiversNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!caregiversNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|nannies/i.test(link.label)));
});
