import assert from "node:assert/strict";
import { test } from "node:test";
import { jobFillNotice } from "./job-fill";
import { jobViewerFamilyLinks, jobViewerFamilyNotice } from "./job-viewer";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { requestsNextLinks, requestsNextNotice } from "./requests-next";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";
import { counterWaitLinks, counterWaitNotice, counterWaitShowsNext } from "./counter-wait";

const adelaide = {
  startDate: new Date("2026-09-18T18:00:00+10:00"),
  specialty: { slug: "respite", name: "Respite", pluralName: "Respite carers" },
  city: { slug: "adelaide", name: "Adelaide", state: { slug: "sa" } },
};

test("counterWaitNotice names the wait without a count or accept CTA", () => {
  assert.match(counterWaitNotice(), /suggested rate/);
  assert.match(counterWaitNotice(), /shortlist/);
  assert.match(counterWaitNotice(), /browse/);
  assert.doesNotMatch(counterWaitNotice(), /\d+ open/);
  assert.doesNotMatch(counterWaitNotice(), /Accept/);
  assert.doesNotMatch(counterWaitNotice(), /Keep /);
  assert.doesNotMatch(counterWaitNotice(), /Hire/);
  assert.doesNotMatch(counterWaitNotice(), /Instant Book/);
  assert.doesNotMatch(counterWaitNotice(), /Pass on/);
  assert.doesNotMatch(counterWaitNotice(), /job=/);
  assert.notEqual(counterWaitNotice(), jobFillNotice());
  assert.notEqual(counterWaitNotice(), jobViewerFamilyNotice("respite carers", "Adelaide"));
  assert.notEqual(counterWaitNotice(), proposalAlertsNextNotice());
  assert.notEqual(counterWaitNotice(), requestsNextNotice());
  assert.notEqual(counterWaitNotice(), shortlistHireNotice());
});

test("counterWaitShowsNext is only when a counter is waiting", () => {
  assert.equal(counterWaitShowsNext(true), true);
  assert.equal(counterWaitShowsNext(false), false);
});

test("counterWaitLinks go to shortlist and the city directory, not post-a-job", () => {
  const links = counterWaitLinks({
    specialtySlug: "respite",
    specialtyPlural: "Respite carers",
    citySlug: "adelaide",
    cityName: "Adelaide",
    stateSlug: "sa",
  });
  assert.deepEqual(links, [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
    { href: "/caregivers/respite/sa/adelaide", label: "Browse respite carers in Adelaide" },
  ]);
  assert.deepEqual(counterWaitLinks({}), [{ href: "/dashboard/shortlist", label: "Open your shortlist" }]);
  assert.notDeepEqual(links, proposalAlertsNextLinks());
  assert.notDeepEqual(links, shortlistHireLinks());
  assert.notDeepEqual(links, requestsNextLinks({ href: "/care-requests/overnight-respite-adelaide" }));
  assert.notDeepEqual(links, jobViewerFamilyLinks(adelaide));
  assert.ok(!links.some((link) => link.href === "/post-a-job"));
  assert.ok(!links.some((link) => link.href.includes("job=")));
  assert.ok(!links.some((link) => /Accept|Keep |Hire|Instant Book/i.test(link.label)));
});
