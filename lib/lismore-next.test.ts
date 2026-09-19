import assert from "node:assert/strict";
import { test } from "node:test";
import { bookNextLinks, bookNextNotice } from "./book-next";
import { housekeepingSaNextLinks, housekeepingSaNextNotice } from "./housekeeping-sa-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { locationNextLinks, locationNextNotice } from "./location-next";
import { newcastleNextLinks, newcastleNextNotice } from "./newcastle-next";
import { shortlistPlacesLinks, shortlistPlacesNotice } from "./shortlist-places";
import { toowoombaNextLinks, toowoombaNextNotice } from "./toowoomba-next";
import { lismoreNextLinks, lismoreNextNotice, lismoreNextShows } from "./lismore-next";

test("lismoreNextNotice names unused NSW city hubs without a count or Instant Book", () => {
  assert.match(lismoreNextNotice(), /Lismore/);
  assert.match(lismoreNextNotice(), /Bathurst/);
  assert.match(lismoreNextNotice(), /Dubbo/);
  assert.doesNotMatch(lismoreNextNotice(), /\d+ open/);
  assert.doesNotMatch(lismoreNextNotice(), /Instant Book/);
  assert.doesNotMatch(lismoreNextNotice(), /Hire/);
  assert.doesNotMatch(lismoreNextNotice(), /job=/);
  assert.doesNotMatch(lismoreNextNotice(), /Port Lincoln/);
  assert.doesNotMatch(lismoreNextNotice(), /Victor Harbor/);
  assert.doesNotMatch(lismoreNextNotice(), /Mackay/);
  assert.doesNotMatch(lismoreNextNotice(), /Rockhampton/);
  assert.doesNotMatch(lismoreNextNotice(), /Toowoomba/);
  assert.doesNotMatch(lismoreNextNotice(), /Nowra/);
  assert.doesNotMatch(lismoreNextNotice(), /Wollongong/);
  assert.doesNotMatch(lismoreNextNotice(), /Newcastle/);
  assert.notEqual(lismoreNextNotice(), toowoombaNextNotice());
  assert.notEqual(lismoreNextNotice(), housekeepingSaNextNotice());
  assert.notEqual(lismoreNextNotice(), newcastleNextNotice());
  assert.notEqual(lismoreNextNotice(), locationNextNotice());
  assert.notEqual(lismoreNextNotice(), shortlistPlacesNotice());
  assert.notEqual(lismoreNextNotice(), bookNextNotice());
  assert.notEqual(lismoreNextNotice(), locationBoardNotice("Lismore"));
});

test("lismoreNextShows is a signed-in family on Lismore only", () => {
  assert.equal(lismoreNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "lismore" }), true);
  assert.equal(lismoreNextShows({ isFamily: true, stateSlug: "nsw", citySlug: "newcastle" }), false);
  assert.equal(lismoreNextShows({ isFamily: true, stateSlug: "qld", citySlug: "toowoomba" }), false);
  assert.equal(lismoreNextShows({ isFamily: false, stateSlug: "nsw", citySlug: "lismore" }), false);
});

test("lismoreNextLinks go to Bathurst and Dubbo, not Port Lincoln or Mackay", () => {
  assert.deepEqual(lismoreNextLinks(), [
    { href: "/locations/nsw/bathurst", label: "Open Bathurst locations" },
    { href: "/locations/nsw/dubbo", label: "Open Dubbo locations" },
  ]);
  assert.notDeepEqual(lismoreNextLinks(), toowoombaNextLinks());
  assert.notDeepEqual(lismoreNextLinks(), housekeepingSaNextLinks());
  assert.notDeepEqual(lismoreNextLinks(), newcastleNextLinks());
  assert.notDeepEqual(lismoreNextLinks(), locationNextLinks());
  assert.notDeepEqual(lismoreNextLinks(), shortlistPlacesLinks());
  assert.notDeepEqual(lismoreNextLinks(), bookNextLinks());
  assert.notDeepEqual(lismoreNextLinks(), [locationBoardLink({ city: "lismore", cityName: "Lismore" })]);
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/sa/port-lincoln"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/sa/victor-harbor"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/qld/mackay"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/qld/rockhampton"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/qld/toowoomba"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/nsw/nowra"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/locations/nsw/wollongong"));
  assert.ok(!lismoreNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!lismoreNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!lismoreNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
