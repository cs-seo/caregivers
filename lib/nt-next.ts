export function ntNextNotice() {
  return "The Northern Territory has its own city hubs. Open Darwin’s suburb list, or browse aged care carers in the Northern Territory.";
}

export function ntNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "nt");
}

export function ntNextLinks() {
  return [
    { href: "/locations/nt/darwin", label: "Open Darwin suburbs" },
    { href: "/caregivers/aged-care/nt", label: "Browse aged care in the Northern Territory" },
  ];
}
