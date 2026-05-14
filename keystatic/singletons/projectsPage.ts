import { fields, singleton } from "@keystatic/core";

// Singleton for the /projects page chrome: rules & regulations block and the
// teacher-panel intro copy. Teacher entries live in their own collection.
export const projectsPageSingleton = singleton({
  label: "Projects page",
  path: "content/projects-page/",
  schema: {
    rulesIntro: fields.text({
      label: "Project rules — intro",
      multiline: true,
      defaultValue:
        "These rules govern how scholarship applications are reviewed, what a recipient must do to stay in the program, and what triggers revocation.",
    }),
    rulesBody: fields.mdx({
      label: "Project rules — body",
      description: "Markdown supported. Update whenever policy changes.",
      options: {
        image: {
          directory: "public/images/projects-page",
          publicPath: "/images/projects-page/",
        },
      },
    }),
    teachersEyebrow: fields.text({
      label: "Teachers eyebrow",
      defaultValue: "Teachers",
    }),
    teachersHeadline: fields.text({
      label: "Teachers headline",
      defaultValue: "The teachers carrying our students through.",
    }),
    teachersIntro: fields.text({
      label: "Teachers intro",
      multiline: true,
      defaultValue:
        "Every Bridging Generations scholarship is taught by a real classroom teacher. Meet the people guiding our students day to day.",
    }),
  },
});
