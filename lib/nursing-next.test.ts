import assert from "node:assert/strict";
import { test } from "node:test";
import { caregiversNextLinks, caregiversNextNotice } from "./caregivers-next";
import { directoryIsSpecialtyPath, disabilityNextLinks, disabilityNextNotice } from "./disability-next";
import { familyStartLinks, familyStartNotice } from "./family-start";
import { guidesIndexNextLinks, guidesIndexNextNotice } from "./guides-index-next";
import { qldNextLinks, qldNextNotice } from "./qld-next";
import { saNextLinks, saNextNotice } from "./sa-next";
import { trustNextLinks, trustNextNotice } from "./trust-next";
import { nursingNextLinks, nursingNextNotice, nursingNextShows } from "./nursing-next";

test("nursingNextNotice names unused nurse paths without a count or Instant Book", () => {
  assert.match(nursingNextNotice(), /Nurses/);
  assert.match(nursingNextNotice(), /Tasmania/);
  assert.match(nursingNextNotice(), /after-school nanny guide/);
  assert.doesNotMatch(nursingNextNotice(), /\d+ open/);
  assert.doesNotMatch(nursingNextNotice(), /Instant Book/);
  assert.doesNotMatch(nursingNextNotice(), /Hire/);
  assert.doesNotMatch(nursingNextNotice(), /job=/);
  assert.doesNotMatch(nursingNextNotice(), /Western Australia/);
  assert.doesNotMatch(nursingNextNotice(), /NDIS/);
  assert.doesNotMatch(nursingNextNotice(), /disability/);
  assert.doesNotMatch(nursingNextNotice(), /Queensland/);
  assert.doesNotMatch(nursingNextNotice(), /in-home nurse/);
  assert.notEqual(nursingNextNotice(), disabilityNextNotice());
  assert.notEqual(nursingNextNotice(), qldNextNotice());
  assert.notEqual(nursingNextNotice(), saNextNotice());
  assert.notEqual(nursingNextNotice(), caregiversNextNotice());
  assert.notEqual(nursingNextNotice(), familyStartNotice());
  assert.notEqual(nursingNextNotice(), guidesIndexNextNotice());
  assert.notEqual(nursingNextNotice(), trustNextNotice());
});

test("nursingNextShows is a signed-in family on nurses only", () => {
  assert.equal(nursingNextShows({ isFamily: true, specialtySlug: "nursing", specialtyPath: true }), true);
  assert.equal(
    nursingNextShows({ isFamily: true, specialtySlug: "nursing", specialtyPath: true, jobAttached: true }),
    false,
  );
  assert.equal(
    nursingNextShows({ isFamily: true, specialtySlug: "disability-support", specialtyPath: true }),
    false,
  );
  assert.equal(nursingNextShows({ isFamily: true, specialtySlug: "nursing", specialtyPath: false }), false);
  assert.equal(nursingNextShows({ isFamily: false, specialtySlug: "nursing", specialtyPath: true }), false);
  assert.equal(directoryIsSpecialtyPath("/caregivers/nursing"), true);
});

test("nursingNextLinks go to Tasmania nurses and the after-school guide, not QLD or WA", () => {
  assert.deepEqual(nursingNextLinks(), [
    { href: "/caregivers/nursing/tas", label: "Browse nurses in Tasmania" },
    { href: "/guides/after-school-nanny", label: "Open the after-school nanny guide" },
  ]);
  assert.notDeepEqual(nursingNextLinks(), disabilityNextLinks());
  assert.notDeepEqual(nursingNextLinks(), qldNextLinks());
  assert.notDeepEqual(nursingNextLinks(), saNextLinks());
  assert.notDeepEqual(nursingNextLinks(), caregiversNextLinks());
  assert.notDeepEqual(nursingNextLinks(), familyStartLinks());
  assert.notDeepEqual(nursingNextLinks(), guidesIndexNextLinks());
  assert.notDeepEqual(nursingNextLinks(), trustNextLinks());
  assert.ok(!nursingNextLinks().some((link) => link.href === "/caregivers/nursing/qld"));
  assert.ok(!nursingNextLinks().some((link) => link.href === "/caregivers/disability-support/wa"));
  assert.ok(!nursingNextLinks().some((link) => link.href === "/guides/ndis-support-worker"));
  assert.ok(!nursingNextLinks().some((link) => link.href === "/guides/hire-an-in-home-nurse"));
  assert.ok(!nursingNextLinks().some((link) => link.href === "/post-a-job"));
  assert.ok(!nursingNextLinks().some((link) => link.href.includes("job=")));
  assert.ok(!nursingNextLinks().some((link) => /Instant Book|Hire|Withdraw|Pass on/i.test(link.label)));
});
