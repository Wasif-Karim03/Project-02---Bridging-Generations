// Page-centric manifest for the site editor. The owner thinks in terms of "the
// pages of my website" — Home, About, Students, etc. — not Keystatic entity
// types. This file maps each public page to the REAL content sources that feed
// it, so editing a page in the editor actually changes that page on the live
// site.
//
// Each page is a stack of blocks:
//   - entity        → a singleton's fields (optionally a subset), edited inline
//                     (the full record is loaded + saved so hidden fields are
//                     preserved; only `fieldKeys` are shown).
//   - translations  → bilingual UI copy for one or more message sections.
//   - collection    → the list of items the page renders (add / edit / delete),
//                     linking to the existing per-entry editors.
//
// Deliberately bound to what the frontend ACTUALLY reads. Examples:
//   - Home hero copy lives in next-intl messages ("home"/"homeExtra"), not the
//     orphaned statsSnapshot singleton — so the Home page binds to translations.
//   - /donors renders from the donationJourney singleton, not the orphaned
//     donorsPage singleton — so the Donors page binds to donationJourney.

export type PageBlock =
  | {
      kind: "entity";
      /** Singleton entity key from lib/developer/schema.ts. */
      entityKey: string;
      /** If set, only these top-level fields are shown (others preserved on save). */
      fieldKeys?: string[];
      title?: string;
      description?: string;
    }
  | {
      kind: "translations";
      /** Top-level message sections (e.g. "home", "homeExtra"). */
      sections: string[];
      title?: string;
      description?: string;
    }
  | {
      kind: "collection";
      /** Collection entity key from lib/developer/schema.ts. */
      entityKey: string;
      title?: string;
      description?: string;
      /** Optional callout (e.g. "students come from the database"). */
      note?: string;
    };

export type PageDef = {
  /** URL slug under /developer/pages/<key>. */
  key: string;
  /** Sidebar + header label. */
  label: string;
  /** Sidebar grouping. */
  group: string;
  /** Path on the live site this page edits. */
  livePath: string;
  /** One-line description shown at the top of the page editor. */
  blurb?: string;
  blocks: PageBlock[];
};

export const PAGE_GROUP_ORDER = [
  "Main",
  "About",
  "Programs",
  "Stories",
  "Giving",
  "Site-wide",
] as const;

