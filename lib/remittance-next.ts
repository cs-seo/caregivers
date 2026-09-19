export function remittanceNextNotice() {
  return "This remittance uses the same number as the family tax invoice. Open that invoice, or the financial-year statement.";
}

export function remittanceNextLinks(args: { bookingId: string }) {
  return [
    { href: `/dashboard/bookings/${args.bookingId}/invoice`, label: "Open the family tax invoice" },
    { href: "/dashboard/statement", label: "Open the financial-year statement" },
  ];
}
