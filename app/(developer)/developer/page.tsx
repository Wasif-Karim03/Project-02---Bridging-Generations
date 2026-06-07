import Link from "next/link";
import { getDeveloperPassword, getStorageMode } from "@/lib/developer/config";
import { pagesByGroup } from "@/lib/developer/pages";
import { isAuthenticated } from "@/lib/developer/session";
import { LoginForm } from "./_components/LoginForm";

export const dynamic = "force-dynamic";

export default async function DeveloperHome() {
  if (!getDeveloperPassword()) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-semibold text-xl">Editor not configured</h1>
        <p className="mt-3 text-ink-2 text-sm">
          Set <code className="rounded bg-ground-3 px-1">DEVELOPER_PASSWORD</code> (and{" "}
          <code className="rounded bg-ground-3 px-1">DEVELOPER_GITHUB_TOKEN</code> in production) to
          enable the site editor.
        </p>
      </main>
    );
  }

  if (!(await isAuthenticated())) return <LoginForm />;

  const groups = pagesByGroup();
  const mode = getStorageMode();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-semibold text-2xl">Welcome to your site editor</h1>
      <p className="mt-1 text-ink-2 text-sm">
        Pick a page from the left to update it — its photos, text (English & Bangla), and the items
        it shows are all in one place.
      </p>

      <p className="mt-5 rounded-lg border border-hairline bg-ground-2 px-4 py-3 text-ink-2 text-sm">
        {mode === "github"
          ? "Saves publish to the live site automatically. A change takes about a minute to appear."
          : "Local mode: saves write to your computer's project files (development only)."}
      </p>

      <section className="mt-8">
        <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">Quick tools</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Tool
            href="/developer/siteSettings"
            title="Site settings"
            blurb="Name, contact, social links, logo."
          />
          <Tool
            href="/developer/translations"
            title="All page text"
            blurb="Every string, English & Bangla."
          />
          <Tool href="/developer/media" title="Media library" blurb="Browse uploaded photos." />
        </div>
      </section>

      {groups.map(({ group, pages }) => (
        <section key={group} className="mt-8">
          <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">{group}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <Tool
                key={p.key}
                href={`/developer/pages/${p.key}`}
                title={p.label}
                blurb={p.blurb ?? p.livePath}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

function Tool({ href, title, blurb }: { href: string; title: string; blurb: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-hairline bg-ground-2 px-4 py-3 transition-colors hover:border-accent hover:bg-ground-3"
    >
      <span className="font-medium text-sm">{title}</span>
      <span className="line-clamp-2 text-ink-2 text-xs">{blurb}</span>
    </Link>
  );
}
