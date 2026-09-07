import Link from "next/link";
import { redirect } from "next/navigation";
import { updateFamilyProfileAction } from "@/lib/actions";
import { getStates } from "@/lib/queries";
import { requireRole } from "@/lib/session";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Household details",
  description: "Update the suburb and notes families share with carers.",
  path: "/dashboard/household",
  noIndex: true,
});

export default async function HouseholdPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await requireRole("FAMILY");
  if (!user) redirect("/login?callbackUrl=/dashboard/household");
  const query = await searchParams;
  const states = await getStates();

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm">
        <Link href="/dashboard" className="text-teal">
          Back to dashboard
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-ink">Household details</h1>
      <p className="mt-2 text-stone-600">
        Carers see the suburb on care requests. NDIS and My Aged Care numbers print on tax invoices and the
        financial-year statement for coordinators and plan managers.
      </p>
      {query.saved ? <p className="mt-4 rounded-xl bg-sage p-3 text-sm">Household saved.</p> : null}
      <form action={updateFamilyProfileAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        <label className="block text-sm">
          Phone
          <input
            name="phone"
            defaultValue={user.phone ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Suburb
          <input
            name="suburb"
            defaultValue={user.familyProfile?.suburb ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          City
          <select
            name="cityId"
            defaultValue={user.familyProfile?.cityId ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          >
            <option value="">Select a city</option>
            {states.flatMap((state) =>
              state.cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {state.abbrev}
                </option>
              )),
            )}
          </select>
        </label>
        <label className="block text-sm">
          NDIS number (optional)
          <input
            name="ndisNumber"
            defaultValue={user.familyProfile?.ndisNumber ?? ""}
            placeholder="430 112 223"
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          My Aged Care / HCP reference (optional)
          <input
            name="agedCareRef"
            defaultValue={user.familyProfile?.agedCareRef ?? ""}
            placeholder="HCP-NSW-88421"
            maxLength={40}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Notes for carers
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.familyProfile?.bio ?? ""}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
          />
        </label>
        <button className="rounded-xl bg-teal px-5 py-2.5 font-medium text-white" type="submit">
          Save household
        </button>
      </form>
    </div>
  );
}
