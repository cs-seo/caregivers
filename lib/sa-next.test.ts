import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationSpecialtyLinks, locationSpecialtyNotice } from "./location-hub";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { vicNextLinks, vicNextNotice } from "./vic-next";
import { saNextLinks, saNextNotice, saNextShows } from "./sa-next";

test("saNextNotice names Adelaide hubs without a count or Instant Book", () => {
  assert.match(saNextNotice(), /South Australia/);
  assert.match(saNextNotice(), /Adelaide/);
  assert.match(saNextNotice(), /respite/);
  assert.doesNotMatch(saNextNotice(), /\d+ open/);
  assert.doesNotMatch(saNextNotice(), /Instant Book/);
  assert.doesNotMatch(saNextNotice(), /Hire/);
  assert.doesNotMatch(saNextNotice(), /job=/);
  assert.doesNotMatch(saNextNotice(), /Brisbane/);
  assert.doesNotMatch(saNextNotice(), /Melbourne/);
  assert.doesNotMatch(saNextNotice(), /nurses/);
  assert.doesNotMatch(saNextNotice(), /personal care/);
  assert.doesNotMatch(saNextNotice(), /Sydney/);
  assert.doesNotMatch(saNextNotice(), /nannies/);
  assert.doesNotMatch(saNextNotice(), /overnight respite/);
  assert.notEqual(saNextNotice(), qldNextNotice());
  assert.notEqual(saNextNotice(), vicNextNotice());
  assert.notEqual(saNextNotice(), locationNextNotice());
  assert.notEqual(saNextNotice(), caregiversNextNotice());
  assert.notEqual(saNextNotice(), locationSpecialtyNotice());
  assert.notEqual(saNextNotice(), locationBoardNotice("South Australia"));
  assert.notEqual(saNextNotice(), familyStartNotice());
  assert.notEqual(saNextNotice(), guidesIndexNextNotice());
  assert.notEqual(saNextNotice(), trustNextNotice());
  assert.notEqual(saNextNotice(), suburbNextNotice());
});

test("saNextShows is a signed-in family on South Australia only", () => {
  assert.equal(saNextShows({ isFamily: true, stateSlug: "sa" }), true);
  assert.equal(saNextShows({ isFamily: true, stateSlug: "qld" }), false);
  assert.equal(saNextShows({ isFamily: true, stateSlug: "vic" }), false);
  assert.equal(saNextShows({ isFamily: true, stateSlug: "nsw" }), false);
  assert.equal(saNextShows({ isFamily: false, stateSlug: "sa" }), false);
});

test("saNextLinks go to Adelaide suburbs and respite in South Australia, not Brisbane", () => {
  assert.deepEqual(saNextLinks(), [
    { href: "/locations/sa/adelaide", label: "Open Adelaide suburbs" },
    { href: "/caregivers/respite/sa", label: "Browse respite in South Australia" },
  ]);
  assert.notDeepEqual(saNextLinks(), qldNextLinks());
  assert.notDeepEqual(saNextLinks(), vicNextLinks());
  assert.notDeepEqual(saNextLinks(), locationNextLinks());
  assert.notDeepEqual(saNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(saNextLinks(), familyStartLinks());
  assert.notDeepEqual(saNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(saNextLinks(), trustNextLinks());
  assert.notDeepEqual(saNextLinks(), [locationBoardLink({ state: "sa", stateName: "South Australia" })]);
  assert.notDeepEqual(
    saNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(
    saNextLinks(),
    locationSpecialtyLinks([{ slug: "respite", pluralName: "Respite carers" }]),
  );
  assert.ok(!saNextLinks().some((link) => link.href === "/locations/qld/brisbane"));
  assert.ok(!saNextLinks().some((link) => link.href === "/caregivers/nursing/qld"));
  assert.ok(!saNextLinks().some((link) => link.href === "/locations/vic/melbourne"));
  assert.ok(!saNextLinks().some((link) => link.href === "/guides/overnight-respite-care"));
  assert.ok(!saNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!saNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!saNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
