import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStorageMode } from "@/lib/developer/config";
import { collectRelationshipOptions, listCollection, readEntityValues } from "@/lib/developer/data";
import { readTranslations, sectionLabel } from "@/lib/developer/i18n";
import { getPageDef, type PageBlock } from "@/lib/developer/pages";
import { getEntity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { EditorForm } from "../../_components/EditorForm";
import { TranslationsEditor } from "../../_components/TranslationsEditor";

export const dynamic = "force-dynamic";

export default async function PageEditor({ params }: { params: Promise<{ pageKey: string }> }) {
  if (!(await isAuthenticated())) redirect("/developer");
  const { pageKey } = await params;
  const page = getPageDef(pageKey);
  if (!page) notFound();

  // Pre-load the translation groups once if any block needs them.
  const needsTranslations = page.blocks.some((b) => b.kind === "translations");
  const allTranslations = needsTranslations ? await readTranslations() : [];

  const rendered = await Promise.all(
    page.blocks.map((block, i) => renderBlock(block, i, allTranslations)),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
        ← All pages
      </Link>
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-semibold text-2xl">{page.label}</h1>
        {page.livePath ? (
          <Link
            href={page.livePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent text-sm hover:text-accent-2-text"
          >
            View this page ↗
          </Link>
        ) : null}
      </div>
      {page.blurb ? <p className="mt-1 text-ink-2 text-sm">{page.blurb}</p> : null}

      <div className="mt-8 space-y-6">{rendered}</div>
    </main>
  );
}

type TransGroupRaw = Awaited<ReturnType<typeof readTranslations>>[number];

async function renderBlock(block: PageBlock, index: number, allTranslations: TransGroupRaw[]) {
  if (block.kind === "entity") {
    const entity = getEntity(block.entityKey);
    if (!entity) return null;
    const [values, relationshipOptions] = await Promise.all([
      readEntityValues(entity),
      collectRelationshipOptions(entity),
    ]);
    return (
      <BlockCard key={index} title={block.title ?? entity.label} description={block.description}>
        <EditorForm
          entityKey={entity.key}
          entityLabel={entity.label}
          entityType="singleton"
          fields={entity.fields}
          initialValues={values}
          relationshipOptions={relationshipOptions}
          slug={null}
          isNew={false}
          storageMode={getStorageMode()}
          visibleKeys={block.fieldKeys}
          embedded
        />
      </BlockCard>
    );
  }

  if (block.kind === "translations") {
    const wanted = new Set(block.sections);
    const groups = allTranslations
      .filter((g) => wanted.has(g.section))
      .map((g) => ({ ...g, label: sectionLabel(g.section) }));
    if (groups.length === 0) return null;
    return (
      <BlockCard key={index} title={block.title ?? "Page text"} description={block.description}>
        <TranslationsEditor groups={groups} compact />
      </BlockCard>
    );
  }

  // collection
  const entity = getEntity(block.entityKey);
  if (!entity || entity.type !== "collection") return null;
  const items = await listCollection(entity);
  return (
    <BlockCard key={index} title={block.title ?? entity.label} description={block.description}>
      {block.note ? (
        <p className="mb-3 rounded-lg border border-hairline bg-ground-3/60 px-3 py-2 text-ink-2 text-xs">
          {block.note}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-hairline">
        {items.length === 0 ? (
          <p className="bg-ground-2 px-4 py-6 text-center text-ink-2 text-sm">Nothing here yet.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {items.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/developer/${entity.key}/${item.slug}`}
                  className="flex items-center justify-between bg-ground-2 px-4 py-2.5 text-sm hover:bg-ground-3"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-ink-2 text-xs">Edit →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        href={`/developer/${entity.key}/new`}
        className="mt-3 inline-flex items-center rounded-lg border border-accent border-dashed px-3 py-2 text-accent text-sm hover:bg-accent/5"
      >
        + Add {entity.label.replace(/s$/, "").toLowerCase()}
      </Link>
    </BlockCard>
  );
}

function BlockCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-hairline bg-ground-2/40 p-5">
      <h2 className="font-semibold text-base">{title}</h2>
      {description ? <p className="mt-0.5 text-ink-2 text-sm">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
