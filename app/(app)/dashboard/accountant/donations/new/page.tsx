import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireRole } from "@/lib/auth";
import { NewDonationForm } from "./_components/NewDonationForm";

export const metadata: Metadata = {
  title: "Record a donation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewDonationPage() {
  await requireRole("accountant");

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Accountant · New entry</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Record a donation.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          Use this form for gifts received outside the online flow — bank transfer, cash, in-kind,
          or any other channel. Online (Stripe) donations show up automatically via webhook and
          don't need to be entered here.
        </p>
      </header>

      <div className="max-w-[640px]">
        <NewDonationForm />
      </div>

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        <Link
          href="/dashboard/accountant"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          ← Back to the ledger
        </Link>
      </p>
    </div>
  );
}
