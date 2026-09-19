export function gunnedahNextNotice() {
  return "Gunnedah has suburb pages under New South Wales. Open Yeppoon locations, or open Kingaroy locations.";
}

export function gunnedahNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "gunnedah");
}

export function gunnedahNextLinks() {
  return [
    { href: "/locations/qld/yeppoon", label: "Open Yeppoon locations" },
    { href: "/locations/qld/kingaroy", label: "Open Kingaroy locations" },
  ];
}
