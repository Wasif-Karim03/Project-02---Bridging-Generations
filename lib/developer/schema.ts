// Manifest describing every editable content entity (Keystatic collections +
// singletons) and the fields the owner can edit. This is the single source of
// truth the generic editor renders forms from and serializes saves against.
//
// It intentionally mirrors keystatic/collections and keystatic/singletons. When
// the Keystatic schema changes, update this manifest to match. The editor reads
// and writes the same content/ files Keystatic does, so the public site (which
// reads via the Keystatic reader) needs no changes.

export type Option = { label: string; value: string };

export type Field =
  | { key: string; label: string; description?: string; kind: "text"; multiline?: boolean }
  | { key: string; label: string; description?: string; kind: "url" }
  | { key: string; label: string; description?: string; kind: "integer" }
  | { key: string; label: string; description?: string; kind: "boolean" }
  | { key: string; label: string; description?: string; kind: "date" }
  | { key: string; label: string; description?: string; kind: "select"; options: Option[] }
  | { key: string; label: string; description?: string; kind: "multiselect"; options: Option[] }
  | { key: string; label: string; description?: string; kind: "image"; dir: string }
  | { key: string; label: string; description?: string; kind: "relationship"; collection: string }
  | { key: string; label: string; description?: string; kind: "object"; fields: Field[] }
  | { key: string; label: string; description?: string; kind: "array"; item: Field }
  | { key: string; label: string; description?: string; kind: "markdown" };

export type Entity = {
  /** Stable id used in URLs and as the Keystatic collection/singleton key. */
  key: string;
  type: "collection" | "singleton";
  label: string;
  /** UI grouping on the dashboard. */
  group: string;
  /** Directory holding the content. Collections: parent of each slug folder. */
  dir: string;
  /** Index file format for new entries / the data file. */
  fileKind: "yaml" | "mdx";
  /** For fileKind "mdx": which markdown field is stored as the index body. */
  bodyField?: string;
  /** Collection slug field (the field whose value becomes the folder name). */
  slugField?: string;
  /** One-line hint shown under the entity title. */
  blurb?: string;
  fields: Field[];
};

// ---- shared option sets (kept in sync with the Keystatic enums) ----

const RELEASE_STATUS: Option[] = [
  { label: "Pending — no consent recorded", value: "pending" },
  { label: "Granted — written release on file", value: "granted" },
  { label: "Denied — family declined", value: "denied" },
  { label: "Revoked — consent withdrawn", value: "revoked" },
];

const imageField = (key: string, label: string, dir: string): Field => ({
  key,
  label,
  kind: "object",
  fields: [
    { key: "src", label: `${label} — image`, kind: "image", dir },
    {
      key: "alt",
      label: `${label} — alt text`,
      description: "Describe the image for screen readers. Don't start with 'Image of'.",
      kind: "text",
    },
  ],
});

const focalPoint = (key: string, label: string): Field => ({
  key,
  label,
  description: "Mobile crop focus, 0–100. 50/30 is a good portrait default.",
  kind: "object",
  fields: [
    { key: "x", label: "X (0–100)", kind: "integer" },
    { key: "y", label: "Y (0–100)", kind: "integer" },
  ],
});

// =====================================================================
// COLLECTIONS
// =====================================================================

