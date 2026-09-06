import type { DirectoryFilters } from "./queries";

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): DirectoryFilters {
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  return {
    specialty: get("specialty") || undefined,
    state: get("state") || undefined,
    city: get("city") || undefined,
    suburb: get("suburb") || undefined,
    q: get("q") || undefined,
    instantBook: get("instantBook") === "1",
    availableNow: get("availableNow") === "1",
    wwcc: get("wwcc") === "1",
    ndis: get("ndis") === "1",
    minRating: get("minRating") ? Number(get("minRating")) : undefined,
    minYears: get("minYears") ? Number(get("minYears")) : undefined,
    page: get("page") ? Math.max(1, Number(get("page"))) : 1,
    sort: get("sort") === "rate" ? "rate" : get("sort") === "experience" ? "experience" : "rating",
  };
}

export function filterQuery(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => Boolean(value)));
}

export function filterHref(path: string, current: Record<string, string | undefined>, overrides: Record<string, string | undefined> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...current, ...overrides })) {
    if (!value) continue;
    query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function filterCurrent(filters: {
  q?: string;
  specialty?: string;
  state?: string;
  city?: string;
  instantBook?: boolean;
  availableNow?: boolean;
  wwcc?: boolean;
  ndis?: boolean;
  minRating?: number;
  minYears?: number;
  page?: number;
  sort?: string;
}) {
  return {
    q: filters.q,
    specialty: filters.specialty,
    state: filters.state,
    city: filters.city,
    instantBook: filters.instantBook ? "1" : undefined,
    availableNow: filters.availableNow ? "1" : undefined,
    wwcc: filters.wwcc ? "1" : undefined,
    ndis: filters.ndis ? "1" : undefined,
    minRating: filters.minRating ? String(filters.minRating) : undefined,
    minYears: filters.minYears ? String(filters.minYears) : undefined,
    page: filters.page && filters.page > 1 ? String(filters.page) : undefined,
    sort: filters.sort && filters.sort !== "rating" ? filters.sort : undefined,
  };
}
