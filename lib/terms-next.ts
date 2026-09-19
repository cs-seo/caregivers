export function termsNextNotice() {
  return "These terms cover escrow and reviews. Open Bairnsdale locations, or open Castlemaine locations.";
}

export function termsNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function termsNextLinks() {
  return [
    { href: "/locations/vic/bairnsdale", label: "Open Bairnsdale locations" },
    { href: "/locations/vic/castlemaine", label: "Open Castlemaine locations" },
  ];
}
