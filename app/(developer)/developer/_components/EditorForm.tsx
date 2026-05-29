"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { Field } from "@/lib/developer/schema";

type RelMap = Record<string, Array<{ slug: string; label: string }>>;

type Props = {
  entityKey: string;
  entityLabel: string;
  entityType: "collection" | "singleton";
  fields: Field[];
  initialValues: Record<string, unknown>;
  relationshipOptions: RelMap;
  slug: string | null;
  isNew: boolean;
  storageMode: "github" | "local";
};

const inputClass =
  "w-full rounded-lg border border-hairline bg-ground-2 px-3 py-2 text-sm outline-none focus:border-accent";

export function EditorForm(props: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(props.initialValues);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function update(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/developer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityKey: props.entityKey,
          slug: props.slug ?? undefined,
          values,
        }),
      });
      const data = (await res.json()) as { error?: string; slug?: string; mode?: string };
      if (!res.ok) {
        setMessage({ kind: "err", text: data.error ?? "Save failed." });
        return;
      }
      const published =
        data.mode === "github"
          ? "Saved. The live site will update in about a minute."
          : "Saved to your local project files.";
      setMessage({ kind: "ok", text: published });
      if (props.isNew && props.entityType === "collection" && data.slug) {
        router.replace(`/developer/${props.entityKey}/${data.slug}`);
        router.refresh();
      }
    } catch {
      setMessage({ kind: "err", text: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {props.fields.map((field) => (
        <FieldControl
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={(v) => update(field.key, v)}
          rel={props.relationshipOptions}
        />
      ))}

      {message ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.kind === "ok" ? "bg-accent/10 text-accent" : "bg-accent-2/10 text-accent-2-text"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <div className="sticky bottom-0 flex gap-3 border-hairline border-t bg-ground py-4">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : props.isNew ? "Create" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Label({ field, htmlFor }: { field: Field; htmlFor?: string }) {
  return (
    <span className="block">
      <label htmlFor={htmlFor} className="font-medium text-sm">
        {field.label}
      </label>
      {field.description ? (
        <span className="mt-0.5 block text-ink-2 text-xs">{field.description}</span>
      ) : null}
    </span>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  rel,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  rel: RelMap;
}) {
  const id = useId();

  switch (field.kind) {
    case "text":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          {field.multiline ? (
            <textarea
              id={id}
              rows={3}
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass}
            />
          ) : (
            <input
              id={id}
              type="text"
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              className={inputClass}
            />
          )}
        </div>
      );

    case "markdown":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <textarea
            id={id}
            rows={10}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Markdown supported: # headings, **bold**, - lists, [links](url)."
            className={`${inputClass} font-mono`}
          />
        </div>
      );

    case "url":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            type="url"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </div>
      );

    case "integer":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            type="number"
            value={value === "" || value == null ? "" : Number(value)}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            className={inputClass}
          />
        </div>
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="size-4"
          />
          <Label field={field} />
        </label>
      );

    case "date":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <input
            id={id}
            type="date"
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </div>
      );

    case "select":
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <select
            id={id}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "relationship": {
      const opts = rel[field.collection] ?? [];
      return (
        <div className="space-y-1.5">
          <Label field={field} htmlFor={id} />
          <select
            id={id}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            <option value="">— none —</option>
            {opts.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-1.5">
          <Label field={field} />
          <div className="flex flex-wrap gap-3 rounded-lg border border-hairline bg-ground-2 p-3">
            {field.options.map((o) => (
              <label key={o.value} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(o.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, o.value]
                        : selected.filter((v) => v !== o.value),
                    )
                  }
                />
                {o.label}
              </label>
            ))}
          </div>
        </div>
      );
    }

    case "image":
      return <ImageControl field={field} value={String(value ?? "")} onChange={onChange} />;

    case "object": {
      const obj = (value ?? {}) as Record<string, unknown>;
      return (
        <fieldset className="space-y-4 rounded-xl border border-hairline bg-ground-2/50 p-4">
          <legend className="px-1 font-medium text-sm">{field.label}</legend>
          {field.description ? <p className="text-ink-2 text-xs">{field.description}</p> : null}
          {field.fields.map((sub) => (
            <FieldControl
              key={sub.key}
              field={sub}
              value={obj[sub.key]}
              onChange={(v) => onChange({ ...obj, [sub.key]: v })}
              rel={rel}
            />
          ))}
        </fieldset>
      );
    }

    case "array": {
      const items = Array.isArray(value) ? (value as unknown[]) : [];
      const blank = emptyValue(field.item);
      return (
        <div className="space-y-3">
          <Label field={field} />
          {items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: array items have no stable id
            <div key={i} className="rounded-xl border border-hairline bg-ground-2 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-ink-2 text-xs">
                  {field.item.label} {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                  className="text-accent-2-text text-xs underline"
                >
                  Remove
                </button>
              </div>
              <FieldControl
                field={{ ...field.item, label: `${field.item.label} ${i + 1}` }}
                value={item}
                onChange={(v) => onChange(items.map((it, j) => (j === i ? v : it)))}
                rel={rel}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange([...items, blank])}
            className="rounded-lg border border-accent border-dashed px-3 py-2 text-accent text-sm"
          >
            + Add {field.item.label.toLowerCase()}
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

function ImageControl({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: "image" }>;
  value: string;
  onChange: (v: unknown) => void;
}) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("dir", field.dir);
      const res = await fetch("/api/developer/upload", { method: "POST", body: form });
      const data = (await res.json()) as { src?: string; error?: string };
      if (!res.ok || !data.src) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      onChange(data.src);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label field={field} htmlFor={id} />
      {value ? (
        // biome-ignore lint/performance/noImgElement: preview of an arbitrary uploaded path; next/image needs configured domains
        <img
          src={value}
          alt=""
          className="max-h-40 rounded-lg border border-hairline object-contain"
        />
      ) : null}
      <input
        id={id}
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
        className="block text-sm"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/…  (filled automatically after upload)"
        className={inputClass}
      />
      {uploading ? <p className="text-ink-2 text-xs">Uploading…</p> : null}
      {error ? <p className="text-accent-2-text text-xs">{error}</p> : null}
    </div>
  );
}

/** A blank value for a freshly-added array item, shaped by its field kind. */
function emptyValue(field: Field): unknown {
  switch (field.kind) {
    case "boolean":
      return false;
    case "integer":
      return "";
    case "multiselect":
      return [];
    case "array":
      return [];
    case "object": {
      const out: Record<string, unknown> = {};
      for (const f of field.fields) out[f.key] = emptyValue(f);
      return out;
    }
    default:
      return "";
  }
}
