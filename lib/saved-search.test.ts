import assert from "node:assert/strict";
import { test } from "node:test";
import {
  composeInviteAlert,
  composeJobFitAlert,
  composeProposalAlert,
  composeSearchAlert,
  defaultSearchName,
  filtersFromSearchHref,
  isSafeSearchHref,
  inviteAlertLabel,
  jobAlertLabel,
  jobsFitDeltaLabel,
  proposalAlertLabel,
  proposalAlertRate,
  savedSearchDelta,
  savedSearchDeltaLabel,
  savedSearchHref,
  searchAlertLabel,
  searchAlertMailto,
} from "./saved-search";

test("savedSearchHref keeps path segments and drops page", () => {
  assert.equal(
    savedSearchHref("/caregivers/aged-care/nsw/sydney", {
      specialty: "aged-care",
      state: "nsw",
      city: "sydney",
      availableOn: "2026-09-12",
      page: "2",
    }),
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-12",
  );
  assert.equal(
    savedSearchHref("/caregivers/aged-care/nsw/sydney", {
      availableOn: "2026-09-15",
      availableAt: "08:00",
      job: "weekday-aged-care-marrickville",
    }),
    "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15&availableAt=08%3A00",
  );
});

test("isSafeSearchHref only allows local caregiver directory paths", () => {
  assert.equal(isSafeSearchHref("/caregivers/nannies?instantBook=1"), true);
  assert.equal(isSafeSearchHref("https://evil.example/caregivers"), false);
  assert.equal(isSafeSearchHref("/dashboard"), false);
});

test("defaultSearchName adds needed-on and Instant Book", () => {
  assert.equal(
    defaultSearchName("Aged care carers in Sydney", { availableOn: "2026-09-12", instantBook: true }),
    "Aged care carers in Sydney · needed 12 Sept 2026 · Instant Book",
  );
  assert.equal(
    defaultSearchName("Aged care carers in Sydney", { availableOn: "2026-09-15", availableAt: "08:00" }),
    "Aged care carers in Sydney · needed 15 Sept 2026, 8:00 am",
  );
});

test("filtersFromSearchHref reads path segments and query flags", () => {
  const filters = filtersFromSearchHref("/caregivers/aged-care/nsw/sydney?availableOn=2026-09-12&availableAt=08:00");
  assert.equal(filters?.specialty, "aged-care");
  assert.equal(filters?.state, "nsw");
  assert.equal(filters?.city, "sydney");
  assert.equal(filters?.availableOn, "2026-09-12");
  assert.equal(filters?.availableAt, "08:00");
  const nannies = filtersFromSearchHref("/caregivers/nannies?instantBook=1");
  assert.equal(nannies?.specialty, "nannies");
  assert.equal(nannies?.instantBook, true);
  assert.equal(filtersFromSearchHref("/dashboard"), null);
});

test("savedSearchDelta treats a never-opened search as all new", () => {
  const unseen = savedSearchDelta(8, 0, null);
  assert.deepEqual(unseen, { current: 8, newCount: 8, unseen: true });
  assert.equal(savedSearchDeltaLabel(unseen), "8 carers · not opened yet");
  const grown = savedSearchDelta(10, 7, new Date("2026-09-01"));
  assert.equal(grown.newCount, 3);
  assert.equal(savedSearchDeltaLabel(grown), "10 carers · 3 new");
  assert.equal(savedSearchDeltaLabel(savedSearchDelta(7, 7, new Date("2026-09-01"))), "7 carers");
});

test("searchAlertLabel and composeSearchAlert describe new carers since the last digest", () => {
  const grown = savedSearchDelta(43, 20, new Date("2026-09-01"));
  assert.equal(searchAlertLabel(grown, true), "Alerts on · 23 new since last digest");
  assert.equal(searchAlertLabel(grown, false), "Email alerts off");
  assert.equal(searchAlertLabel(savedSearchDelta(8, 0, null), true), "Alerts on · 8 carers waiting for a first digest");
  const digest = composeSearchAlert([
    {
      name: "Aged care in Sydney · needed 15 Sept 2026",
      href: "/caregivers/aged-care/nsw/sydney?availableOn=2026-09-15",
      current: 43,
      newCount: 23,
    },
    { name: "Instant Book nannies", href: "/caregivers/nannies?instantBook=1", current: 12, newCount: 0 },
  ]);
  assert.equal(digest.hasNew, true);
  assert.equal(digest.subject, "CareProof: 23 new carers — Aged care in Sydney · needed 15 Sept 2026");
  assert.match(digest.body, /43 carers match now · 23 new/);
  assert.match(digest.body, /\/caregivers\/aged-care\/nsw\/sydney\?availableOn=2026-09-15/);
  assert.ok(searchAlertMailto("family@careproof.com.au", digest).startsWith("mailto:family%40careproof.com.au"));
});

