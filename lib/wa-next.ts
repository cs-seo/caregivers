export function waNextNotice() {
  return "Western Australia has its own city hubs. Open Mandurah’s suburb list, or browse nannies in Western Australia.";
}

export function waNextShows(args: { isFamily: boolean; stateSlug: string }) {
  return Boolean(args.isFamily && args.stateSlug === "wa");
}

export function waNextLinks() {
  return [
    { href: "/locations/wa/mandurah", label: "Open Mandurah suburbs" },
    { href: "/caregivers/nannies/wa", label: "Browse nannies in Western Australia" },
  ];
}
