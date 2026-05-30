import Link from "next/link";
import { getDeveloperPassword, getStorageMode } from "@/lib/developer/config";
import { ENTITIES, ENTITY_GROUP_ORDER, type Entity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { LoginForm } from "./_components/LoginForm";
import { LogoutButton } from "./_components/LogoutButton";

export const dynamic = "force-dynamic";

function groupEntities(): Array<{ group: string; items: Entity[] }> {
  const byGroup = new Map<string, Entity[]>();
  for (const e of ENTITIES) {
    const list = byGroup.get(e.group) ?? [];
    list.push(e);
    byGroup.set(e.group, list);
  }
  const order = [...ENTITY_GROUP_ORDER, ...byGroup.keys()];
  const seen = new Set<string>();
  const groups: Array<{ group: string; items: Entity[] }> = [];
  for (const g of order) {
    if (seen.has(g) || !byGroup.has(g)) continue;
    seen.add(g);
    groups.push({ group: g, items: byGroup.get(g) as Entity[] });
  }
  return groups;
}

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

  const groups = groupEntities();
  const mode = getStorageMode();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Site editor</h1>
          <p className="mt-1 text-ink-2 text-sm">Update the website's text and images.</p>
        </div>
        <LogoutButton />
      </header>

      <p className="mt-4 rounded-lg border border-hairline bg-ground-2 px-4 py-3 text-ink-2 text-sm">
        {mode === "github"
          ? "Saves publish to the live site automatically. A change takes about a minute to appear."
          : "Local mode: saves write to your computer's project files (development only)."}
      </p>

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">Page text</h2>
          <ul className="mt-3 divide-y divide-hairline rounded-xl border border-hairline bg-ground-2">
            <li>
              <Link
                href="/developer/translations"
                className="flex items-center justify-between px-4 py-3 hover:bg-ground-3"
              >
                <span>
                  <span className="font-medium">Page text (English & বাংলা)</span>
                  <span className="block text-ink-2 text-xs">
                    Headings, buttons, nav, and hero copy across the site — in both languages.
                  </span>
                </span>
                <span className="text-ink-2 text-xs">Edit →</span>
              </Link>
            </li>
          </ul>
        </section>
        {groups.map(({ group, items }) => (
          <section key={group}>
            <h2 className="font-medium text-ink-2 text-xs uppercase tracking-wide">{group}</h2>
            <ul className="mt-3 divide-y divide-hairline rounded-xl border border-hairline bg-ground-2">
              {items.map((entity) => (
                <li key={entity.key}>
                  <Link
                    href={`/developer/${entity.key}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-ground-3"
                  >
                    <span>
                      <span className="font-medium">{entity.label}</span>
                      {entity.blurb ? (
                        <span className="block text-ink-2 text-xs">{entity.blurb}</span>
                      ) : null}
                    </span>
                    <span className="text-ink-2 text-xs">
                      {entity.type === "collection" ? "List →" : "Edit →"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
