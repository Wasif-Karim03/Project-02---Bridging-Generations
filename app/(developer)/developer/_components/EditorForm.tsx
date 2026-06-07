"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
  /**
   * When set, only these top-level fields are rendered. The full `initialValues`
   * are still held in state and posted on save, so fields that aren't shown are
   * preserved in the file rather than wiped. Used by the page-centric editor to
   * surface just the fields relevant to one website page.
   */
  visibleKeys?: string[];
  /** Embedded-in-a-page mode: inline (non-sticky) save bar, "Save" label. */
  embedded?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-hairline bg-ground px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

export function EditorForm(props: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, unknown>>(props.initialValues);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Warn before a tab close / refresh when there are unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function update(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
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
      setDirty(false);
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

  const shownFields = props.visibleKeys
    ? props.fields.filter((f) => props.visibleKeys?.includes(f.key))
    : props.fields;

  return (
    <div className="space-y-6">
      {shownFields.map((field) => (
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

      <div
        className={
          props.embedded
            ? "flex gap-3"
            : "sticky bottom-0 flex gap-3 border-hairline border-t bg-ground py-4"
        }
      >
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 font-medium text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving…" : props.isNew ? "Create" : props.embedded ? "Save" : "Save changes"}
        </button>
        {dirty && !busy ? (
          <span className="self-center text-accent-2-text text-xs">● Unsaved changes</span>
        ) : null}
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

    case "boolean": {
      const on = value === true;
      return (
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-hairline bg-ground px-3 py-2.5">
          <Label field={field} />
          <button
            type="button"
            role="switch"
            aria-checked={on}
            onClick={() => onChange(!on)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              on ? "bg-accent" : "bg-ground-3"
            }`}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                on ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      );
    }

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
          {items.map((item, i) => {
            const move = (to: number) => {
              if (to < 0 || to >= items.length) return;
              const next = [...items];
              const [m] = next.splice(i, 1);
              next.splice(to, 0, m);
              onChange(next);
            };
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: array items have no stable id
              <div key={i} className="rounded-xl border border-hairline bg-ground-2 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-ink-2 text-xs">
                    {field.item.label} {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(i - 1)}
                      disabled={i === 0}
                      title="Move up"
                      className="rounded p-1 text-ink-2 hover:bg-ground-3 hover:text-ink disabled:opacity-30"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                        aria-hidden="true"
                      >
                        <path d="m18 15-6-6-6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i + 1)}
                      disabled={i === items.length - 1}
                      title="Move down"
                      className="rounded p-1 text-ink-2 hover:bg-ground-3 hover:text-ink disabled:opacity-30"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3.5"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(items.filter((_, j) => j !== i))}
                      className="ml-1 text-accent-2-text text-xs underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <FieldControl
                  field={{ ...field.item, label: `${field.item.label} ${i + 1}` }}
                  value={item}
                  onChange={(v) => onChange(items.map((it, j) => (j === i ? v : it)))}
                  rel={rel}
                />
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => onChange([...items, blank])}
            className="rounded-lg border border-accent border-dashed px-3 py-2 text-accent text-sm transition-colors hover:bg-accent/5"
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
  const [dragOver, setDragOver] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image file.");
      return;
    }
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

  const fileName = value ? value.split("/").pop() : null;

  return (
    <div className="space-y-2">
      <Label field={field} />

      {value ? (
        <div className="flex items-start gap-3 rounded-xl border border-hairline bg-ground p-3">
          {/* biome-ignore lint/performance/noImgElement: arbitrary uploaded path; next/image needs configured domains */}
          <img
            src={value}
            alt=""
            className="size-24 shrink-0 rounded-lg border border-hairline bg-ground-3 object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{fileName}</p>
            <p className="mt-0.5 break-all text-ink-2 text-xs">{value}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label
                htmlFor={id}
                className="cursor-pointer rounded-lg border border-hairline px-3 py-1.5 font-medium text-sm transition-colors hover:border-accent hover:text-accent"
              >
                {uploading ? "Uploading…" : "Replace"}
              </label>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-ink-2 text-sm underline underline-offset-4 hover:text-ink"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          className={`flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-center transition-colors ${
            dragOver
              ? "border-accent bg-accent/5 text-accent"
              : "border-hairline bg-ground text-ink-2 hover:border-accent hover:text-ink"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="M12 3v12" />
            <path d="m7 8 5-5 5 5" />
            <path d="M5 21h14" />
          </svg>
          <span className="font-medium text-sm">
            {uploading ? "Uploading…" : "Click or drag an image here"}
          </span>
          <span className="text-xs">JPG, PNG, or WebP · max 8MB</span>
        </label>
      )}

      <input
        id={id}
        type="file"
        accept="image/*"
        disabled={uploading}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
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
