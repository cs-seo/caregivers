export function invoiceNextNotice() {
  return "Use this invoice for HCP or NDIS reconciliation. The financial-year statement totals every funded sit.";
}

export function invoiceNextLinks(isFamily: boolean) {
  const links = [{ href: "/dashboard/statement", label: "Open the financial-year statement" }];
  if (isFamily) {
    links.push({ href: "/dashboard/household", label: "Check NDIS and My Aged Care refs" });
  }
  return links;
}
