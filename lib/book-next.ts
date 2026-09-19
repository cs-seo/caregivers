export function bookNextNotice() {
  return "This sit form sits next to unused city hubs. Open Nowra locations, or open Whyalla locations.";
}

export function bookNextShows(args: { isFamily: boolean; jobAttached: boolean }) {
  return Boolean(args.isFamily && !args.jobAttached);
}

export function bookNextLinks() {
  return [
    { href: "/locations/nsw/nowra", label: "Open Nowra locations" },
    { href: "/locations/sa/whyalla", label: "Open Whyalla locations" },
  ];
}
