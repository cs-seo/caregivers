export function forCarersNextNotice() {
  return "This page is written for carers. Open housekeeping carers, or open special needs carers.";
}

export function forCarersNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function forCarersNextLinks() {
  return [
    { href: "/caregivers/housekeeping", label: "Open housekeeping carers" },
    { href: "/caregivers/special-needs", label: "Open special needs carers" },
  ];
}
