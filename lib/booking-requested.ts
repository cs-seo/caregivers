export function isRequestedFlash(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function requestedBookingNotice(args: { carerName: string; handoverComplete: boolean }) {
  if (args.handoverComplete) {
    return `Request sent. ${args.carerName} needs to accept before you pay into escrow. Handover is ready — message them while you wait.`;
  }
  return `Request sent. ${args.carerName} needs to accept before you pay into escrow. Add handover while you wait, or message them.`;
}

export function requestedBookingLinks(args: {
  caregiverSlug: string;
  handoverComplete: boolean;
  requestSlug?: string | null;
}) {
  const links: { href: string; label: string }[] = [
    {
      href: "#handover",
      label: args.handoverComplete ? "Review handover" : "Add handover",
    },
    { href: "#messages", label: "Message the carer" },
    { href: `/caregiver/${args.caregiverSlug}`, label: "View their profile" },
  ];
  if (args.requestSlug) {
    links.push({
      href: `/care-requests/${args.requestSlug}`,
      label: "Open the attached request",
    });
  }
  return links;
}
