import assert from "node:assert/strict";
import { test } from "node:test";
import { requestedBookingLinks, requestedBookingNotice } from "./booking-requested";
import { homeFamilyLinks, homeFamilyNotice } from "./home-family";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { proposalAlertsNextLinks, proposalAlertsNextNotice } from "./proposal-alerts";
import { rosterNextLinks, rosterNextNotice } from "./roster-next";

test("pendingAcceptanceNextNotice names accept-then-pay without a count or accept CTA", () => {
  assert.match(pendingAcceptanceNextNotice(), /accept before you pay/);
  assert.match(pendingAcceptanceNextNotice(), /attached request/);
  assert.match(pendingAcceptanceNextNotice(), /shortlist/);
  assert.doesNotMatch(pendingAcceptanceNextNotice(), /\d+ open/);
  assert.doesNotMatch(pendingAcceptanceNextNotice(), /Accept/);
  assert.doesNotMatch(pendingAcceptanceNextNotice(), /Confirm complete/);
  assert.doesNotMatch(pendingAcceptanceNextNotice(), /Instant Book/);
  assert.doesNotMatch(pendingAcceptanceNextNotice(), /job=/);
  assert.notEqual(
    pendingAcceptanceNextNotice(),
    requestedBookingNotice({ carerName: "James Okafor", handoverComplete: false }),
  );
  assert.notEqual(pendingAcceptanceNextNotice(), proposalAlertsNextNotice());
  assert.notEqual(pendingAcceptanceNextNotice(), homeFamilyNotice());
  assert.notEqual(pendingAcceptanceNextNotice(), rosterNextNotice());
});

test("pendingAcceptanceNextLinks go to the attached request and shortlist, not handover", () => {
  assert.deepEqual(pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }), [
    {
      href: "/care-requests/ndis-weekend-community-access-brisbane",
      label: "Open the attached request",
    },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.deepEqual(pendingAcceptanceNextLinks({}), [
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ]);
  assert.notDeepEqual(
    pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }),
    requestedBookingLinks({
      caregiverSlug: "james-okafor-disability-support-sydney",
      handoverComplete: false,
      requestSlug: "ndis-weekend-community-access-brisbane",
    }),
  );
  assert.notDeepEqual(
    pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }),
    proposalAlertsNextLinks(),
  );
  assert.notDeepEqual(
    pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }),
    homeFamilyLinks(),
  );
  assert.notDeepEqual(
    pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }),
    rosterNextLinks({ href: "/caregivers?availableOn=2026-09-09" }),
  );
  assert.ok(
    !pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }).some(
      (link) => link.href === "#handover",
    ),
  );
  assert.ok(
    !pendingAcceptanceNextLinks({ requestSlug: "ndis-weekend-community-access-brisbane" }).some((link) =>
      link.href.includes("job="),
    ),
  );
});