const studentEntity: Entity = {
  key: "student",
  type: "collection",
  label: "Students",
  group: "People",
  dir: "content/students",
  fileKind: "yaml",
  slugField: "displayName",
  blurb: "Sponsored students shown on /students. First names only.",
  fields: [
    { key: "displayName", label: "Display name (first name only)", kind: "text" },
    { key: "schoolId", label: "School", kind: "relationship", collection: "school" },
    { key: "grade", label: "Grade (1–12)", kind: "integer" },
    {
      key: "community",
      label: "Community",
      kind: "select",
      options: [
        { label: "Unknown / leave blank", value: "unknown" },
        { label: "Chakma", value: "chakma" },
        { label: "Marma", value: "marma" },
        { label: "Tripura", value: "tripura" },
        { label: "Tanchangya", value: "tanchangya" },
        { label: "Mro", value: "mro" },
        { label: "Bawm", value: "bawm" },
        { label: "Khumi", value: "khumi" },
        { label: "Khiyang", value: "khiyang" },
        { label: "Lushai", value: "lushai" },
        { label: "Pankho", value: "pankho" },
        { label: "Bengali", value: "bengali" },
        { label: "Other", value: "other" },
      ],
    },
    { key: "quote", label: "Aspiration quote", kind: "text" },
    { key: "bio", label: "Bio (profile page)", kind: "text", multiline: true },
    imageField("portrait", "Portrait", "students"),
    {
      key: "consent",
      label: "Consent",
      kind: "object",
      fields: [
        {
          key: "portraitReleaseStatus",
          label: "Portrait release status",
          kind: "select",
          options: RELEASE_STATUS,
        },
        {
          key: "storyReleaseStatus",
          label: "Story release status",
          kind: "select",
          options: RELEASE_STATUS,
        },
        { key: "signedDate", label: "Date family signed release", kind: "date" },
        { key: "releaseFormId", label: "Release form ID", kind: "text" },
        {
          key: "consentScope",
          label: "Consent scope",
          description: "Portrait only renders when 'Website' is in scope.",
          kind: "multiselect",
          options: [
            { label: "Website (this site)", value: "website" },
            { label: "Print materials", value: "print-materials" },
            { label: "Social media", value: "social-media" },
            { label: "Grant reports", value: "grant-reports" },
            { label: "Press", value: "press" },
          ],
        },
        { key: "revokable", label: "Revokable (leave on)", kind: "boolean" },
        { key: "revokedAt", label: "Revoked on", kind: "date" },
      ],
    },
    {
      key: "sponsorshipStatus",
      label: "Sponsorship status",
      kind: "select",
      options: [
        { label: "Sponsored", value: "sponsored" },
        { label: "Waiting for a sponsor", value: "waiting" },
      ],
    },
    { key: "enrolledAt", label: "Enrolled on", kind: "date" },
    { key: "village", label: "Village", kind: "text" },
    { key: "region", label: "Region", kind: "text" },
    { key: "area", label: "Area", kind: "text" },
    { key: "hobby", label: "Hobby", kind: "text" },
    { key: "gpa", label: "GPA / Grade", kind: "text" },
    { key: "lifeTarget", label: "Life target", kind: "text", multiline: true },
    { key: "registrationCode", label: "Registration code", kind: "text" },
  ],
};

const schoolEntity: Entity = {
  key: "school",
  type: "collection",
  label: "Schools",
  group: "People",
  dir: "content/schools",
  fileKind: "yaml",
  slugField: "name",
  blurb: "Partner schools.",
  fields: [
    { key: "name", label: "Name", kind: "text" },
    { key: "location", label: "Location", kind: "text" },
    { key: "description", label: "Description", kind: "text", multiline: true },
    { key: "descriptionBn", label: "Description (Bengali)", kind: "text", multiline: true },
    { key: "establishedYear", label: "Established year", kind: "integer" },
    imageField("heroImage", "Hero image", "schools"),
    { key: "studentCountOverride", label: "Student count (override)", kind: "integer" },
    { key: "overview", label: "Overview (long form, markdown)", kind: "markdown" },
  ],
};

const projectEntity: Entity = {
  key: "project",
  type: "collection",
  label: "Projects",
  group: "Programs",
  dir: "content/projects",
  fileKind: "yaml",
  slugField: "title",
  fields: [
    { key: "title", label: "Title (English)", kind: "text" },
    { key: "titleBn", label: "Title (Bengali)", kind: "text" },
    { key: "summary", label: "Summary (English)", kind: "text", multiline: true },
    { key: "summaryBn", label: "Summary (Bengali)", kind: "text", multiline: true },
    { key: "body", label: "Body (English)", kind: "text", multiline: true },
    { key: "bodyBn", label: "Body (Bengali)", kind: "text", multiline: true },
    { key: "fundingGoal", label: "Funding goal (USD)", kind: "integer" },
    { key: "fundingRaised", label: "Funding raised (USD)", kind: "integer" },
    {
      key: "status",
      label: "Status",
      kind: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Funded", value: "funded" },
        { label: "Paused", value: "paused" },
      ],
    },
    imageField("heroImage", "Hero image", "projects"),
    { key: "order", label: "Sort order", kind: "integer" },
    { key: "boardOwnerName", label: "Board owner", kind: "text" },
    { key: "lastUpdated", label: "Last updated", kind: "date" },
    { key: "mathLineItem", label: "Line-item math", kind: "text", multiline: true },
  ],
};

