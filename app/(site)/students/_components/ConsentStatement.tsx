import { getTranslations } from "next-intl/server";

export async function ConsentStatement() {
  const tx = await getTranslations("studentsPageExtra");
  return (
    <section
      aria-labelledby="students-consent-title"
      className="bg-ground-3 px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3">
        <h2 id="students-consent-title" className="text-heading-5 uppercase tracking-wide text-ink">
          {tx("consentTitle")}
        </h2>
        <p className="max-w-[72ch] text-body-sm text-ink-2">{tx("consentBody")}</p>
      </div>
    </section>
  );
}
