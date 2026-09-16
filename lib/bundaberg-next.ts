export function bundabergNextNotice() {
  return "Bundaberg has suburb pages under Queensland. Open Orange locations, or open Burnie locations.";
}

export function bundabergNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "bundaberg");
}

export function bundabergNextLinks() {
  return [
    { href: "/locations/nsw/orange", label: "Open Orange locations" },
    { href: "/locations/tas/burnie", label: "Open Burnie locations" },
  ];
}
