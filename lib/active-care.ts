export function activeCareNextNotice() {
  return "Care is booked into escrow. Open a live sit, or compare someone already on your shortlist.";
}

export function activeCareNextLinks(args: { sitHref?: string | null }) {
  const links = [];
  if (args.sitHref) {
    links.push({ href: args.sitHref, label: "Open a live sit" });
  }
  links.push({ href: "/dashboard/shortlist", label: "Open your shortlist" });
  return links;
}
