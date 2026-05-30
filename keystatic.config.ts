import { config } from "@keystatic/core";
import {
  activityCollection,
  blogPostCollection,
  boardMemberCollection,
  donorProfileCollection,
  galleryImageCollection,
  projectCollection,
  schoolCollection,
  studentCollection,
  successStoryCollection,
  teacherCollection,
  testimonialCollection,
} from "./keystatic/collections";
import {
  contactPageSingleton,
  donatePageSingleton,
  donationJourneySingleton,
  donorsPageSingleton,
  pageMediaSingleton,
  privacyPageSingleton,
  projectsPageSingleton,
  scholarshipsPageSingleton,
  siteSettingsSingleton,
  statsSnapshotSingleton,
  studentsPageSingleton,
  termsPageSingleton,
} from "./keystatic/singletons";

// Gate on the OAuth client ID: if Keystatic's GitHub app isn't wired yet
// (dev, tests, preview without secrets), fall back to local filesystem.
// Production should always have KEYSTATIC_GITHUB_CLIENT_ID set.
const useGitHub = Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID);

// The repo Vercel actually deploys from — confirmed via the GitHub deployments
// API (vercel[bot] posts Production statuses here). Previously pointed at the
// stale `Bamyani1/bridging-generations`, which has no deployments, so Keystatic
// saves never reached the live site. The password-gated /developer editor is
// the primary content editor; this keeps /keystatic correct as a fallback.
export default config({
  storage: useGitHub
    ? {
        kind: "github",
        repo: { owner: "Wasif-Karim03", name: "Project-02---Bridging-Generations" },
      }
    : { kind: "local" },
  ui: {
    brand: { name: "Bridging Generations" },
  },
  collections: {
    school: schoolCollection,
    student: studentCollection,
    project: projectCollection,
    activity: activityCollection,
    blogPost: blogPostCollection,
    successStory: successStoryCollection,
    testimonial: testimonialCollection,
    galleryImage: galleryImageCollection,
    boardMember: boardMemberCollection,
    teacher: teacherCollection,
    donorProfile: donorProfileCollection,
  },
  singletons: {
    siteSettings: siteSettingsSingleton,
    statsSnapshot: statsSnapshotSingleton,
    donorsPage: donorsPageSingleton,
    donatePage: donatePageSingleton,
    donationJourney: donationJourneySingleton,
    contactPage: contactPageSingleton,
    termsPage: termsPageSingleton,
    privacyPage: privacyPageSingleton,
    studentsPage: studentsPageSingleton,
    projectsPage: projectsPageSingleton,
    scholarshipsPage: scholarshipsPageSingleton,
    pageMedia: pageMediaSingleton,
  },
});
