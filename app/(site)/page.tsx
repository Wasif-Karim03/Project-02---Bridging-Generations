import { getRecentActivities } from "@/lib/content/activities";
import { getAllGalleryImages } from "@/lib/content/galleryImages";
import { getFeaturedProjects } from "@/lib/content/projects";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getSpotlightStudents } from "@/lib/content/students";
import { getFeaturedSuccessStories } from "@/lib/content/successStories";
import { getFeaturedTestimonial } from "@/lib/content/testimonials";
import { HomeActivities } from "./_components/HomeActivities";
import { HomeCTAFooter } from "./_components/HomeCTAFooter";
import { HomeGallery } from "./_components/HomeGallery";
import { HomeHeroCarousel } from "./_components/HomeHeroCarousel";
import { HomeMissionBand } from "./_components/HomeMissionBand";
import { HomeNewsTicker } from "./_components/HomeNewsTicker";
import { HomeProgramsGrid } from "./_components/HomeProgramsGrid";
import { HomeSpotlightScroller } from "./_components/HomeSpotlightScroller";
import { HomeSuccessPanel } from "./_components/HomeSuccessPanel";
import { HomeTestimonialPanel } from "./_components/HomeTestimonialPanel";

export default async function Home() {
  // Spec calls for: 7+ recent activities, 6 projects, 3 success stories, 3
  // spotlight students, ~8 gallery photos, 1 testimonial. The hero carousel +
  // ticker are self-contained.
  const [
    settings,
    projects,
    successStories,
    activities,
    tickerActivities,
    students,
    testimonial,
    galleryImages,
  ] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(6),
    getFeaturedSuccessStories(3),
    getRecentActivities(7),
    // Separate fetch keeps the ticker compact regardless of the activity feed
    // depth. 8 keeps the marquee comfortably long.
    getRecentActivities(8),
    getSpotlightStudents(3),
    getFeaturedTestimonial(),
    getAllGalleryImages(),
  ]);

  const tickerItems = tickerActivities.map((a) => ({
    id: a.id,
    title: a.title,
    href: "/activities",
  }));

  return (
    <>
      {/* 1. Scrolling news ticker */}
      <HomeNewsTicker items={tickerItems} />
      {/* 2. Hero slider (3 full-width slides) */}
      <HomeHeroCarousel />
      {/* 3. About BG section */}
      <HomeMissionBand missionFull={settings.missionFull} />
      {/* 4. Success Stories — 3 cards */}
      <HomeSuccessPanel stories={successStories} />
      {/* 5. Recent Activities — 7+ entries with optional PDF */}
      <HomeActivities activities={activities} />
      {/* 6. Students — 3 photos + Donate Now */}
      <HomeSpotlightScroller students={students} />
      {/* 7. Projects — 6 cards with per-project Donate Now */}
      <HomeProgramsGrid projects={projects} />
      {/* 8. Gallery — tab filter + 8 photos */}
      <HomeGallery images={galleryImages} />
      {/* 9. Testimonial — spec heading + send-feedback CTA */}
      {testimonial ? <HomeTestimonialPanel testimonial={testimonial} /> : null}
      <HomeCTAFooter />
    </>
  );
}
