import assert from "node:assert/strict";
import { test } from "node:test";
import {
  handoverFromForm,
  handoverGaps,
  handoverToDb,
  hasHandover,
  readHandover,
} from "./handover";

test("readHandover trims empty fields", () => {
  assert.deepEqual(readHandover({ handoverAccess: "  lockbox 2048  ", handoverCare: "   " }), {
    handoverAccess: "lockbox 2048",
    handoverCare: "",
    handoverEmergency: "",
  });
});

test("hasHandover is true when any field is set", () => {
  assert.equal(hasHandover({ handoverEmergency: "Alex 0400 111 222" }), true);
  assert.equal(hasHandover({ handoverAccess: "", handoverCare: "", handoverEmergency: "" }), false);
  assert.equal(hasHandover(null), false);
});

test("handoverGaps flags missing access, care and emergency", () => {
  assert.deepEqual(handoverGaps({ handoverAccess: "gate left" }), {
    access: false,
    care: true,
    emergency: true,
  });
});

test("handoverFromForm caps length and handoverToDb stores nulls", () => {
  const form = new FormData();
  form.set("handoverAccess", `  ${"k".repeat(600)}  `);
  form.set("handoverCare", "");
  form.set("handoverEmergency", "  Alex 0400 111 222 ");
  const fields = handoverFromForm(form);
  assert.equal(fields.handoverAccess.length, 500);
  assert.equal(fields.handoverEmergency, "Alex 0400 111 222");
  assert.deepEqual(handoverToDb(fields), {
    handoverAccess: fields.handoverAccess,
    handoverCare: null,
    handoverEmergency: "Alex 0400 111 222",
  });
});
