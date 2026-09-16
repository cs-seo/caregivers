import assert from "node:assert/strict";
import { test } from "node:test";
import { legalNextLinks, legalNextNotice } from "./legal-next";
import { personalCareSaNextLinks, personalCareSaNextNotice } from "./personal-care-sa-next";
import { privacyNextLinks, privacyNextNotice, privacyNextShows } from "./privacy-next";
import { termsNextLinks, termsNextNotice, termsNextShows } from "./terms-next";

test("termsNextNotice names unused Bairnsdale and Castlemaine paths without a count or Instant Book", () => {
  assert.match(termsNextNotice(), /terms/);
  assert.match(termsNextNotice(), /Bairnsdale/);
  assert.match(termsNextNotice(), /Castlemaine/);
  assert.doesNotMatch(termsNextNotice(), /\d+ open/);
  assert.doesNotMatch(termsNextNotice(), /Instant Book/);
  assert.doesNotMatch(termsNextNotice(), /Hire/);
  assert.doesNotMatch(termsNextNotice(), /job=/);
  assert.doesNotMatch(termsNextNotice(), /Warwick/);
  assert.doesNotMatch(termsNextNotice(), /Emerald/);
  assert.doesNotMatch(termsNextNotice(), /Naracoorte/);
  assert.doesNotMatch(termsNextNotice(), /Berri/);
  assert.doesNotMatch(termsNextNotice(), /privacy/);
  assert.doesNotMatch(termsNextNotice(), /escrow and checks/);
  assert.notEqual(termsNextNotice(), privacyNextNotice());
  assert.notEqual(termsNextNotice(), personalCareSaNextNotice());
  assert.notEqual(termsNextNotice(), legalNextNotice());
});

test("termsNextShows is a signed-in family only", () => {
  assert.equal(termsNextShows({ isFamily: true }), true);
  assert.equal(termsNextShows({ isFamily: false }), false);
  assert.equal(privacyNextShows({ isFamily: true }), true);
});

test("termsNextLinks go to Bairnsdale and Castlemaine, not Warwick or Naracoorte", () => {
  assert.deepEqual(termsNextLinks(), [
    { href: "/locations/vic/bairnsdale", label: "Open Bairnsdale locations" },
    { href: "/locations/vic/castlemaine", label: "Open Castlemaine locations" },
  ]);
  assert.notDeepEqual(termsNextLinks(), privacyNextLinks());
  assert.notDeepEqual(termsNextLinks(), personalCareSaNextLinks());
  assert.notDeepEqual(termsNextLinks(), legalNextLinks());
  assert.ok(!termsNextLinks().some((link) => link.href === "/caregivers/personal-care/sa"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/locations/qld/warwick"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/locations/qld/emerald"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/privacy"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/locations/sa/naracoorte"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/locations/sa/berri"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/care-requests"));
  assert.ok(!termsNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!termsNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!termsNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
