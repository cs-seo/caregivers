// In-memory (per-instance) sliding-window rate limiter.
//
// PRODUCTION NOTE: This keeps counters in the Node process memory, so it only
// protects a single instance. A horizontally scaled deployment (multiple Vercel
// lambdas / server instances) MUST back this with a shared store such as Redis
// (e.g. Upstash) and, ideally, an edge/WAF rate limit in front of the app.
// Treat this as defence-in-depth against bursts and casual abuse, not as a
// complete DoS mitigation.

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
  retryAfterMs: number;
};

type Bucket = {
  // Timestamps (ms) of recent hits within the window.
  hits: number[];
};

const buckets = new Map<string, Bucket>();

// Occasionally evict stale buckets so memory does not grow unbounded.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    const cutoff = now - windowMs;
    bucket.hits = bucket.hits.filter((t) => t > cutoff);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Max number of requests allowed within the window. */
  limit: number;
  /** Sliding window size in milliseconds. */
  windowMs: number;
  /** Injectable clock for tests. */
  now?: number;
};

/**
 * Records a hit for `key` and reports whether it is within the allowed rate.
 * Uses a sliding window so bursts at window boundaries are counted correctly.
 */
export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = options;
  const now = options.now ?? Date.now();
  const cutoff = now - windowMs;

  sweep(now, windowMs);

  const bucket = buckets.get(key) ?? { hits: [] };
  // Drop hits that have aged out of the window.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0];
    const retryAfterMs = Math.max(0, oldest + windowMs - now);
    return { ok: false, remaining: 0, limit, retryAfterMs };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.hits.length),
    limit,
    retryAfterMs: 0,
  };
}

/** Test/maintenance helper: clears all counters. */
export function resetRateLimit(key?: string) {
  if (key) buckets.delete(key);
  else buckets.clear();
}
