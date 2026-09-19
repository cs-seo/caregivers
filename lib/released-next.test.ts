import assert from "node:assert/strict";
import { test } from "node:test";
import { declinedNextLinks, declinedNextNotice } from "./declined-next";
import { remittanceNextLinks, remittanceNextNotice } from "./remittance-next";
import { releasedNextLinks, releasedNextNotice } from "./released-next";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "./reviews-due";

test("releasedNextNotice names released funds without a count or publish CTA", () => {
  assert.match(releasedNextNotice(), /released/);
  assert.match(releasedNextNotice(), /reviews to write/);
  assert.match(releasedNextNotice(), /browse carers/);
  assert.doesNotMatch(releasedNextNotice(), /\d+ open/);
  assert.doesNotMatch(releasedNextNotice(), /Publish/);
  assert.doesNotMatch(releasedNextNotice(), /Confirm complete/);
  assert.doesNotMatch(releasedNextNotice(), /Instant Book/);
  assert.doesNotMatch(releasedNextNotice(), /job=/);
  assert.notEqual(releasedNextNotice(), reviewsDueNextNotice());
  assert.notEqual(releasedNextNotice(), remittanceNextNotice());
  assert.notEqual(releasedNextNotice(), declinedNextNotice());
});

test("releasedNextLinks go to reviews-due and the specialty directory, not the review form", () => {
  assert.deepEqual(releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }), [
    { href: "/dashboard/reviews-due", label: "Open reviews to write" },
    { href: "/caregivers/aged-care", label: "Browse aged care carers" },
  ]);
  assert.deepEqual(releasedNextLinks({}), [
    { href: "/dashboard/reviews-due", label: "Open reviews to write" },
    { href: "/caregivers", label: "Browse verified carers" },
  ]);
  assert.notDeepEqual(
    releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }),
    reviewsDueNextLinks({ specialty: "aged-care", specialtyPlural: "Aged care carers" }),
  );
  assert.notDeepEqual(
    releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }),
    remittanceNextLinks({ bookingId: "sit-1" }),
  );
  assert.notDeepEqual(
    releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }),
    declinedNextLinks({ specialtySlug: "nannies", specialtyPlural: "Nannies" }),
  );
  assert.ok(
    !releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }).some(
      (link) => link.href === "#review",
    ),
  );
  assert.ok(
    !releasedNextLinks({ specialtySlug: "aged-care", specialtyPlural: "Aged care carers" }).some((link) =>
      link.href.includes("job="),
    ),
  );
});
