export function pendingAcceptanceNextNotice() {
  return "They still need to accept before you pay. Open the attached request, or compare someone already on your shortlist.";
}

export function pendingAcceptanceNextLinks(args: { requestSlug?: string | null }) {
  const links = [];
  if (args.requestSlug) {
    links.push({
      href: `/care-requests/${args.requestSlug}`,
      label: "Open the attached request",
    });
  }
  links.push({ href: "/dashboard/shortlist", label: "Open your shortlist" });
  return links;
}
