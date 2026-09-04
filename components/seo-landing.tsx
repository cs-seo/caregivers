import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { relatedSpecialtySlugs, type SeoPlace } from "@/lib/seo-content";

export function FaqBlock({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  return (
    <section className="mt-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />
      <h2 className="text-xl font-semibold text-ink">Common questions</h2>
      <dl className="mt-4 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.q} className="rounded-2xl border border-line bg-card p-4">
            <dt className="font-medium text-ink">{faq.q}</dt>
            <dd className="mt-2 text-sm text-stone-600">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function RelatedSpecialties({
  place,
  specialties,
}: {
  place: SeoPlace;
  specialties: { slug: string; pluralName: string }[];
}) {
  const slugs = relatedSpecialtySlugs(place.specialty.slug);
  const items = specialties.filter((item) => slugs.includes(item.slug));
  if (items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-ink">Related care in {place.city?.name ?? place.state?.name ?? "Australia"}</h2>
      <ul className="mt-3 flex flex-wrap gap-3 text-sm">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              className="text-teal hover:underline"
              href={
                place.state
                  ? `/caregivers/${item.slug}/${place.state.slug}${place.city ? `/${place.city.slug}` : ""}${place.suburb ? `/${place.suburb.slug}` : ""}`
                  : `/caregivers/${item.slug}`
              }
            >
              {item.pluralName}
              {place.suburb ? ` in ${place.suburb.name}` : place.city ? ` in ${place.city.name}` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LinkGrid({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link className="text-teal hover:underline" href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
