export const FOR_CARERS_INTRO =
  "Set your rate, show verified experience, and get paid through escrow — not handshake transfers.";

export const FOR_CARERS_KEEP_RATE =
  "Keep 100% of your advertised rate. Families pay a 10% platform fee on top.";

export const FOR_CARERS_STEPS = [
  {
    title: "Set your rate, hours and checks",
    body: "List specialties, a city, usual weekly hours and screening such as WWCC, NDIS Worker Screening or AHPRA. Families compare those facts and Instant Book — not a bio alone.",
  },
  {
    title: "Get booked two ways",
    body: "Turn on Instant Book for sits outside your notice window. Turn it off to accept requests first. Days you mark away pause Instant Book. Or browse the open job board and apply to family posts.",
  },
  {
    title: "Propose, or answer an invite",
    body: "Send a proposal with your rate, the same way freelancers apply on Upwork. Families can invite you with a note. Message on the request before anyone is hired. Update or withdraw a pending proposal, or decline an invite.",
  },
  {
    title: "Accept the sit — families pay into escrow",
    body: "Request-to-book sits wait for you to accept; the family pays after. Instant Book collects on the book page. CareProof holds the funds in escrow and releases them when the family confirms, or automatically 72 hours after the sit if there is no dispute.",
  },
  {
    title: "Released bookings become verified work history",
    body: "Completed, released sits show on your public profile. Families can leave a review only after release. You can publish one public reply.",
  },
] as const;

export const FOR_CARERS_FAQS = [
  {
    q: "How do I find jobs that fit me?",
    a: "Open the care-request board. After you sign in, CareProof marks jobs that match your city, specialties and usual weekly hours, including the start clock time. The dashboard lists those matches and any invites. You can still propose on a mismatch if the family is flexible.",
  },
  {
    q: "Do I keep my advertised rate?",
    a: "Yes. You keep 100% of the advertised hourly rate. Families pay a 10% CareProof fee on top. Your remittance shows the amount held or paid to you.",
  },
  {
    q: "What is Instant Book?",
    a: "Instant Book confirms immediately when the start is outside your notice window — often 2 hours for babysitters and 12 hours for aged care. A sit that starts too soon becomes a request to book. Mark today as a day off and Instant Book pauses until tomorrow.",
  },
  {
    q: "When am I paid?",
    a: "Never up front. After you accept a request-to-book sit, the family pays into escrow. Instant Book collects when they book. Funds release when the family confirms, or automatically 72 hours after the sit if there is no dispute.",
  },
  {
    q: "Can a family invite me without booking?",
    a: "Yes. An invite asks you to send a proposal. It does not book you. You can decline with an optional reason, or propose and message on the request first.",
  },
] as const;

export function forCarersHomeHref() {
  return "/for-carers";
}

export function forCarersHomeHeading() {
  return "For carers";
}

export function forCarersHomeNotice() {
  return "Keep 100% of your advertised rate. Families pay a 10% fee on top. Instant Book, proposals on open requests, and escrow payout.";
}

export function forCarersHomeCta() {
  return "See how you get booked";
}

export function forCarersRegisterHref() {
  return "/register?role=carer";
}

export function forCarersBoardHref() {
  return "/care-requests";
}

export function parseRegisterRole(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "carer" || raw === "CAREGIVER") return "CAREGIVER";
  return "FAMILY";
}

export function forCarersFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FOR_CARERS_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}
