import type { Metadata } from "next";
import { SectionScaffold } from "../_components/SectionScaffold";

export const metadata: Metadata = {
  title: "Settings · Admin",
  robots: { index: false, follow: false },
};

export default function AdminSettingsPage() {
  return (
    <SectionScaffold
      icon="settings"
      eyebrow="Manage"
      title="Settings"
      description="Site-wide settings — organization name, contact details, social links, and the numbers shown on the homepage."
      comingSoon={[
        "Update organization name and contact info",
        "Manage social media links",
        "Edit the headline stats shown on the homepage",
      ]}
      ctas={[{ href: "/developer", label: "Open site editor", external: true }]}
    />
  );
}
