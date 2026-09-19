export function disputeNextNotice(isFamily = true) {
  return isFamily
    ? "Funds stay held while this sit is in dispute. Open the tax invoice for a plan manager, or read how escrow works."
    : "Funds stay held while this sit is in dispute. Open the remittance, or read how escrow works.";
}

export function disputeNextLinks(args: { isFamily: boolean; bookingId: string }) {
  return [
    {
      href: args.isFamily
        ? `/dashboard/bookings/${args.bookingId}/invoice`
        : `/dashboard/bookings/${args.bookingId}/remittance`,
      label: args.isFamily ? "Open the tax invoice" : "Open the remittance",
    },
    { href: "/trust-and-safety", label: "How escrow and disputes work" },
  ];
}
