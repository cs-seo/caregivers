export function lismoreNextNotice() {
  return "Lismore has suburb pages under New South Wales. Open Bathurst locations, or open Dubbo locations.";
}

export function lismoreNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "lismore");
}

export function lismoreNextLinks() {
  return [
    { href: "/locations/nsw/bathurst", label: "Open Bathurst locations" },
    { href: "/locations/nsw/dubbo", label: "Open Dubbo locations" },
  ];
}
