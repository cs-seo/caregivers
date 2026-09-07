import { filterHref } from "./directory";
import { formatDate, parseSydneyDateTimeLocal, titleCaseSlug } from "./format";
import type { DirectoryFilters } from "./queries";

export const MAX_SAVED_SEARCHES = 20;

export function isSafeSearchHref(href: string) {
  if (!href.startsWith("/caregivers")) return false;
  if (href.includes("://")) return false;
  if (href.length > 240) return false;
  return true;
}

export function savedSearchHref(path: string, current: Record<string, string | undefined>) {
  const query = { ...current, page: undefined };
  if (path !== "/caregivers") {
    query.specialty = undefined;
    query.state = undefined;
    query.city = undefined;
  }
  return filterHref(path, query);
}

export function defaultSearchName(title: string, filters: Pick<DirectoryFilters, "availableOn" | "instantBook" | "wwcc" | "ndis" | "q">) {
  const parts = [title.trim() || "Verified carers"];
  if (filters.availableOn) {
    const when = parseSydneyDateTimeLocal(`${filters.availableOn}T12:00`);
    parts.push(`needed ${Number.isNaN(when.getTime()) ? filters.availableOn : formatDate(when)}`);
  }
  if (filters.instantBook) parts.push("Instant Book");
  if (filters.wwcc) parts.push("child check");
  if (filters.ndis) parts.push("NDIS");
  if (filters.q) parts.push(`“${filters.q.trim()}”`);
  return parts.join(" · ").slice(0, 80);
}

export function fallbackSearchName(href: string) {
  const [path] = href.split("?");
  const bits = path.replace(/^\/caregivers\/?/, "").split("/").filter(Boolean);
  if (bits.length === 0) return "All carers";
  return bits.map(titleCaseSlug).join(" · ");
}
