export function DirectoryFilters({
  action,
  current,
}: {
  action: string;
  current: Record<string, string | undefined>;
}) {
  return (
    <form action={action} method="get" className="space-y-4 rounded-2xl border border-line bg-card p-4">
      <p className="text-sm font-semibold text-ink">Filter carers</p>
      {current.specialty ? <input type="hidden" name="specialty" value={current.specialty} /> : null}
      {current.state ? <input type="hidden" name="state" value={current.state} /> : null}
      {current.city ? <input type="hidden" name="city" value={current.city} /> : null}
      <label className="block text-sm">
        <span className="text-stone-600">Needed on</span>
        <input
          type="date"
          name="availableOn"
          defaultValue={current.availableOn ?? ""}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Keywords</span>
        <input
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="Name or suburb"
          className="mt-1 w-full rounded-lg border border-line px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="instantBook" value="1" defaultChecked={current.instantBook === "1"} />
        Instant Book
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="availableNow" value="1" defaultChecked={current.availableNow === "1"} />
        Available now
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="wwcc" value="1" defaultChecked={current.wwcc === "1"} />
        WWCC verified
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ndis" value="1" defaultChecked={current.ndis === "1"} />
        NDIS screening
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="currentChecks" value="1" defaultChecked={current.currentChecks === "1"} />
        Current checks only
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Minimum rating</span>
        <select name="minRating" defaultValue={current.minRating ?? ""} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
          <option value="">Any</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Sort by</span>
        <select name="sort" defaultValue={current.sort ?? "rating"} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
          <option value="rating">Highest rated</option>
          <option value="rate">Lowest hourly rate</option>
          <option value="experience">Most experience</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="text-stone-600">Minimum years</span>
        <select name="minYears" defaultValue={current.minYears ?? ""} className="mt-1 w-full rounded-lg border border-line px-3 py-2">
          <option value="">Any</option>
          <option value="3">3+</option>
          <option value="5">5+</option>
          <option value="10">10+</option>
        </select>
      </label>
      <button type="submit" className="w-full rounded-lg bg-teal py-2 text-sm font-medium text-white">
        Apply filters
      </button>
    </form>
  );
}
