import assert from "node:assert/strict";
import { test } from "node:test";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { forCarersNextLinks, forCarersNextNotice } from "./for-carers-next";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { invoiceGuideLinks, invoiceGuideNotice } from "./invoice-guide";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { guidesIndexNextLinks, guidesIndexNextNotice, guidesIndexNextShows } from "./guides-index-next";

test("guidesIndexNextNotice names unused guides without a count or Instant Book", () => {
  assert.match(guidesIndexNextNotice(), /live booking/);
  assert.match(guidesIndexNextNotice(), /nanny guide/);
  assert.match(guidesIndexNextNotice(), /personal care guide/);
  assert.doesNotMatch(guidesIndexNextNotice(), /\d+ open/);
  assert.doesNotMatch(guidesIndexNextNotice(), /Instant Book/);
  assert.doesNotMatch(guidesIndexNextNotice(), /Hire/);
  assert.doesNotMatch(guidesIndexNextNotice(), /job=/);
  assert.doesNotMatch(guidesIndexNextNotice(), /housekeeping/);
  assert.doesNotMatch(guidesIndexNextNotice(), /overnight respite/);
  assert.notEqual(guidesIndexNextNotice(), familyStartNotice());
  assert.notEqual(guidesIndexNextNotice(), trustNextNotice());
  assert.notEqual(guidesIndexNextNotice(), guideNextNotice());
  assert.notEqual(guidesIndexNextNotice(), invoiceGuideNotice());
  assert.notEqual(guidesIndexNextNotice(), forCarersNextNotice());
});

test("guidesIndexNextShows is only a signed-in family", () => {
  assert.equal(guidesIndexNextShows({ isFamily: true }), true);
  assert.equal(guidesIndexNextShows({ isFamily: false }), false);
});

test("guidesIndexNextLinks go to unused hiring guides, not post-a-job", () => {
  assert.deepEqual(guidesIndexNextLinks(), [
    { href: "/guides/hire-a-nanny-australia", label: "Open the nanny guide" },
    { href: "/guides/personal-care-assistant", label: "Open the personal care guide" },
  ]);
  assert.notDeepEqual(guidesIndexNextLinks(), familyStartLinks());
  assert.notDeepEqual(guidesIndexNextLinks(), trustNextLinks());
  assert.notDeepEqual(guidesIndexNextLinks(), invoiceGuideLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(guidesIndexNextLinks(), forCarersNextLinks());
  assert.notDeepEqual(
    guidesIndexNextLinks(),
    guideNextLinks({
      specialtySlug: "nannies",
      specialtyPlural: "Nannies",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.ok(!guidesIndexNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!guidesIndexNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!guidesIndexNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
