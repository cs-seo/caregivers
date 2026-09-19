import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEMO_CARER_EMAIL,
  DEMO_FAMILY_EMAIL,
  PRODUCTION_SITE_URL,
  SITE_HOST,
  siteUrl,
} from "./constants";

test("production host is caregiver.com.au", () => {
  assert.equal(SITE_HOST, "caregiver.com.au");
  assert.equal(PRODUCTION_SITE_URL, "https://caregiver.com.au");
  assert.equal(DEMO_FAMILY_EMAIL, "family@caregiver.com.au");
  assert.equal(DEMO_CARER_EMAIL, "carer@caregiver.com.au");
  assert.doesNotMatch(SITE_HOST, /careproof\.com\.au/);
  assert.doesNotMatch(PRODUCTION_SITE_URL, /careproof\.com\.au/);
});

test("siteUrl falls back to caregiver.com.au when NEXT_PUBLIC_SITE_URL is unset", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(siteUrl(), "https://caregiver.com.au");
  if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = previous;
});
