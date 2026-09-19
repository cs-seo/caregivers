import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationSpecialtyLinks, locationSpecialtyNotice } from "./location-hub";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { locationNextLinks, locationNextNotice, locationNextShows } from "./location-next";

test("locationNextNotice names city hubs without a count or Instant Book", () => {
  assert.match(locationNextNotice(), /City and suburb hubs/);
  assert.match(locationNextNotice(), /Sydney/);
  assert.match(locationNextNotice(), /nannies/);
  assert.doesNotMatch(locationNextNotice(), /\d+ open/);
  assert.doesNotMatch(locationNextNotice(), /Instant Book/);
  assert.doesNotMatch(locationNextNotice(), /Hire/);
  assert.doesNotMatch(locationNextNotice(), /job=/);
  assert.doesNotMatch(locationNextNotice(), /Post a care request/);
  assert.notEqual(locationNextNotice(), locationSpecialtyNotice());
  assert.notEqual(locationNextNotice(), locationBoardNotice("Sydney"));
  assert.notEqual(locationNextNotice(), familyStartNotice());
  assert.notEqual(locationNextNotice(), guideNextNotice());
  assert.notEqual(locationNextNotice(), suburbNextNotice());
});

test("locationNextShows is only a signed-in family", () => {
  assert.equal(locationNextShows({ isFamily: true }), true);
  assert.equal(locationNextShows({ isFamily: false }), false);
});

test("locationNextLinks go to Sydney suburbs and nannies, not post-a-job", () => {
  assert.deepEqual(locationNextLinks(), [
    { href: "/locations/nsw/sydney", label: "Open Sydney suburbs" },
    { href: "/caregivers/nannies", label: "Browse nannies Australia-wide" },
  ]);
  assert.notDeepEqual(locationNextLinks(), familyStartLinks());
  assert.notDeepEqual(
    locationNextLinks(),
    guideNextLinks({
      specialtySlug: "aged-care",
      specialtyPlural: "Aged care carers",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.notDeepEqual(
    locationNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(locationNextLinks(), [locationBoardLink({ city: "sydney", cityName: "Sydney" })]);
  assert.notDeepEqual(
    locationNextLinks(),
    locationSpecialtyLinks([
      { slug: "aged-care", pluralName: "Aged care carers" },
      { slug: "nannies", pluralName: "Nannies" },
    ]),
  );
  assert.notEqual(
    locationNextLinks()[1],
    locationSpecialtyLinks([{ slug: "nannies", pluralName: "Nannies" }])[0],
  );
  assert.ok(!locationNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!locationNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!locationNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
