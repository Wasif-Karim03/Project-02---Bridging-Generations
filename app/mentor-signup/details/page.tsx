import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { MentorApplicationForm } from "./_components/MentorApplicationForm";

export const metadata: Metadata = {
  title: "Mentor application",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Step 2 of the mentor signup flow. The Clerk account was created on
// /mentor-signup; here the applicant fills in everything the board needs to
// review them. On submit, we persist to mentor_applications and send them
// to /pending-approval. An admin approves later from
// /dashboard/admin/applications/mentor/[id], which promotes their users row
// from donor → mentor via autoPromoteMentorIfPossible.

export default async function MentorApplicationPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  const initialEmail = dbUser?.email ?? undefined;

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="application-hero-title"
        className="bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[1280px]">
          <Reveal stagger="up">
            <Eyebrow>Step 2 of 2 · Your profile</Eyebrow>
            <h1
              id="application-hero-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              Tell us about yourself.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              Everything below goes to our board for review — we never share it publicly. Once
              you're approved, you'll be able to{" "}
              <Link
                href="/dashboard/mentor"
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                sign in
              </Link>{" "}
              and start mentoring assigned students.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0">
            <MentorApplicationForm initialEmail={initialEmail} />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-6">
              <SideCard
                heading="What happens next"
                items={[
                  "Our team reviews every mentor application against published criteria.",
                  "You'll get an email decision — usually within a few days.",
                  "Once approved, you'll be matched with a student and gain mentor access.",
                ]}
              />
              <SideCard
                heading="Your privacy"
                items={[
                  "Your contact info and photo are board-only — never on the public site.",
                  "We only share what's needed to introduce you to your assigned student.",
                  "You can update your profile or withdraw at any time.",
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
