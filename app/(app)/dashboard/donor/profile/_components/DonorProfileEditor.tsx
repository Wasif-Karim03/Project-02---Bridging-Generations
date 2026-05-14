"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { saveDonorProfileAction } from "../actions";

type DonorProfile = {
  legalName: string;
  publicInitials: string;
  anonymous: boolean;
  dedicationText: string;
  photoUrl: string;
};

type DonorProfileEditorProps = {
  initial: DonorProfile;
};

// Editor for the donor's public-facing profile. Calls the server action,
// which writes to donor_profiles via Drizzle when DATABASE_URL is set, or
// returns a success no-op in preview mode (still keeping the form usable).
export function DonorProfileEditor({ initial }: DonorProfileEditorProps) {
  const [profile, setProfile] = useState<DonorProfile>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await saveDonorProfileAction(profile);
      if (result.status === "success") {
        setSavedAt(new Date());
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("[donor/profile] save failed", err);
      setError("Could not save right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Legal name (private — never shown publicly)">
        {(args) => (
          <Input
            {...args}
            value={profile.legalName}
            onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
            maxLength={200}
            placeholder="e.g. Jane Q. Donor"
          />
        )}
      </Field>

      <Field label="Public initials (shown on /donors if you go anonymous)">
        {(args) => (
          <Input
            {...args}
            value={profile.publicInitials}
            onChange={(e) =>
              setProfile({ ...profile, publicInitials: e.target.value.toUpperCase().slice(0, 8) })
            }
            maxLength={8}
            placeholder="e.g. J.D."
          />
        )}
      </Field>

      <label className="flex items-start gap-3 border border-hairline bg-ground-2 p-4">
        <input
          type="checkbox"
          checked={profile.anonymous}
          onChange={(e) => setProfile({ ...profile, anonymous: e.target.checked })}
          className="mt-1 size-5"
        />
        <div className="flex flex-col gap-1">
          <span className="text-body-sm font-semibold text-ink">Stay anonymous on /donors</span>
          <span className="text-meta text-ink-2">
            When checked, only your initials appear on the public donor wall. Recommended for most
            donors.
          </span>
        </div>
      </label>

      <Field label="Dedication line (optional — shown on /donors)">
        {(args) => (
          <Textarea
            {...args}
            value={profile.dedicationText}
            onChange={(e) =>
              setProfile({ ...profile, dedicationText: e.target.value.slice(0, 280) })
            }
            rows={3}
            maxLength={280}
            placeholder="e.g. In honour of my mother, a teacher for 40 years."
          />
        )}
      </Field>

      <Field label="Profile photo URL (optional)">
        {(args) => (
          <Input
            {...args}
            value={profile.photoUrl}
            onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })}
            placeholder="https://… (Vercel Blob upload coming in Phase 5)"
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {savedAt ? (
          <span className="text-meta uppercase tracking-[0.06em] text-accent">Saved.</span>
        ) : null}
        {error ? (
          <span role="alert" className="text-meta text-accent-2-text">
            {error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
