export function swanHillNextNotice() {
  return "Swan Hill has suburb pages under Victoria. Open Benalla locations, or open Carnarvon locations.";
}

export function swanHillNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "vic" && args.citySlug === "swan-hill");
}

export function swanHillNextLinks() {
  return [
    { href: "/locations/vic/benalla", label: "Open Benalla locations" },
    { href: "/locations/wa/carnarvon", label: "Open Carnarvon locations" },
  ];
}
