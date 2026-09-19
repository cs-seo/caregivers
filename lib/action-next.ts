export function actionNextNotice() {
  return "A sit still needs you. Open the first one, or print the financial-year statement.";
}

export function actionNextLinks(args: { sitHref?: string | null }) {
  const links = [];
  if (args.sitHref?.startsWith("/dashboard/bookings/")) {
    links.push({ href: args.sitHref, label: "Open a sit that needs you" });
  }
  links.push({ href: "/dashboard/statement", label: "Open the financial-year statement" });
  return links;
}
