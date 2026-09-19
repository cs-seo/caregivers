export function townsvilleNextNotice() {
  return "Townsville has suburb pages under Queensland. Open Katherine locations, or open Whyalla locations.";
}

export function townsvilleNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "townsville");
}

export function townsvilleNextLinks() {
  return [
    { href: "/locations/nt/katherine", label: "Open Katherine locations" },
    { href: "/locations/sa/whyalla", label: "Open Whyalla locations" },
  ];
}
