import { auth } from "@/auth";
import { createCareRequestAction } from "@/lib/actions";
import { parsePostJobPrefill } from "@/lib/job-post";
import { getSpecialties, getStates } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Post a care request",
  description: "Tell verified Australian carers what you need. Compare proposals and hire into escrow.",
  path: "/post-a-job",
  noIndex: true,
});

export default async function PostJobPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; specialty?: string; city?: string }>;
}) {
  const [session, specialties, states, query] = await Promise.all([
    auth(),
    getSpecialties(),
    getStates(),
    searchParams,
  ]);
  const prefill = parsePostJobPrefill(query);
  const preferredSpecialtyId = specialties.find((item) => item.slug === prefill.specialty)?.id;
  const preferredCityId = states
    .flatMap((state) => state.cities)
    .find((city) => city.slug === prefill.city)?.id;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold text-ink">Post a care request</h1>
      <p className="mt-2 text-stone-600">
        Like posting a job on Upwork: describe the care, set a budget, and hire the best proposal into escrow.
      </p>
      {!session ? (
        <p className="mt-6 rounded-xl bg-sage p-4 text-sm">
          <Link href="/login?callbackUrl=/post-a-job" className="font-medium text-teal">
            Log in as a family
          </Link>{" "}
          to post.
        </p>
      ) : session.user.role !== "FAMILY" ? (
        <p className="mt-6 text-sm text-clay">Care requests are posted by family accounts.</p>
      ) : (
        <form action={createCareRequestAction} className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
          {query.error === "past" ? (
            <p className="text-sm text-clay">Pick a start time that has not already passed.</p>
          ) : query.error ? (
            <p className="text-sm text-clay">Please complete the required fields.</p>
          ) : null}
          <label className="block text-sm">
            Title
            <input name="title" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Specialty
            <select name="specialtyId" required defaultValue={preferredSpecialtyId} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            City
            <select name="cityId" required defaultValue={preferredCityId} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
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
            Start date
            <input name="startDate" type="date" required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Start time
            <input name="startAt" type="time" required defaultValue="08:00" className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
            <span className="mt-1 block text-xs text-stone-500">
              Carers see whether this clock time falls inside their usual weekly hours.
            </span>
          </label>
          <label className="block text-sm">
            Hourly budget (AUD)
            <input name="budget" type="number" min={25} step={1} required className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Estimated hours
            <input name="hoursEstimate" type="number" min={1} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <label className="block text-sm">
            Description
            <textarea name="description" required rows={6} className="mt-1 w-full rounded-lg border border-line px-3 py-2" />
          </label>
          <button className="w-full rounded-xl bg-teal py-3 font-semibold text-white" type="submit">
            Publish request
          </button>
        </form>
      )}
    </div>
  );
}
