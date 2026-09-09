export function jobFillHeading() {
  return "How this request gets filled";
}

export function jobFillNotice() {
  return "Book, invite, or hire a proposal. Booking a matching carer closes this request and attaches the sit. An invite asks for a written proposal first.";
}

export const JOB_FILL_STEPS = [
  {
    title: "Book someone who is free",
    body: "Book from the match list, a profile or your shortlist. That closes this request and attaches the sit — same as Instant Book from a matching profile.",
  },
  {
    title: "Invite a carer to propose",
    body: "An invite does not book them. Add a note so they know why you asked. Edit or withdraw it while it is pending.",
  },
  {
    title: "Hire a written proposal",
    body: "Compare their rate to your budget, pass on a miss, or hire into escrow with an optional welcome note. Other pending proposals and leftover invites then close.",
  },
] as const;
