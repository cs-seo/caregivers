import assert from "node:assert/strict";
import { test } from "node:test";
import { actNextLinks, actNextNotice } from "./act-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guestBrowseLinks, guestBrowseNotice } from "./guest-browse";
import { personalCareNextLinks, personalCareNextNotice } from "./personal-care-next";
import { profileCheckNextLinks, profileCheckNextNotice } from "./profile-check";
import { waNextLinks, waNextNotice } from "./wa-next";
import { registerNextLinks, registerNextNotice, registerNextShows } from "./register-next";

test("registerNextNotice names unused signed-in paths without a count or Instant Book", () => {
  assert.match(registerNextNotice(), /family account/);
  assert.match(registerNextNotice(), /Bendigo/);
  assert.match(registerNextNotice(), /after-school/);
  assert.match(registerNextNotice(), /Queensland/);
  assert.doesNotMatch(registerNextNotice(), /\d+ open/);
  assert.doesNotMatch(registerNextNotice(), /Instant Book/);
  assert.doesNotMatch(registerNextNotice(), /Hire/);
  assert.doesNotMatch(registerNextNotice(), /job=/);
  assert.doesNotMatch(registerNextNotice(), /Canberra/);
  assert.doesNotMatch(registerNextNotice(), /babysitters/);
  assert.doesNotMatch(registerNextNotice(), /Townsville/);
  assert.doesNotMatch(registerNextNotice(), /Ballarat/);
  assert.doesNotMatch(registerNextNotice(), /Mandurah/);
  assert.doesNotMatch(registerNextNotice(), /Create account/);
  assert.doesNotMatch(registerNextNotice(), /before you sign in/);
  assert.notEqual(registerNextNotice(), guestBrowseNotice());
  assert.notEqual(registerNextNotice(), familyStartNotice());
  assert.notEqual(registerNextNotice(), actNextNotice());
  assert.notEqual(registerNextNotice(), personalCareNextNotice());
  assert.notEqual(registerNextNotice(), profileCheckNextNotice());
  assert.notEqual(registerNextNotice(), waNextNotice());
});

test("registerNextShows is a signed-in family only", () => {
  assert.equal(registerNextShows({ isFamily: true }), true);
  assert.equal(registerNextShows({ isFamily: false }), false);
});

test("registerNextLinks go to Bendigo and QLD after-school, not Canberra or guest browse", () => {
  assert.deepEqual(registerNextLinks(), [
    { href: "/locations/vic/bendigo", label: "Open Bendigo locations" },
    { href: "/caregivers/after-school-care/qld", label: "Browse after-school carers in Queensland" },
  ]);
  assert.notDeepEqual(registerNextLinks(), guestBrowseLinks());
  assert.notDeepEqual(registerNextLinks(), familyStartLinks());
  assert.notDeepEqual(registerNextLinks(), actNextLinks());
  assert.notDeepEqual(registerNextLinks(), personalCareNextLinks());
  assert.notDeepEqual(registerNextLinks(), profileCheckNextLinks());
  assert.notDeepEqual(registerNextLinks(), waNextLinks());
  assert.ok(!registerNextLinks().some((link) => link.href === "/locations/act/canberra"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/caregivers/babysitters/act"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/caregivers/personal-care/qld/townsville"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/locations/vic/ballarat"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/locations"));
  assert.ok(!registerNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!registerNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!registerNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
