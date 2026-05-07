import { fields, singleton } from "@keystatic/core";

export const termsPageSingleton = singleton({
  label: "Terms page",
  path: "content/terms-page/",
  format: { contentField: "body" },
  schema: {
    body: fields.mdx({
      label: "Terms body",
      options: { image: { directory: "public/images/terms", publicPath: "/images/terms/" } },
    }),
    lastUpdated: fields.date({
      label: "Last updated",
      validation: { isRequired: true },
    }),
  },
});
