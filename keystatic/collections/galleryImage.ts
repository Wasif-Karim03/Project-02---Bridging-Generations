import { collection, fields } from "@keystatic/core";
import { requiredImageWithAlt } from "../fields";

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
    takenAt: fields.date({ label: "Taken on" }),
    location: fields.text({ label: "Location" }),
    photographerCredit: fields.text({
      label: "Photographer credit",
      description: "Optional. Shown alongside location and year in caption + lightbox.",
    }),
  },
});
