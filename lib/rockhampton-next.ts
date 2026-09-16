export function rockhamptonNextNotice() {
  return "Rockhampton has suburb pages under Queensland. Open Central Coast locations, or open Canberra locations.";
}

export function rockhamptonNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "rockhampton");
}

export function rockhamptonNextLinks() {
  return [
    { href: "/locations/nsw/central-coast", label: "Open Central Coast locations" },
    { href: "/locations/act/canberra", label: "Open Canberra locations" },
  ];
}
