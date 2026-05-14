export type FooterLink = {
  label: string;
  href: string;
  labelKey?: string; // Translation key under footer.links.* — see messages/{en,bn}.json.
};

// Footer follows the spec's 3-column structure:
//   1. Head Office — phone, email(s), physical address
//   2. About — Recent Activities, Success Stories, other "about the work" links
//   3. Others — Terms / Legal
// bKash logo + copyright sit in a row below the columns.
export const footerContent = {
  brand: {
    name: "Bridging Generations",
  },
  // "About" column — links that explain the org's work.
  about: [
    { label: "About Us", labelKey: "aboutUs", href: "/about" },
    { label: "Our Mission and Our Vision", labelKey: "missionVision", href: "/mission-vision" },
    { label: "Recent Activities", labelKey: "recentActivities", href: "/activities" },
    { label: "Success Stories", labelKey: "successStories", href: "/success-stories" },
    { label: "Projects", labelKey: "projects", href: "/projects" },
    { label: "Students", labelKey: "students", href: "/students" },
    { label: "Mentors", labelKey: "mentors", href: "/mentors" },
  ] satisfies FooterLink[],
  // "Others" column — legal / supporting.
  others: [
    { label: "Terms and Conditions", labelKey: "termsAndConditions", href: "/terms" },
    { label: "Donors", labelKey: "donors", href: "/donors" },
    { label: "Testimonial", labelKey: "testimonial", href: "/testimonials" },
    { label: "Blog", labelKey: "blog", href: "/blog" },
    { label: "Gallery", labelKey: "gallery", href: "/gallery" },
    { label: "Contact", labelKey: "contact", href: "/contact" },
  ] satisfies FooterLink[],
  copyrightNote: "Bridging Generations is a registered 501(c)(3) nonprofit.",
};
