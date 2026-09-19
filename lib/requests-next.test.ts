import assert from "node:assert/strict";
import { test } from "node:test";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { postJobNextLinks, postJobNextNotice } from "./post-job-next";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { searchesNextLinks, searchesNextNotice } from "./searches-next";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { requestsNextLinks, requestsNextNotice, requestsNextPlace } from "./requests-next";

const now = new Date("2026-09-08T08:00:00.000Z");

test("requestsNextNotice names an accepting request without a count or hire CTA", () => {
  assert.match(requestsNextNotice(), /accepting/);
  assert.match(requestsNextNotice(), /soonest/);
  assert.match(requestsNextNotice(), /shortlist/);
  assert.doesNotMatch(requestsNextNotice(), /\d+ open/);
  assert.doesNotMatch(requestsNextNotice(), /Instant Book/);
  assert.doesNotMatch(requestsNextNotice(), /Hire/);
  assert.doesNotMatch(requestsNextNotice(), /Pass on/);
  assert.doesNotMatch(requestsNextNotice(), /Withdraw/);
  assert.doesNotMatch(requestsNextNotice(), /Turn alerts off/);
  assert.doesNotMatch(requestsNextNotice(), /job=/);
  assert.notEqual(requestsNextNotice(), proposalAlertsNextNotice());
  assert.notEqual(requestsNextNotice(), pendingAcceptanceNextNotice({ requestSlug: "weekday-aged-care-marrickville" }));
  assert.notEqual(requestsNextNotice(), postJobNextNotice());
  assert.notEqual(requestsNextNotice(), searchesNextNotice());
  assert.notEqual(requestsNextNotice(), shortlistHireNotice());
});

test("requestsNextPlace picks the soonest accepting request, not expired or hired", () => {
  const jobs = [
    { slug: "sunday-companion-newtown", status: "open", startDate: new Date("2026-09-06T09:00:00+10:00") },
    { slug: "midweek-respite-leichhardt", status: "hired", startDate: new Date("2026-08-20T08:00:00+10:00") },
    { slug: "overnight-respite-adelaide", status: "open", startDate: new Date("2026-09-18T18:00:00+10:00") },
    { slug: "weekday-aged-care-marrickville", status: "open", startDate: new Date("2026-09-15T08:00:00+10:00") },
  ];
  assert.deepEqual(requestsNextPlace(jobs, now), { href: "/care-requests/weekday-aged-care-marrickville" });
  assert.deepEqual(requestsNextPlace(jobs.filter((job) => job.slug !== "weekday-aged-care-marrickville"), now), {
    href: "/care-requests/overnight-respite-adelaide",
  });
  assert.equal(requestsNextPlace(jobs.filter((job) => job.status !== "open"), now), null);
  assert.equal(requestsNextPlace([], now), null);
});

test("requestsNextLinks open that request and shortlist, not Instant Book or post-a-job", () => {
  const place = { href: "/care-requests/weekday-aged-care-marrickville" };
  assert.deepEqual(requestsNextLinks(place), [
    { href: place.href, label: "Open the soonest request" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.deepEqual(requestsNextLinks(), [{ href: "/dashboard/shortlist", label: "Open your shortlist" }]);
  assert.notDeepEqual(requestsNextLinks(place), proposalAlertsNextLinks());
  assert.notDeepEqual(requestsNextLinks(place), pendingAcceptanceNextLinks({ requestSlug: "weekday-aged-care-marrickville" }));
  assert.notDeepEqual(requestsNextLinks(place), postJobNextLinks());
  assert.notDeepEqual(
    requestsNextLinks(place),
    searchesNextLinks({ href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15" }),
  );
  assert.notDeepEqual(requestsNextLinks(place), shortlistHireLinks());
  assert.ok(!requestsNextLinks(place).some((link) => link.href === "/post-a-job"));
  assert.ok(!requestsNextLinks(place).some((link) => link.href === "/caregivers"));
  assert.ok(!requestsNextLinks(place).some((link) => link.href.includes("job=")));
  assert.ok(!requestsNextLinks(place).some((link) => /Instant Book/i.test(link.label)));
});
