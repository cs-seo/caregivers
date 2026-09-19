"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { analyticsConfig, track, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics";

/**
 * Injects the configured analytics provider script and nothing else. Renders
 * null (zero network cost) when no provider env var is set.
 */
export function AnalyticsScripts() {
  const config = analyticsConfig();

  if (config.provider === "ga4" && config.gaId) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${config.gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${config.gaId}', { send_page_view: true });
          `}
        </Script>
        <Suspense fallback={null}>
          <Ga4PageviewTracker gaId={config.gaId} />
        </Suspense>
      </>
    );
  }

  if (config.provider === "plausible" && config.plausibleDomain) {
    return (
      <Script
        src="https://plausible.io/js/script.js"
        data-domain={config.plausibleDomain}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}

/**
 * GA4's SPA page views: the initial load is sent by the config snippet, but
 * client-side App Router navigations need an explicit page_view.
 */
function Ga4PageviewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as Window & { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") return;
    const query = searchParams?.toString();
    const page_path = query ? `${pathname}?${query}` : pathname;
    w.gtag("event", "page_view", { page_path, send_to: gaId });
  }, [pathname, searchParams, gaId]);

  return null;
}

/** Fire a conversion event once when a page/section mounts. */
export function TrackView({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
}) {
  useEffect(() => {
    track(event, props);
    // Fire once per mount; props are event metadata, not deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
  return null;
}

/**
 * Wrap a CTA to fire a conversion event on click. Renders an inline `contents`
 * span so it does not affect layout; the wrapped link/button still navigates.
 */
export function TrackClick({
  event,
  props,
  children,
}: {
  event: AnalyticsEvent;
  props?: AnalyticsProps;
  children: React.ReactNode;
}) {
  return (
    <span className="contents" onClick={() => track(event, props)}>
      {children}
    </span>
  );
}
