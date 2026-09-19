export function locationNextNotice() {
  return "City and suburb hubs sit under each state. Open Sydney’s specialty list, or browse nannies Australia-wide.";
}

export function locationNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function locationNextLinks() {
  return [
    { href: "/locations/nsw/sydney", label: "Open Sydney suburbs" },
    { href: "/caregivers/nannies", label: "Browse nannies Australia-wide" },
  ];
}
