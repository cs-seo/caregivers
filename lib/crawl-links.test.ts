import assert from "node:assert/strict";
import { test } from "node:test";
import {
  crawlFooterSpecialtyLinks,
  crawlFooterStateLinks,
  crawlSpecialtyCityLinks,
  crawlStaticPaths,
  crawlSuburbSpecialtyLinks,
} from "./crawl-links";

const specialties = [
  { slug: "aged-care", pluralName: "Aged care carers" },
  { slug: "nannies", pluralName: "Nannies" },
  { slug: "babysitters", pluralName: "Babysitters" },
  { slug: "disability-support", pluralName: "Disability support workers" },
  { slug: "special-needs", pluralName: "Special needs carers" },
  { slug: "housekeeping", pluralName: "Housekeepers" },
  { slug: "companion-care", pluralName: "Companion carers" },
  { slug: "nursing", pluralName: "Nurses" },
  { slug: "respite", pluralName: "Respite carers" },
  { slug: "after-school-care", pluralName: "After-school carers" },
  { slug: "personal-care", pluralName: "Personal care assistants" },
];

test("crawlStaticPaths include locations, privacy and terms for indexing", () => {
  assert.ok(crawlStaticPaths().includes("/locations"));
  assert.ok(crawlStaticPaths().includes("/privacy"));
  assert.ok(crawlStaticPaths().includes("/terms"));
  assert.ok(crawlStaticPaths().includes("/guides"));
  assert.ok(!crawlStaticPaths().includes("/login"));
  assert.ok(!crawlStaticPaths().includes("/dashboard"));
  assert.ok(!crawlStaticPaths().includes("/post-a-job"));
});

test("crawlFooterSpecialtyLinks include every care type, not a short slice", () => {
  const links = crawlFooterSpecialtyLinks(specialties);
  assert.equal(links.length, specialties.length);
  assert.ok(links.some((link) => link.href === "/caregivers/after-school-care"));
  assert.ok(links.some((link) => link.href === "/caregivers/personal-care"));
  assert.ok(links.some((link) => link.href === "/caregivers/respite"));
  assert.ok(!links.some((link) => link.href === "/dashboard/shortlist"));
  assert.ok(!links.some((link) => /Instant Book|Hire|Book/i.test(link.label)));
});

test("crawlFooterStateLinks open location hubs, not a single specialty", () => {
  assert.deepEqual(
    crawlFooterStateLinks([
      { slug: "nsw", name: "New South Wales" },
      { slug: "sa", name: "South Australia" },
    ]),
    [
      { href: "/locations/nsw", label: "New South Wales" },
      { href: "/locations/sa", label: "South Australia" },
    ],
  );
  assert.ok(
    !crawlFooterStateLinks([{ slug: "nsw", name: "New South Wales" }]).some(
      (link) => link.href === "/caregivers/aged-care/nsw",
    ),
  );
});

test("crawlSuburbSpecialtyLinks expose every specialty on a suburb, including long-tail hubs", () => {
  const links = crawlSuburbSpecialtyLinks(specialties, {
    stateSlug: "sa",
    citySlug: "clare",
    suburbSlug: "auburn",
  });
  assert.equal(links.length, specialties.length);
  assert.ok(links.some((link) => link.href === "/caregivers/nursing/sa/clare/auburn"));
  assert.ok(links.some((link) => link.href === "/caregivers/personal-care/sa/clare/auburn"));
  assert.ok(links.some((link) => link.href === "/caregivers/after-school-care/sa/clare/auburn"));
  assert.ok(!links.some((link) => link.href.includes("job=")));
});

test("crawlSpecialtyCityLinks include long-tail hubs, not only capitals", () => {
  const links = crawlSpecialtyCityLinks(
    { slug: "aged-care", pluralName: "Aged care carers" },
    [
      {
        slug: "nsw",
        cities: [
          { slug: "sydney", name: "Sydney" },
          { slug: "parkes", name: "Parkes" },
          { slug: "clare", name: "Clare" },
        ],
      },
      {
        slug: "sa",
        cities: [{ slug: "clare", name: "Clare" }],
      },
    ],
  );
  assert.ok(links.some((link) => link.href === "/caregivers/aged-care/nsw/parkes"));
  assert.ok(links.some((link) => link.href === "/caregivers/aged-care/sa/clare"));
  assert.ok(links.some((link) => link.href === "/caregivers/aged-care/nsw/sydney"));
  assert.equal(links.length, 4);
  assert.ok(!links.some((link) => link.href === "/caregivers/aged-care/qld/sunshine-coast"));
});
