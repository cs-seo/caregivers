import { siteUrl } from "./constants";

export function jobSharePath(slug: string) {
  return `/care-requests/${slug}`;
}

export function jobShareUrl(slug: string, origin = siteUrl()) {
  return `${origin}${jobSharePath(slug)}`;
}

export function jobShareNotice(audience: "owner" | "public" = "owner") {
  return audience === "owner"
    ? "Share this request so a household member or a carer you know can open it."
    : "Share this open request. Carers can send a proposal from the link.";
}

export function jobShareHeading() {
  return "Share this request";
}
