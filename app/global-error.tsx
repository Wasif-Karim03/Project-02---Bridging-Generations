"use client";

// Top-of-tree error boundary. Fires only when the root layout itself
// throws (e.g. font loader fails, i18n provider crashes). At that point
// the normal app/error.tsx can't render because no layout exists — Next
// expects this file to ship its own <html>/<body>.

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: "48px 24px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#faf6ef",
          color: "#1e1e1e",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: 12,
              color: "#0f4c5c",
              marginBottom: 12,
            }}
          >
            Site error
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>
            Bridging Generations is temporarily unavailable.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#5c5c5c", marginBottom: 24 }}>
            We've hit an unexpected error and our team has been notified. Please refresh in a
            minute. If the problem persists, email info@bridginggenerations.org.
          </p>
          {error.digest ? (
            <p
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#5c5c5c",
              }}
            >
              Error ref · {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
