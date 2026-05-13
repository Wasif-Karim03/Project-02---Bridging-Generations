"use client";

type ProfilePrivacyToggleProps = {
  value: "public" | "anonymous";
  onChange: (val: "public" | "anonymous") => void;
};

export function ProfilePrivacyToggle({ value, onChange }: ProfilePrivacyToggleProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-body-sm font-medium text-ink">Profile visibility</legend>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        {(["public", "anonymous"] as const).map((opt) => {
          const id = `visibility-${opt}`;
          const checked = value === opt;
          return (
            <label
              key={opt}
              htmlFor={id}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors ${
                checked
                  ? "border-accent bg-ground-2 text-ink"
                  : "border-hairline bg-ground text-ink-2 hover:border-accent/40"
              }`}
            >
              <input
                id={id}
                type="radio"
                name="visibility"
                value={opt}
                checked={checked}
                onChange={() => onChange(opt)}
                className="accent-accent"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-body-sm font-medium capitalize">{opt}</span>
                <span className="text-meta text-ink-2">
                  {opt === "public"
                    ? "Your name and photo appear on your donor page."
                    : "Your profile exists but your name and photo are hidden."}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
