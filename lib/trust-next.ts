export function trustNextNotice() {
  return "Checks and escrow sit on this page. Open the overnight respite guide, or open the in-home nurse guide.";
}

export function trustNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function trustNextLinks() {
  return [
    { href: "/guides/overnight-respite-care", label: "Open the overnight respite guide" },
    { href: "/guides/hire-an-in-home-nurse", label: "Open the in-home nurse guide" },
  ];
}
