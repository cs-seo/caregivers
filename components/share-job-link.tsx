"use client";

import { useEffect, useState } from "react";
import { jobShareHeading } from "@/lib/job-share";

export function ShareJobLink({ path, notice }: { path: string; notice: string }) {
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-card p-5">
      <h2 className="text-lg font-semibold text-ink">{jobShareHeading()}</h2>
      <p className="mt-2 text-sm text-stone-600">{notice}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          readOnly
          value={url}
          aria-label="Request link"
          className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink"
        />
        <button
          type="button"
          onClick={copy}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-teal hover:bg-sage"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
