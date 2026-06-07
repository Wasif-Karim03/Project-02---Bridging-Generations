import Link from "next/link";
import { redirect } from "next/navigation";
import { listMediaImages } from "@/lib/developer/media";
import { isAuthenticated } from "@/lib/developer/session";
import { MediaGrid } from "../_components/MediaGrid";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  if (!(await isAuthenticated())) redirect("/developer");
  const groups = await listMediaImages();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/developer" className="text-ink-2 text-sm hover:text-ink">
        ← All pages
      </Link>
      <h1 className="mt-3 font-semibold text-2xl">Media library</h1>
      <p className="mt-1 text-ink-2 text-sm">
        Every photo you've uploaded, grouped by where it's used. Click an image to copy its path, or
        use the trash icon to delete it.
      </p>
      <div className="mt-8">
        <MediaGrid groups={groups} />
      </div>
    </main>
  );
}
