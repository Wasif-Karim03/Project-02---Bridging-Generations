import { NextResponse } from "next/server";
import { getUserIdOptional } from "@/lib/auth";
import { getStripe } from "@/lib/payments/stripe";
import { SITE_URL } from "@/lib/seo/siteUrl";

// Body shape accepted by the donate form.
type CheckoutBody = {
  amount?: number; // USD whole dollars
  recurring?: boolean; // true = recurring monthly subscription
  projectId?: string;
  studentId?: string;
  dedicationText?: string;
  donorName?: string;
  donorEmail?: string;
};

const MIN_DOLLARS = 5;
const MAX_DOLLARS = 10000;

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return bad(
      "Stripe is not yet configured. Set STRIPE_SECRET_KEY in Netlify environment variables.",
      503,
    );
  }

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return bad("Invalid JSON body.");
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < MIN_DOLLARS || amount > MAX_DOLLARS) {
    return bad(`Amount must be between $${MIN_DOLLARS} and $${MAX_DOLLARS}.`);
  }

  const recurring = body.recurring === true;
  const projectId = (body.projectId ?? "").trim().slice(0, 80);
  const studentId = (body.studentId ?? "").trim().slice(0, 80);
  const dedicationText = (body.dedicationText ?? "").trim().slice(0, 280);

  // Attach the signed-in donor's Clerk ID to metadata so the webhook can link
  // the donation to their local users row. Anonymous (signed-out) donations
  // still work — they're attributed by donorEmail only.
  const clerkUserId = await getUserIdOptional();

  const successUrl = `${SITE_URL}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${SITE_URL}/donate?canceled=1`;

  try {
    // Stripe Checkout takes amount in cents.
    const unitAmount = Math.round(amount * 100);

    const productName = projectId
      ? `Donation to project: ${projectId}`
      : studentId
        ? `Sponsorship for student: ${studentId}`
        : "Donation to Bridging Generations";

    const session = await stripe.checkout.sessions.create({
      mode: recurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            recurring: recurring ? { interval: "month" } : undefined,
            product_data: {
              name: productName,
              description: dedicationText
                ? `Dedicated to: ${dedicationText}`
                : "Bridging Generations · 501(c)(3) nonprofit",
            },
          },
          quantity: 1,
        },
      ],
      // Metadata is what the webhook reads to attribute donations.
      metadata: {
        projectId,
        studentId,
        dedicationText,
        recurring: recurring ? "1" : "0",
        source: "donate-page",
        clerkUserId: clerkUserId ?? "",
      },
      // Pre-fill donor email if provided.
      customer_email: body.donorEmail || undefined,
      // For subscriptions, Stripe needs metadata on the subscription itself
      // (not just the session) so the webhook on `invoice.paid` can attribute.
      subscription_data: recurring
        ? {
            metadata: {
              projectId,
              studentId,
              dedicationText,
              source: "donate-page",
              clerkUserId: clerkUserId ?? "",
            },
          }
        : undefined,
      // Optional: ask Stripe to cover the processing fee at checkout. Disabled
      // by default — turn on once the nonprofit-discount application lands.
      allow_promotion_codes: false,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (!session.url) {
      return bad("Stripe did not return a checkout URL.", 502);
    }
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout-session] create failed", err);
    return bad("Could not create checkout session. Please try again.", 502);
  }
}
