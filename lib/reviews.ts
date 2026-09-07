import { BOOKING_STATUS } from "./constants";

export const REVIEW_REPLY_LIMIT = 500;

export function sanitizeReviewReply(raw: string) {
  return raw.trim().slice(0, REVIEW_REPLY_LIMIT);
}

export function hasReviewReply(review?: { reply?: string | null } | null) {
  return Boolean(review?.reply?.trim());
}

export function canReplyToReview(
  review: { reply?: string | null; caregiverId: string } | null | undefined,
  caregiverId?: string | null,
) {
  return Boolean(caregiverId && review && review.caregiverId === caregiverId && !hasReviewReply(review));
}

export function isSafeReviewReturnPath(path: string) {
  if (!path.startsWith("/")) return false;
  if (path.includes("://") || path.includes("//") || path.includes("\\")) return false;
  if (path.length > 240) return false;
  return path.startsWith("/dashboard/bookings/") || path.startsWith("/caregiver/");
}

export function canWriteReview(
  booking:
    | {
        familyId: string;
        status: string;
        review?: { id?: string } | null;
      }
    | null
    | undefined,
  familyId?: string | null,
) {
  return Boolean(
    familyId &&
      booking &&
      booking.familyId === familyId &&
      booking.status === BOOKING_STATUS.RELEASED &&
      !booking.review,
  );
}

export function reviewsDueLabel(count: number) {
  if (count <= 0) return "No sits waiting for a review";
  return `${count} ${count === 1 ? "sit is" : "sits are"} ready for a review`;
}

export function composeReviewDueAlert(items: { title: string; href: string; when: string }[]) {
  const count = items.length;
  const subject =
    count === 0
      ? "CareProof: no sits waiting for a review"
      : count === 1
        ? "CareProof: 1 sit is ready for a review"
        : `CareProof: ${count} sits are ready for a review`;
  const listed = items.slice(0, 5);
  const lines =
    listed.length === 0
      ? ["Every released sit already has a review."]
      : listed.map((item) => `${item.title}\n${item.when}\nWrite a review ${item.href}`);
  const body = [
    count === 0
      ? "No released bookings are waiting for a review."
      : "Reviews are only accepted after funds are released. They show on the carer’s public profile.",
    "",
    ...lines,
    "",
    "Open the sit from your dashboard to publish a rating and comment.",
  ].join("\n");
  return { subject, body, hasDue: count > 0 };
}
