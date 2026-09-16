export function cairnsNextNotice() {
  return "Cairns has suburb pages under Queensland. Open Karratha locations, or open Port Pirie locations.";
}

export function cairnsNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "cairns");
}

export function cairnsNextLinks() {
  return [
    { href: "/locations/wa/karratha", label: "Open Karratha locations" },
    { href: "/locations/sa/port-pirie", label: "Open Port Pirie locations" },
  ];
}
