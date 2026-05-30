import Link from "next/link";
import { redirect } from "next/navigation";
import { readTranslations, sectionLabel } from "@/lib/developer/i18n";
import { isAuthenticated } from "@/lib/developer/session";
import { TranslationsEditor } from "../_components/TranslationsEditor";

export const dynamic = "force-dynamic";

export default async function TranslationsPage() {
  if (!(await isAuthenticated())) redirect("/developer");
  const raw = await readTranslations();
  const groups = raw.map((g) => ({ ...g, label: sectionLabel(g.section) }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
        ← All sections
      </Link>
      <h1 className="mt-3 font-semibold text-2xl">Page text (English & বাংলা)</h1>
      <p className="mt-1 text-ink-2 text-sm">
        Headings, buttons, navigation, and hero copy that appears across the site.
      </p>
      <div className="mt-8">
        <TranslationsEditor groups={groups} />
      </div>
    </main>
  );
}