test("jobAlertLabel and composeJobFitAlert describe new fitting jobs", () => {
  const grown = savedSearchDelta(3, 1, new Date("2026-09-01"));
  assert.equal(jobAlertLabel(grown, true), "Alerts on · 2 new jobs since last digest");
  assert.equal(jobAlertLabel(grown, false), "Email alerts off");
  assert.equal(jobAlertLabel(savedSearchDelta(1, 0, null), true), "Alerts on · 1 job waiting for a first digest");
  const digest = composeJobFitAlert(
    [
      {
        title: "Weekday aged care for Mum in Marrickville",
        href: "/care-requests/weekday-aged-care-marrickville",
        when: "Sydney · 15 Sept 2026, 8:00 am",
      },
    ],
    1,
    1,
  );
  assert.equal(digest.hasNew, true);
  assert.equal(digest.subject, "CareProof: 1 new job fits your roster");
  assert.match(digest.body, /1 open job fits you now · 1 new/);
  assert.match(digest.body, /weekday-aged-care-marrickville/);
});

test("inviteAlertLabel and composeInviteAlert describe new invites", () => {
  const grown = savedSearchDelta(1, 0, new Date("2026-09-01"));
  assert.equal(inviteAlertLabel(grown, true), "Alerts on · 1 new invite since last digest");
  assert.equal(inviteAlertLabel(grown, false), "Email alerts off");
  assert.equal(
    inviteAlertLabel(savedSearchDelta(2, 0, null), true),
    "Alerts on · 2 invites waiting for a first digest",
  );
  const digest = composeInviteAlert(
    [
      {
        title: "Weekday aged care for Mum in Marrickville",
        href: "/care-requests/weekday-aged-care-marrickville",
        family: "Alex Martin",
        when: "starts 15 Sept 2026, 8:00 am",
        note: "Mum is in Marrickville and we need weekday mornings.",
      },
    ],
    1,
    1,
  );
  assert.equal(digest.hasNew, true);
  assert.equal(digest.subject, "CareProof: 1 new invite to apply");
  assert.match(digest.body, /1 pending invite · 1 new/);
  assert.match(digest.body, /Alex Martin · starts 15 Sept 2026/);
  assert.match(digest.body, /weekday-aged-care-marrickville/);
  assert.match(digest.body, /weekday mornings/);
});

test("proposalAlertLabel and composeProposalAlert describe new proposals", () => {
  const grown = savedSearchDelta(2, 0, new Date("2026-09-01"));
  assert.equal(proposalAlertLabel(grown, true), "Alerts on · 2 new proposals since last digest");
  assert.equal(proposalAlertLabel(grown, false), "Email alerts off");
  assert.equal(
    proposalAlertLabel(savedSearchDelta(1, 0, null), true),
    "Alerts on · 1 proposal waiting for a first digest",
  );
  assert.equal(proposalAlertRate(6800), "$68.00/hr");
  assert.equal(proposalAlertRate(6800, 3800), "$38.00/hr counter");
  const digest = composeProposalAlert(
    [
      {
        title: "Weekday aged care for Mum in Marrickville",
        href: "/care-requests/weekday-aged-care-marrickville",
        carer: "Sarah Nguyen",
        rate: proposalAlertRate(6800),
      },
      {
        title: "Overnight respite in Adelaide",
        href: "/care-requests/overnight-respite-adelaide",
        carer: "Lara Schmidt",
        rate: proposalAlertRate(4200, 3800),
      },
    ],
    2,
    2,
  );
  assert.equal(digest.hasNew, true);
  assert.equal(digest.subject, "CareProof: 2 new proposals on your requests");
  assert.match(digest.body, /2 pending proposals on your open requests · 2 new/);
  assert.match(digest.body, /Sarah Nguyen · \$68\.00\/hr/);
  assert.match(digest.body, /Lara Schmidt · \$38\.00\/hr counter/);
  assert.match(digest.body, /weekday-aged-care-marrickville/);
});

test("jobsFitDeltaLabel mirrors saved-search new counts for carers", () => {
  assert.equal(jobsFitDeltaLabel(savedSearchDelta(1, 0, null)), "1 job fits · not opened yet");
  assert.equal(jobsFitDeltaLabel(savedSearchDelta(3, 1, new Date("2026-09-01"))), "3 jobs fit · 2 new");
  assert.equal(jobsFitDeltaLabel(savedSearchDelta(2, 2, new Date("2026-09-01"))), "2 jobs fit");
  assert.equal(jobsFitDeltaLabel(savedSearchDelta(0, 0, new Date("2026-09-01"))), "0 matching jobs");
});
