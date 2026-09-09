import assert from "node:assert/strict";
import { test } from "node:test";
import { actNextLinks, actNextNotice } from "./act-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { perthNextLinks, perthNextNotice } from "./perth-next";
import { registerNextLinks, registerNextNotice } from "./register-next";
import { shortlistPlacesLinks, shortlistPlacesNotice } from "./shortlist-places";
import { bookNextLinks, bookNextNotice, bookNextShows } from "./book-next";

test("bookNextNotice names unused sit-form paths without a count or Instant Book", () => {
  assert.match(bookNextNotice(), /sit form/);
  assert.match(bookNextNotice(), /Nowra/);
  assert.match(bookNextNotice(), /Whyalla/);
  assert.doesNotMatch(bookNextNotice(), /\d+ open/);
  assert.doesNotMatch(bookNextNotice(), /Instant Book/);
  assert.doesNotMatch(bookNextNotice(), /Hire/);
  assert.doesNotMatch(bookNextNotice(), /job=/);
  assert.doesNotMatch(bookNextNotice(), /Bendigo/);
  assert.doesNotMatch(bookNextNotice(), /Queensland/);
  assert.doesNotMatch(bookNextNotice(), /after-school/);
  assert.doesNotMatch(bookNextNotice(), /Canberra/);
  assert.doesNotMatch(bookNextNotice(), /Create account/);
  assert.doesNotMatch(bookNextNotice(), /family account/);
  assert.notEqual(bookNextNotice(), registerNextNotice());
  assert.notEqual(bookNextNotice(), shortlistPlacesNotice());
  assert.notEqual(bookNextNotice(), perthNextNotice());
  assert.notEqual(bookNextNotice(), actNextNotice());
  assert.notEqual(bookNextNotice(), familyStartNotice());
});

test("bookNextShows is a signed-in family with no job attached", () => {
  assert.equal(bookNextShows({ isFamily: true, jobAttached: false }), true);
  assert.equal(bookNextShows({ isFamily: true, jobAttached: true }), false);
  assert.equal(bookNextShows({ isFamily: false, jobAttached: false }), false);
});

test("bookNextLinks go to Nowra and Whyalla, not Bendigo or register leftover dests", () => {
  assert.deepEqual(bookNextLinks(), [
    { href: "/locations/nsw/nowra", label: "Open Nowra locations" },
    { href: "/locations/sa/whyalla", label: "Open Whyalla locations" },
  ]);
  assert.notDeepEqual(bookNextLinks(), registerNextLinks());
  assert.notDeepEqual(bookNextLinks(), shortlistPlacesLinks());
  assert.notDeepEqual(bookNextLinks(), perthNextLinks());
  assert.notDeepEqual(bookNextLinks(), actNextLinks());
  assert.notDeepEqual(bookNextLinks(), familyStartLinks());
  assert.ok(!bookNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!bookNextLinks().some((link) => link.href === "/caregivers/after-school-care/qld"));
  assert.ok(!bookNextLinks().some((link) => link.href === "/locations/act/canberra"));
  assert.ok(!bookNextLinks().some((link) => link.href === "/register"));
  assert.ok(!bookNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!bookNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!bookNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
