import assert from "node:assert/strict";
import { test } from "node:test";
import { activeCareNextLinks, activeCareNextNotice } from "./active-care";
import { comingUpNextLinks, comingUpNextNotice } from "./coming-up-next";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { rosterNextLinks, rosterNextNotice } from "./roster-next";
import { searchAlertsNextLinks, searchAlertsNextNotice } from "./search-alerts";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { searchesNextLinks, searchesNextNotice, searchesNextPlace } from "./searches-next";

test("searchesNextNotice names the saved filter without a count or alert CTA", () => {
  assert.match(searchesNextNotice(), /saved search/);
  assert.match(searchesNextNotice(), /directory filter/);
  assert.match(searchesNextNotice(), /shortlist/);
  assert.doesNotMatch(searchesNextNotice(), /\d+ open/);
  assert.doesNotMatch(searchesNextNotice(), /Mark digest sent/);
  assert.doesNotMatch(searchesNextNotice(), /Turn alerts off/);
  assert.doesNotMatch(searchesNextNotice(), /Instant Book/);
  assert.doesNotMatch(searchesNextNotice(), /job=/);
  assert.notEqual(searchesNextNotice(), searchAlertsNextNotice());
  assert.notEqual(searchesNextNotice(), comingUpNextNotice());
  assert.notEqual(searchesNextNotice(), homeFamilyNotice());
  assert.notEqual(searchesNextNotice(), rosterNextNotice());
  assert.notEqual(searchesNextNotice(), activeCareNextNotice());
  assert.notEqual(searchesNextNotice(), shortlistHireNotice());
});

test("searchesNextPlace prefers a safe directory watch that is not Instant Book", () => {
  const agedCare = { href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" };
  const nannies = { href: "/caregivers/nannies?instantBook=1" };
  assert.deepEqual(searchesNextPlace([nannies, agedCare]), agedCare);
  assert.deepEqual(searchesNextPlace([nannies]), nannies);
  assert.equal(searchesNextPlace([{ href: "https://evil.example/caregivers" }]), null);
  assert.equal(searchesNextPlace([]), null);
});

test("searchesNextLinks open that search and shortlist, not post-a-job", () => {
  const place = { href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" };
  assert.deepEqual(searchesNextLinks(place), [
    { href: place.href, label: "Open a saved search" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.deepEqual(searchesNextLinks(), [{ href: "/dashboard/shortlist", label: "Open your shortlist" }]);
  assert.notDeepEqual(searchesNextLinks(place), searchAlertsNextLinks(place));
  assert.notDeepEqual(searchesNextLinks(place), comingUpNextLinks());
  assert.notDeepEqual(searchesNextLinks(place), homeFamilyLinks());
  assert.notDeepEqual(searchesNextLinks(place), shortlistHireLinks());
  assert.notDeepEqual(searchesNextLinks(place), activeCareNextLinks({ sitHref: "/dashboard/bookings/sit-1" }));
  assert.notDeepEqual(
    searchesNextLinks(place),
    rosterNextLinks({ href: "/caregivers?availableOn=2026-09-09" }),
  );
  assert.ok(!searchesNextLinks(place).some((link) => link.href === "/post-a-job"));
  assert.ok(!searchesNextLinks(place).some((link) => link.href === "/dashboard#coming-up"));
  assert.ok(!searchesNextLinks(place).some((link) => link.href.includes("job=")));
});
