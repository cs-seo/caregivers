export function bookingSubmitNotice(args: { instantBook: boolean }) {
  if (args.instantBook) {
    return "Instant Book confirms this sit now. You pay into escrow on the next screen, then add handover.";
  }
  return "This is a request. The carer accepts before you pay into escrow. You can add handover after you send it.";
}

export function bookingSubmitLinks(args: { caregiverSlug: string }) {
  return [
    { href: `/caregiver/${args.caregiverSlug}`, label: "Back to their profile" },
    { href: "/how-it-works", label: "How booking and escrow work" },
    { href: "/trust-and-safety", label: "Trust and payments" },
  ];
}
