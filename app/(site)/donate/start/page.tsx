import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getStudentBySlug } from "@/lib/content/students";
import { getProjectBySlug } from "@/lib/db/queries/projects";
import { pageAlternates } from "@/lib/seo/alternates";

export const metadata: Metadata = {
  title: "Donate",
  description: "Choose how you'd like to give to Bridging Generations.",
  alternates: pageAlternates("/donate/start"),
};

type SearchParams = { student?: string; project?: string };

export default async function DonateStartPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const studentSlug = sp.student?.trim() || "";
  const projectSlug = sp.project?.trim() || "";

  const [student, project] = await Promise.all([
    studentSlug ? getStudentBySlug(studentSlug) : Promise.resolve(null),
    projectSlug ? getProjectBySlug(projectSlug) : Promise.resolve(null),
  ]);

  const qs = new URLSearchParams();
  if (studentSlug) qs.set("student", studentSlug);
  if (projectSlug) qs.set("project", projectSlug);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const guestHref = `/donate${suffix}`;
  const accountHref = `/be-a-donor${suffix}`;

  const context = student?.displayName ?? project?.name ?? null;

  return (
    <main className="bg-ground">
      <section className="mx-auto max-w-[960px] px-4 pt-28 pb-24 sm:px-6 lg:pt-36 lg:pb-28">
        <div className="flex flex-col items-center gap-3 text-center">
          <Eyebrow>Make a donation</Eyebrow>
          <h1 className="text-balance text-display-2 text-ink">
            {context ? `Support ${context}` : "Choose how you'd like to give"}
          </h1>
          <p className="mx-auto max-w-[54ch] text-body-lg text-ink-2">
            Give in under a minute as a guest, or create a donor account to track your impact and
            follow the students you support.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Option 1 — guest donation */}
          <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-8">
            <span className="text-meta uppercase tracking-[0.08em] text-ink-2">Fastest</span>
            <h2 className="text-heading-3 text-accent">Donate now</h2>
            <p className="text-body text-ink-2">
              No account needed. Give a one-time or monthly gift securely by card — it takes about a
              minute.
            </p>
            <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                Secure card payment via Stripe
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                Instant tax-deductible receipt by email
              </li>
            </ul>
            <Link
              href={guestHref}
              className="mt-auto inline-flex min-h-[52px] items-center justify-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
            >
              Continue to donation →
            </Link>
          </div>

          {/* Option 2 — create donor account */}
          <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-ground-2 p-8">
            <span className="text-meta uppercase tracking-[0.08em] text-ink-2">Stay connected</span>
            <h2 className="text-heading-3 text-accent">Create a donor account</h2>
            <p className="text-body text-ink-2">
              Set up a free donor account to track your giving, keep all your receipts in one place,
              and follow the students and projects you support.
            </p>
            <ul className="flex flex-col gap-2 text-body-sm text-ink-2">
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                A personal donor dashboard
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                Manage recurring gifts and history
              </li>
            </ul>
            <Link
              href={accountHref}
              className="mt-auto inline-flex min-h-[52px] items-center justify-center border border-accent px-6 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
            >
              Create an account →
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-meta uppercase tracking-[0.06em] text-ink-2">
          Bridging Generations is a registered 501(c)(3) — your gift is tax-deductible.
        </p>
      </section>
    </main>
  );
}
