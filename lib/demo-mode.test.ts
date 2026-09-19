import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SUPPORT_EMAIL,
  isDemoMode,
  isSeededAccountEmail,
  leftoverFamily,
  platformAbnLine,
  publicCarerWhere,
  publicJobWhere,
  showPlatformAbn,
} from "./demo-mode";

test("support email is on caregiver.com.au", () => {
  assert.equal(SUPPORT_EMAIL, "hello@caregiver.com.au");
});

test("isSeededAccountEmail matches demo host mailboxes only", () => {
  assert.equal(isSeededAccountEmail("family@caregiver.com.au"), true);
  assert.equal(isSeededAccountEmail("alex@gmail.com"), false);
  assert.equal(isSeededAccountEmail(null), false);
});

test("leftoverFamily stays off when demo mode is forced off", () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  assert.equal(isDemoMode(), false);
  assert.equal(leftoverFamily(true), false);
  assert.deepEqual(publicCarerWhere(), { user: { email: { not: { endsWith: "@caregiver.com.au" } } } });
  assert.deepEqual(publicJobWhere(), { family: { email: { not: { endsWith: "@caregiver.com.au" } } } });
  assert.equal(showPlatformAbn(), false);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
});

test("platformAbnLine stays blank on production until a real ABN is set", () => {
  const previousDemo = process.env.NEXT_PUBLIC_DEMO_MODE;
  const previousAbn = process.env.NEXT_PUBLIC_PLATFORM_ABN;
  process.env.NEXT_PUBLIC_DEMO_MODE = "false";
  delete process.env.NEXT_PUBLIC_PLATFORM_ABN;
  assert.equal(showPlatformAbn(), false);
  assert.equal(platformAbnLine(), "");
  process.env.NEXT_PUBLIC_PLATFORM_ABN = "12 345 678 901";
  assert.equal(showPlatformAbn(), true);
  assert.equal(platformAbnLine(), "ABN 12 345 678 901");
  if (previousDemo === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = previousDemo;
  if (previousAbn === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_ABN;
  else process.env.NEXT_PUBLIC_PLATFORM_ABN = previousAbn;
});

test("leftoverFamily stays on when demo mode is forced on", () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  assert.equal(isDemoMode(), true);
  assert.equal(leftoverFamily(true), true);
  assert.equal(leftoverFamily(false), false);
  assert.deepEqual(publicCarerWhere(), {});
  assert.deepEqual(publicJobWhere(), {});
  assert.equal(showPlatformAbn(), true);
  if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
});
