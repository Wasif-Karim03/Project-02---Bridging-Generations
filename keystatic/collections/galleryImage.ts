import { collection, fields } from "@keystatic/core";
import { requiredImageWithAlt } from "../fields";

// Spec gallery categories: All / Humanity / Activities / Projects / Students / Publication.
// "All" is a derived UI filter, not a category value.
export const GALLERY_CATEGORY_OPTIONS = [
  { label: "Humanity", value: "humanity" },
  { label: "Activities", value: "activities" },
  { label: "Projects", value: "projects" },
  { label: "Students", value: "students" },
  { label: "Publication", value: "publication" },
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORY_OPTIONS)[number]["value"];

export const galleryImageCollection = collection({
  label: "Gallery images",
  path: "content/gallery/*/",
  slugField: "caption",
  columns: ["takenAt", "location"],
  schema: {
    caption: fields.slug({
      name: {
        label: "Caption (also used as slug)",
        validation: { isRequired: true, length: { min: 1 } },
      },
      slug: { label: "Slug" },
    }),
    image: requiredImageWithAlt({ label: "Image", dir: "gallery" }),
    width: fields.integer({
      label: "Width (pixels)",
      description:
        "Intrinsic pixel width of the image. Needed so next/image can reserve layout space.",
      validation: { isRequired: true, min: 1 },
    }),
    height: fields.integer({
      label: "Height (pixels)",
      description: "Intrinsic pixel height of the image.",
      validation: { isRequired: true, min: 1 },
    }),
    category: fields.select({
      label: "Category",
      description:
        "Filter tab on the homepage gallery grid and /gallery. Editors pick exactly one.",
      options: GALLERY_CATEGORY_OPTIONS,
      defaultValue: "activities",
    }),
    takenAt: fields.date({ label: "Taken on" }),
    location: fields.text({ label: "Location" }),
    photographerCredit: fields.text({
      label: "Photographer credit",
      description: "Optional. Shown alongside location and year in caption + lightbox.",
    }),
  },
});
