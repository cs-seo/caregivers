/**
 * Privacy-conscious, provider-agnostic analytics.
 *
 * Nothing loads and no events fire unless the owner configures a provider via
 * env vars (`NEXT_PUBLIC_GA_ID` for GA4, or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` for
 * Plausible). With no env set, every function here is a safe no-op so the site
 * ships zero third-party scripts and zero tracking by default.
 */

export const ANALYTICS_EVENTS = {
  SEARCH_PERFORMED: "search_performed",
  PROFILE_VIEWED: "profile_viewed",
  BOOKING_STARTED: "booking_started",
  BOOKING_REQUESTED: "booking_requested",
  BOOKING_PAID: "booking_paid",
  JOB_POST_STARTED: "job_post_started",
  JOB_POSTED: "job_posted",
  REGISTRATION_STARTED: "registration_started",
  REGISTRATION_COMPLETED: "registration_completed",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

export type AnalyticsProvider = "ga4" | "plausible" | null;

export type AnalyticsConfig = {
  provider: AnalyticsProvider;
  gaId?: string;
  plausibleDomain?: string;
};

function clean(value: string | undefined | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Resolve the active analytics provider from environment variables. GA4 takes
 * precedence when both are set. Returns `provider: null` when nothing is
 * configured, which callers treat as "do nothing".
 */
export function resolveAnalyticsConfig(env: {
  gaId?: string | null;
  plausibleDomain?: string | null;
}): AnalyticsConfig {
  const gaId = clean(env.gaId);
  const plausibleDomain = clean(env.plausibleDomain);
  if (gaId) return { provider: "ga4", gaId };
  if (plausibleDomain) return { provider: "plausible", plausibleDomain };
  return { provider: null };
}

/** Read the config from `process.env`. Safe to call on server or client. */
export function analyticsConfig(): AnalyticsConfig {
  return resolveAnalyticsConfig({
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    plausibleDomain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  });
}

/** Whether any analytics provider is configured. */
export function analyticsEnabled(config: AnalyticsConfig = analyticsConfig()) {
  return config.provider !== null;
}

type GtagWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  plausible?: (event: string, options?: { props?: AnalyticsProps }) => void;
};

/**
 * Fire a typed conversion event. No-op on the server, and no-op in the browser
 * unless a provider script has loaded (which only happens when configured).
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps) {
  if (typeof window === "undefined") return;
  const w = window as GtagWindow;
  const config = analyticsConfig();
  if (config.provider === "ga4" && typeof w.gtag === "function") {
    w.gtag("event", event, props ?? {});
    return;
  }
  if (config.provider === "plausible" && typeof w.plausible === "function") {
    w.plausible(event, props ? { props } : undefined);
  }
}
