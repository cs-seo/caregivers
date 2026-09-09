import assert from "node:assert/strict";
import { test } from "node:test";
import { CITIES_BY_STATE } from "../prisma/data/cities";
import { SUBURBS_BY_CITY } from "../prisma/data/suburbs";

test("CITIES_BY_STATE has unique slugs per state and covers the new regional towns", () => {
  const slugs = Object.values(CITIES_BY_STATE).flatMap((cities) => cities.map((city) => city.slug));
  assert.equal(slugs.length, 81);
  for (const [stateSlug, cities] of Object.entries(CITIES_BY_STATE)) {
    const seen = new Set<string>();
    for (const city of cities) {
      assert.equal(seen.has(city.slug), false, `${stateSlug}/${city.slug} is duplicated`);
      seen.add(city.slug);
      assert.ok(Number.isFinite(city.lat));
      assert.ok(Number.isFinite(city.lng));
    }
  }
  assert.ok(CITIES_BY_STATE.nsw.some((city) => city.slug === "goulburn"));
  assert.ok(CITIES_BY_STATE.nsw.some((city) => city.slug === "katoomba"));
  assert.ok(CITIES_BY_STATE.vic.some((city) => city.slug === "wangaratta"));
  assert.ok(CITIES_BY_STATE.qld.some((city) => city.slug === "ipswich"));
  assert.ok(CITIES_BY_STATE.wa.some((city) => city.slug === "karratha"));
  assert.ok(CITIES_BY_STATE.sa.some((city) => city.slug === "gawler"));
  assert.ok(CITIES_BY_STATE.tas.some((city) => city.slug === "ulverstone"));
  assert.ok(CITIES_BY_STATE.nt.some((city) => city.slug === "katherine"));
});

test("every seeded city has suburb pages", () => {
  for (const [stateSlug, cities] of Object.entries(CITIES_BY_STATE)) {
    const suburbs = SUBURBS_BY_CITY[stateSlug] ?? {};
    for (const city of cities) {
      assert.ok((suburbs[city.slug] ?? []).length > 0, `${stateSlug}/${city.slug} needs suburbs`);
    }
  }
});
