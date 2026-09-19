import { isJobAccepting } from "./job-status";

export function requestsNextNotice() {
  return "A posted request is still accepting. Open the soonest one, or compare someone already on your shortlist.";
}

export function requestsNextPlace(
  jobs: { slug: string; status: string; startDate?: Date | null }[],
  now = new Date(),
) {
  const open = jobs
    .filter((job) => isJobAccepting(job, now) && job.slug)
    .slice()
    .sort((a, b) => (a.startDate?.getTime() ?? Number.POSITIVE_INFINITY) - (b.startDate?.getTime() ?? Number.POSITIVE_INFINITY));
  return open[0] ? { href: `/care-requests/${open[0].slug}` } : null;
}

export function requestsNextLinks(place?: { href: string } | null) {
  const links = [];
  if (place?.href?.startsWith("/care-requests/")) {
    links.push({ href: place.href, label: "Open the soonest request" });
  }
  links.push({ href: "/dashboard/shortlist", label: "Open your shortlist" });
  return links;
}
