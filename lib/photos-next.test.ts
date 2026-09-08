import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { profileCheckNextLinks, profileCheckNextNotice } from "./profile-check";
import { shortlistPlacesLinks, shortlistPlacesNotice } from "./shortlist-places";
import { suburbNextNotice } from "./suburb-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { photosNextHasPhoto, photosNextLinks, photosNextNotice, photosNextShows } from "./photos-next";

test("photosNextNotice names unused portrait paths without a count or Instant Book", () => {
  assert.match(photosNextNotice(), /portrait/);
  assert.match(photosNextNotice(), /in-home aged care guide/);
  assert.match(photosNextNotice(), /Tasmania/);
  assert.doesNotMatch(photosNextNotice(), /\d+ open/);
  assert.doesNotMatch(photosNextNotice(), /Instant Book/);
  assert.doesNotMatch(photosNextNotice(), /Hire/);
  assert.doesNotMatch(photosNextNotice(), /job=/);
  assert.doesNotMatch(photosNextNotice(), /Wollongong/);
  assert.doesNotMatch(photosNextNotice(), /Newcastle/);
  assert.doesNotMatch(photosNextNotice(), /after-school/);
  assert.doesNotMatch(photosNextNotice(), /roster calendar/);
  assert.doesNotMatch(photosNextNotice(), /GST/);
  assert.notEqual(photosNextNotice(), profileCheckNextNotice());
  assert.notEqual(photosNextNotice(), shortlistPlacesNotice());
  assert.notEqual(photosNextNotice(), suburbNextNotice());
  assert.notEqual(photosNextNotice(), guidesIndexNextNotice());
  assert.notEqual(photosNextNotice(), trustNextNotice());
  assert.notEqual(photosNextNotice(), familyStartNotice());
});

test("photosNextShows is a signed-in family on a portrait when no check is soon", () => {
  assert.equal(photosNextHasPhoto("/portraits/james-okafor.svg"), true);
  assert.equal(photosNextHasPhoto(null), false);
  assert.equal(photosNextHasPhoto(""), false);
  assert.equal(photosNextShows({ isFamily: true, hasPhoto: true, expiringSoon: false }), true);
  assert.equal(photosNextShows({ isFamily: true, hasPhoto: true, expiringSoon: true }), false);
  assert.equal(photosNextShows({ isFamily: true, hasPhoto: false, expiringSoon: false }), false);
  assert.equal(photosNextShows({ isFamily: false, hasPhoto: true, expiringSoon: false }), false);
});

test("photosNextLinks go to aged care guide and Tasmania, not Wollongong or the roster", () => {
  assert.deepEqual(photosNextLinks(), [
    { href: "/guides/in-home-aged-care", label: "Open the in-home aged care guide" },
    { href: "/locations/tas", label: "Open Tasmania locations" },
  ]);
  assert.notDeepEqual(photosNextLinks(), profileCheckNextLinks());
  assert.notDeepEqual(photosNextLinks(), shortlistPlacesLinks());
  assert.notDeepEqual(photosNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(photosNextLinks(), trustNextLinks());
  assert.notDeepEqual(photosNextLinks(), familyStartLinks());
  assert.ok(!photosNextLinks().some((link) => link.href === "/dashboard/calendar"));
  assert.ok(!photosNextLinks().some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(!photosNextLinks().some((link) => link.href === "/locations/nsw/wollongong"));
  assert.ok(!photosNextLinks().some((link) => link.href === "/guides/gst-invoices-for-hcp-and-ndis"));
  assert.ok(!photosNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!photosNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!photosNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
