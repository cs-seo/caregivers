export function goldCoastNextNotice() {
  return "The Gold Coast has suburb pages under Queensland. Open nannies on the Gold Coast, or open babysitters on the Gold Coast.";
}

export function goldCoastNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "gold-coast");
}

export function goldCoastNextLinks() {
  return [
    { href: "/caregivers/nannies/qld/gold-coast", label: "Browse nannies on the Gold Coast" },
    { href: "/caregivers/babysitters/qld/gold-coast", label: "Browse babysitters on the Gold Coast" },
  ];
}
