"use client";

import { useEffect } from "react";

// Top-level fallback that also replaces the root layout when the layout itself
// throws. Renders its own <html>/<body>. Never exposes error internals.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-AU">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: "32rem",
          margin: "4rem auto",
          padding: "0 1rem",
          textAlign: "center",
          color: "#1c1917",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 600 }}>We hit an unexpected error</h1>
        <p style={{ marginTop: "0.75rem", color: "#57534e" }}>
          Sorry about that. The issue has been logged. Please try again.
        </p>
        <button
          onClick={reset}
          type="button"
          style={{
            marginTop: "1.5rem",
            background: "#0f766e",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
