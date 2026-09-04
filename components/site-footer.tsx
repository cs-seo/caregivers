import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { getSpecialties, getStates } from "@/lib/queries";

export async function SiteFooter() {
  const [specialties, states] = await Promise.all([getSpecialties(), getStates()]);

  return (
    <footer className="mt-16 border-t border-line bg-teal-deep text-sage">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-white">{SITE_NAME}</p>
          <p className="mt-2 text-sm text-sage/80">
            Verified carers across Australia. Funds stay in escrow until the booking is complete.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Specialties</p>
          <ul className="mt-3 space-y-1 text-sm">
            {specialties.slice(0, 8).map((specialty) => (
              <li key={specialty.id}>
                <Link className="hover:text-white" href={`/caregivers/${specialty.slug}`}>
                  {specialty.pluralName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">States</p>
          <ul className="mt-3 space-y-1 text-sm">
            {states.map((state) => (
              <li key={state.id}>
                <Link className="hover:text-white" href={`/caregivers/aged-care/${state.slug}`}>
                  {state.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <Link className="hover:text-white" href="/how-it-works">
                How it works
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/for-carers">
                For carers
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/trust-and-safety">
                Trust and safety
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/locations">
                Cities and suburbs
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/guides">
                Hiring guides
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/post-a-job">
                Post a care request
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sage/70">
        © {new Date().getFullYear()} {SITE_NAME}. Escrow protects families and carers. Prices in AUD.
      </div>
    </footer>
  );
}
