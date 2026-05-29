import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStorageMode } from "@/lib/developer/config";
import { collectRelationshipOptions, readEntityValues } from "@/lib/developer/data";
import { getEntity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { DeleteButton } from "../../_components/DeleteButton";
import { EditorForm } from "../../_components/EditorForm";

export const dynamic = "force-dynamic";

export default async function CollectionEntryPage({
  params,
}: {
  params: Promise<{ entityKey: string; slug: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/developer");
  const { entityKey, slug } = await params;
  const entity = getEntity(entityKey);
  if (!entity || entity.type !== "collection") notFound();

  const isNew = slug === "new";
  const [values, relationshipOptions] = await Promise.all([
    readEntityValues(entity, isNew ? undefined : slug),
    collectRelationshipOptions(entity),
  ]);

  const label = !isNew && entity.slugField ? String(values[entity.slugField] ?? slug) : "";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href={`/developer/${entity.key}`} className="text-ink-2 text-sm hover:text-ink">
        ← {entity.label}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-4">
        <h1 className="font-semibold text-2xl">
          {isNew ? `New ${entity.label.replace(/s$/, "").toLowerCase()}` : label || slug}
        </h1>
        {!isNew ? <DeleteButton entityKey={entity.key} slug={slug} label={label || slug} /> : null}
      </div>

      <div className="mt-8">
        <EditorForm
          entityKey={entity.key}
          entityLabel={entity.label}
          entityType="collection"
          fields={entity.fields}
          initialValues={values}
          relationshipOptions={relationshipOptions}
          slug={isNew ? null : slug}
          isNew={isNew}
          storageMode={getStorageMode()}
        />
      </div>
    </main>
  );
}
