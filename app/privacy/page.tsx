import Link from "next/link";
import { auth } from "@/auth";
import { LegalNextPanel } from "@/components/legal-next";
import { SITE_HOST } from "@/lib/constants";
import { leftoverFamily, SUPPORT_EMAIL } from "@/lib/demo-mode";
import { privacyNextLinks, privacyNextNotice, privacyNextShows } from "@/lib/privacy-next";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy",
  description: "How CareProof handles personal information for families and carers in Australia.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const session = await auth();
  const showPrivacyNext = privacyNextShows({ isFamily: leftoverFamily(session?.user?.role === "FAMILY") });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-semibold text-ink">Privacy</h1>
      <p className="text-stone-600">
        CareProof ({SITE_HOST}) is an Australian marketplace. We collect the account, booking and screening
        details needed to introduce families and carers, hold escrow, and show verified work history.
      </p>
      <section>
        <h2 className="text-xl font-semibold text-ink">What we store</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
          <li>Name, email, phone and suburb</li>
          <li>Carer bios, rates, specialties, credentials and work history</li>
          <li>Booking times, notes and payment status</li>
          <li>Messages sent on a booking thread or a care-request thread</li>
          <li>Reviews left after funds are released</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Who sees it</h2>
        <p className="mt-2 text-stone-700">
          Public directory pages show the carer profile a carer chose to publish. Booking and care-request messages stay
          between the family and that carer. We do not sell personal information.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Checks</h2>
        <p className="mt-2 text-stone-700">
          WWCC, NDIS, AHPRA and police-check numbers are shown only as the carer entered them, so families can verify
          the document. Do not upload another person’s check without their consent.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-ink">Contact</h2>
        <p className="mt-2 text-stone-700">
          Email {SUPPORT_EMAIL} to ask about an account, a booking, or a correction to personal information.
        </p>
      </section>
      {showPrivacyNext ? (
        <div className="mt-8 rounded-xl bg-sage p-3 text-sm">
          <p>{privacyNextNotice()}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {privacyNextLinks().map((link) => (
              <Link key={link.href} href={link.href} className="font-medium text-teal hover:underline">
                {link.label}
              </Link>
            ))}
          </p>
        </div>
      ) : (
        <LegalNextPanel />
      )}
    </div>
  );
}
