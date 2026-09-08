import assert from "node:assert/strict";
import { test } from "node:test";
import { disputeNextLinks, disputeNextNotice } from "./dispute-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guestBrowseLinks, guestBrowseNotice } from "./guest-browse";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { postJobNextLinks, postJobNextNotice } from "./post-job-next";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";

test("homeFamilyNotice names dashboard and saved carers without a count or Instant Book CTA", () => {
  assert.match(homeFamilyNotice(), /signed in/);
  assert.match(homeFamilyNotice(), /dashboard/);
  assert.match(homeFamilyNotice(), /saved/);
  assert.doesNotMatch(homeFamilyNotice(), /\d+ open/);
  assert.doesNotMatch(homeFamilyNotice(), /Instant Book/);
  assert.doesNotMatch(homeFamilyNotice(), /job=/);
  assert.notEqual(homeFamilyNotice(), familyStartNotice());
  assert.notEqual(homeFamilyNotice(), guestBrowseNotice());
  assert.notEqual(homeFamilyNotice(), proposalAlertsNextNotice());
  assert.notEqual(homeFamilyNotice(), postJobNextNotice());
  assert.notEqual(homeFamilyNotice(), disputeNextNotice(true));
});

test("homeFamilyLinks go to the dashboard and shortlist, not post-a-job", () => {
  assert.deepEqual(homeFamilyLinks(), [
    { href: "/dashboard", label: "Open your dashboard" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(homeFamilyLinks(), familyStartLinks());
  assert.notDeepEqual(homeFamilyLinks(), guestBrowseLinks());
  assert.notDeepEqual(homeFamilyLinks(), proposalAlertsNextLinks());
  assert.notDeepEqual(homeFamilyLinks(), postJobNextLinks());
  assert.notDeepEqual(homeFamilyLinks(), disputeNextLinks({ isFamily: true, bookingId: "sit-1" }));
  assert.ok(!homeFamilyLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!homeFamilyLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!homeFamilyLinks().some((link) => link.href.includes("job=")));
});
