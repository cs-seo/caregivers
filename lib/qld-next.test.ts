import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationSpecialtyLinks, locationSpecialtyNotice } from "./location-hub";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { qldNextLinks, qldNextNotice, qldNextShows } from "./qld-next";

test("qldNextNotice names Brisbane hubs without a count or Instant Book", () => {
  assert.match(qldNextNotice(), /Queensland/);
  assert.match(qldNextNotice(), /Brisbane/);
  assert.match(qldNextNotice(), /nurses/);
  assert.doesNotMatch(qldNextNotice(), /\d+ open/);
  assert.doesNotMatch(qldNextNotice(), /Instant Book/);
  assert.doesNotMatch(qldNextNotice(), /Hire/);
  assert.doesNotMatch(qldNextNotice(), /job=/);
  assert.doesNotMatch(qldNextNotice(), /Melbourne/);
  assert.doesNotMatch(qldNextNotice(), /personal care/);
  assert.doesNotMatch(qldNextNotice(), /Sydney/);
  assert.doesNotMatch(qldNextNotice(), /nannies/);
  assert.doesNotMatch(qldNextNotice(), /Victoria/);
  assert.notEqual(qldNextNotice(), vicNextNotice());
  assert.notEqual(qldNextNotice(), locationNextNotice());
  assert.notEqual(qldNextNotice(), caregiversNextNotice());
  assert.notEqual(qldNextNotice(), locationSpecialtyNotice());
  assert.notEqual(qldNextNotice(), locationBoardNotice("Queensland"));
  assert.notEqual(qldNextNotice(), familyStartNotice());
  assert.notEqual(qldNextNotice(), guidesIndexNextNotice());
  assert.notEqual(qldNextNotice(), suburbNextNotice());
});

test("qldNextShows is a signed-in family on Queensland only", () => {
  assert.equal(qldNextShows({ isFamily: true, stateSlug: "qld" }), true);
  assert.equal(qldNextShows({ isFamily: true, stateSlug: "vic" }), false);
  assert.equal(qldNextShows({ isFamily: true, stateSlug: "nsw" }), false);
  assert.equal(qldNextShows({ isFamily: false, stateSlug: "qld" }), false);
});

test("qldNextLinks go to Brisbane suburbs and nurses in Queensland, not Melbourne", () => {
  assert.deepEqual(qldNextLinks(), [
    { href: "/locations/qld/brisbane", label: "Open Brisbane suburbs" },
    { href: "/caregivers/nursing/qld", label: "Browse nurses in Queensland" },
  ]);
  assert.notDeepEqual(qldNextLinks(), vicNextLinks());
  assert.notDeepEqual(qldNextLinks(), locationNextLinks());
  assert.notDeepEqual(qldNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(qldNextLinks(), familyStartLinks());
  assert.notDeepEqual(qldNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(qldNextLinks(), [locationBoardLink({ state: "qld", stateName: "Queensland" })]);
  assert.notDeepEqual(
    qldNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(
    qldNextLinks(),
    locationSpecialtyLinks([{ slug: "nursing", pluralName: "Nurses" }]),
  );
  assert.ok(!qldNextLinks().some((link) => link.href === "/locations/vic/melbourne"));
  assert.ok(!qldNextLinks().some((link) => link.href === "/caregivers/personal-care/vic"));
  assert.ok(!qldNextLinks().some((link) => link.href === "/locations/nsw"));
  assert.ok(!qldNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!qldNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!qldNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
