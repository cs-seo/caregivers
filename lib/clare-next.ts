export function clareNextNotice() {
  return "Clare has suburb pages under South Australia. Open Huonville locations, or open Tennant Creek locations.";
}

export function clareNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "sa" && args.citySlug === "clare");
}

export function clareNextLinks() {
  return [
    { href: "/locations/tas/huonville", label: "Open Huonville locations" },
    { href: "/locations/nt/tennant-creek", label: "Open Tennant Creek locations" },
  ];
}
