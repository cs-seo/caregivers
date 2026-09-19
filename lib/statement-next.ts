export function statementNextNotice(isFamily = true) {
  return isFamily
    ? "Plan managers file this with HCP or NDIS. Download the CSV, or open a sit invoice."
    : "Keep a copy of this remittance summary. Download the CSV, or open a sit remittance.";
}

export function statementNextLinks(args: { isFamily: boolean; bookingId?: string | null }) {
  const links = [{ href: "/dashboard/statement/csv", label: "Download the CSV" }];
  if (args.bookingId) {
    links.push({
      href: args.isFamily
        ? `/dashboard/bookings/${args.bookingId}/invoice`
        : `/dashboard/bookings/${args.bookingId}/remittance`,
      label: args.isFamily ? "Open a tax invoice" : "Open a remittance",
    });
  }
  return links;
}
