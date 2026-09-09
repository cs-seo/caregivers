export function invoiceGuideNotice() {
  return "Plan managers file GST invoices after escrow. Open the financial-year statement, or a tax invoice already on file.";
}

export function invoiceGuideLinks(args: { bookingId?: string | null }) {
  const links = [{ href: "/dashboard/statement", label: "Open the financial-year statement" }];
  if (args.bookingId) {
    links.push({
      href: `/dashboard/bookings/${args.bookingId}/invoice`,
      label: "Open a tax invoice",
    });
  }
  return links;
}
