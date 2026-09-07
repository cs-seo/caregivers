import { filterHref, parseFilters } from "./directory";
import { formatDate, formatDateTime, parseSydneyDateTimeLocal, titleCaseSlug } from "./format";
import type { DirectoryFilters } from "./queries";

export const MAX_SAVED_SEARCHES = 20;

export function isSafeSearchHref(href: string) {
  if (!href.startsWith("/caregivers")) return false;
  if (href.includes("://")) return false;
  if (href.length > 240) return false;
  return true;
}

export function savedSearchHref(path: string, current: Record<string, string | undefined>) {
  const query: Record<string, string | undefined> = { ...current, page: undefined, job: undefined };
  if (path !== "/caregivers") {
    query.specialty = undefined;
    query.state = undefined;
    query.city = undefined;
  }
  return filterHref(path, query);
}

export function defaultSearchName(
  title: string,
  filters: Pick<DirectoryFilters, "availableOn" | "availableAt" | "instantBook" | "wwcc" | "ndis" | "q">,
) {
  const parts = [title.trim() || "Verified carers"];
  if (filters.availableOn) {
    const clock = filters.availableAt ?? "12:00";
    const when = parseSydneyDateTimeLocal(`${filters.availableOn}T${clock}`);
    if (Number.isNaN(when.getTime())) {
      parts.push(`needed ${filters.availableOn}`);
    } else if (filters.availableAt) {
      parts.push(`needed ${formatDateTime(when)}`);
    } else {
      parts.push(`needed ${formatDate(when)}`);
    }
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

export function filtersFromSearchHref(href: string): DirectoryFilters | null {
  if (!isSafeSearchHref(href)) return null;
  const url = new URL(href, "https://careproof.example");
  const parts = url.pathname.replace(/^\/caregivers\/?/, "").split("/").filter(Boolean);
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  if (parts[0]) params.specialty = parts[0];
  if (parts[1]) params.state = parts[1];
  if (parts[2]) params.city = parts[2];
  if (parts[3]) params.suburb = parts[3];
  return parseFilters(params);
}

export function savedSearchDelta(current: number, lastSeenCount: number, seenAt?: Date | null) {
  const count = Math.max(0, current);
  const seen = Math.max(0, lastSeenCount);
  if (!seenAt) return { current: count, newCount: count, unseen: true };
  return { current: count, newCount: Math.max(0, count - seen), unseen: false };
}

export function savedSearchDeltaLabel(delta: ReturnType<typeof savedSearchDelta>) {
  if (delta.current === 0) return delta.unseen ? "No carers yet" : "0 carers";
  if (delta.unseen) return `${delta.current} carers · not opened yet`;
  if (delta.newCount > 0) return `${delta.current} carers · ${delta.newCount} new`;
  return `${delta.current} carers`;
}

export function jobsFitDeltaLabel(delta: ReturnType<typeof savedSearchDelta>) {
  if (delta.current === 0) return delta.unseen ? "No matching jobs yet" : "0 matching jobs";
  const jobs = delta.current === 1 ? "job fits" : "jobs fit";
  if (delta.unseen) return `${delta.current} ${jobs} · not opened yet`;
  if (delta.newCount > 0) return `${delta.current} ${jobs} · ${delta.newCount} new`;
  return `${delta.current} ${jobs}`;
}
