import assert from "node:assert/strict";
import { test } from "node:test";
import { CITIES_BY_STATE } from "../prisma/data/cities";
import { SUBURBS_BY_CITY } from "../prisma/data/suburbs";

const REGION_HUBS = [
  "hunter-valley",
  "southern-highlands",
  "mornington-peninsula",
  "yarra-valley",
  "moreton-bay",
  "barossa",
  "adelaide-hills",
];

test("CITIES_BY_STATE has unique slugs per state and covers long-tail towns and regions", () => {
  const slugs = Object.values(CITIES_BY_STATE).flatMap((cities) => cities.map((city) => city.slug));
  assert.ok(slugs.length >= 119);
  for (const [stateSlug, cities] of Object.entries(CITIES_BY_STATE)) {
    const seen = new Set<string>();
    for (const city of cities) {
      assert.equal(seen.has(city.slug), false, `${stateSlug}/${city.slug} is duplicated`);
      seen.add(city.slug);
      assert.ok(Number.isFinite(city.lat));
      assert.ok(Number.isFinite(city.lng));
    }
  }
  assert.ok(CITIES_BY_STATE.nsw.some((city) => city.slug === "hunter-valley"));
  assert.ok(CITIES_BY_STATE.nsw.some((city) => city.slug === "byron-bay"));
  assert.ok(CITIES_BY_STATE.vic.some((city) => city.slug === "mornington-peninsula"));
  assert.ok(CITIES_BY_STATE.qld.some((city) => city.slug === "logan"));
  assert.ok(CITIES_BY_STATE.wa.some((city) => city.slug === "margaret-river"));
  assert.ok(CITIES_BY_STATE.sa.some((city) => city.slug === "barossa"));
  assert.ok(CITIES_BY_STATE.tas.some((city) => city.slug === "huonville"));
  assert.ok(CITIES_BY_STATE.nt.some((city) => city.slug === "tennant-creek"));
});

test("every seeded city has long-tail suburb pages", () => {
  for (const [stateSlug, cities] of Object.entries(CITIES_BY_STATE)) {
    const suburbs = SUBURBS_BY_CITY[stateSlug] ?? {};
    for (const city of cities) {
      const names = suburbs[city.slug] ?? [];
      assert.ok(names.length >= 3, `${stateSlug}/${city.slug} needs at least 3 suburbs`);
      assert.equal(new Set(names).size, names.length, `${stateSlug}/${city.slug} has duplicate suburbs`);
    }
  }
});

test("region hubs keep satellite towns as suburb pages", () => {
  for (const slug of REGION_HUBS) {
    const state = Object.entries(CITIES_BY_STATE).find(([, cities]) => cities.some((city) => city.slug === slug));
    assert.ok(state, `${slug} is missing from CITIES_BY_STATE`);
    const names = SUBURBS_BY_CITY[state![0]]?.[slug] ?? [];
    assert.ok(names.length >= 5, `${slug} needs satellite towns`);
  }
  assert.ok(SUBURBS_BY_CITY.nsw["southern-highlands"].includes("Bowral"));
  assert.ok(SUBURBS_BY_CITY.vic["mornington-peninsula"].includes("Rosebud"));
  assert.ok(SUBURBS_BY_CITY.sa.barossa.includes("Tanunda"));
  assert.ok(SUBURBS_BY_CITY.nsw.katoomba.includes("Blackheath"));
});
