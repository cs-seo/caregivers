import assert from "node:assert/strict";
import { test } from "node:test";
import { calendarNextLinks, calendarNextNotice } from "./calendar-next";
import { profileMoreLink, profileMoreNotice } from "./profile-more";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";
import { suburbNextLinks, suburbNextNotice } from "./suburb-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import {
  profileCheckExpiringSoon,
  profileCheckNextLinks,
  profileCheckNextNotice,
  profileCheckNextShows,
} from "./profile-check";

test("profileCheckNextNotice names an expiring check without a count or Instant Book", () => {
  assert.match(profileCheckNextNotice(), /expires soon/);
  assert.match(profileCheckNextNotice(), /roster calendar/);
  assert.match(profileCheckNextNotice(), /after-school/);
  assert.doesNotMatch(profileCheckNextNotice(), /\d+ open/);
  assert.doesNotMatch(profileCheckNextNotice(), /Instant Book/);
  assert.doesNotMatch(profileCheckNextNotice(), /Hire/);
  assert.doesNotMatch(profileCheckNextNotice(), /job=/);
  assert.doesNotMatch(profileCheckNextNotice(), /Trust and safety/);
  assert.notEqual(profileCheckNextNotice(), profileMoreNotice("Aged care carers", "Sydney"));
  assert.notEqual(profileCheckNextNotice(), calendarNextNotice());
  assert.notEqual(profileCheckNextNotice(), trustNextNotice());
  assert.notEqual(profileCheckNextNotice(), suburbNextNotice());
  assert.notEqual(profileCheckNextNotice(), reviewsDueNextNotice());
});

test("profileCheckNextShows is a signed-in family when a check is soon or expired", () => {
  assert.equal(profileCheckExpiringSoon([{ state: "soon" }]), true);
  assert.equal(profileCheckExpiringSoon([{ state: "expired" }]), true);
  assert.equal(profileCheckExpiringSoon([]), false);
  assert.equal(profileCheckNextShows({ isFamily: true, expiringSoon: true }), true);
  assert.equal(profileCheckNextShows({ isFamily: true, expiringSoon: false }), false);
  assert.equal(profileCheckNextShows({ isFamily: false, expiringSoon: true }), false);
});

test("profileCheckNextLinks go to the roster and after-school carers, not post-a-job", () => {
  assert.deepEqual(profileCheckNextLinks(), [
    { href: "/dashboard/calendar", label: "Open the roster calendar" },
    { href: "/caregivers/after-school-care", label: "Open after-school carers" },
  ]);
  assert.notDeepEqual(profileCheckNextLinks(), calendarNextLinks());
  assert.notDeepEqual(profileCheckNextLinks(), trustNextLinks());
  assert.notDeepEqual(profileCheckNextLinks(), reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }));
  assert.notDeepEqual(
    profileCheckNextLinks(),
    suburbNextLinks({
      profileHref: "/caregiver/sarah-nguyen-aged-care-sydney",
      profileName: "Sarah Nguyen",
      cityHref: "/caregivers/aged-care/nsw/sydney",
    }),
  );
  assert.notDeepEqual(
    profileCheckNextLinks()[1],
    profileMoreLink({
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      specialtyPlural: "Aged care carers",
      cityName: "Sydney",
    }),
  );
  assert.ok(!profileCheckNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!profileCheckNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!profileCheckNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
