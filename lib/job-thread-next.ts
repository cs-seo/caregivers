export function jobThreadNextNotice() {
  return "A thread stays on this request until you hire. Open messages with a carer already involved, or compare someone already on your shortlist.";
}

export function jobThreadShowsNext(args: {
  isOwner: boolean;
  accepting: boolean;
  involved: number;
  waitingCounter?: boolean;
}) {
  return Boolean(args.isOwner && args.accepting && args.involved > 0 && !args.waitingCounter);
}

export function jobThreadNextLinks() {
  return [
    { href: "#messages", label: "Open messages on this request" },
    { href: "/dashboard/shortlist", label: "Open your shortlist" },
  ];
}
