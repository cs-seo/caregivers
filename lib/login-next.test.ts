import assert from "node:assert/strict";
import { test } from "node:test";
import { guestBrowseLinks, guestBrowseNotice } from "./guest-browse";
import { hunterValleyNextLinks, hunterValleyNextNotice } from "./hunter-valley-next";
import { registerNextLinks, registerNextNotice, registerNextShows } from "./register-next";
import { loginNextLinks, loginNextNotice, loginNextShows } from "./login-next";

test("loginNextNotice names unused Logan and Moreton Bay paths without a count or Instant Book", () => {
  assert.match(loginNextNotice(), /signed in/);
  assert.match(loginNextNotice(), /family/);
  assert.match(loginNextNotice(), /Logan/);
  assert.match(loginNextNotice(), /Moreton Bay/);
  assert.doesNotMatch(loginNextNotice(), /\d+ open/);
  assert.doesNotMatch(loginNextNotice(), /Instant Book/);
  assert.doesNotMatch(loginNextNotice(), /Hire/);
  assert.doesNotMatch(loginNextNotice(), /job=/);
  assert.doesNotMatch(loginNextNotice(), /Hunter Valley/);
  assert.doesNotMatch(loginNextNotice(), /Yarra Valley/);
  assert.doesNotMatch(loginNextNotice(), /Adelaide Hills/);
  assert.doesNotMatch(loginNextNotice(), /Barossa/);
  assert.doesNotMatch(loginNextNotice(), /Southern Highlands/);
  assert.doesNotMatch(loginNextNotice(), /Bendigo/);
  assert.doesNotMatch(loginNextNotice(), /Create account/);
  assert.doesNotMatch(loginNextNotice(), /before you sign in/);
  assert.notEqual(loginNextNotice(), registerNextNotice());
  assert.notEqual(loginNextNotice(), guestBrowseNotice());
  assert.notEqual(loginNextNotice(), hunterValleyNextNotice());
});

test("loginNextShows is a signed-in family only", () => {
  assert.equal(loginNextShows({ isFamily: true }), true);
  assert.equal(loginNextShows({ isFamily: false }), false);
  assert.equal(registerNextShows({ isFamily: true }), true);
});

test("loginNextLinks go to Logan and Moreton Bay, not Hunter Valley or guest browse", () => {
  assert.deepEqual(loginNextLinks(), [
    { href: "/locations/qld/logan", label: "Open Logan locations" },
    { href: "/locations/qld/moreton-bay", label: "Open Moreton Bay locations" },
  ]);
  assert.notDeepEqual(loginNextLinks(), registerNextLinks());
  assert.notDeepEqual(loginNextLinks(), guestBrowseLinks());
  assert.notDeepEqual(loginNextLinks(), hunterValleyNextLinks());
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/nsw/hunter-valley"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/vic/yarra-valley"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/sa/adelaide-hills"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/sa/barossa"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/nsw/southern-highlands"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations/vic/bendigo"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/locations"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/register"));
  assert.ok(!loginNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!loginNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!loginNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
