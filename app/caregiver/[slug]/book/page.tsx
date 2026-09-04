import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { auth } from "@/auth";
import { getCaregiverBySlug } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const carer = await getCaregiverBySlug(slug);
  if (!carer) return {};
  return pageMeta({
    title: `Book ${carer.user.name}`,
    description: `Book ${carer.user.name} in ${carer.city.name}. Payment is collected by CareProof and released after the booking.`,
    path: `/caregiver/${carer.slug}/book`,
    noIndex: true,
  });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, auth()]);
  const carer = await getCaregiverBySlug(slug);
  if (!carer) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: carer.user.name, href: `/caregiver/${carer.slug}` },
          { name: "Book" },
        ]}
      />
      <h1 className="text-3xl font-semibold text-ink">Book {carer.user.name}</h1>
      <p className="mt-2 text-stone-600">
        Three fields, then escrow. {carer.instantBook ? "Instant Book confirms immediately." : "The carer will accept before you pay."}
      </p>
      {query.error ? (
        <p className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-clay">Please check the date, hours and care type.</p>
      ) : null}
      {!session?.user ? (
        <p className="mt-4 rounded-xl bg-sage p-3 text-sm">
          Families sign in to book.{" "}
          <Link href={`/login?callbackUrl=/caregiver/${carer.slug}/book`} className="font-medium text-teal">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/register" className="font-medium text-teal">
            create an account
          </Link>
          .
        </p>
      ) : session.user.role !== "FAMILY" ? (
        <p className="mt-4 text-sm text-clay">Switch to a family account to book carers.</p>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <BookingForm
            slug={carer.slug}
            hourlyRateCents={carer.hourlyRateCents}
            instantBook={carer.instantBook}
            specialties={carer.specialties.map((s) => ({ id: s.specialty.id, name: s.specialty.name }))}
          />
        </div>
      )}
    </div>
  );
}
