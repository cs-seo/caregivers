import { isSafeSearchHref } from "./saved-search";

export function searchAlertsNextNotice() {
  return "Open a watched search to see who is new, or post a request if you need cover this week.";
}

export function searchAlertsNextPlace(
  rows: { href: string; name: string; alertsOn: boolean; newCount: number }[],
) {
  const watched = rows.filter((row) => row.alertsOn && isSafeSearchHref(row.href));
  const pick = watched.find((row) => row.newCount > 0) ?? watched[0];
  return pick ? { href: pick.href, name: pick.name } : null;
}

export function searchAlertsNextLinks(place?: { href: string } | null) {
  const links = [];
  if (place?.href && isSafeSearchHref(place.href)) {
    links.push({ href: place.href, label: "Open this search" });
  }
  links.push({ href: "/post-a-job", label: "Post a care request" });
  return links;
}
