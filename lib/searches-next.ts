import { isSafeSearchHref } from "./saved-search";

export function searchesNextNotice() {
  return "A saved search keeps the directory filter. Open it again, or compare someone already on your shortlist.";
}

export function searchesNextPlace(rows: { href: string }[]) {
  const safe = rows.filter((row) => isSafeSearchHref(row.href));
  const browse = safe.find((row) => !row.href.includes("instantBook=")) ?? safe[0];
  return browse ? { href: browse.href } : null;
}

export function searchesNextLinks(place?: { href: string } | null) {
  const links = [];
  if (place?.href && isSafeSearchHref(place.href)) {
    links.push({ href: place.href, label: "Open a saved search" });
  }
  links.push({ href: "/dashboard/shortlist", label: "Open your shortlist" });
  return links;
}
