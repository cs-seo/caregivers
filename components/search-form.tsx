import { getSpecialties, getStates } from "@/lib/queries";

export async function SearchForm({
  specialty,
  state,
  city,
  q,
  availableOn,
  availableAt,
  job,
}: {
  specialty?: string;
  state?: string;
  city?: string;
  q?: string;
  availableOn?: string;
  availableAt?: string;
  job?: string;
}) {
  const [specialties, states] = await Promise.all([getSpecialties(), getStates()]);
  const selectedState = states.find((item) => item.slug === state);
  const cities = selectedState?.cities ?? states.flatMap((item) => item.cities).slice(0, 20);

  return (
    <form action="/caregivers" method="get" className="grid gap-3 rounded-2xl bg-card p-4 shadow-sm md:grid-cols-12">
      {job ? <input type="hidden" name="job" value={job} /> : null}
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-stone-500">Keywords</span>
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Name or suburb"
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-stone-500">Specialty</span>
        <select
          name="specialty"
          defaultValue={specialty ?? ""}
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
        >
          <option value="">All care types</option>
          {specialties.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.pluralName}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-stone-500">State</span>
        <select name="state" defaultValue={state ?? ""} className="w-full rounded-xl border border-line bg-white px-3 py-2.5">
          <option value="">All Australia</option>
          {states.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.abbrev} — {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-stone-500">Needed on</span>
        <input
          type="date"
          name="availableOn"
          defaultValue={availableOn ?? ""}
          className="w-full rounded-xl border border-line bg-white px-3 py-2.5"
        />
        <input
          type="time"
          name="availableAt"
          defaultValue={availableAt ?? ""}
          className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5"
          aria-label="Needed at"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-stone-500">City</span>
        <select name="city" defaultValue={city ?? ""} className="w-full rounded-xl border border-line bg-white px-3 py-2.5">
          <option value="">Any city</option>
          {cities.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end md:col-span-2">
        <button
          type="submit"
          className="w-full rounded-xl bg-teal px-4 py-2.5 font-medium text-white hover:bg-teal-deep"
        >
          Search
        </button>
      </div>
    </form>
  );
}
