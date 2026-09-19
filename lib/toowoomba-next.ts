export function toowoombaNextNotice() {
  return "Toowoomba has suburb pages under Queensland. Open Mackay locations, or open Rockhampton locations.";
}

export function toowoombaNextShows(args: { isFamily: boolean; stateSlug: string; citySlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "qld" && args.citySlug === "toowoomba");
}

export function toowoombaNextLinks() {
  return [
    { href: "/locations/qld/mackay", label: "Open Mackay locations" },
    { href: "/locations/qld/rockhampton", label: "Open Rockhampton locations" },
  ];
}
