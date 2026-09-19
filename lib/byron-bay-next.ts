export function byronBayNextNotice() {
  return "Byron Bay has suburb pages under New South Wales. Open Margaret River locations, or open Mornington Peninsula locations.";
}

export function byronBayNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "byron-bay");
}

export function byronBayNextLinks() {
  return [
    { href: "/locations/wa/margaret-river", label: "Open Margaret River locations" },
    { href: "/locations/vic/mornington-peninsula", label: "Open Mornington Peninsula locations" },
  ];
}
