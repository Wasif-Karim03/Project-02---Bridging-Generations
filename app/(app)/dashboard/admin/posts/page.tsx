import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Posts · Admin",
  robots: { index: false, follow: false },
};

export default function AdminPostsPage() {
  return (
    <SectionScaffold
      icon="post"
      eyebrow="Manage"
      title="Posts"
      description="Write and publish blog posts and news updates that appear on the public site."
      comingSoon={[
        "Write, edit, and publish blog posts",
        "Add a cover image and summary to each post",
        "Save drafts and schedule what goes live",
      ]}
      ctas={[{ href: "/keystatic", label: "Write a post in CMS", external: true }]}
    />
  );
}
