export function shortlistPlacesNotice() {
  return "Your saved roster sits next to unused city hubs. Open Wollongong suburbs, or browse personal care in Wollongong.";
}

export function shortlistPlacesShows(args: { hasCarers: boolean; jobAttached: boolean }) {
  return Boolean(args.hasCarers && !args.jobAttached);
}

export function shortlistPlacesLinks() {
  return [
    { href: "/locations/nsw/wollongong", label: "Open Wollongong suburbs" },
    { href: "/caregivers/personal-care/nsw/wollongong", label: "Browse personal care in Wollongong" },
  ];
}
