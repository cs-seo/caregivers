import assert from "node:assert/strict";
import { test } from "node:test";
import { awaitingPayNextLinks, awaitingPayNextNotice } from "./awaiting-pay";
import { disputeNextLinks, disputeNextNotice } from "./dispute-next";
import { historyNextLinks, historyNextNotice } from "./history-next";
import { invoiceGuideLinks, invoiceGuideNotice } from "./invoice-guide";
import { pendingAcceptanceNextLinks, pendingAcceptanceNextNotice } from "./pending-next";
import { actionNextLinks, actionNextNotice } from "./action-next";

test("actionNextNotice names a sit that needs you without a count or pay CTA", () => {
  assert.match(actionNextNotice(), /still needs you/);
  assert.match(actionNextNotice(), /first one/);
  assert.match(actionNextNotice(), /financial-year statement/);
  assert.doesNotMatch(actionNextNotice(), /\d+ open/);
  assert.doesNotMatch(actionNextNotice(), /Instant Book/);
  assert.doesNotMatch(actionNextNotice(), /Release/);
  assert.doesNotMatch(actionNextNotice(), /Refund/);
  assert.doesNotMatch(actionNextNotice(), /Confirm complete/);
  assert.doesNotMatch(actionNextNotice(), /job=/);
  assert.notEqual(actionNextNotice(), pendingAcceptanceNextNotice());
  assert.notEqual(actionNextNotice(), awaitingPayNextNotice());
  assert.notEqual(actionNextNotice(), disputeNextNotice(true));
  assert.notEqual(actionNextNotice(), historyNextNotice());
  assert.notEqual(actionNextNotice(), invoiceGuideNotice());
});

test("actionNextLinks go to that sit and the FY statement, not reviews or shortlist", () => {
  assert.deepEqual(actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }), [
    { href: "/dashboard/bookings/chloe-disputed", label: "Open a sit that needs you" },
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.deepEqual(actionNextLinks({}), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.notDeepEqual(
    actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }),
    historyNextLinks({ href: "/dashboard/bookings/leichhardt-released" }),
  );
  assert.notDeepEqual(
    actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }),
    pendingAcceptanceNextLinks({ requestSlug: "weekday-aged-care-marrickville" }),
  );
  assert.notDeepEqual(
    actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }),
    awaitingPayNextLinks({ caregiverSlug: "elena-rossi-companion-care-sydney", bookingId: "elena-unpaid" }),
  );
  assert.notDeepEqual(
    actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }),
    disputeNextLinks({ isFamily: true, bookingId: "chloe-disputed" }),
  );
  assert.notDeepEqual(
    actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }),
    invoiceGuideLinks({ bookingId: "chloe-disputed" }),
  );
  assert.ok(
    !actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }).some((link) => link.href === "/dashboard/shortlist"),
  );
  assert.ok(
    !actionNextLinks({ sitHref: "/dashboard/bookings/chloe-disputed" }).some((link) => link.href.includes("job=")),
  );
});
