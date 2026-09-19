import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { nursingNextLinks, nursingNextNotice } from "./nursing-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { respiteNextLinks, respiteNextNotice, respiteNextShows } from "./respite-next";

test("respiteNextNotice names unused respite paths without a count or Instant Book", () => {
  assert.match(respiteNextNotice(), /Respite/);
  assert.match(respiteNextNotice(), /ACT/);
  assert.match(respiteNextNotice(), /babysitter guide/);
  assert.doesNotMatch(respiteNextNotice(), /\d+ open/);
  assert.doesNotMatch(respiteNextNotice(), /Instant Book/);
  assert.doesNotMatch(respiteNextNotice(), /Hire/);
  assert.doesNotMatch(respiteNextNotice(), /job=/);
  assert.doesNotMatch(respiteNextNotice(), /Tasmania/);
  assert.doesNotMatch(respiteNextNotice(), /nurses/);
  assert.doesNotMatch(respiteNextNotice(), /after-school/);
  assert.doesNotMatch(respiteNextNotice(), /Western Australia/);
  assert.doesNotMatch(respiteNextNotice(), /overnight respite/);
  assert.doesNotMatch(respiteNextNotice(), /South Australia/);
  assert.notEqual(respiteNextNotice(), nursingNextNotice());
  assert.notEqual(respiteNextNotice(), disabilityNextNotice());
  assert.notEqual(respiteNextNotice(), saNextNotice());
  assert.notEqual(respiteNextNotice(), trustNextNotice());
  assert.notEqual(respiteNextNotice(), caregiversNextNotice());
  assert.notEqual(respiteNextNotice(), familyStartNotice());
  assert.notEqual(respiteNextNotice(), guidesIndexNextNotice());
});

test("respiteNextShows is a signed-in family on respite only", () => {
  assert.equal(respiteNextShows({ isFamily: true, specialtySlug: "respite", specialtyPath: true }), true);
  assert.equal(
    respiteNextShows({ isFamily: true, specialtySlug: "respite", specialtyPath: true, jobAttached: true }),
    false,
  );
  assert.equal(respiteNextShows({ isFamily: true, specialtySlug: "nursing", specialtyPath: true }), false);
  assert.equal(respiteNextShows({ isFamily: true, specialtySlug: "respite", specialtyPath: false }), false);
  assert.equal(respiteNextShows({ isFamily: false, specialtySlug: "respite", specialtyPath: true }), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers/respite"), true);
});

test("respiteNextLinks go to ACT respite and the babysitter guide, not SA or TAS", () => {
  assert.deepEqual(respiteNextLinks(), [
    { href: "/caregivers/respite/act", label: "Browse respite in the ACT" },
    { href: "/guides/hire-a-babysitter", label: "Open the babysitter guide" },
  ]);
  assert.notDeepEqual(respiteNextLinks(), nursingNextLinks());
  assert.notDeepEqual(respiteNextLinks(), disabilityNextLinks());
  assert.notDeepEqual(respiteNextLinks(), saNextLinks());
  assert.notDeepEqual(respiteNextLinks(), trustNextLinks());
  assert.notDeepEqual(respiteNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(respiteNextLinks(), familyStartLinks());
  assert.notDeepEqual(respiteNextLinks(), guidesIndexNextLinks());
  assert.ok(!respiteNextLinks().some((link) => link.href === "/caregivers/respite/sa"));
  assert.ok(!respiteNextLinks().some((link) => link.href === "/guides/overnight-respite-care"));
  assert.ok(!respiteNextLinks().some((link) => link.href === "/caregivers/nursing/tas"));
  assert.ok(!respiteNextLinks().some((link) => link.href === "/guides/after-school-nanny"));
  assert.ok(!respiteNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!respiteNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!respiteNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
