export function dalbyNextNotice() {
  return "Dalby has suburb pages under Queensland. Open Colac locations, or open Portland locations.";
}

export function dalbyNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "dalby");
}

export function dalbyNextLinks() {
  return [
    { href: "/locations/vic/colac", label: "Open Colac locations" },
    { href: "/locations/vic/portland", label: "Open Portland locations" },
  ];
}
