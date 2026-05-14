import "server-only";
import Stripe from "stripe";

// Single Stripe client per server instance. The SDK is request-scoped under
// the hood, so a module-level singleton is fine.
let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // The Stripe SDK defaults to the API version it was built against — no
  // need to pin explicitly. Upgrading the SDK is the conscious moment to
  // also re-check API behaviour.
  cached = new Stripe(key, { typescript: true });
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
