import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Gallery · Admin",
  robots: { index: false, follow: false },
};

export default function AdminGalleryPage() {
  return (
    <SectionScaffold
      icon="gallery"
      eyebrow="Manage"
      title="Gallery"
      description="Upload and organize the photos shown in the public gallery and across the site."
      comingSoon={[
        "Upload new photos and add captions",
        "Reorder and remove gallery images",
        "Reuse images anywhere on the site",
      ]}
      ctas={[{ href: "/developer/media", label: "Open media library", external: true }]}
    />
  );
}
