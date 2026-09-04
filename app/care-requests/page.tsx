import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { formatAud } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Open care requests",
  description:
    "Browse open care requests from Australian families. Carers send proposals; families hire into escrow.",
  path: "/care-requests",
});

export default async function CareRequestsPage() {
  const requests = await prisma.careRequest.findMany({
    where: { status: "open" },
    include: {
      specialty: true,
      city: { include: { state: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Care requests" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Open care requests</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Families post what they need. Carers send a proposal. Hiring funds escrow the same way a profile booking does.
          </p>
        </div>
        <Link href="/post-a-job" className="rounded-full bg-teal px-4 py-2 text-sm font-medium text-white no-underline">
          Post a request
        </Link>
      </div>
      <ul className="mt-8 space-y-4">
        {requests.map((job) => (
          <li key={job.id} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-lg font-semibold">
              <Link href={`/care-requests/${job.slug}`} className="hover:text-teal">
                {job.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              {job.specialty.name} · {job.city.name}, {job.city.state.abbrev} · from {formatDate(job.startDate)}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-stone-700">{job.description}</p>
            <p className="mt-3 text-sm text-stone-500">
              Budget {formatAud(job.budgetCents)}/hr · {job._count.proposals} proposals
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
