import assert from "node:assert/strict";
import { test } from "node:test";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";

test("proposalAlertsNextNotice names shortlist Instant Book without a count or hire CTA", () => {
  assert.match(proposalAlertsNextNotice(), /shortlist/);
  assert.match(proposalAlertsNextNotice(), /Instant Book/);
  assert.doesNotMatch(proposalAlertsNextNotice(), /\d+ open/);
  assert.doesNotMatch(proposalAlertsNextNotice(), /Hire/);
  assert.doesNotMatch(proposalAlertsNextNotice(), /Pass on/);
  assert.doesNotMatch(proposalAlertsNextNotice(), /job=/);
  assert.notEqual(proposalAlertsNextNotice(), reviewsDueNextNotice());
  assert.notEqual(proposalAlertsNextNotice(), shortlistHireNotice());
});

test("proposalAlertsNextLinks go to the shortlist and directory, not a specific request", () => {
  assert.deepEqual(proposalAlertsNextLinks(), [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    { href: "/caregivers", label: "Browse verified carers" },
  ]);
  assert.notDeepEqual(proposalAlertsNextLinks(), reviewsDueNextLinks());
  assert.notDeepEqual(proposalAlertsNextLinks(), shortlistHireLinks());
  assert.ok(!proposalAlertsNextLinks().some((link) => link.href.startsWith("/care-requests/")));
  assert.ok(!proposalAlertsNextLinks().some((link) => link.href === "/post-a-job"));
});
