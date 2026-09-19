import Link from "next/link";
import { formatDate } from "@/lib/format";
import { hasReviewReply } from "@/lib/reviews";
import { replyToReviewAction } from "@/lib/actions";

export function ReviewCard({
  authorName,
  rating,
  body,
  createdAt,
  caregiverName,
  caregiverHref,
  location,
  reply,
  repliedAt,
}: {
  authorName: string;
  rating: number;
  body: string;
  createdAt: Date;
  caregiverName?: string;
  caregiverHref?: string;
  location?: string;
  reply?: string | null;
  repliedAt?: Date | null;
}) {
  const stars = "★".repeat(Math.min(5, Math.max(1, rating)));
  return (
    <article>
      <p className="text-sm font-medium text-ink">
        {authorName} · {stars}
      </p>
      <p className="mt-1 text-sm text-stone-700">{body}</p>
      {caregiverHref && caregiverName ? (
        <p className="mt-3 text-xs text-stone-500">
          <Link href={caregiverHref} className="text-teal">
            {caregiverName}
          </Link>
          {location ? ` · ${location}` : ""}
          {" · "}
          {formatDate(createdAt)}
        </p>
      ) : (
        <p className="mt-2 text-xs text-stone-500">{formatDate(createdAt)}</p>
      )}
      {hasReviewReply({ reply }) ? (
        <div className="mt-3 rounded-xl bg-sage p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-deep">
            Reply from {caregiverName ?? "the carer"}
          </p>
          <p className="mt-1 text-sm text-stone-700">{reply}</p>
          {repliedAt ? <p className="mt-1 text-xs text-stone-500">{formatDate(repliedAt)}</p> : null}
        </div>
      ) : null}
    </article>
  );
}

export function ReviewReplyForm({
  reviewId,
  next,
  error,
}: {
  reviewId: string;
  next: string;
  error?: boolean;
}) {
  return (
    <form action={replyToReviewAction} className="mt-3 space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      <input type="hidden" name="next" value={next} />
      {error ? <p className="text-sm text-clay">Add a short public reply.</p> : null}
      <label className="block text-sm text-stone-600">
        Public reply
        <textarea
          name="reply"
          required
          rows={3}
          maxLength={500}
          placeholder="Thank the family. This stays on your public profile."
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <button className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white" type="submit">
        Publish reply
      </button>
    </form>
  );
}
