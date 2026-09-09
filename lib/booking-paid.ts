export function isPaidFlash(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function paidBookingNotice(args: { carerName: string; handoverComplete: boolean }) {
  if (args.handoverComplete) {
    return `Payment collected and held in escrow. ${args.carerName} is booked. Handover is ready — add the sit to your calendar or message them.`;
  }
  return `Payment collected and held in escrow. ${args.carerName} is booked. Add handover before they travel, then calendar and messages.`;
}

export function paidBookingLinks(args: {
  bookingId: string;
  handoverComplete: boolean;
  isSeries?: boolean;
  requestSlug?: string | null;
}) {
  const links: { href: string; label: string }[] = [
    {
      href: "#handover",
      label: args.handoverComplete ? "Review handover" : "Add handover",
    },
    {
      href: args.isSeries ? `/dashboard/bookings/${args.bookingId}/ics?series=1` : `/dashboard/bookings/${args.bookingId}/ics`,
      label: args.isSeries ? "Add the series to your calendar" : "Add this sit to your calendar",
    },
    { href: "#messages", label: "Message the carer" },
  ];
  if (args.requestSlug) {
    links.push({
      href: `/care-requests/${args.requestSlug}`,
      label: "Open the attached request",
    });
  }
  return links;
}
