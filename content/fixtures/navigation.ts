export type NavItem = {
  href: string;
  label: string; // English fallback / static analytics label
  labelKey?: string; // Translation key under nav.* (consumed by Nav.tsx)
};

export type NavDropdownItem = NavItem & {
  description?: string;
  descriptionKey?: string;
};

export type PrimaryNavItem = NavItem | (NavItem & { dropdown: NavDropdownItem[] });

// Spec navigation order (top navbar):
// Home, About BG (dropdown), Students, Projects, Testimonial, Blog, Gallery, Donors
// Home is implicit in the brand wordmark; not duplicated as a nav item.
//
// `labelKey` is consumed by the Nav component to look up a translated string
// in messages/{en,bn}.json under `nav.*`. `label` remains the English fallback.
export const primaryNav: PrimaryNavItem[] = [
  {
    href: "/about",
    label: "About BG",
    labelKey: "aboutBG",
    dropdown: [
      {
        href: "/about",
        label: "About Us",
        labelKey: "aboutBGDropdown.aboutUs",
        description: "Mission, leadership, transparency",
        descriptionKey: "aboutBGDropdown.aboutUsDesc",
      },
      {
        href: "/mission-vision",
        label: "Our Mission and Our Vision",
        labelKey: "aboutBGDropdown.missionVision",
        description: "What we promise and where we are going",
        descriptionKey: "aboutBGDropdown.missionVisionDesc",
      },
    ],
  },
  { href: "/students", label: "Students", labelKey: "students" },
  { href: "/projects", label: "Projects", labelKey: "projects" },
  { href: "/testimonials", label: "Testimonial", labelKey: "testimonial" },
  { href: "/blog", label: "Blog", labelKey: "blog" },
  { href: "/gallery", label: "Gallery", labelKey: "gallery" },
  { href: "/donors", label: "Donors", labelKey: "donors" },
];

export const donateCta = {
  href: "/be-a-donor",
  label: "Be a Donor",
  labelKey: "donate",
};

export type NavGroup = {
  eyebrow: string;
  eyebrowKey?: string;
  items: NavItem[];
};

export const mobileNavGroups: NavGroup[] = [
  {
    eyebrow: "About BG",
    eyebrowKey: "drawerGroupAboutBG",
    items: [
      { href: "/about", label: "About Us", labelKey: "aboutBGDropdown.aboutUs" },
      {
        href: "/mission-vision",
        label: "Our Mission and Our Vision",
        labelKey: "aboutBGDropdown.missionVision",
      },
    ],
  },
  {
    eyebrow: "Explore",
    eyebrowKey: "drawerGroupExplore",
    items: [
      { href: "/students", label: "Students", labelKey: "students" },
      { href: "/projects", label: "Projects", labelKey: "projects" },
      { href: "/projects/scholarships", label: "Scholarships" },
      { href: "/activities", label: "Activities" },
      { href: "/success-stories", label: "Success Stories" },
      { href: "/blog", label: "Blog", labelKey: "blog" },
      { href: "/gallery", label: "Gallery", labelKey: "gallery" },
      { href: "/mentors", label: "Mentors" },
    ],
  },
  {
    eyebrow: "Recognize",
    eyebrowKey: "drawerGroupRecognize",
    items: [
      { href: "/donors", label: "Donors", labelKey: "donors" },
      { href: "/testimonials", label: "Testimonial", labelKey: "testimonial" },
    ],
  },
  {
    eyebrow: "Trust",
    eyebrowKey: "drawerGroupTrust",
    items: [
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
    ],
  },
];
