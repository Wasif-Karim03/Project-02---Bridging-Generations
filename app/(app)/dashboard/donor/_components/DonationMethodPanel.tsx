import { Link } from "next-view-transitions";

// Three-card "how to donate" panel — Stripe + bKash are stubs (the
// spec says "Coming soon" UI only; do NOT touch the working Stripe code
// path that already exists elsewhere). "Call to donate" surfaces the
// existing org phone + email so donors have a live channel today.
export function DonationMethodPanel() {
  return (
    <section
      aria-labelledby="donation-method-title"
      className="flex flex-col gap-4 border-2 border-accent bg-accent/5 p-6"
    >
      <header className="flex flex-col gap-1 border-b border-hairline pb-3">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Make a gift</p>
        <h2 id="donation-method-title" className="text-heading-4 text-ink">
          How would you like to donate?
        </h2>
      </header>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StubMethod
          eyebrow="Card via Stripe"
          title="Add card"
          body="Pay by credit / debit card. Recurring sponsorship supported."
          chip="Coming soon"
        />
        <StubMethod
          eyebrow="Mobile (Bangladesh)"
          title="Pay via bKash"
          body="Send directly from bKash. Auto-receipts via SMS + email."
          chip="Coming soon"
        />
        <CallMethod />
      </ul>
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Online payment integrations are being finalized. For now, the call line above is the active
        donation channel.
      </p>
    </section>
  );
}

function StubMethod({
  eyebrow,
  title,
  body,
  chip,
}: {
  eyebrow: string;
  title: string;
  body: string;
  chip: string;
}) {
  return (
    <li className="flex h-full flex-col gap-2 border border-hairline bg-ground-2 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">{eyebrow}</span>
        <span className="inline-block bg-accent-3 px-2 py-0.5 text-meta uppercase tracking-[0.08em] text-ink">
          {chip}
        </span>
      </div>
      <h3 className="text-heading-5 text-ink">{title}</h3>
      <p className="text-body-sm text-ink-2">{body}</p>
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-auto inline-flex min-h-[40px] cursor-not-allowed items-center bg-ink-2/30 px-3 text-nav-link uppercase text-ink-2"
      >
        Not yet available
      </button>
    </li>
  );
}

function CallMethod() {
  return (
    <li className="flex h-full flex-col gap-2 border border-hairline bg-ground-2 p-5">
      <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">By phone</span>
      <h3 className="text-heading-5 text-ink">Call to donate</h3>
      <p className="text-body-sm text-ink-2">
        Speak with the team directly. We'll record the donation in the manual ledger and email a
        receipt.
      </p>
      <p className="text-body-sm text-ink">+8801898911452 (WhatsApp)</p>
      <Link
        href="/contact"
        className="mt-auto inline-flex min-h-[40px] items-center bg-accent px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
      >
        Open contact form →
      </Link>
    </li>
  );
}
