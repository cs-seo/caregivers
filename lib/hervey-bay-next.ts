export function herveyBayNextNotice() {
  return "Hervey Bay has suburb pages under Queensland. Open Bunbury locations, or open Ulverstone locations.";
}

export function herveyBayNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "hervey-bay");
}

export function herveyBayNextLinks() {
  return [
    { href: "/locations/wa/bunbury", label: "Open Bunbury locations" },
    { href: "/locations/tas/ulverstone", label: "Open Ulverstone locations" },
  ];
}
