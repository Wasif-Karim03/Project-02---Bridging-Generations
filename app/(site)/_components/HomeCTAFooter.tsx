import { getTranslations } from "next-intl/server";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { Reveal } from "@/components/ui/Reveal";

export async function HomeCTAFooter() {
  const t = await getTranslations("homeExtra");
  return (
    <Reveal stagger="up">
      <CTAFooterPanel
        headline={t("ctaHeadline")}
        body={t("ctaBody")}
        ctaLabel={t("ctaLabel")}
        ctaHref="/be-a-donor"
        secondaryCtaLabel={t("ctaSecondaryLabel")}
        secondaryCtaHref="/student-signup"
        tone="cream"
        titleId="home-cta-footer-title"
        id="join"
      />
    </Reveal>
  );
}
