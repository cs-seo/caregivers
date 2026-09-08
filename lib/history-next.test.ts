import assert from "node:assert/strict";
import { test } from "node:test";
import { BOOKING_STATUS } from "./constants";
import { householdNextLinks, householdNextNotice } from "./household-next";
import { invoiceNextLinks, invoiceNextNotice } from "./invoice-next";
import { releasedNextLinks, releasedNextNotice } from "./released-next";
import { remittanceNextLinks, remittanceNextNotice } from "./remittance-next";
import { statementNextLinks, statementNextNotice } from "./statement-next";
import { historyNextLinks, historyNextNotice, historyNextPlace } from "./history-next";

test("historyNextNotice names released sits without a count or review CTA", () => {
  assert.match(historyNextNotice(), /Released sits/);
  assert.match(historyNextNotice(), /paid sit/);
  assert.match(historyNextNotice(), /financial-year statement/);
  assert.doesNotMatch(historyNextNotice(), /\d+ open/);
  assert.doesNotMatch(historyNextNotice(), /publish/);
  assert.doesNotMatch(historyNextNotice(), /Instant Book/);
  assert.doesNotMatch(historyNextNotice(), /Confirm complete/);
  assert.doesNotMatch(historyNextNotice(), /job=/);
  assert.notEqual(historyNextNotice(), releasedNextNotice());
  assert.notEqual(historyNextNotice(), remittanceNextNotice());
  assert.notEqual(historyNextNotice(), statementNextNotice(true));
  assert.notEqual(historyNextNotice(), invoiceNextNotice());
  assert.notEqual(historyNextNotice(), householdNextNotice());
});

test("historyNextPlace skips cancelled sits and picks the first released group", () => {
  const tess = {
    href: "/dashboard/bookings/tess-declined",
    weeks: [{ status: BOOKING_STATUS.CANCELLED }],
  };
  const leichhardt = {
    href: "/dashboard/bookings/leichhardt-released",
    weeks: [{ status: BOOKING_STATUS.RELEASED }],
  };
  assert.deepEqual(historyNextPlace([tess, leichhardt]), { href: leichhardt.href });
  assert.equal(historyNextPlace([tess]), null);
  assert.equal(historyNextPlace([]), null);
  assert.equal(historyNextPlace([{ href: "/care-requests/nope", weeks: [{ status: BOOKING_STATUS.RELEASED }] }]), null);
});

test("historyNextLinks open that sit and the FY statement, not reviews-due", () => {
  const place = { href: "/dashboard/bookings/leichhardt-released" };
  assert.deepEqual(historyNextLinks(place), [
    { href: place.href, label: "Open a paid sit" },
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.deepEqual(historyNextLinks(), [
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ]);
  assert.notDeepEqual(
    historyNextLinks(place),
    releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }),
  );
  assert.notDeepEqual(historyNextLinks(place), remittanceNextLinks({ bookingId: "leichhardt-released" }));
  assert.notDeepEqual(historyNextLinks(place), statementNextLinks({ isFamily: true, bookingId: "leichhardt-released" }));
  assert.notDeepEqual(historyNextLinks(place), invoiceNextLinks(true));
  assert.notDeepEqual(historyNextLinks(place), householdNextLinks());
  assert.ok(!historyNextLinks(place).some((link) => link.href === "/dashboard/reviews-due"));
  assert.ok(!historyNextLinks(place).some((link) => link.href.includes("job=")));
});
