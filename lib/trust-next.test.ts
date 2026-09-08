import assert from "node:assert/strict";
import { test } from "node:test";
import { boardNextLinks, boardNextNotice } from "./board-next";
import { bookingSubmitLinks, bookingSubmitNotice } from "./booking-submit";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guideNextLinks, guideNextNotice } from "./guide-next";
import { invoiceGuideLinks, invoiceGuideNotice } from "./invoice-guide";
import { trustNextLinks, trustNextNotice, trustNextShows } from "./trust-next";

test("trustNextNotice names checks and guides without a count or Instant Book", () => {
  assert.match(trustNextNotice(), /Checks and escrow/);
  assert.match(trustNextNotice(), /overnight respite/);
  assert.match(trustNextNotice(), /in-home nurse guide/);
  assert.doesNotMatch(trustNextNotice(), /\d+ open/);
  assert.doesNotMatch(trustNextNotice(), /Instant Book/);
  assert.doesNotMatch(trustNextNotice(), /Hire/);
  assert.doesNotMatch(trustNextNotice(), /job=/);
  assert.doesNotMatch(trustNextNotice(), /GST invoices/);
  assert.doesNotMatch(trustNextNotice(), /companion carers/);
  assert.notEqual(trustNextNotice(), familyStartNotice());
  assert.notEqual(trustNextNotice(), guideNextNotice());
  assert.notEqual(trustNextNotice(), invoiceGuideNotice());
  assert.notEqual(trustNextNotice(), bookingSubmitNotice({ instantBook: false }));
  assert.notEqual(trustNextNotice(), boardNextNotice());
});

test("trustNextShows is only a signed-in family", () => {
  assert.equal(trustNextShows({ isFamily: true }), true);
  assert.equal(trustNextShows({ isFamily: false }), false);
});

test("trustNextLinks go to unused hiring guides, not post-a-job", () => {
  assert.deepEqual(trustNextLinks(), [
    { href: "/guides/overnight-respite-care", label: "Open the overnight respite guide" },
    { href: "/guides/hire-an-in-home-nurse", label: "Open the in-home nurse guide" },
  ]);
  assert.notDeepEqual(trustNextLinks(), familyStartLinks());
  assert.notDeepEqual(trustNextLinks(), invoiceGuideLinks({ bookingId: "sit-1" }));
  assert.notDeepEqual(trustNextLinks(), bookingSubmitLinks({ caregiverSlug: "sarah-nguyen-aged-care-sydney" }));
  assert.notDeepEqual(trustNextLinks(), boardNextLinks());
  assert.notDeepEqual(
    trustNextLinks(),
    guideNextLinks({
      specialtySlug: "respite",
      specialtyPlural: "Respite carers",
      stateSlug: "nsw",
      stateName: "New South Wales",
    }),
  );
  assert.ok(!trustNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!trustNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!trustNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Accept|Keep /i.test(link.label)));
});
