export function ConsentStatement() {
  return (
    <section
      aria-labelledby="students-consent-title"
      className="bg-ground-3 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3">
        <h2 id="students-consent-title" className="text-heading-5 uppercase tracking-wide text-ink">
          A note on photos
        </h2>
        <p className="max-w-[72ch] text-body-sm text-ink-2">
          We publish a student&rsquo;s portrait only when their family has signed a written release
          that names this website specifically. Where that release is missing, pending, or
          withdrawn, you&rsquo;ll see a neutral illustrated placeholder in its place. Families can
          revoke consent at any time; the next deploy removes the photo.
        </p>
      </div>
    </section>
  );
}
