import assert from "node:assert/strict";
import { test } from "node:test";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { searchesNextLinks, searchesNextNotice } from "./searches-next";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { shortlistNextLinks, shortlistNextNotice } from "./shortlist-next";

test("shortlistNextNotice names saved carers without a count or Instant Book CTA", () => {
  assert.match(shortlistNextNotice(), /saved/);
  assert.match(shortlistNextNotice(), /shortlist/);
  assert.match(shortlistNextNotice(), /household defaults/);
  assert.doesNotMatch(shortlistNextNotice(), /\d+ open/);
  assert.doesNotMatch(shortlistNextNotice(), /Instant Book/);
  assert.doesNotMatch(shortlistNextNotice(), /job=/);
  assert.doesNotMatch(shortlistNextNotice(), /Hire/);
  assert.notEqual(shortlistNextNotice(), shortlistHireNotice());
  assert.notEqual(shortlistNextNotice(), comingUpNextNotice());
  assert.notEqual(shortlistNextNotice(), householdNextNotice());
  assert.notEqual(shortlistNextNotice(), proposalAlertsNextNotice());
  assert.notEqual(shortlistNextNotice(), homeFamilyNotice());
  assert.notEqual(shortlistNextNotice(), searchesNextNotice());
});

test("shortlistNextLinks go to the shortlist and household, not post-a-job", () => {
  assert.deepEqual(shortlistNextLinks(), [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    { href: "/dashboard/household", label: "Open household defaults" },
  ]);
  assert.notDeepEqual(shortlistNextLinks(), shortlistHireLinks());
  assert.notDeepEqual(shortlistNextLinks(), comingUpNextLinks());
  assert.notDeepEqual(shortlistNextLinks(), householdNextLinks());
  assert.notDeepEqual(shortlistNextLinks(), proposalAlertsNextLinks());
  assert.notDeepEqual(shortlistNextLinks(), homeFamilyLinks());
  assert.notDeepEqual(
    shortlistNextLinks(),
    searchesNextLinks({ href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" }),
  );
  assert.ok(!shortlistNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!shortlistNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!shortlistNextLinks().some((link) => /Instant Book/i.test(link.label)));
});
