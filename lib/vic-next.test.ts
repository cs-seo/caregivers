import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationSpecialtyLinks, locationSpecialtyNotice } from "./location-hub";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { vicNextLinks, vicNextNotice, vicNextShows } from "./vic-next";

test("vicNextNotice names Melbourne hubs without a count or Instant Book", () => {
  assert.match(vicNextNotice(), /Victoria/);
  assert.match(vicNextNotice(), /Melbourne/);
  assert.match(vicNextNotice(), /personal care/);
  assert.doesNotMatch(vicNextNotice(), /\d+ open/);
  assert.doesNotMatch(vicNextNotice(), /Instant Book/);
  assert.doesNotMatch(vicNextNotice(), /Hire/);
  assert.doesNotMatch(vicNextNotice(), /job=/);
  assert.doesNotMatch(vicNextNotice(), /Sydney/);
  assert.doesNotMatch(vicNextNotice(), /nannies/);
  assert.doesNotMatch(vicNextNotice(), /nanny guide/);
  assert.doesNotMatch(vicNextNotice(), /New South Wales/);
  assert.notEqual(vicNextNotice(), locationNextNotice());
  assert.notEqual(vicNextNotice(), caregiversNextNotice());
  assert.notEqual(vicNextNotice(), locationSpecialtyNotice());
  assert.notEqual(vicNextNotice(), locationBoardNotice("Victoria"));
  assert.notEqual(vicNextNotice(), familyStartNotice());
  assert.notEqual(vicNextNotice(), guidesIndexNextNotice());
  assert.notEqual(vicNextNotice(), suburbNextNotice());
});

test("vicNextShows is a signed-in family on Victoria only", () => {
  assert.equal(vicNextShows({ isFamily: true, stateSlug: "vic" }), true);
  assert.equal(vicNextShows({ isFamily: true, stateSlug: "nsw" }), false);
  assert.equal(vicNextShows({ isFamily: true, stateSlug: "qld" }), false);
  assert.equal(vicNextShows({ isFamily: false, stateSlug: "vic" }), false);
});

test("vicNextLinks go to Melbourne suburbs and personal care in Victoria, not NSW", () => {
  assert.deepEqual(vicNextLinks(), [
    { href: "/locations/vic/melbourne", label: "Open Melbourne suburbs" },
    { href: "/caregivers/personal-care/vic", label: "Browse personal care in Victoria" },
  ]);
  assert.notDeepEqual(vicNextLinks(), locationNextLinks());
  assert.notDeepEqual(vicNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(vicNextLinks(), familyStartLinks());
  assert.notDeepEqual(vicNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(vicNextLinks(), [locationBoardLink({ state: "vic", stateName: "Victoria" })]);
  assert.notDeepEqual(
    vicNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(
    vicNextLinks(),
    locationSpecialtyLinks([{ slug: "personal-care", pluralName: "Personal care assistants" }]),
  );
  assert.ok(!vicNextLinks().some((link) => link.href === "/locations/nsw"));
  assert.ok(!vicNextLinks().some((link) => link.href === "/locations/nsw/sydney"));
  assert.ok(!vicNextLinks().some((link) => link.href === "/guides/personal-care-assistant"));
  assert.ok(!vicNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!vicNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!vicNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
