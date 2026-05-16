import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { StudentApplicationForm } from "./_components/StudentApplicationForm";

export const metadata: Metadata = {
  title: "Scholarship application",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Step 2 of the student signup flow. The Clerk account was created on
// /student-signup; here the student fills in the details we need to evaluate
// their application. On submit, we persist to student_registrations,
// promote their users.role to "student", and redirect them to sign-in.

export default async function StudentApplicationPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  const initialEmail = dbUser?.email ?? undefined;

  return (
    <div className="bg-ground">
      {/* Hero — same scale + treatment as the rest of the marketing surfaces */}
      <section
        aria-labelledby="application-hero-title"
        className="bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Reveal stagger="up">
            <Eyebrow>Step 2 of 2 · Your details</Eyebrow>
            <h1
              id="application-hero-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              Tell us a bit about yourself.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              Everything below goes only to our board for review — we never share it publicly. Once
              you're approved, you'll be able to{" "}
              <Link
                href="/dashboard/student"
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                sign in
              </Link>{" "}
              and see who is sponsoring you and how much they've given.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Body — two-column on desktop: form left, reassurance sidebar right */}
      <section className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            <StudentApplicationForm initialEmail={initialEmail} />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-6">
              <SideCard
                heading="What happens next"
                items={[
                  "We review every application against published eligibility rules.",
                  "You'll get an email decision within about four weeks.",
                  "If approved, you'll be linked to a public student profile and start seeing sponsors.",
                ]}
              />
              <SideCard
                heading="Your privacy"
                items={[
                  "Family income + guardian details are board-only — never on the public site.",
                  "Your portrait + story are only shared with your family's signed consent.",
                  "You can update your profile or revoke consent at any time after approval.",
                ]}
              />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function SideCard({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div className="border border-hairline bg-ground-2 p-5">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">{heading}</p>
      <ul className="mt-3 flex flex-col gap-2 text-body-sm text-ink-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span aria-hidden="true" className="select-none text-accent">
              →
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
