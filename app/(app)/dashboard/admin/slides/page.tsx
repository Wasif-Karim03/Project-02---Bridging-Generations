import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Slides · Admin",
  robots: { index: false, follow: false },
};

export default function AdminSlidesPage() {
  return (
    <SectionScaffold
      icon="slides"
      eyebrow="Manage"
      title="Slides"
      description="Manage the rotating hero slides at the top of the homepage — the big images and headlines visitors see first."
      comingSoon={[
        "Add, reorder, and remove homepage slides",
        "Set each slide's image, headline, and button",
        "Preview the slideshow as visitors see it",
      ]}
      ctas={[{ href: "/developer/pages/home", label: "Edit homepage", external: true }]}
    />
  );
}
