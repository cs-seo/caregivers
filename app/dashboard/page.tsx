import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/badges";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { formatAud } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Dashboard",
  description: "Manage CareProof bookings and escrow.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  const isFamily = user.role === "FAMILY";
  const bookings = await prisma.booking.findMany({
    where: isFamily ? { familyId: user.id } : { caregiver: { userId: user.id } },
    include: {
      caregiver: { include: { user: true } },
      family: { select: { name: true } },
      specialty: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const familyJobs = isFamily
    ? await prisma.careRequest.findMany({
        where: { familyId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const carerProposals = !isFamily
    ? await prisma.proposal.findMany({
        where: { caregiverId: user.caregiverProfile?.id ?? "__none__" },
        include: { careRequest: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-3xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-2 text-stone-600">
        Signed in as {user.name} ({isFamily ? "family" : "carer"}).
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Bookings and escrow</h2>
        <ul className="mt-4 space-y-3">
          {bookings.length === 0 ? (
            <li className="text-sm text-stone-500">No bookings yet.</li>
          ) : (
            bookings.map((booking) => (
              <li key={booking.id} className="rounded-2xl border border-line bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={`/dashboard/bookings/${booking.id}`} className="font-semibold hover:text-teal">
                      {booking.specialty.name} with {isFamily ? booking.caregiver.user.name : booking.family.name}
                    </Link>
                    <p className="text-sm text-stone-500">{formatDateTime(booking.startAt)}</p>
                  </div>
                  <Badge>{BOOKING_STATUS_LABELS[booking.status] ?? booking.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {formatAud(booking.totalCents)} held for the family · carer payout {formatAud(booking.subtotalCents)}
                  {booking.payment ? ` · payment ${booking.payment.status}` : ""}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">{isFamily ? "Your care requests" : "Your proposals"}</h2>
        <ul className="mt-4 space-y-3">
          {isFamily
            ? familyJobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/care-requests/${job.slug}`} className="text-teal hover:underline">
                    {job.title}
                  </Link>
                  <span className="ml-2 text-sm text-stone-500">{job.status}</span>
                </li>
              ))
            : carerProposals.map((proposal) => (
                <li key={proposal.id}>
                  <Link href={`/care-requests/${proposal.careRequest.slug}`} className="text-teal hover:underline">
                    {proposal.careRequest.title}
                  </Link>
                  <span className="ml-2 text-sm text-stone-500">{proposal.status}</span>
                </li>
              ))}
        </ul>
      </section>
    </div>
  );
}
