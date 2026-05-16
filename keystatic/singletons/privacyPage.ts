import { fields, singleton } from "@keystatic/core";

export const privacyPageSingleton = singleton({
  label: "Privacy page",
  path: "content/privacy-page/",
  format: { contentField: "body" },
  schema: {
    body: fields.mdx({
      label: "Privacy policy body",
      options: { image: { directory: "public/images/privacy", publicPath: "/images/privacy/" } },
    }),
    lastUpdated: fields.date({
      label: "Last updated",
      validation: { isRequired: true },
    }),
  },
});
