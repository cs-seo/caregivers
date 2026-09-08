export function actNextNotice() {
  return "The Australian Capital Territory has its own city hubs. Open Canberra’s suburb list, or browse babysitters in the ACT.";
}

export function actNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "act");
}

export function actNextLinks() {
  return [
    { href: "/locations/act/canberra", label: "Open Canberra suburbs" },
    { href: "/caregivers/babysitters/act", label: "Browse babysitters in the ACT" },
  ];
}