const activityEntity: Entity = {
  key: "activity",
  type: "collection",
  label: "Activities",
  group: "Stories",
  dir: "content/activities",
  fileKind: "yaml",
  slugField: "title",
  fields: [
    { key: "title", label: "Title (English)", kind: "text" },
    { key: "titleBn", label: "Title (Bengali)", kind: "text" },
    { key: "excerpt", label: "Excerpt (English, ≤240)", kind: "text", multiline: true },
    { key: "excerptBn", label: "Excerpt (Bengali)", kind: "text", multiline: true },
    {
      key: "tag",
      label: "Tag",
      kind: "select",
      options: [
        { label: "Distribution", value: "distribution" },
        { label: "Milestone", value: "milestone" },
        { label: "Visit", value: "visit" },
        { label: "Announcement", value: "announcement" },
        { label: "Event", value: "event" },
        { label: "Fundraiser", value: "fundraiser" },
      ],
    },
    { key: "published", label: "Published", kind: "boolean" },
    { key: "publishedAt", label: "Published on", kind: "date" },
    imageField("coverImage", "Cover image", "activities"),
    {
      key: "relatedProjectId",
      label: "Related project",
      kind: "relationship",
      collection: "project",
    },
    { key: "pdfUrl", label: "Report PDF URL", kind: "url" },
  ],
};

const blogPostEntity: Entity = {
  key: "blogPost",
  type: "collection",
  label: "Blog posts",
  group: "Stories",
  dir: "content/blog-posts",
  fileKind: "mdx",
  bodyField: "body",
  slugField: "title",
  fields: [
    { key: "title", label: "Title (English)", kind: "text" },
    { key: "titleBn", label: "Title (Bengali)", kind: "text" },
    { key: "excerpt", label: "Excerpt (English, ≤280)", kind: "text", multiline: true },
    { key: "excerptBn", label: "Excerpt (Bengali)", kind: "text", multiline: true },
    { key: "body", label: "Body (English, markdown)", kind: "markdown" },
    { key: "bodyBn", label: "Body (Bengali, markdown)", kind: "text", multiline: true },
    imageField("coverImage", "Cover image", "blog"),
    focalPoint("coverMobileFocalPoint", "Cover image — mobile focal point"),
    {
      key: "category",
      label: "Category",
      kind: "select",
      options: [
        { label: "Success story", value: "success-story" },
        { label: "Recent activity", value: "recent-activity" },
        { label: "Event news", value: "event-news" },
      ],
    },
    { key: "author", label: "Author", kind: "relationship", collection: "boardMember" },
    { key: "published", label: "Published", kind: "boolean" },
    { key: "publishedAt", label: "Published on", kind: "date" },
    { key: "featured", label: "Featured", kind: "boolean" },
    { key: "dropcap", label: "Drop cap on first paragraph", kind: "boolean" },
    { key: "tags", label: "Tags", kind: "array", item: { key: "", label: "Tag", kind: "text" } },
    { key: "metaTitle", label: "Meta title (SEO)", kind: "text" },
    { key: "metaDescription", label: "Meta description (SEO)", kind: "text", multiline: true },
    imageField("ogImageOverride", "OG image override", "blog"),
  ],
};

