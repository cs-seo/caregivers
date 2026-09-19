export function inProgressNextNotice() {
  return "Care is underway. Message the carer if something changes, or keep the tax invoice for this sit.";
}

export function inProgressNextLinks(args: { bookingId: string }) {
  return [
    { href: "#messages", label: "Message the carer" },
    { href: `/dashboard/bookings/${args.bookingId}/invoice`, label: "Open the tax invoice" },
  ];
}
