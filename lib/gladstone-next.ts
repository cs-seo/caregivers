export function gladstoneNextNotice() {
  return "Gladstone has suburb pages under Queensland. Open Traralgon locations, or open Horsham locations.";
}

export function gladstoneNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "gladstone");
}

export function gladstoneNextLinks() {
  return [
    { href: "/locations/vic/traralgon", label: "Open Traralgon locations" },
    { href: "/locations/vic/horsham", label: "Open Horsham locations" },
  ];
}
