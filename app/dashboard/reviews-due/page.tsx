import Link from "next/link";
import { redirect } from "next/navigation";
import { BOOKING_STATUS, ROLES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { composeReviewDueAlert, reviewsDueLabel } from "@/lib/reviews";
import { reviewsDueNextLinks, reviewsDueNextNotice } from "@/lib/reviews-due";
import { searchAlertMailto } from "@/lib/saved-search";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Reviews to write",
  description: "Preview the reminder CareProof would email when a released sit is still waiting for a review.",
  path: "/dashboard/reviews-due",
  noIndex: true,
});

export default async function ReviewsDuePage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/reviews-due");
  if (user.role !== ROLES.FAMILY) redirect("/dashboard");
  const due = await prisma.booking.findMany({
    where: { familyId: user.id, status: BOOKING_STATUS.RELEASED, review: null },
    include: {
      caregiver: { include: { user: { select: { name: true } } } },
      specialty: { select: { name: true, slug: true, pluralName: true } },
    },
    orderBy: { startAt: "desc" },
  });
  const digest = composeReviewDueAlert(
    due.map((booking) => ({
      title: `${booking.specialty.name} with ${booking.caregiver.user.name}`,
      href: `/dashboard/bookings/${booking.id}#review`,
      when: formatDateTime(booking.startAt),
    })),
  );
  const email = user.email ?? "family@careproof.com.au";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard" className="text-sm text-teal">
        Back to dashboard
      </Link>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Reviews to write</h1>
      <p className="mt-2 text-stone-600">
        This demo has no mail server. The reminder below is what CareProof would email when a released sit still needs a
        rating. Reviews only open after funds are released.
      </p>

      <article className="mt-6 rounded-2xl border border-line bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal">Email preview</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{digest.subject}</h2>
        <p className="mt-3 whitespace-pre-line text-sm text-stone-700">{digest.body}</p>
        <p className="mt-4">
          <a href={searchAlertMailto(email, digest)} className="text-sm font-medium text-teal hover:underline">
            Email this reminder to {email}
          </a>
        </p>
      </article>

      <section className="mt-6 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm text-stone-500">{reviewsDueLabel(due.length)}</p>
        {due.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {due.map((booking) => (
              <li key={booking.id}>
                <Link href={`/dashboard/bookings/${booking.id}#review`} className="font-medium text-teal hover:underline">
                  {booking.specialty.name} with {booking.caregiver.user.name}
                </Link>
                <span className="mt-0.5 block text-stone-500">{formatDateTime(booking.startAt)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      {due.length ? (
        <div className="mt-6 rounded-xl bg-sage p-3 text-sm">
          <p>{reviewsDueNextNotice()}</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {reviewsDueNextLinks({
              specialty: due[0].specialty.slug,
              specialtyPlural: due[0].specialty.pluralName,
            }).map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-medium text-teal hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
