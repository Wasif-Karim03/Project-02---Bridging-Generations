import { fields, singleton } from "@keystatic/core";

// Hero images that were previously hardcoded into page components. Stored as
// plain path strings (e.g. "/home-hero.jpg" or "/images/site/foo.jpg") so they
// work both for the existing files at the public root and for new uploads the
// /developer editor writes under public/images/site/. The owner edits these via
// the editor's image-upload control.
export const pageMediaSingleton = singleton({
  label: "Page hero images",
  path: "content/page-media/",
  schema: {
    homeSlide1Image: fields.text({
      label: "Home — hero slide 1 image",
      defaultValue: "/home-hero.jpg",
    }),
    homeSlide2Image: fields.text({
      label: "Home — hero slide 2 image",
      defaultValue: "/activity-visit.jpg",
    }),
    homeSlide3Image: fields.text({
      label: "Home — hero slide 3 image",
      defaultValue: "/home-mission.jpg",
    }),
    aboutHeroImage: fields.text({
      label: "About page — hero image",
      defaultValue: "/home-mission.jpg",
    }),
    mentorsHeroImage: fields.text({
      label: "Mentors page — hero image",
      defaultValue: "/activity-visit.jpg",
    }),
    missionVisionHeroImage: fields.text({
      label: "Mission & Vision page — hero image",
      defaultValue: "/home-mission.jpg",
    }),
    donationJourneyHeroImage: fields.text({
      label: "Donation journey page — hero image",
      defaultValue: "/donors-hero.jpg",
    }),
    scholarshipsHeroImage: fields.text({
      label: "Scholarships page — hero image",
      defaultValue: "/project-scholarship.jpg",
    }),
  },
});
