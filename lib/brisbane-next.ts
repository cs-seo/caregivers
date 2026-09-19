export function brisbaneNextNotice() {
  return "Brisbane has suburb pages under Queensland. Open Melbourne locations, or open Sydney locations.";
}

export function brisbaneNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "brisbane");
}

export function brisbaneNextLinks() {
  return [
    { href: "/locations/vic/melbourne", label: "Open Melbourne locations" },
    { href: "/locations/nsw/sydney", label: "Open Sydney locations" },
  ];
}
