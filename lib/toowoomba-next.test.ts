import assert from "node:assert/strict";
import { test } from "node:test";
import { agedCareNextLinks, agedCareNextNotice } from "./aged-care-next";
import { bookNextLinks, bookNextNotice } from "./book-next";
import { goldCoastNextLinks, goldCoastNextNotice } from "./gold-coast-next";
import { locationBoardLink, locationBoardNotice } from "./job-board";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { registerNextLinks, registerNextNotice } from "./register-next";
import { toowoombaNextLinks, toowoombaNextNotice, toowoombaNextShows } from "./toowoomba-next";

test("toowoombaNextNotice names unused QLD city hubs without a count or Instant Book", () => {
  assert.match(toowoombaNextNotice(), /Toowoomba/);
  assert.match(toowoombaNextNotice(), /Mackay/);
  assert.match(toowoombaNextNotice(), /Rockhampton/);
  assert.doesNotMatch(toowoombaNextNotice(), /\d+ open/);
  assert.doesNotMatch(toowoombaNextNotice(), /Instant Book/);
  assert.doesNotMatch(toowoombaNextNotice(), /Hire/);
  assert.doesNotMatch(toowoombaNextNotice(), /job=/);
  assert.doesNotMatch(toowoombaNextNotice(), /Nowra/);
  assert.doesNotMatch(toowoombaNextNotice(), /Whyalla/);
  assert.doesNotMatch(toowoombaNextNotice(), /Bendigo/);
  assert.doesNotMatch(toowoombaNextNotice(), /Sunshine Coast/);
  assert.doesNotMatch(toowoombaNextNotice(), /Cairns/);
  assert.doesNotMatch(toowoombaNextNotice(), /Gold Coast/);
  assert.doesNotMatch(toowoombaNextNotice(), /Brisbane/);
  assert.notEqual(toowoombaNextNotice(), qldNextNotice());
  assert.notEqual(toowoombaNextNotice(), goldCoastNextNotice());
  assert.notEqual(toowoombaNextNotice(), agedCareNextNotice());
  assert.notEqual(toowoombaNextNotice(), bookNextNotice());
  assert.notEqual(toowoombaNextNotice(), registerNextNotice());
  assert.notEqual(toowoombaNextNotice(), locationBoardNotice("Toowoomba"));
});

test("toowoombaNextShows is a signed-in family on Toowoomba only", () => {
  assert.equal(toowoombaNextShows({ isFamily: true, stateSlug: "qld", citySlug: "toowoomba" }), true);
  assert.equal(toowoombaNextShows({ isFamily: true, stateSlug: "qld", citySlug: "gold-coast" }), false);
  assert.equal(toowoombaNextShows({ isFamily: true, stateSlug: "qld", citySlug: "brisbane" }), false);
  assert.equal(toowoombaNextShows({ isFamily: false, stateSlug: "qld", citySlug: "toowoomba" }), false);
});

test("toowoombaNextLinks go to Mackay and Rockhampton, not Nowra or Sunshine Coast", () => {
  assert.deepEqual(toowoombaNextLinks(), [
    { href: "/locations/qld/mackay", label: "Open Mackay locations" },
    { href: "/locations/qld/rockhampton", label: "Open Rockhampton locations" },
  ]);
  assert.notDeepEqual(toowoombaNextLinks(), qldNextLinks());
  assert.notDeepEqual(toowoombaNextLinks(), goldCoastNextLinks());
  assert.notDeepEqual(toowoombaNextLinks(), agedCareNextLinks());
  assert.notDeepEqual(toowoombaNextLinks(), bookNextLinks());
  assert.notDeepEqual(toowoombaNextLinks(), registerNextLinks());
  assert.notDeepEqual(toowoombaNextLinks(), [locationBoardLink({ city: "toowoomba", cityName: "Toowoomba" })]);
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/locations/nsw/nowra"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/locations/sa/whyalla"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/caregivers/aged-care/qld/sunshine-coast"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/locations/qld/cairns"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/locations/qld/brisbane"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!toowoombaNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!toowoombaNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
