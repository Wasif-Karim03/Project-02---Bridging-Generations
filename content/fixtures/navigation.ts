export type NavItem = {
  href: string;
  label: string;
};

export type NavDropdownItem = NavItem & {
  description?: string;
};

export type PrimaryNavItem =
  | NavItem
  | (NavItem & { dropdown: NavDropdownItem[] });

// Spec navigation order (top navbar):
// Home, About BG (dropdown), Students, Projects, Testimonial, Blog, Gallery, Donors
// Home is implicit in the brand wordmark; not duplicated as a nav item.
export const primaryNav: PrimaryNavItem[] = [
  {
    href: "/about",
    label: "About BG",
    dropdown: [
      { href: "/about", label: "About Us", description: "Mission, leadership, transparency" },
      {
        href: "/mission-vision",
        label: "Our Mission and Our Vision",
        description: "What we promise and where we are going",
      },
    ],
  },
  { href: "/students", label: "Students" },
  { href: "/projects", label: "Projects" },
  { href: "/testimonials", label: "Testimonial" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Gallery" },
  { href: "/donors", label: "Donors" },
];

export const donateCta = {
  href: "/donate",
  label: "Donate",
};

// Mobile drawer groups. Desktop nav shows the primary items + dropdown; the
// drawer surfaces every reachable destination so phone visitors don't need to
// type URLs. Editorial grouping: Explore (the work), Recognize (the people),
// Trust (legal + contact). Donate is rendered as a prominent CTA above the
// groups, not in any group.
export type NavGroup = {
  eyebrow: string;
  items: NavItem[];
};

export const mobileNavGroups: NavGroup[] = [
  {
    eyebrow: "About BG",
    items: [
      { href: "/about", label: "About Us" },
      { href: "/mission-vision", label: "Our Mission and Our Vision" },
    ],
  },
  {
    eyebrow: "Explore",
    items: [
      { href: "/students", label: "Students" },
      { href: "/projects", label: "Projects" },
      { href: "/projects/scholarships", label: "Scholarships" },
      { href: "/activities", label: "Activities" },
      { href: "/success-stories", label: "Success Stories" },
      { href: "/blog", label: "Blog" },
      { href: "/gallery", label: "Gallery" },
      { href: "/mentors", label: "Mentors" },
    ],
  },
  {
    eyebrow: "Recognize",
    items: [
      { href: "/donors", label: "Donors" },
      { href: "/testimonials", label: "Testimonial" },
    ],
  },
  {
    eyebrow: "Trust",
    items: [
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
