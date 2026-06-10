import type { Metadata } from "next";
import { listDedicatedGalleryImages } from "@/lib/db/queries/gallery";
import { PageHeader } from "../_components/SectionScaffold";
import { deleteGalleryImageAction } from "./actions";
import { GalleryUploader } from "./_components/GalleryUploader";

export const metadata: Metadata = {
  title: "Gallery · Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await listDedicatedGalleryImages();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Manage"
        title="Gallery"
        description="Upload photos for the public gallery and tag each one so visitors can filter. Photos from your projects and blog posts appear in the gallery automatically — you don't need to re-upload them here."
      />

      <GalleryUploader />

      <section className="flex flex-col gap-3">
        <h2 className="text-heading-5 text-ink">Uploaded photos ({images.length})</h2>
        {images.length === 0 ? (
          <p className="rounded-xl border border-hairline bg-ground-2 px-5 py-8 text-center text-body text-ink-2">
            No gallery photos yet. Upload some above.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img) => (
              <li key={img.id} className="relative overflow-hidden rounded-lg border border-hairline">
                {/* biome-ignore lint/performance/noImgElement: CDN-hosted gallery URL */}
                <img src={img.url} alt={img.caption ?? ""} className="aspect-square w-full object-cover" />
                <span className="absolute left-1 top-1 rounded-md bg-ink/75 px-2 py-0.5 text-meta uppercase text-white">
                  {img.tag}
                </span>
                <form action={deleteGalleryImageAction} className="absolute right-1 top-1">
                  <input type="hidden" name="id" value={img.id} />
                  <button
                    type="submit"
                    aria-label="Delete photo"
                    className="rounded-md bg-ink/75 px-2 py-1 text-meta uppercase text-white hover:bg-red-700"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
