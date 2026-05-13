import "server-only";

export type GiftContext = {
  amount?: string;
  designation?: string;
  firstName?: string;
};

const ALLOWED_DESIGNATIONS = new Set(["tuition", "books", "meals", "materials", "general"]);

function sanitizeAmount(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!/^\d{1,5}$/.test(trimmed)) return undefined;
  const n = Number(trimmed);
  if (n < 1 || n > 100000) return undefined;
  return trimmed;
}

function sanitizeName(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > 40) return undefined;
  if (!/^[\p{L}\p{M}'\- ]+$/u.test(trimmed)) return undefined;
  return trimmed;
}

function sanitizeDesignation(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const lowered = raw.trim().toLowerCase();
  if (!ALLOWED_DESIGNATIONS.has(lowered)) return undefined;
  return lowered;
}

/**
 * Resolve the gift context for the thank-you page. Today the only source is
 * URL search params (intent-only — no PII storage). The exported function name
 * is the **seam**: a future webhook integration can replace this implementation
 * without touching the consumer.
 */
export async function getGiftContext(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<GiftContext | null> {
  const first = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const amount = sanitizeAmount(first("amount"));
  const designation = sanitizeDesignation(first("designation"));
  const firstName = sanitizeName(first("firstName"));

  if (!amount && !designation && !firstName) return null;
  return { amount, designation, firstName };
}

const DESIGNATION_COPY: Record<string, string> = {
  tuition: "tuition for one student",
  books: "books and learning materials",
  meals: "daily meals",
  materials: "school supplies",
  general: "the program where it's needed most",
};

type ThankYouPersonalizationProps = {
  context: GiftContext | null;
};

export function ThankYouPersonalization({ context }: ThankYouPersonalizationProps) {
  if (!context) return null;

  const { amount, designation, firstName } = context;
  const designationCopy = designation ? DESIGNATION_COPY[designation] : undefined;

  return (
    <p className="max-w-[60ch] text-body-lg text-ink" data-testid="thank-you-personalization">
      {firstName ? `Thank you, ${firstName} — ` : "Thank you — "}
      {amount ? (
        <>
          your <strong className="font-semibold">${amount}</strong>{" "}
        </>
      ) : (
        "your gift "
      )}
      {designationCopy
        ? `funds ${designationCopy} in the Chittagong Hill Tracts.`
        : "keeps a student in the classroom this term."}
    </p>
  );
}