export const PAGES: PageDef[] = [
  // ---- MAIN ----
  {
    key: "home",
    label: "Home",
    group: "Main",
    livePath: "/",
    blurb: "Your landing page — hero carousel, mission band, and the featured content below it.",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["homeSlide1Image", "homeSlide2Image", "homeSlide3Image"],
        title: "Hero carousel images",
        description: "The three rotating banner photos at the top of the home page.",
      },
      {
        kind: "translations",
        sections: ["home", "homeExtra"],
        title: "Hero & section text",
        description: "Headlines, eyebrows, and button labels for the home page — English & Bangla.",
      },
      {
        kind: "collection",
        entityKey: "project",
        title: "Featured projects",
        description: "The programs grid pulls from your projects. Edit or add them here.",
      },
      {
        kind: "collection",
        entityKey: "successStory",
        title: "Featured success stories",
      },
      {
        kind: "collection",
        entityKey: "activity",
        title: "Recent activities",
      },
      {
        kind: "collection",
        entityKey: "testimonial",
        title: "Testimonials",
      },
      {
        kind: "collection",
        entityKey: "galleryImage",
        title: "Gallery strip",
      },
    ],
  },

  // ---- ABOUT ----
  {
    key: "about",
    label: "About",
    group: "About",
    livePath: "/about",
    blurb: "Organization overview, mission/vision statements, transparency, and your team.",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["aboutHeroImage"],
        title: "Page hero image",
      },
      {
        kind: "entity",
        entityKey: "siteSettings",
        fieldKeys: [
          "orgName",
          "missionShort",
          "missionFull",
          "visionFull",
          "foundingYear",
          "ein",
          "form990Url",
          "candidProfileUrl",
          "mailingAddress",
        ],
        title: "Organization details",
        description: "Mission, vision, and transparency info shown on the About page.",
      },
      {
        kind: "translations",
        sections: ["about", "aboutExtra"],
        title: "Section & team labels",
      },
      {
        kind: "collection",
        entityKey: "boardMember",
        title: "Leadership & team",
        description: "Board, moderators, R&D, accounting, coordinators, and mentors.",
      },
      {
        kind: "collection",
        entityKey: "testimonial",
        title: "Partner testimonial",
      },
    ],
  },
  {
    key: "mission-vision",
    label: "Mission & Vision",
    group: "About",
    livePath: "/mission-vision",
    blurb: "The dedicated mission and vision page.",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["missionVisionHeroImage"],
        title: "Page hero image",
      },
      {
        kind: "translations",
        sections: ["missionVision"],
        title: "Mission & vision text",
        description: "This page's headings and body copy — English & Bangla.",
      },
    ],
  },

  // ---- PROGRAMS ----
  {
    key: "students",
    label: "Students",
    group: "Programs",
    livePath: "/students",
    blurb: "The student directory, spotlight band, and scholarship rules.",
    blocks: [
      {
        kind: "entity",
        entityKey: "studentsPage",
        title: "Spotlight band & rules",
        description: "The featured-students band and the scholarship rules section.",
      },
      {
        kind: "translations",
        sections: ["students", "studentsPageExtra"],
        title: "Page & filter text",
      },
      {
        kind: "collection",
        entityKey: "student",
        title: "Students",
        note: "Approved student applications publish here automatically from the database. Entries you add here are an additional, manually-curated source.",
      },
      {
        kind: "collection",
        entityKey: "school",
        title: "Schools",
        description: "Students are grouped by school on this page.",
      },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    group: "Programs",
    livePath: "/projects",
    blurb: "Program portfolio, donation targets, and the teachers section.",
    blocks: [
      {
        kind: "entity",
        entityKey: "projectsPage",
        title: "Rules & teachers section text",
      },
      {
        kind: "translations",
        sections: ["projectsPageExtra"],
        title: "Section & CTA text",
      },
      {
        kind: "collection",
        entityKey: "project",
        title: "Projects",
        description: "Active, paused, and funded programs with their funding goals.",
      },
      {
        kind: "collection",
        entityKey: "teacher",
        title: "Teachers",
      },
    ],
  },
  {
    key: "scholarships",
    label: "Scholarships",
    group: "Programs",
    livePath: "/projects/scholarships",
    blurb: "The scholarships program sub-page.",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["scholarshipsHeroImage"],
        title: "Page hero image",
      },
      {
        kind: "entity",
        entityKey: "scholarshipsPage",
        title: "Program content",
        description: "Hero, overview, eligibility, and the apply call-to-action.",
      },
      {
        kind: "translations",
        sections: ["scholarshipsPageExtra"],
        title: "Section text",
      },
    ],
  },
  {
    key: "mentors",
    label: "Mentors",
    group: "Programs",
    livePath: "/mentors",
    blurb: "The volunteer mentor directory.",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["mentorsHeroImage"],
        title: "Page hero image",
      },
      {
        kind: "translations",
        sections: ["mentorsPage"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "boardMember",
        title: "Mentors & team",
        note: "Mentors are team members with the team set to “Mentor”.",
      },
    ],
  },

  // ---- STORIES ----
  {
    key: "activities",
    label: "Activities",
    group: "Stories",
    livePath: "/activities",
    blurb: "Recent field updates and announcements.",
    blocks: [
      {
        kind: "translations",
        sections: ["activitiesPage"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "activity",
        title: "Activities",
      },
    ],
  },
  {
    key: "success-stories",
    label: "Success Stories",
    group: "Stories",
    livePath: "/success-stories",
    blurb: "Student and alumni case studies.",
    blocks: [
      {
        kind: "translations",
        sections: ["successStoriesPage"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "successStory",
        title: "Success stories",
      },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    group: "Stories",
    livePath: "/blog",
    blurb: "News and articles.",
    blocks: [
      {
        kind: "translations",
        sections: ["blog"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "blogPost",
        title: "Blog posts",
      },
    ],
  },
  {
    key: "gallery",
    label: "Gallery",
    group: "Stories",
    livePath: "/gallery",
    blurb: "The photo gallery.",
    blocks: [
      {
        kind: "translations",
        sections: ["gallery"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "galleryImage",
        title: "Gallery images",
      },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    group: "Stories",
    livePath: "/testimonials",
    blurb: "Quotes from your community.",
    blocks: [
      {
        kind: "translations",
        sections: ["testimonialsPage"],
        title: "Page text",
      },
      {
        kind: "collection",
        entityKey: "testimonial",
        title: "Testimonials",
      },
    ],
  },

  // ---- GIVING ----
  {
    key: "donate",
    label: "Donate",
    group: "Giving",
    livePath: "/donate",
    blurb: "The main donation page — amounts, FAQ, and thank-you messages.",
    blocks: [
      {
        kind: "entity",
        entityKey: "donatePage",
        title: "Donation page content",
        description: "Headline, suggested amounts, payment source, FAQ, and thank-you copy.",
      },
      {
        kind: "translations",
        sections: ["donatePageExtra"],
        title: "Section text",
      },
    ],
  },
  {
    key: "donors",
    label: "Donors & Journey",
    group: "Giving",
    livePath: "/donors",
    blurb:
      "The donor recognition page and 5-year impact timeline (this content powers both /donors and /donation-journey).",
    blocks: [
      {
        kind: "entity",
        entityKey: "pageMedia",
        fieldKeys: ["donationJourneyHeroImage"],
        title: "Page hero image",
      },
      {
        kind: "entity",
        entityKey: "donationJourney",
        title: "Impact timeline & totals",
        description: "Lifetime totals and the year-by-year milestones shown on the donors page.",
      },
      {
        kind: "translations",
        sections: ["donationJourney", "donorsPageExtra"],
        title: "Section & donor-profile text",
      },
      {
        kind: "collection",
        entityKey: "donorProfile",
        title: "Donor profiles",
      },
    ],
  },

  // ---- SITE-WIDE ----
  {
    key: "contact",
    label: "Contact",
    group: "Site-wide",
    livePath: "/contact",
    blurb: "The contact page and form.",
    blocks: [
      {
        kind: "entity",
        entityKey: "contactPage",
        title: "Contact page content",
      },
      {
        kind: "translations",
        sections: ["contactPageExtra"],
        title: "Form & section text",
      },
    ],
  },
  {
    key: "legal",
    label: "Privacy & Terms",
    group: "Site-wide",
    livePath: "/privacy",
    blurb: "Your privacy policy and terms of service pages.",
    blocks: [
      {
        kind: "entity",
        entityKey: "privacyPage",
        title: "Privacy policy",
      },
      {
        kind: "translations",
        sections: ["privacyPageExtra"],
        title: "Privacy page headings",
      },
      {
        kind: "entity",
        entityKey: "termsPage",
        title: "Terms of service",
      },
      {
        kind: "translations",
        sections: ["termsPageExtra"],
        title: "Terms page headings",
      },
    ],
  },
];

export function getPageDef(key: string): PageDef | undefined {
  return PAGES.find((p) => p.key === key);
}

export function pagesByGroup(): Array<{ group: string; pages: PageDef[] }> {
  const byGroup = new Map<string, PageDef[]>();
  for (const p of PAGES) {
    const list = byGroup.get(p.group) ?? [];
    list.push(p);
    byGroup.set(p.group, list);
  }
  const order = [...PAGE_GROUP_ORDER, ...byGroup.keys()];
  const seen = new Set<string>();
  const out: Array<{ group: string; pages: PageDef[] }> = [];
  for (const g of order) {
    if (seen.has(g) || !byGroup.has(g)) continue;
    seen.add(g);
    out.push({ group: g, pages: byGroup.get(g) as PageDef[] });
  }
  return out;
}
