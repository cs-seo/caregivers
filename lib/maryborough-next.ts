export function maryboroughNextNotice() {
  return "Maryborough has suburb pages under Queensland. Open Sale locations, or open Busselton locations.";
}

export function maryboroughNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "maryborough");
}

export function maryboroughNextLinks() {
  return [
    { href: "/locations/vic/sale", label: "Open Sale locations" },
    { href: "/locations/wa/busselton", label: "Open Busselton locations" },
  ];
}
