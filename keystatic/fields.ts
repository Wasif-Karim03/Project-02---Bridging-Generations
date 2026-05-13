import { fields } from "@keystatic/core";

const ALT_HELP =
  'Describe the image for screen readers and low-bandwidth users. Be specific. Do not start with "Image of...".';

export function requiredImageWithAlt({ label, dir }: { label: string; dir: string }) {
  return fields.object(
    {
      src: fields.image({
        label: `${label} — file`,
        directory: `public/images/${dir}`,
        publicPath: `/images/${dir}/`,
        validation: { isRequired: true },
      }),
      alt: fields.text({
        label: `${label} — alt text`,
        description: ALT_HELP,
        validation: { isRequired: true, length: { min: 1 } },
      }),
    },
    { label },
  );
}

export function optionalImageWithAlt({ label, dir }: { label: string; dir: string }) {
  return fields.object(
    {
      src: fields.image({
        label: `${label} — file`,
        directory: `public/images/${dir}`,
        publicPath: `/images/${dir}/`,
      }),
      alt: fields.text({
        label: `${label} — alt text`,
        description: ALT_HELP,
      }),
    },
    { label },
  );
}
