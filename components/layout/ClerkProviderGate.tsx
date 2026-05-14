import type { ReactNode } from "react";

// Conditionally wraps children with Clerk's <ClerkProvider> when the
// CLERK_SECRET_KEY env var is set. Without keys we render children as-is —
// the site keeps working pre-auth-setup; pages that explicitly need auth
// redirect to /sign-in which itself shows a "setup pending" panel.
//
// Async server component so it can dynamic-import @clerk/nextjs only when
// configured (keeps the Clerk runtime out of the bundle when off).
export async function ClerkProviderGate({ children }: { children: ReactNode }) {
  if (!process.env.CLERK_SECRET_KEY) return <>{children}</>;
  const { ClerkProvider } = await import("@clerk/nextjs");
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#0f4c5c",
          colorText: "#1e1e1e",
          colorBackground: "#f5f1ea",
          borderRadius: "0px",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
