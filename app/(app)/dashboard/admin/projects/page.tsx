import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Projects · Admin",
  robots: { index: false, follow: false },
};

export default function AdminProjectsPage() {
  return (
    <SectionScaffold
      icon="projects"
      eyebrow="Manage"
      title="Projects"
      description="Create and manage the projects featured across the site — fundraising goals, photos, and the students each project supports."
      comingSoon={[
        "Add, edit, and archive projects in one place",
        "Track each project's funding goal and progress",
        "Attach photos and link projects to students",
      ]}
      ctas={[{ href: "/keystatic", label: "Edit projects in CMS", external: true }]}
    />
  );
}
