export type FooterLink = { label: string; href: string };

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
    { label: "About Us", href: "/about" },
    { label: "Our Mission and Our Vision", href: "/mission-vision" },
    { label: "Recent Activities", href: "/activities" },
    { label: "Success Stories", href: "/success-stories" },
    { label: "Projects", href: "/projects" },
    { label: "Students", href: "/students" },
    { label: "Mentors", href: "/mentors" },
  ] satisfies FooterLink[],
  // "Others" column — legal / supporting.
  others: [
    { label: "Terms and Conditions", href: "/terms" },
    { label: "Donors", href: "/donors" },
    { label: "Testimonial", href: "/testimonials" },
    { label: "Blog", href: "/blog" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ] satisfies FooterLink[],
  copyrightNote: "Bridging Generations is a registered 501(c)(3) nonprofit.",
};
