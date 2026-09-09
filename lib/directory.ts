import { footerBoardLink } from "./footer-board";
import { isJobSlug, shortlistHref } from "./job-match";
import { postJobHref } from "./job-post";
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
    availableOn: /^\d{4}-\d{2}-\d{2}$/.test(get("availableOn") ?? "") ? get("availableOn") : undefined,
    availableAt: /^([01]\d|2[0-3]):([0-5]\d)$/.test(get("availableAt") ?? "") ? get("availableAt") : undefined,
    job: isJobSlug(get("job") ?? "") ? get("job") : undefined,
    instantBook: get("instantBook") === "1",
    availableNow: get("availableNow") === "1",
    wwcc: get("wwcc") === "1",
    ndis: get("ndis") === "1",
    currentChecks: get("currentChecks") === "1",
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
  availableOn?: string;
  availableAt?: string;
  job?: string;
  instantBook?: boolean;
  availableNow?: boolean;
  wwcc?: boolean;
  ndis?: boolean;
  currentChecks?: boolean;
  minRating?: number;
  minYears?: number;
  page?: number;
  sort?: string;
}) {
  return {
    q: filters.q,
    availableOn: filters.availableOn,
    availableAt: filters.availableOn ? filters.availableAt : undefined,
    job: filters.job && isJobSlug(filters.job) ? filters.job : undefined,
    specialty: filters.specialty,
    state: filters.state,
    city: filters.city,
    instantBook: filters.instantBook ? "1" : undefined,
    availableNow: filters.availableNow ? "1" : undefined,
    wwcc: filters.wwcc ? "1" : undefined,
    ndis: filters.ndis ? "1" : undefined,
    currentChecks: filters.currentChecks ? "1" : undefined,
    minRating: filters.minRating ? String(filters.minRating) : undefined,
    minYears: filters.minYears ? String(filters.minYears) : undefined,
    page: filters.page && filters.page > 1 ? String(filters.page) : undefined,
    sort: filters.sort && filters.sort !== "rating" ? filters.sort : undefined,
  };
}

export function directoryBasePath(
  filters: Pick<DirectoryFilters, "specialty" | "state" | "city" | "suburb">,
) {
  const { specialty, state, city, suburb } = filters;
  if (specialty && state && city && suburb) return `/caregivers/${specialty}/${state}/${city}/${suburb}`;
  if (specialty && state && city) return `/caregivers/${specialty}/${state}/${city}`;
  if (specialty && state) return `/caregivers/${specialty}/${state}`;
  if (specialty) return `/caregivers/${specialty}`;
  return "/caregivers";
}

function emptyStateHref(
  filters: DirectoryFilters,
  overrides: Partial<DirectoryFilters> = {},
) {
  const next = { ...filters, ...overrides, page: 1 };
  const path = directoryBasePath(next);
  const query = filterCurrent(next);
  if (path !== "/caregivers") {
    query.specialty = undefined;
    query.state = undefined;
    query.city = undefined;
  }
  return filterHref(path, query);
}

export function emptyStateLinks(filters: DirectoryFilters) {
  const links: { href: string; label: string }[] = [];
  const { specialty, state, city, suburb, availableOn, availableAt } = filters;
  if (availableOn && availableAt) {
    links.push({
      href: emptyStateHref(filters, { availableAt: undefined }),
      label: "Search any time that day",
    });
  }
  if (availableOn) {
    links.push({
      href: emptyStateHref(filters, { availableOn: undefined, availableAt: undefined }),
      label: "Search again without a date",
    });
  }
  if (specialty && state && city && suburb) {
    links.push({
      href: `/caregivers/${specialty}/${state}/${city}`,
      label: "See carers across this city",
    });
  }
  if (specialty && state && city) {
    links.push({
      href: `/caregivers/${specialty}/${state}`,
      label: "See this specialty across the state",
    });
  }
  if (specialty) {
    links.push({
      href: `/caregivers/${specialty}`,
      label: "Browse this specialty Australia-wide",
    });
  }
  links.push({ href: "/caregivers", label: "Browse all verified carers" });
  links.push({ href: "/locations", label: "Explore cities and suburbs" });
  links.push({
    href: postJobHref({ specialty, city }),
    label: "Post a care request",
  });
  return [...new Map(links.map((link) => [link.href, link])).values()];
}

export type DirectoryJobEmpty = {
  jobSlug: string;
  jobTitle: string;
  shortlistCount: number;
};

export function directoryJobEmptyNotice(jobTitle: string) {
  return `No carers match these filters for ${jobTitle} yet. Open your shortlist, return to the request, or widen the search.`;
}

export function directoryJobEmptyLinks(filters: DirectoryFilters, job?: DirectoryJobEmpty | null) {
  const links: { href: string; label: string }[] = [];
  if (job?.jobSlug && isJobSlug(job.jobSlug)) {
    if (job.shortlistCount > 0) {
      links.push({
        href: shortlistHref(job.jobSlug),
        label: "Compare carers on your shortlist for this request",
      });
    }
    links.push({
      href: `/care-requests/${job.jobSlug}`,
      label: "Back to your request",
    });
    links.push({
      href: emptyStateHref(filters, { job: undefined }),
      label: "Browse without attaching to this request",
    });
  }
  return [...new Map([...links, ...emptyStateLinks(filters)].map((link) => [link.href, link])).values()];
}

export function directoryListedPostLink(filters: Pick<DirectoryFilters, "specialty" | "city">) {
  if (!filters.specialty) return null;
  return {
    href: postJobHref({ specialty: filters.specialty, city: filters.city }),
    label: "Post a care request",
  };
}

export function directoryListedPostNotice() {
  return "Need a sit these profiles don’t cover? Post a request and compare proposals.";
}

export function directoryBoardNotice() {
  return "Prefer to compare proposals instead? Open care requests already on the board.";
}

export function directoryBoardLink() {
  return footerBoardLink();
}

export function directoryNearbyNotice(pluralName: string, suburbName: string, cityName: string) {
  return `No ${pluralName.toLowerCase()} are listed in ${suburbName} yet. Showing verified carers who cover greater ${cityName}, including ${suburbName}.`;
}

export function directoryNearbyLinks(args: {
  specialty: string;
  state: string;
  city: string;
  specialtyPlural: string;
  cityName: string;
  stateName: string;
}) {
  const who = args.specialtyPlural.toLowerCase();
  return [
    {
      href: `/caregivers/${args.specialty}/${args.state}/${args.city}`,
      label: `See ${who} across ${args.cityName}`,
    },
    {
      href: `/caregivers/${args.specialty}/${args.state}`,
      label: `See ${who} across ${args.stateName}`,
    },
  ];
}
