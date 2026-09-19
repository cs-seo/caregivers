import { isDemoMode } from "./demo-mode";
import type { DirectoryFilters } from "./queries";

export function directoryFiltersNoIndex(filters: DirectoryFilters) {
  return Boolean(
    filters.q ||
      filters.availableOn ||
      filters.availableAt ||
      filters.instantBook ||
      filters.availableNow ||
      filters.wwcc ||
      filters.ndis ||
      filters.currentChecks ||
      (filters.minRating && filters.minRating > 0) ||
      (filters.minYears && filters.minYears > 0) ||
      (filters.page && filters.page > 1) ||
      filters.job ||
      (filters.sort && filters.sort !== "rating"),
  );
}

export function directoryLandingNoIndex(filters: DirectoryFilters, emptyListing = false) {
  if (directoryFiltersNoIndex(filters)) return true;
  return emptyListing && !isDemoMode();
}

export function marketplacePageNoIndex() {
  return !isDemoMode();
}
