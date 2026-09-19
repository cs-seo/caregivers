export function howItWorksNextNotice() {
  return "This page is for families comparing escrow. Open Alice Springs locations, or open Broome locations.";
}

export function howItWorksNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function howItWorksNextLinks() {
  return [
    { href: "/locations/nt/alice-springs", label: "Open Alice Springs locations" },
    { href: "/locations/wa/broome", label: "Open Broome locations" },
  ];
}
