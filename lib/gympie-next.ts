export function gympieNextNotice() {
  return "Gympie has suburb pages under Queensland. Open Murray Bridge locations, or open Port Augusta locations.";
}

export function gympieNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "gympie");
}

export function gympieNextLinks() {
  return [
    { href: "/locations/sa/murray-bridge", label: "Open Murray Bridge locations" },
    { href: "/locations/sa/port-augusta", label: "Open Port Augusta locations" },
  ];
}
