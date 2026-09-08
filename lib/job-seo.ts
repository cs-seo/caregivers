import { SITE_NAME, siteUrl } from "./constants";

export type JobPostingSource = {
  slug: string;
  title: string;
  description: string;
  createdAt: Date;
  startDate: Date;
  budgetCents: number;
  specialty: { name: string };
  city: { name: string; state: { abbrev: string } };
};

export function jobPostingJsonLd(job: JobPostingSource, accepting: boolean, origin = siteUrl()) {
  if (!accepting) return null;
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.startDate.toISOString(),
    employmentType: "CONTRACTOR",
    industry: job.specialty.name,
    url: `${origin}/care-requests/${job.slug}`,
    identifier: {
      "@type": "PropertyValue",
      name: SITE_NAME,
      value: job.slug,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: origin,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city.name,
        addressRegion: job.city.state.abbrev,
        addressCountry: "AU",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "AUD",
      value: {
        "@type": "QuantitativeValue",
        value: job.budgetCents / 100,
        unitText: "HOUR",
      },
    },
  };
}
