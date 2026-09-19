import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { searchAlertsNextLinks, searchAlertsNextNotice, searchAlertsNextPlace } from "./search-alerts";

test("searchAlertsNextNotice names watched search without a count or digest CTA", () => {
  assert.match(searchAlertsNextNotice(), /watched search/);
  assert.match(searchAlertsNextNotice(), /post a request/);
  assert.doesNotMatch(searchAlertsNextNotice(), /\d+ open/);
  assert.doesNotMatch(searchAlertsNextNotice(), /Mark digest sent/);
  assert.doesNotMatch(searchAlertsNextNotice(), /Turn alerts off/);
  assert.doesNotMatch(searchAlertsNextNotice(), /Instant Book/);
  assert.doesNotMatch(searchAlertsNextNotice(), /job=/);
  assert.notEqual(searchAlertsNextNotice(), proposalAlertsNextNotice());
  assert.notEqual(searchAlertsNextNotice(), reviewsDueNextNotice());
  assert.notEqual(searchAlertsNextNotice(), familyStartNotice());
  assert.notEqual(searchAlertsNextNotice(), shortlistHireNotice());
});

test("searchAlertsNextPlace prefers a watched search with new carers", () => {
  const agedCare = {
    href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15",
    name: "Aged care in Sydney · needed 15 Sept 2026",
    alertsOn: true,
    newCount: 3,
  };
  const nannies = {
    href: "/caregivers/nannies?instantBook=1",
    name: "Instant Book nannies",
    alertsOn: true,
    newCount: 0,
  };
  assert.deepEqual(searchAlertsNextPlace([nannies, agedCare]), {
    href: agedCare.href,
    name: agedCare.name,
  });
  assert.deepEqual(searchAlertsNextPlace([nannies]), {
    href: nannies.href,
    name: nannies.name,
  });
  assert.equal(searchAlertsNextPlace([{ ...agedCare, alertsOn: false }]), null);
  assert.equal(searchAlertsNextPlace([{ ...agedCare, href: "https://evil.example/caregivers" }]), null);
});

test("searchAlertsNextLinks open that search and post-a-job, not the shortlist", () => {
  const place = { href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" };
  assert.deepEqual(searchAlertsNextLinks(place), [
    { href: place.href, label: "Open this search" },
    { href: "/post-a-job", label: "Post a care request" },
  ]);
  assert.deepEqual(searchAlertsNextLinks(), [{ href: "/post-a-job", label: "Post a care request" }]);
  assert.notDeepEqual(searchAlertsNextLinks(place), proposalAlertsNextLinks());
  assert.notDeepEqual(searchAlertsNextLinks(place), reviewsDueNextLinks());
  assert.notDeepEqual(searchAlertsNextLinks(place), familyStartLinks());
  assert.notDeepEqual(searchAlertsNextLinks(place), shortlistHireLinks());
  assert.ok(!searchAlertsNextLinks(place).some((link) => link.href === "/dashboard/shortlist"));
  assert.ok(!searchAlertsNextLinks(place).some((link) => link.href === "/caregivers"));
  assert.ok(!searchAlertsNextLinks(place).some((link) => link.href.includes("job=")));
});
