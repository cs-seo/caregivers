export function coffsHarbourNextNotice() {
  return "Coffs Harbour has suburb pages under New South Wales. Open Wagga Wagga locations, or open Tamworth locations.";
}

export function coffsHarbourNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "coffs-harbour");
}

export function coffsHarbourNextLinks() {
  return [
    { href: "/locations/nsw/wagga-wagga", label: "Open Wagga Wagga locations" },
    { href: "/locations/nsw/tamworth", label: "Open Tamworth locations" },
  ];
}
