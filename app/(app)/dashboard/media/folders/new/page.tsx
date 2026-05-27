import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { requireRole } from "@/lib/auth";
import { NewFolderForm } from "./_components/NewFolderForm";

export const metadata: Metadata = {
  title: "New media folder",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewFolderPage() {
  await requireRole("media");
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Eyebrow>Media · New folder</Eyebrow>
        <h1 className="text-balance text-heading-1 text-ink">Create a folder.</h1>
        <p className="max-w-[60ch] text-body text-ink-2">
          One folder per event or project. You'll add images and links inside after creation.
        </p>
      </header>
      <div className="max-w-[640px]">
        <NewFolderForm />
      </div>
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        <Link
          href="/dashboard/media"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          ← Back to folders
        </Link>
      </p>
    </div>
  );
}
