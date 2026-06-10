import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Pages · Admin",
  robots: { index: false, follow: false },
};

export default function AdminPagesPage() {
  return (
    <SectionScaffold
      icon="pages"
      eyebrow="Manage"
      title="Pages"
      description="Edit the words and images on every page of the public website — Home, About, Mission, Contact, and more."
      comingSoon={[
        "Edit page headlines, body text, and images",
        "Preview changes before they go live",
        "See which pages were updated most recently",
      ]}
      ctas={[{ href: "/developer", label: "Open site editor", external: true }]}
    />
  );
}
