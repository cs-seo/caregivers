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
    q: get("q") || undefined,
    instantBook: get("instantBook") === "1",
    availableNow: get("availableNow") === "1",
    wwcc: get("wwcc") === "1",
    ndis: get("ndis") === "1",
    minRating: get("minRating") ? Number(get("minRating")) : undefined,
    minYears: get("minYears") ? Number(get("minYears")) : undefined,
  };
}

export function filterQuery(params: Record<string, string | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => Boolean(value)));
}
