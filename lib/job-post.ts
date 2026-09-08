export function postedJobNotice() {
  return "Request posted. Book or invite a carer who is free at this start. Proposal alerts will show when someone replies.";
}

export function isPostedFlash(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1";
}

export function postedJobHref(slug: string) {
  return `/care-requests/${slug}?posted=1`;
}
