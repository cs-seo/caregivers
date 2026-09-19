import assert from "node:assert/strict";
import { test } from "node:test";
import { credentialLabel } from "./trust";
import { issuingStateSlug } from "./seo-content";

test("issuingStateSlug accepts slugs and full state names", () => {
  assert.equal(issuingStateSlug("QLD"), "qld");
  assert.equal(issuingStateSlug("Northern Territory"), "nt");
  assert.equal(issuingStateSlug("xyz"), undefined);
});

test("credentialLabel uses the local child-check name", () => {
  assert.equal(credentialLabel("wwcc", "qld"), "Blue Card");
  assert.equal(credentialLabel("wwcc", "nt", true), "Ochre Card");
  assert.equal(credentialLabel("wwcc", "act"), "Working with Vulnerable People (WWVP) registration");
  assert.equal(credentialLabel("first_aid"), "First aid (asthma & anaphylaxis)");
});
