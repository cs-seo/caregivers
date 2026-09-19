import assert from "node:assert/strict";
import { test } from "node:test";
import { gunnedahNextLinks, gunnedahNextNotice } from "./gunnedah-next";
import { legalNextLinks, legalNextNotice } from "./legal-next";
import { loginNextLinks, loginNextNotice, loginNextShows } from "./login-next";
import { nursingSaNextLinks, nursingSaNextNotice } from "./nursing-sa-next";
import { privacyNextLinks, privacyNextNotice, privacyNextShows } from "./privacy-next";

test("privacyNextNotice names unused Naracoorte and Berri paths without a count or Instant Book", () => {
  assert.match(privacyNextNotice(), /privacy/);
  assert.match(privacyNextNotice(), /Naracoorte/);
  assert.match(privacyNextNotice(), /Berri/);
  assert.doesNotMatch(privacyNextNotice(), /\d+ open/);
  assert.doesNotMatch(privacyNextNotice(), /Instant Book/);
  assert.doesNotMatch(privacyNextNotice(), /Hire/);
  assert.doesNotMatch(privacyNextNotice(), /job=/);
  assert.doesNotMatch(privacyNextNotice(), /Lithgow/);
  assert.doesNotMatch(privacyNextNotice(), /Warragul/);
  assert.doesNotMatch(privacyNextNotice(), /Gunnedah/);
  assert.doesNotMatch(privacyNextNotice(), /Yeppoon/);
  assert.doesNotMatch(privacyNextNotice(), /Kingaroy/);
  assert.doesNotMatch(privacyNextNotice(), /Logan/);
  assert.doesNotMatch(privacyNextNotice(), /escrow and checks/);
  assert.notEqual(privacyNextNotice(), legalNextNotice());
  assert.notEqual(privacyNextNotice(), nursingSaNextNotice());
  assert.notEqual(privacyNextNotice(), gunnedahNextNotice());
  assert.notEqual(privacyNextNotice(), loginNextNotice());
});

test("privacyNextShows is a signed-in family only", () => {
  assert.equal(privacyNextShows({ isFamily: true }), true);
  assert.equal(privacyNextShows({ isFamily: false }), false);
  assert.equal(loginNextShows({ isFamily: true }), true);
});

test("privacyNextLinks go to Naracoorte and Berri, not Lithgow or the legal panel", () => {
  assert.deepEqual(privacyNextLinks(), [
    { href: "/locations/sa/naracoorte", label: "Open Naracoorte locations" },
    { href: "/locations/sa/berri", label: "Open Berri locations" },
  ]);
  assert.notDeepEqual(privacyNextLinks(), legalNextLinks());
  assert.notDeepEqual(privacyNextLinks(), nursingSaNextLinks());
  assert.notDeepEqual(privacyNextLinks(), gunnedahNextLinks());
  assert.notDeepEqual(privacyNextLinks(), loginNextLinks());
  assert.ok(!privacyNextLinks().some((link) => link.href === "/locations/nsw/lithgow"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/locations/vic/warragul"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/caregivers/nursing/sa"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/locations/nsw/gunnedah"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/locations/qld/yeppoon"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/locations/qld/kingaroy"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/caregivers"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/care-requests"));
  assert.ok(!privacyNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!privacyNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!privacyNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on|Book/i.test(link.label)));
});
