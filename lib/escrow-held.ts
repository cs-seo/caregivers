export function escrowHeldNextNotice() {
  return "Funds stay in escrow until the sit is complete. Open the tax invoice, or add this sit to your calendar.";
}

export function escrowHeldNextLinks(args: { bookingId: string; isSeries?: boolean }) {
  return [
    { href: `/dashboard/bookings/${args.bookingId}/invoice`, label: "Open the tax invoice" },
    {
      href: args.isSeries
        ? `/dashboard/bookings/${args.bookingId}/ics?series=1`
        : `/dashboard/bookings/${args.bookingId}/ics`,
      label: args.isSeries ? "Add the series to your calendar" : "Add this sit to your calendar",
    },
  ];
}