const successStoryEntity: Entity = {
  key: "successStory",
  type: "collection",
  label: "Success stories",
  group: "Stories",
  dir: "content/success-stories",
  fileKind: "mdx",
  bodyField: "body",
  slugField: "subjectName",
  fields: [
    { key: "subjectName", label: "Subject name", kind: "text" },
    { key: "subjectRole", label: "Subject role (English)", kind: "text" },
    { key: "subjectRoleBn", label: "Subject role (Bengali)", kind: "text" },
    { key: "pullQuote", label: "Pull quote (English)", kind: "text", multiline: true },
    { key: "pullQuoteBn", label: "Pull quote (Bengali)", kind: "text", multiline: true },
    { key: "body", label: "Body (markdown)", kind: "markdown" },
    imageField("portrait", "Portrait", "success-stories"),
    focalPoint("portraitMobileFocalPoint", "Portrait — mobile focal point"),
    { key: "heroDuotone", label: "Duotone hero", kind: "boolean" },
    { key: "dropcap", label: "Drop cap on first paragraph", kind: "boolean" },
    {
      key: "linkedStudentId",
      label: "Linked student",
      kind: "relationship",
      collection: "student",
    },
    { key: "published", label: "Published", kind: "boolean" },
    { key: "publishedAt", label: "Published on", kind: "date" },
    { key: "metaTitle", label: "Meta title (SEO)", kind: "text" },
    { key: "metaDescription", label: "Meta description (SEO)", kind: "text", multiline: true },
    imageField("ogImageOverride", "OG image override", "success-stories"),
  ],
};

