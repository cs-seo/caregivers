export function guidesIndexNextNotice() {
  return "These pages sit next to live booking. Open the nanny guide, or open the personal care guide.";
}

export function guidesIndexNextShows(args: { isFamily: boolean }) {
  return Boolean(args.isFamily);
}

export function guidesIndexNextLinks() {
  return [
    { href: "/guides/hire-a-nanny-australia", label: "Open the nanny guide" },
    { href: "/guides/personal-care-assistant", label: "Open the personal care guide" },
  ];
}
