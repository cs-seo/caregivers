import assert from "node:assert/strict";
import { test } from "node:test";
import { expiredJobDirectoryHref, expiredJobOwnerNotice, expiredJobRecoveryLinks } from "./job-expired";

const newtown = {
  specialty: { slug: "companion-care", name: "Companion care", pluralName: "Companion carers" },
  city: { slug: "sydney", name: "Sydney", state: { slug: "nsw" } },
};

test("expiredJobDirectoryHref stays on the specialty city path without a past date", () => {
  assert.equal(expiredJobDirectoryHref(newtown), "/caregivers/companion-care/nsw/sydney");
});

test("expiredJobRecoveryLinks offer post again and the matching directory", () => {
  assert.deepEqual(expiredJobRecoveryLinks(newtown), [
    { href: "/post-a-job?specialty=companion-care&city=sydney", label: "Post a new care request" },
    { href: "/caregivers/companion-care/nsw/sydney", label: "Browse companion carers in Sydney" },
  ]);
  assert.match(expiredJobOwnerNotice(), /left the open board/);
  assert.doesNotMatch(expiredJobDirectoryHref(newtown), /availableOn/);
});
