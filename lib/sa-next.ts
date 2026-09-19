export function saNextNotice() {
  return "South Australia has its own city hubs. Open Adelaide’s suburb list, or browse respite carers in South Australia.";
}

export function saNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "sa");
}

export function saNextLinks() {
  return [
    { href: "/locations/sa/adelaide", label: "Open Adelaide suburbs" },
    { href: "/caregivers/respite/sa", label: "Browse respite in South Australia" },
  ];
}
