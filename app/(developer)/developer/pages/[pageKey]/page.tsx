import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStorageMode } from "@/lib/developer/config";
import { collectRelationshipOptions, listCollection, readEntityValues } from "@/lib/developer/data";
import { readTranslations, sectionLabel } from "@/lib/developer/i18n";
import { getPageDef, type PageBlock } from "@/lib/developer/pages";
import { getEntity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { EditorCard } from "../../_components/EditorCard";
import { EditorForm } from "../../_components/EditorForm";
import { Icon, type IconName, pageIcon } from "../../_components/icons";
import { TranslationsEditor } from "../../_components/TranslationsEditor";

export const dynamic = "force-dynamic";

type RenderedBlock = { id: string; title: string; icon: IconName; node: React.ReactNode };

export default async function PageEditor({ params }: { params: Promise<{ pageKey: string }> }) {
  if (!(await isAuthenticated())) redirect("/developer");
  const { pageKey } = await params;
  const page = getPageDef(pageKey);
  if (!page) notFound();

  const needsTranslations = page.blocks.some((b) => b.kind === "translations");
  const allTranslations = needsTranslations ? await readTranslations() : [];

  const blocks = (
    await Promise.all(page.blocks.map((block, i) => renderBlock(block, i, allTranslations)))
  ).filter((b): b is RenderedBlock => b !== null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
        ← All pages
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Icon name={pageIcon(page.key)} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-2xl leading-tight">{page.label}</h1>
          {page.blurb ? <p className="mt-0.5 text-ink-2 text-sm">{page.blurb}</p> : null}
        </div>
        {page.livePath ? (
          <Link
            href={page.livePath}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-hairline px-3 py-1.5 text-accent text-sm transition-colors hover:border-accent hover:bg-accent/5"
          >
            View page ↗
          </Link>
        ) : null}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_200px]">
        <div className="min-w-0 space-y-5">
          {blocks.map((b) => (
            <EditorCard key={b.id} id={b.id} title={b.title} icon={b.icon}>
              {b.node}
            </EditorCard>
          ))}
        </div>

        {blocks.length > 2 ? (
          <aside className="hidden xl:block">
            <div className="sticky top-20">
              <p className="px-3 pb-2 font-semibold text-ink-2 text-[10px] uppercase tracking-[0.14em]">
                On this page
              </p>
              <ul className="space-y-0.5 text-sm">
                {blocks.map((b) => (
                  <li key={b.id}>
                    <a
                      href={`#${b.id}`}
                      className="block truncate rounded-lg px-3 py-1.5 text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink"
                    >
                      {b.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

type TransGroupRaw = Awaited<ReturnType<typeof readTranslations>>[number];

function blockIcon(block: PageBlock): IconName {
  if (block.kind === "translations") return "text";
  if (block.kind === "collection") return "list";
  return block.entityKey === "pageMedia" ? "image" : "settings";
}

async function renderBlock(
  block: PageBlock,
  index: number,
  allTranslations: TransGroupRaw[],
): Promise<RenderedBlock | null> {
  const id = `block-${index}`;

  if (block.kind === "entity") {
    const entity = getEntity(block.entityKey);
    if (!entity) return null;
    const [values, relationshipOptions] = await Promise.all([
      readEntityValues(entity),
      collectRelationshipOptions(entity),
    ]);
    return {
      id,
      title: block.title ?? entity.label,
      icon: blockIcon(block),
      node: (
        <>
          {block.description ? (
            <p className="mb-4 text-ink-2 text-sm">{block.description}</p>
          ) : null}
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
        </>
      ),
    };
  }

  if (block.kind === "translations") {
    const wanted = new Set(block.sections);
    const groups = allTranslations
      .filter((g) => wanted.has(g.section))
      .map((g) => ({ ...g, label: sectionLabel(g.section) }));
    if (groups.length === 0) return null;
    return {
      id,
      title: block.title ?? "Page text",
      icon: "text",
      node: (
        <>
          {block.description ? (
            <p className="mb-4 text-ink-2 text-sm">{block.description}</p>
          ) : null}
          <TranslationsEditor groups={groups} compact />
        </>
      ),
    };
  }

  // collection
  const entity = getEntity(block.entityKey);
  if (!entity || entity.type !== "collection") return null;
  const items = await listCollection(entity);
  return {
    id,
    title: block.title ?? entity.label,
    icon: "list",
    node: (
      <>
        {block.description ? <p className="mb-3 text-ink-2 text-sm">{block.description}</p> : null}
        {block.note ? (
          <p className="mb-3 rounded-lg border border-hairline bg-ground-3/60 px-3 py-2 text-ink-2 text-xs">
            {block.note}
          </p>
        ) : null}
        <div className="overflow-hidden rounded-lg border border-hairline">
          {items.length === 0 ? (
            <p className="bg-ground-2 px-4 py-6 text-center text-ink-2 text-sm">
              Nothing here yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/developer/${entity.key}/${item.slug}`}
                    className="flex items-center justify-between bg-ground-2 px-4 py-2.5 text-sm transition-colors hover:bg-ground-3"
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
          className="mt-3 inline-flex items-center gap-1 rounded-lg border border-accent border-dashed px-3 py-2 text-accent text-sm transition-colors hover:bg-accent/5"
        >
          + Add {entity.label.replace(/s$/, "").toLowerCase()}
        </Link>
      </>
    ),
  };
}
