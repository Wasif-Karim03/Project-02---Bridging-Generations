import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { pageMediaSingleton } from "@/keystatic/singletons/pageMedia";
import { reader } from "./reader";

export type PageMedia = Entry<typeof pageMediaSingleton>;

// Fallbacks mirror the original hardcoded paths, so the site renders correctly
// even if the singleton file is ever missing.
const DEFAULTS: PageMedia = {
  homeSlide1Image: "/home-hero.jpg",
  homeSlide2Image: "/activity-visit.jpg",
  homeSlide3Image: "/home-mission.jpg",
  aboutHeroImage: "/home-mission.jpg",
  mentorsHeroImage: "/activity-visit.jpg",
  missionVisionHeroImage: "/home-mission.jpg",
  donationJourneyHeroImage: "/donors-hero.jpg",
  scholarshipsHeroImage: "/project-scholarship.jpg",
};

export async function getPageMedia(): Promise<PageMedia> {
  const entry = await reader.singletons.pageMedia.read();
  if (!entry) return DEFAULTS;
  // Coerce any empty fields back to their default so we never render a blank src.
  return {
    homeSlide1Image: entry.homeSlide1Image || DEFAULTS.homeSlide1Image,
    homeSlide2Image: entry.homeSlide2Image || DEFAULTS.homeSlide2Image,
    homeSlide3Image: entry.homeSlide3Image || DEFAULTS.homeSlide3Image,
    aboutHeroImage: entry.aboutHeroImage || DEFAULTS.aboutHeroImage,
    mentorsHeroImage: entry.mentorsHeroImage || DEFAULTS.mentorsHeroImage,
    missionVisionHeroImage: entry.missionVisionHeroImage || DEFAULTS.missionVisionHeroImage,
    donationJourneyHeroImage: entry.donationJourneyHeroImage || DEFAULTS.donationJourneyHeroImage,
    scholarshipsHeroImage: entry.scholarshipsHeroImage || DEFAULTS.scholarshipsHeroImage,
  };
}
