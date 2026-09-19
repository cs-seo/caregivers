export function armidaleNextNotice() {
  return "Armidale has suburb pages under New South Wales. Open Mildura locations, or open Warrnambool locations.";
}

export function armidaleNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nsw" && args.citySlug === "armidale");
}

export function armidaleNextLinks() {
  return [
    { href: "/locations/vic/mildura", label: "Open Mildura locations" },
    { href: "/locations/vic/warrnambool", label: "Open Warrnambool locations" },
  ];
}
