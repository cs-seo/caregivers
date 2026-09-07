import assert from "node:assert/strict";
import { test } from "node:test";
import { isUnreadFor, unreadCountFor } from "./messages";

test("isUnreadFor is only true for incoming messages without readAt", () => {
  assert.equal(isUnreadFor({ senderId: "carer", readAt: null }, "family"), true);
  assert.equal(isUnreadFor({ senderId: "family", readAt: null }, "family"), false);
  assert.equal(isUnreadFor({ senderId: "carer", readAt: new Date("2026-09-07T00:00:00.000Z") }, "family"), false);
});

test("unreadCountFor counts incoming unread messages only", () => {
  const count = unreadCountFor(
    [
      { senderId: "family", readAt: null },
      { senderId: "carer", readAt: null },
      { senderId: "carer", readAt: new Date("2026-09-06T00:00:00.000Z") },
    ],
    "family",
  );
  assert.equal(count, 1);
});
