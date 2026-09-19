import { randomBytes } from "node:crypto";
import { siteUrl } from "./constants";

export const CALENDAR_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export function newCalendarToken() {
  return randomBytes(24).toString("base64url");
}

export function isCalendarToken(value: string) {
  return CALENDAR_TOKEN_PATTERN.test(value);
}

export function calendarFeedPath(token: string) {
  return `/feed/${token}/ics`;
}

export function subscribeUrls(token: string, origin = siteUrl()) {
  const https = `${origin.replace(/\/$/, "")}${calendarFeedPath(token)}`;
  const webcal = https.replace(/^https:/, "webcal:").replace(/^http:/, "webcal:");
  return { https, webcal };
}
