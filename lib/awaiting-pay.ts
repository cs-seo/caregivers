export function awaitingPayNextNotice() {
  return "They accepted. Review their profile and checks before you pay into escrow, or add this sit to your calendar.";
}

export function awaitingPayNextLinks(args: { caregiverSlug: string; bookingId: string }) {
  return [
    { href: `/caregiver/${args.caregiverSlug}`, label: "View their profile" },
    { href: `/dashboard/bookings/${args.bookingId}/ics`, label: "Add this sit to your calendar" },
  ];
}
