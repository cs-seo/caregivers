import assert from "node:assert/strict";
import { test } from "node:test";
import { awaitingPayNextLinks, awaitingPayNextNotice } from "./awaiting-pay";
import { declinedNextLinks, declinedNextNotice } from "./declined-next";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";
import { shortlistHireLinks, shortlistHireNotice } from "./shortlist-hire";

test("declinedNextNotice names a closed sit without a count or Instant Book CTA", () => {
  assert.match(declinedNextNotice(), /cannot do this sit/);
  assert.match(declinedNextNotice(), /Browse carers/);
  assert.match(declinedNextNotice(), /shortlist/);
  assert.doesNotMatch(declinedNextNotice(), /\d+ open/);
  assert.doesNotMatch(declinedNextNotice(), /Instant Book/);
  assert.doesNotMatch(declinedNextNotice(), /Pay into escrow/);
  assert.doesNotMatch(declinedNextNotice(), /Accept/);
  assert.doesNotMatch(declinedNextNotice(), /job=/);
  assert.notEqual(declinedNextNotice(), pendingAcceptanceNextNotice());
  assert.notEqual(declinedNextNotice(), reviewsDueNextNotice());
  assert.notEqual(declinedNextNotice(), shortlistHireNotice());
  assert.notEqual(declinedNextNotice(), awaitingPayNextNotice());
});

test("declinedNextLinks go to the specialty directory and shortlist, not handover", () => {
  assert.deepEqual(declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }), [
    { href: "/caregivers/nannies", label: "Browse nannies" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.deepEqual(declinedNextLinks({}), [
    { href: "/caregivers", label: "Browse verified carers" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(
    declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }),
    pendingAcceptanceNextLinks({}),
  );
  assert.notDeepEqual(
    declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }),
    reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }),
  );
  assert.notDeepEqual(
    declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }),
    shortlistHireLinks(),
  );
  assert.notDeepEqual(
    declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }),
    awaitingPayNextLinks({ caregiverSlug: "tess-okonkwo-babysitter-sydney", bookingId: "sit-1" }),
  );
  assert.ok(
    !declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }).some(
      (link) => link.href === "#handover",
    ),
  );
  assert.ok(
    !declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }).some((link) =>
      link.href.includes("job="),
    ),
  );
});