const boardMemberEntity: Entity = {
  key: "boardMember",
  type: "collection",
  label: "Team members",
  group: "People",
  dir: "content/board",
  fileKind: "yaml",
  slugField: "name",
  blurb: "Board, moderators, R&D, accounting, coordinators, mentors (shown on /about & /mentors).",
  fields: [
    { key: "name", label: "Name", kind: "text" },
    {
      key: "team",
      label: "Team",
      kind: "select",
      options: [
        { label: "Board Member", value: "board" },
        { label: "Moderator", value: "moderator" },
        { label: "Research & Development", value: "rnd" },
        { label: "Accounting", value: "accounting" },
        { label: "Coordinator", value: "coordinator" },
        { label: "Mentor", value: "mentor" },
      ],
    },
    { key: "role", label: "Role / Position", kind: "text" },
    { key: "occupation", label: "Occupation / Status", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    { key: "educationStatus", label: "Education status", kind: "text" },
    { key: "bio", label: "Bio / Statement", kind: "text", multiline: true },
    imageField("portrait", "Portrait", "board"),
    { key: "startDate", label: "Start date", kind: "date" },
    { key: "endDate", label: "End date", kind: "date" },
    { key: "order", label: "Sort order", kind: "integer" },
  ],
};

const teacherEntity: Entity = {
  key: "teacher",
  type: "collection",
  label: "Teachers",
  group: "People",
  dir: "content/teachers",
  fileKind: "yaml",
  slugField: "name",
  fields: [
    { key: "name", label: "Name", kind: "text" },
    imageField("portrait", "Photo", "teachers"),
    { key: "schoolId", label: "School", kind: "relationship", collection: "school" },
    { key: "educationStatus", label: "Education status", kind: "text" },
    { key: "major", label: "Subject / Major", kind: "text" },
    { key: "startedTeaching", label: "Started teaching", kind: "date" },
    { key: "bio", label: "Short note", kind: "text", multiline: true },
    { key: "order", label: "Sort order", kind: "integer" },
  ],
};

const testimonialEntity: Entity = {
  key: "testimonial",
  type: "collection",
  label: "Testimonials",
  group: "Stories",
  dir: "content/testimonials",
  fileKind: "yaml",
  slugField: "speakerName",
  fields: [
    { key: "speakerName", label: "Speaker name", kind: "text" },
    { key: "quote", label: "Quote (English, ≤280)", kind: "text", multiline: true },
    { key: "quoteBn", label: "Quote (Bengali)", kind: "text", multiline: true },
    { key: "speakerTitle", label: "Speaker title (English)", kind: "text" },
    { key: "speakerTitleBn", label: "Speaker title (Bengali)", kind: "text" },
    { key: "highlightWord", label: "Highlight word", kind: "text" },
    imageField("speakerPhoto", "Speaker photo", "testimonials"),
    {
      key: "speakerRole",
      label: "Speaker role",
      kind: "select",
      options: [
        { label: "Parent", value: "parent" },
        { label: "Teacher", value: "teacher" },
        { label: "Student", value: "student" },
        { label: "Alum", value: "alum" },
        { label: "Board member", value: "board" },
        { label: "Partner", value: "partner" },
        { label: "Volunteer", value: "volunteer" },
        { label: "Donor", value: "donor" },
      ],
    },
  ],
};

const galleryEntity: Entity = {
  key: "galleryImage",
  type: "collection",
  label: "Gallery images",
  group: "Media",
  dir: "content/gallery",
  fileKind: "yaml",
  slugField: "caption",
  fields: [
    { key: "caption", label: "Caption (also the slug)", kind: "text" },
    imageField("image", "Image", "gallery"),
    { key: "width", label: "Width (pixels)", kind: "integer" },
    { key: "height", label: "Height (pixels)", kind: "integer" },
    {
      key: "category",
      label: "Category",
      kind: "select",
      options: [
        { label: "Humanity", value: "humanity" },
        { label: "Activities", value: "activities" },
        { label: "Projects", value: "projects" },
        { label: "Students", value: "students" },
        { label: "Publication", value: "publication" },
      ],
    },
    { key: "takenAt", label: "Taken on", kind: "date" },
    { key: "location", label: "Location", kind: "text" },
    { key: "photographerCredit", label: "Photographer credit", kind: "text" },
  ],
};

const donorProfileEntity: Entity = {
  key: "donorProfile",
  type: "collection",
  label: "Donor profiles",
  group: "People",
  dir: "content/donor-profiles",
  fileKind: "yaml",
  slugField: "displayName",
  fields: [
    { key: "displayName", label: "Display name", kind: "text" },
    { key: "email", label: "Email (internal)", kind: "text" },
    { key: "isAnonymous", label: "Anonymous profile", kind: "boolean" },
    { key: "photoUrl", label: "Photo URL", kind: "url" },
    { key: "joinedDate", label: "Joined on", kind: "date" },
    { key: "message", label: "Public message", kind: "text", multiline: true },
    {
      key: "donationHistory",
      label: "Donation history",
      kind: "array",
      item: {
        key: "",
        label: "Donation",
        kind: "object",
        fields: [
          { key: "date", label: "Date", kind: "date" },
          { key: "amount", label: "Amount (USD)", kind: "integer" },
          {
            key: "designation",
            label: "Designation",
            kind: "select",
            options: [
              { label: "Tuition", value: "tuition" },
              { label: "Books & learning materials", value: "books" },
              { label: "Daily meals", value: "meals" },
              { label: "School supplies", value: "materials" },
              { label: "General (where most needed)", value: "general" },
            ],
          },
          {
            key: "linkedStudentId",
            label: "Linked student",
            kind: "relationship",
            collection: "student",
          },
          { key: "note", label: "Admin note (internal)", kind: "text", multiline: true },
        ],
      },
    },
  ],
};

// =====================================================================
// SINGLETONS (one record each)
// =====================================================================

const statsSnapshotEntity: Entity = {
  key: "statsSnapshot",
  type: "singleton",
  label: "Home stats & hero",
  group: "Site",
  dir: "content/stats-snapshot",
  fileKind: "yaml",
  blurb: "The big numbers and headline on the home page.",
  fields: [
    { key: "studentCount", label: "Student count", kind: "integer" },
    { key: "schoolCount", label: "School count", kind: "integer" },
    { key: "donorCount", label: "Donor count", kind: "integer" },
    { key: "homeHeroEyebrow", label: "Home hero eyebrow", kind: "text" },
    { key: "homeHeroHeadline", label: "Home hero headline", kind: "text", multiline: true },
    { key: "homeHeroSubhead", label: "Home hero subhead", kind: "text", multiline: true },
  ],
};

const siteSettingsEntity: Entity = {
  key: "siteSettings",
  type: "singleton",
  label: "Site settings",
  group: "Site",
  dir: "content/site-settings",
  fileKind: "yaml",
  blurb: "Org name, mission, contact details, social links, shared microcopy.",
  fields: [
    { key: "orgName", label: "Organization name", kind: "text" },
    { key: "missionShort", label: "Mission (1-sentence)", kind: "text", multiline: true },
    { key: "missionFull", label: "Mission (full paragraph)", kind: "text", multiline: true },
    { key: "visionFull", label: "Vision (full paragraph)", kind: "text", multiline: true },
    { key: "foundingYear", label: "Founding year", kind: "integer" },
    { key: "ein", label: "EIN (501(c)(3))", kind: "text" },
    { key: "form990Url", label: "Form 990 URL", kind: "url" },
    { key: "candidProfileUrl", label: "Candid / GuideStar URL", kind: "url" },
    { key: "mailingAddress", label: "Mailing address", kind: "text", multiline: true },
    { key: "contactEmail", label: "Contact email", kind: "text" },
    { key: "secondaryEmail", label: "Secondary email", kind: "text" },
    { key: "phoneNumber", label: "Phone number", kind: "text" },
    { key: "whatsappNumber", label: "WhatsApp number (digits only)", kind: "text" },
    {
      key: "socialLinks",
      label: "Social links",
      kind: "object",
      fields: [
        { key: "instagram", label: "Instagram URL", kind: "url" },
        { key: "facebook", label: "Facebook URL", kind: "url" },
        { key: "linkedin", label: "LinkedIn URL", kind: "url" },
        { key: "youtube", label: "YouTube URL", kind: "url" },
      ],
    },
    {
      key: "metaDefaults",
      label: "Meta defaults",
      kind: "object",
      fields: [
        { key: "title", label: "Default page title", kind: "text" },
        { key: "description", label: "Default meta description", kind: "text", multiline: true },
        imageField("ogImage", "Default OG image", "site"),
        { key: "twitterHandle", label: "Twitter / X handle (no @)", kind: "text" },
      ],
    },
    {
      key: "copy",
      label: "Shared microcopy",
      kind: "object",
      fields: [
        { key: "navDonateCta", label: "Nav donate CTA", kind: "text" },
        { key: "footerTagline", label: "Footer tagline", kind: "text" },
        { key: "donateButtonPrimary", label: "Donate button — primary", kind: "text" },
        { key: "donateButtonSecondary", label: "Donate button — secondary", kind: "text" },
        {
          key: "contactFormSuccess",
          label: "Contact form — success",
          kind: "text",
          multiline: true,
        },
        { key: "contactFormError", label: "Contact form — error", kind: "text", multiline: true },
        { key: "newsletterOptIn", label: "Newsletter opt-in label", kind: "text" },
        { key: "placeholderAlt", label: "Student placeholder alt text", kind: "text" },
      ],
    },
  ],
};

const contactPageEntity: Entity = {
  key: "contactPage",
  type: "singleton",
  label: "Contact page",
  group: "Pages",
  dir: "content/contact-page",
  fileKind: "yaml",
  fields: [
    { key: "headline", label: "Headline", kind: "text" },
    { key: "intro", label: "Intro", kind: "text", multiline: true },
    { key: "destinationEmail", label: "Destination email", kind: "text" },
    { key: "responseNote", label: "Response note", kind: "text", multiline: true },
  ],
};

const donatePageEntity: Entity = {
  key: "donatePage",
  type: "singleton",
  label: "Donate page",
  group: "Pages",
  dir: "content/donate-page",
  fileKind: "yaml",
  fields: [
    { key: "headline", label: "Headline", kind: "text" },
    { key: "intro", label: "Intro", kind: "text", multiline: true },
    { key: "monthlySuggestion", label: "Monthly suggestion (USD)", kind: "integer" },
    { key: "suggestedAmounts", label: "Suggested amounts (USD, comma-separated)", kind: "text" },
    {
      key: "transactionSource",
      label: "Transaction source",
      kind: "select",
      options: [
        { label: "Stripe Checkout (recommended)", value: "stripe" },
        { label: "Givebutter (legacy embed)", value: "givebutter" },
        { label: "Mailto fallback", value: "mailto" },
        { label: "Placeholder (setup pending)", value: "placeholder" },
      ],
    },
    { key: "givebutterAccountId", label: "Givebutter account ID (legacy)", kind: "text" },
    { key: "givebutterCampaignId", label: "Givebutter campaign ID (legacy)", kind: "text" },
    {
      key: "afterDonateNote",
      label: "After-donate note (live path)",
      kind: "text",
      multiline: true,
    },
    {
      key: "afterDonateNoteFallback",
      label: "After-donate note (fallback)",
      kind: "text",
      multiline: true,
    },
    { key: "thankYouBody", label: "Thank-you body (live path)", kind: "text", multiline: true },
    {
      key: "thankYouBodyFallback",
      label: "Thank-you body (fallback)",
      kind: "text",
      multiline: true,
    },
    {
      key: "transactionSourceNote",
      label: "Transaction-source note",
      kind: "text",
      multiline: true,
    },
    {
      key: "faq",
      label: "FAQ",
      kind: "array",
      item: {
        key: "",
        label: "FAQ item",
        kind: "object",
        fields: [
          { key: "question", label: "Question", kind: "text" },
          { key: "answer", label: "Answer", kind: "text", multiline: true },
        ],
      },
    },
  ],
};

const donationJourneyEntity: Entity = {
  key: "donationJourney",
  type: "singleton",
  label: "Donation journey",
  group: "Pages",
  dir: "content/donation-journey",
  fileKind: "yaml",
  fields: [
    { key: "headline", label: "Headline", kind: "text" },
    { key: "intro", label: "Intro", kind: "text", multiline: true },
    { key: "totalRaisedAllTime", label: "Total raised all time (USD)", kind: "integer" },
    { key: "totalDonorsAllTime", label: "Total donors all time", kind: "integer" },
    { key: "totalStudentsAllTime", label: "Total students all time", kind: "integer" },
    {
      key: "yearlyEntries",
      label: "Yearly entries",
      kind: "array",
      item: {
        key: "",
        label: "Year",
        kind: "object",
        fields: [
          { key: "year", label: "Year", kind: "integer" },
          { key: "totalRaised", label: "Total raised that year (USD)", kind: "integer" },
          { key: "studentCount", label: "Student count (end of year)", kind: "integer" },
          { key: "donorCount", label: "Donor count that year", kind: "integer" },
          { key: "milestone", label: "Key milestone", kind: "text", multiline: true },
          {
            key: "milestoneTag",
            label: "Milestone tag",
            kind: "select",
            options: [
              { label: "Milestone", value: "milestone" },
              { label: "Fundraiser", value: "fundraiser" },
              { label: "Scholarship", value: "scholarship" },
              { label: "Distribution", value: "distribution" },
              { label: "Visit", value: "visit" },
              { label: "Announcement", value: "announcement" },
            ],
          },
          { key: "highlightQuote", label: "Highlight quote", kind: "text", multiline: true },
          { key: "quoteAttribution", label: "Quote attribution", kind: "text" },
        ],
      },
    },
  ],
};

const donorsPageEntity: Entity = {
  key: "donorsPage",
  type: "singleton",
  label: "Donors page",
  group: "Pages",
  dir: "content/donors-page",
  fileKind: "yaml",
  fields: [
    { key: "headline", label: "Headline", kind: "text" },
    { key: "subhead", label: "Subhead", kind: "text", multiline: true },
    {
      key: "thankYouMessages",
      label: "Thank-you wall",
      kind: "array",
      item: {
        key: "",
        label: "Message",
        kind: "object",
        fields: [
          {
            key: "message",
            label: "Message (no names, no amounts)",
            kind: "text",
            multiline: true,
          },
          { key: "year", label: "Year", kind: "integer" },
          {
            key: "tier",
            label: "Tier",
            kind: "select",
            options: [
              { label: "(no tier)", value: "" },
              { label: "Founder", value: "founder" },
              { label: "Patron", value: "patron" },
              { label: "Friend", value: "friend" },
            ],
          },
        ],
      },
    },
    { key: "totalDonorsLabel", label: "Total donors label", kind: "text" },
  ],
};

const projectsPageEntity: Entity = {
  key: "projectsPage",
  type: "singleton",
  label: "Projects page",
  group: "Pages",
  dir: "content/projects-page",
  fileKind: "mdx",
  bodyField: "rulesBody",
  fields: [
    { key: "rulesIntro", label: "Project rules — intro", kind: "text", multiline: true },
    { key: "rulesBody", label: "Project rules — body (markdown)", kind: "markdown" },
    { key: "teachersEyebrow", label: "Teachers eyebrow", kind: "text" },
    { key: "teachersHeadline", label: "Teachers headline", kind: "text" },
    { key: "teachersIntro", label: "Teachers intro", kind: "text", multiline: true },
  ],
};

const scholarshipsPageEntity: Entity = {
  key: "scholarshipsPage",
  type: "singleton",
  label: "Scholarships page",
  group: "Pages",
  dir: "content/scholarships-page",
  fileKind: "mdx",
  bodyField: "overview",
  fields: [
    { key: "heroEyebrow", label: "Hero eyebrow", kind: "text" },
    { key: "heroHeadline", label: "Hero headline", kind: "text" },
    { key: "heroSubhead", label: "Hero subhead", kind: "text", multiline: true },
    { key: "overview", label: "Overview body (markdown)", kind: "markdown" },
    { key: "eligibility", label: "Eligibility body (markdown)", kind: "markdown" },
    { key: "applyCtaLabel", label: "Apply CTA label", kind: "text" },
    { key: "applyCtaHref", label: "Apply CTA href", kind: "text" },
  ],
};

const studentsPageEntity: Entity = {
  key: "studentsPage",
  type: "singleton",
  label: "Students page",
  group: "Pages",
  dir: "content/students-page",
  fileKind: "mdx",
  bodyField: "rulesBody",
  fields: [
    { key: "spotlightEnabled", label: "Show HSC/SSC spotlight band", kind: "boolean" },
    { key: "spotlightEyebrow", label: "Spotlight eyebrow", kind: "text" },
    { key: "spotlightHeadline", label: "Spotlight headline", kind: "text" },
    { key: "spotlightBody", label: "Spotlight body", kind: "text", multiline: true },
    {
      key: "spotlightStudents",
      label: "Featured students",
      kind: "array",
      item: { key: "", label: "Student", kind: "relationship", collection: "student" },
    },
    { key: "rulesIntro", label: "Scholarship rules — intro", kind: "text", multiline: true },
    { key: "rulesBody", label: "Scholarship rules — body (markdown)", kind: "markdown" },
  ],
};

const privacyPageEntity: Entity = {
  key: "privacyPage",
  type: "singleton",
  label: "Privacy policy",
  group: "Pages",
  dir: "content/privacy-page",
  fileKind: "mdx",
  bodyField: "body",
  fields: [
    { key: "body", label: "Privacy policy body (markdown)", kind: "markdown" },
    { key: "lastUpdated", label: "Last updated", kind: "date" },
  ],
};

const termsPageEntity: Entity = {
  key: "termsPage",
  type: "singleton",
  label: "Terms of service",
  group: "Pages",
  dir: "content/terms-page",
  fileKind: "mdx",
  bodyField: "body",
  fields: [
    { key: "body", label: "Terms body (markdown)", kind: "markdown" },
    { key: "lastUpdated", label: "Last updated", kind: "date" },
  ],
};

export const ENTITIES: Entity[] = [
  statsSnapshotEntity,
  siteSettingsEntity,
  studentEntity,
  schoolEntity,
  projectEntity,
  activityEntity,
  blogPostEntity,
  successStoryEntity,
  boardMemberEntity,
  teacherEntity,
  testimonialEntity,
  galleryEntity,
  donorProfileEntity,
  contactPageEntity,
  donatePageEntity,
  donationJourneyEntity,
  donorsPageEntity,
  projectsPageEntity,
  scholarshipsPageEntity,
  studentsPageEntity,
  privacyPageEntity,
  termsPageEntity,
];

export function getEntity(key: string): Entity | undefined {
  return ENTITIES.find((e) => e.key === key);
}

export const ENTITY_GROUP_ORDER = [
  "Site",
  "Pages",
  "People",
  "Students",
  "Programs",
  "Stories",
  "Media",
];
