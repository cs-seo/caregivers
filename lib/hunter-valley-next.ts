export function hunterValleyNextNotice() {
  return "Hunter Valley has suburb pages under New South Wales. Open Yarra Valley locations, or open Adelaide Hills locations.";
}

export function hunterValleyNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "hunter-valley");
}

export function hunterValleyNextLinks() {
  return [
    { href: "/locations/vic/yarra-valley", label: "Open Yarra Valley locations" },
    { href: "/locations/sa/adelaide-hills", label: "Open Adelaide Hills locations" },
  ];
}
