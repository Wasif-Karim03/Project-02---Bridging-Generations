import { collection, fields } from "@keystatic/core";
import { optionalImageWithAlt, requiredImageWithAlt } from "../fields";

// Spec categories: success stories / recent activities / event news.
// "All" is a derived UI filter, not a category value.
export const BLOG_CATEGORY_OPTIONS = [
  { label: "Success story", value: "success-story" },
  { label: "Recent activity", value: "recent-activity" },
  { label: "Event news", value: "event-news" },
] as const;

export type BlogCategory = (typeof BLOG_CATEGORY_OPTIONS)[number]["value"];

export const blogPostCollection = collection({
  label: "Blog posts",
  path: "content/blog-posts/*/",
  slugField: "title",
  format: { contentField: "body" },
  columns: ["publishedAt", "published"],
  schema: {
    title: fields.slug({
      name: { label: "Title (English)", validation: { isRequired: true, length: { min: 1 } } },
      slug: { label: "Slug", description: "URL: /blog/<slug>" },
    }),
    titleBn: fields.text({
      label: "Title (Bengali)",
      description: "Optional. Shown when locale is Bengali. Falls back to English when empty.",
    }),
    excerpt: fields.text({
      label: "Excerpt (English)",
      description: "Up to 280 characters — used on cards and as default meta description.",
      multiline: true,
      validation: { isRequired: true, length: { min: 1, max: 280 } },
    }),
    excerptBn: fields.text({
      label: "Excerpt (Bengali)",
      description: "Optional. Falls back to English when empty.",
      multiline: true,
    }),
    body: fields.mdx({
      label: "Body (English)",
      options: { image: { directory: "public/images/blog", publicPath: "/images/blog/" } },
    }),
    bodyBn: fields.text({
      label: "Body (Bengali) — optional",
      description:
        "Plain markdown supported (headings, bold, links). The English body remains the canonical body when this is empty.",
      multiline: true,
    }),
    coverImage: requiredImageWithAlt({ label: "Cover image", dir: "blog" }),
    coverMobileFocalPoint: fields.object(
      {
        x: fields.integer({
          label: "X (0–100)",
          description: "Horizontal focal point as a percentage. 50 = center.",
          defaultValue: 50,
          validation: { isRequired: false, min: 0, max: 100 },
        }),
        y: fields.integer({
          label: "Y (0–100)",
          description: "Vertical focal point as a percentage. 30 = upper third.",
          defaultValue: 30,
          validation: { isRequired: false, min: 0, max: 100 },
        }),
      },
      {
        label: "Cover image — mobile focal point",
        description:
          "Drives object-position on the cover at <640px viewports. Defaults to {x:50, y:30}.",
      },
    ),
    category: fields.select({
      label: "Category",
      description: "Drives the filter chips on /blog.",
      options: BLOG_CATEGORY_OPTIONS,
      defaultValue: "recent-activity",
    }),
    author: fields.relationship({ label: "Author", collection: "boardMember" }),
    published: fields.checkbox({
      label: "Published",
      description: "Draft gate. Off keeps the post out of the public site.",
      defaultValue: false,
    }),
    publishedAt: fields.date({
      label: "Published on",
      validation: { isRequired: true },
    }),
    featured: fields.checkbox({
      label: "Featured",
      description: "Pin to top of /blog. Only one post should be featured at a time.",
      defaultValue: false,
    }),
    dropcap: fields.checkbox({
      label: "Drop cap on first paragraph",
      description: "Magazine-style oversized first letter on the opening paragraph of the body.",
      defaultValue: false,
    }),
    tags: fields.array(fields.text({ label: "Tag" }), {
      label: "Tags",
      itemLabel: (props) => props.value || "Tag",
    }),
    metaTitle: fields.text({
      label: "Meta title (SEO override)",
      description: "Falls back to title when empty.",
    }),
    metaDescription: fields.text({
      label: "Meta description (SEO override)",
      description: "Falls back to excerpt when empty.",
      multiline: true,
    }),
    ogImageOverride: optionalImageWithAlt({
      label: "OG image override",
      dir: "blog",
    }),
  },
});
