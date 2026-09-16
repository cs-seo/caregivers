export function mackayNextNotice() {
  return "Mackay has suburb pages under Queensland. Open Ballarat locations, or open Darwin locations.";
}

export function mackayNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "mackay");
}

export function mackayNextLinks() {
  return [
    { href: "/locations/vic/ballarat", label: "Open Ballarat locations" },
    { href: "/locations/nt/darwin", label: "Open Darwin locations" },
  ];
}
