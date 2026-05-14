import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { deleteUserByClerkId, upsertUserFromClerk } from "@/lib/db/queries/users";

// Clerk → users table sync. Configure the endpoint URL in the Clerk dashboard
// (Webhooks → Add endpoint) pointing at:
//   {NEXT_PUBLIC_SITE_URL}/api/clerk/webhook
// Subscribe to events: user.created, user.updated, user.deleted.
// Then paste the Signing Secret into CLERK_WEBHOOK_SECRET in Vercel env.

type ClerkUserPayload = {
  id: string;
  email_addresses?: Array<{ email_address?: string; id?: string }>;
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
};

function primaryEmail(u: ClerkUserPayload): string {
  if (!u.email_addresses?.length) return "";
  const primary = u.email_addresses.find((e) => e.id === u.primary_email_address_id);
  return primary?.email_address ?? u.email_addresses[0]?.email_address ?? "";
}

function displayName(u: ClerkUserPayload): string | null {
  const parts = [u.first_name, u.last_name].filter(Boolean) as string[];
  return parts.length > 0 ? parts.join(" ") : null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn("[clerk/webhook] CLERK_WEBHOOK_SECRET not set; ignoring event.");
    return NextResponse.json({ received: false, reason: "not-configured" }, { status: 200 });
  }

  // svix signature headers are case-insensitive on the wire but
  // Headers.get is case-insensitive itself, so just read the lowercase form.
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers." }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: { type: string; data: ClerkUserPayload };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUserPayload };
  } catch (err) {
    console.error("[clerk/webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const user = event.data;

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const email = primaryEmail(user);
      if (!email) {
        console.warn("[clerk/webhook] %s: no primary email on user %s", event.type, user.id);
        break;
      }
      try {
        await upsertUserFromClerk({
          clerkUserId: user.id,
          email,
          displayName: displayName(user),
        });
      } catch (err) {
        console.error("[clerk/webhook] upsert failed", err);
      }
      break;
    }
    case "user.deleted": {
      try {
        await deleteUserByClerkId(user.id);
      } catch (err) {
        console.error("[clerk/webhook] delete failed", err);
      }
      break;
    }
    default: {
      console.info("[clerk/webhook] ignoring event type: %s", event.type);
    }
  }

  return NextResponse.json({ received: true });
}
