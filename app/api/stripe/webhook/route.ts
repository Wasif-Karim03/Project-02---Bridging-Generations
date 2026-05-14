import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { insertDonation } from "@/lib/db/queries/donations";
import { getUserByClerkId, getUserByEmail } from "@/lib/db/queries/users";
import { getStripe } from "@/lib/payments/stripe";

// Resolve a checkout / invoice event back to a local users.id. Prefer the
// clerkUserId we stuffed into Stripe metadata at checkout-session time; fall
// back to email lookup so donations made before sign-up still attach when
// the donor later creates an account with the same email.
async function resolveDonorUserId(args: {
  clerkUserId: string | null | undefined;
  email: string | null | undefined;
}): Promise<string | null> {
  if (args.clerkUserId) {
    const u = await getUserByClerkId(args.clerkUserId);
    if (u) return u.id;
  }
  if (args.email) {
    const u = await getUserByEmail(args.email);
    if (u) return u.id;
  }
  return null;
}

// Stripe webhook endpoint — receives checkout.session.completed and
// invoice.paid events. Persists each to the donations table when
// DATABASE_URL is set (silent no-op otherwise) and always logs the
// attribution so the board can reconcile manually until the DB is wired up.
//
// Stripe requires the raw request body bytes for signature verification,
// so we read req.text() and pass that to constructEvent. Do NOT use req.json.

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    console.warn("[stripe/webhook] received event but STRIPE_SECRET_KEY is not set; ignoring.");
    return NextResponse.json({ received: false, reason: "stripe-not-configured" }, { status: 200 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set; cannot verify signature.");
    return NextResponse.json(
      { received: false, reason: "webhook-secret-not-configured" },
      { status: 400 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const meta = session.metadata ?? {};
      const amountCents = session.amount_total ?? 0;
      const currency = (session.currency ?? "usd").toLowerCase();
      const recurring = meta.recurring === "1";
      const projectId = meta.projectId || null;
      const studentId = meta.studentId || null;
      const dedicationText = meta.dedicationText || null;

      console.info(
        "[stripe/webhook] checkout.session.completed: $%s · project=%s · student=%s · dedication=%s · email=%s",
        (amountCents / 100).toFixed(2),
        projectId ?? "(none)",
        studentId ?? "(none)",
        dedicationText ?? "(none)",
        session.customer_email ?? "(none)",
      );

      try {
        // Recurring sub kickoff still gets logged here, but the first paid
        // invoice arrives separately as invoice.paid — to avoid double-counting,
        // skip the DB insert for subscription-mode sessions and let
        // invoice.paid persist the row instead.
        if (!recurring) {
          const donorEmail = session.customer_email ?? null;
          const donorUserId = await resolveDonorUserId({
            clerkUserId: meta.clerkUserId || null,
            email: donorEmail,
          });
          await insertDonation({
            amountCents,
            currency,
            recurring: false,
            source: "stripe",
            externalReference: session.id,
            status: "succeeded",
            donorUserId,
            donorEmail,
            studentSlug: studentId,
            projectSlug: projectId,
            dedicationText,
            metadata: { sessionId: session.id, mode: session.mode },
          });
        }
      } catch (err) {
        console.error("[stripe/webhook] insertDonation failed", err);
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const amountCents = invoice.amount_paid ?? 0;
      const currency = (invoice.currency ?? "usd").toLowerCase();
      // The newer Stripe API moved `subscription` off the invoice top-level
      // (now lives under invoice.parent.subscription_details); read defensively.
      // biome-ignore lint/suspicious/noExplicitAny: shape varies by Stripe API version
      const invoiceAny = invoice as any;
      const subscriptionId =
        invoiceAny.subscription ?? invoiceAny.parent?.subscription_details?.subscription ?? null;
      // Subscription metadata was attached at session-create time via
      // subscription_data.metadata; expand it from the invoice via the API
      // only if we need attribution. For now, also try invoice.metadata as a
      // simpler fallback.
      const meta = invoice.metadata ?? {};
      const projectId = meta.projectId || null;
      const studentId = meta.studentId || null;
      const dedicationText = meta.dedicationText || null;

      console.info(
        "[stripe/webhook] invoice.paid (recurring): $%s · subscription=%s",
        (amountCents / 100).toFixed(2),
        subscriptionId || "(none)",
      );

      try {
        const donorEmail = invoice.customer_email ?? null;
        const donorUserId = await resolveDonorUserId({
          clerkUserId: meta.clerkUserId || null,
          email: donorEmail,
        });
        await insertDonation({
          amountCents,
          currency,
          recurring: true,
          source: "stripe",
          externalReference: subscriptionId || invoice.id || null,
          status: "succeeded",
          donorUserId,
          donorEmail,
          studentSlug: studentId,
          projectSlug: projectId,
          dedicationText,
          metadata: { invoiceId: invoice.id, subscriptionId },
        });
      } catch (err) {
        console.error("[stripe/webhook] insertDonation failed", err);
      }
      break;
    }
    default: {
      console.info("[stripe/webhook] received unhandled event type: %s", event.type);
    }
  }

  return NextResponse.json({ received: true });
}
