"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { submitGiveForm } from "../actions";
import { type GiveActionState, initialGiveState } from "../actions.types";

const COUNTRY_CODES = [
  { code: "+880", label: "🇧🇩 +880 (Bangladesh)" },
  { code: "+1", label: "🇺🇸 +1 (USA / Canada)" },
  { code: "+44", label: "🇬🇧 +44 (UK)" },
  { code: "+61", label: "🇦🇺 +61 (Australia)" },
  { code: "+49", label: "🇩🇪 +49 (Germany)" },
  { code: "+33", label: "🇫🇷 +33 (France)" },
  { code: "+39", label: "🇮🇹 +39 (Italy)" },
  { code: "+34", label: "🇪🇸 +34 (Spain)" },
  { code: "+31", label: "🇳🇱 +31 (Netherlands)" },
  { code: "+46", label: "🇸🇪 +46 (Sweden)" },
  { code: "+47", label: "🇳🇴 +47 (Norway)" },
  { code: "+45", label: "🇩🇰 +45 (Denmark)" },
  { code: "+358", label: "🇫🇮 +358 (Finland)" },
  { code: "+41", label: "🇨🇭 +41 (Switzerland)" },
  { code: "+43", label: "🇦🇹 +43 (Austria)" },
  { code: "+32", label: "🇧🇪 +32 (Belgium)" },
  { code: "+351", label: "🇵🇹 +351 (Portugal)" },
  { code: "+48", label: "🇵🇱 +48 (Poland)" },
  { code: "+81", label: "🇯🇵 +81 (Japan)" },
  { code: "+82", label: "🇰🇷 +82 (South Korea)" },
  { code: "+86", label: "🇨🇳 +86 (China)" },
  { code: "+91", label: "🇮🇳 +91 (India)" },
  { code: "+92", label: "🇵🇰 +92 (Pakistan)" },
  { code: "+94", label: "🇱🇰 +94 (Sri Lanka)" },
  { code: "+66", label: "🇹🇭 +66 (Thailand)" },
  { code: "+60", label: "🇲🇾 +60 (Malaysia)" },
  { code: "+65", label: "🇸🇬 +65 (Singapore)" },
  { code: "+62", label: "🇮🇩 +62 (Indonesia)" },
  { code: "+63", label: "🇵🇭 +63 (Philippines)" },
  { code: "+84", label: "🇻🇳 +84 (Vietnam)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+966", label: "🇸🇦 +966 (Saudi Arabia)" },
  { code: "+974", label: "🇶🇦 +974 (Qatar)" },
  { code: "+965", label: "🇰🇼 +965 (Kuwait)" },
  { code: "+20", label: "🇪🇬 +20 (Egypt)" },
  { code: "+27", label: "🇿🇦 +27 (South Africa)" },
  { code: "+55", label: "🇧🇷 +55 (Brazil)" },
  { code: "+52", label: "🇲🇽 +52 (Mexico)" },
  { code: "+64", label: "🇳🇿 +64 (New Zealand)" },
];

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bolivia",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Maldives",
  "Malta",
  "Mexico",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const selectClass =
  "border border-hairline bg-ground-2 px-4 py-3 text-body text-ink focus:border-accent focus:outline-none w-full";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" variant="primary" disabled={pending} className="min-h-[48px] w-full">
      {pending ? "Submitting…" : "Create profile & continue to donate"}
    </Button>
  );
}

export function DonorProfileForm() {
  const [state, formAction, pending] = useActionState<GiveActionState, FormData>(
    submitGiveForm,
    initialGiveState,
  );

  const [visibility, setVisibility] = useState<"public" | "anonymous">("public");

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4 bg-ground-2 p-8">
        <h2 className="text-heading-4 text-ink">Profile submitted.</h2>
        <p className="text-body text-ink-2">{state.message}</p>
        <Button variant="primary" href="/donate">
          Continue to donate
        </Button>
      </div>
    );
  }

  const fieldErrors = state.fieldErrors ?? {};
  const errorKeys = Object.keys(fieldErrors);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6" aria-busy={pending}>
      {state.status === "error" ? (
        <div role="alert" className="flex flex-col gap-2 border border-accent-2 p-4 text-body">
          <p className="text-ink">{state.message}</p>
          {errorKeys.length > 0 ? (
            <ul className="list-disc pl-6 text-ink-2">
              {errorKeys.map((k) => (
                <li key={k}>{fieldErrors[k as keyof typeof fieldErrors]}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Full name */}
      <Field label="Full name" error={fieldErrors.name}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="name"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            required
            placeholder="Your full name"
          />
        )}
      </Field>

      {/* Address */}
      <Field label="Address" error={fieldErrors.address}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="address"
            type="text"
            autoComplete="street-address"
            enterKeyHint="next"
            required
            placeholder="Street address, city, state / province"
          />
        )}
      </Field>

      {/* Email */}
      <Field label="Email" error={fieldErrors.email}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCorrect="off"
            autoCapitalize="off"
            enterKeyHint="next"
            required
            placeholder="you@example.com"
          />
        )}
      </Field>

      {/* Phone with country code */}
      <Field label="Phone number" error={fieldErrors.phone}>
        {(fieldProps) => (
          <div className="flex gap-2">
            <select
              name="countryCode"
              defaultValue="+880"
              className="shrink-0 border border-hairline bg-ground-2 px-3 py-3 text-body text-ink focus:border-accent focus:outline-none"
              style={{ minWidth: "10rem" }}
            >
              {COUNTRY_CODES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
            <Input
              {...fieldProps}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              enterKeyHint="next"
              required
              placeholder="Phone number"
              className="w-full"
            />
          </div>
        )}
      </Field>

      {/* Country */}
      <Field label="Country" error={fieldErrors.country}>
        {(fieldProps) => (
          <select {...fieldProps} name="country" defaultValue="" className={selectClass}>
            <option value="" disabled>
              Select your country
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </Field>

      {/* Visibility preference */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-body-sm font-medium text-ink">
          Would you like your profile to be visible publicly?
        </legend>
        <div className="flex gap-6 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="accent-accent"
            />
            Yes, show my profile
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-body text-ink">
            <input
              type="radio"
              name="visibility"
              value="anonymous"
              checked={visibility === "anonymous"}
              onChange={() => setVisibility("anonymous")}
              className="accent-accent"
            />
            No, keep me anonymous
          </label>
        </div>
      </fieldset>

      {/* Honeypot */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="give-company">
          Company
          <input
            id="give-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <p className="text-meta text-ink-2">
        Your information is used solely to process your donation. We will never share or sell your
        details.
      </p>

      <SubmitButton pending={pending} />

      <p className="text-meta text-ink-2">
        Prefer to donate without a profile?{" "}
        <a href="/donate" className="underline hover:text-ink">
          Skip and donate directly.
        </a>
      </p>
    </form>
  );
}
