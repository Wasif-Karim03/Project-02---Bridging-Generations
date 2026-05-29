import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getStorageMode } from "@/lib/developer/config";
import { collectRelationshipOptions, listCollection, readEntityValues } from "@/lib/developer/data";
import { getEntity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { EditorForm } from "../_components/EditorForm";

export const dynamic = "force-dynamic";

export default async function EntityPage({ params }: { params: Promise<{ entityKey: string }> }) {
  if (!(await isAuthenticated())) redirect("/developer");
  const { entityKey } = await params;
  const entity = getEntity(entityKey);
  if (!entity) notFound();

  if (entity.type === "singleton") {
    const [values, relationshipOptions] = await Promise.all([
      readEntityValues(entity),
      collectRelationshipOptions(entity),
    ]);
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
          ← All sections
        </Link>
        <h1 className="mt-3 font-semibold text-2xl">{entity.label}</h1>
        {entity.blurb ? <p className="mt-1 text-ink-2 text-sm">{entity.blurb}</p> : null}
        <div className="mt-8">
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
          />
        </div>
      </main>
    );
  }

  // Collection → list entries.
  const items = await listCollection(entity);
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
        ← All sections
      </Link>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">{entity.label}</h1>
        <Link
          href={`/developer/${entity.key}/new`}
          className="rounded-lg bg-accent px-4 py-2 font-medium text-sm text-white"
        >
          + New
        </Link>
      </div>
      {entity.blurb ? <p className="mt-1 text-ink-2 text-sm">{entity.blurb}</p> : null}

      {items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-hairline border-dashed bg-ground-2 px-4 py-10 text-center text-ink-2 text-sm">
          Nothing here yet. Click <strong>+ New</strong> to add the first one.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-hairline rounded-xl border border-hairline bg-ground-2">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/developer/${entity.key}/${item.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-ground-3"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-ink-2 text-xs">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
