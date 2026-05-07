import Link from "next/link";

type DonateAfterNoteProps = {
  note: string;
};

export function DonateAfterNote({ note }: DonateAfterNoteProps) {
  if (!note.trim()) return null;
  return (
    <section
      aria-labelledby="donate-after-title"
      className="bg-ground-3 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
    >
      <div className="mx-auto flex max-w-[900px] flex-col gap-3 text-body text-ink-2">
        <h2 id="donate-after-title" className="text-eyebrow uppercase tracking-[0.1em] text-accent">
          After you give
        </h2>
        <p className="text-balance whitespace-pre-line">{note}</p>
        <p>
          Still have questions?{" "}
          <Link
            href="/contact"
            className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
          >
            Contact the board
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
