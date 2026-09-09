import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSydneyDateTimeLocal } from "./format";
import { jobPostingJsonLd } from "./job-seo";

const marrickville = {
  slug: "weekday-aged-care-marrickville",
  title: "Weekday aged care for Mum in Marrickville",
  description: "Weekday mornings for Mum.",
  createdAt: new Date("2026-08-01T00:00:00.000Z"),
  startDate: parseSydneyDateTimeLocal("2026-09-15T08:00"),
  budgetCents: 6500,
  specialty: { name: "Aged care" },
  city: { name: "Sydney", state: { abbrev: "NSW" } },
};

test("jobPostingJsonLd describes an accepting sit for Google Jobs", () => {
  const data = jobPostingJsonLd(marrickville, true, "https://careproof.com.au");
  assert.equal(data?.["@type"], "JobPosting");
  assert.equal(data?.title, marrickville.title);
  assert.equal(data?.url, "https://careproof.com.au/care-requests/weekday-aged-care-marrickville");
  assert.equal(data?.employmentType, "CONTRACTOR");
  assert.equal(data?.industry, "Aged care");
  assert.equal(data?.jobLocation.address.addressLocality, "Sydney");
  assert.equal(data?.jobLocation.address.addressRegion, "NSW");
  assert.equal(data?.jobLocation.address.addressCountry, "AU");
  assert.equal(data?.baseSalary.currency, "AUD");
  assert.equal(data?.baseSalary.value.value, 65);
  assert.equal(data?.baseSalary.value.unitText, "HOUR");
  assert.equal(data?.validThrough, marrickville.startDate.toISOString());
  assert.equal(data?.identifier.value, "weekday-aged-care-marrickville");
});

test("jobPostingJsonLd stays off expired or hired requests", () => {
  assert.equal(jobPostingJsonLd(marrickville, false), null);
});
