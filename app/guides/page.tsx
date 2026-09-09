import Link from "next/link";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FamilyStartPanel } from "@/components/family-start";
import { forCarersHomeCta, forCarersHomeHref, forCarersHomeNotice } from "@/lib/for-carers";
import { guidesIndexNextLinks, guidesIndexNextNotice, guidesIndexNextShows } from "@/lib/guides-index-next";
import { HIRE_GUIDES } from "@/lib/seo-content";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Guides to hiring carers in Australia",
  description:
    "Practical guides to hiring a nanny, babysitter, aged care worker or NDIS support worker in Australia, including WWCC and escrow.",
  path: "/guides",
});

export default async function GuidesIndexPage() {
  const session = await auth();
  const showGuidesIndexNext = guidesIndexNextShows({ isFamily: session?.user?.role === "FAMILY" });
  return (
    <div>
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Guides" }]} />
      <h1 className="text-3xl font-semibold text-ink">Guides to hiring carers in Australia</h1>
      <p className="mt-3 max-w-2xl text-stone-600">
        Short, practical pages for the searches families actually make — hire a nanny, find a babysitter, book in-home
        aged care, or hire an NDIS support worker.
      </p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {HIRE_GUIDES.map((guide) => (
          <li key={guide.slug} className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-lg font-semibold">
              <Link href={`/guides/${guide.slug}`} className="hover:text-teal">
                {guide.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-stone-600">{guide.description}</p>
          </li>
        ))}
      </ul>
      {showGuidesIndexNext ? (
        <div className="mt-8 rounded-xl bg-sage p-3 text-sm">
          <p>{guidesIndexNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {guidesIndexNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : (
        <FamilyStartPanel />
      )}
      <p className="mt-8 text-sm text-stone-600">
        Carers: {forCarersHomeNotice()}{" "}
        <Link href={forCarersHomeHref()} className="font-medium text-teal hover:underline">
          {forCarersHomeCta()}
        </Link>
        .
      </p>
    </div>
  );
}
