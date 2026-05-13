import { getRecentActivities } from "@/lib/content/activities";
import { isPlaceholder } from "@/lib/content/isPlaceholder";
import { getFeaturedProjects } from "@/lib/content/projects";
import { getAllSchools } from "@/lib/content/schools";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { getStatsSnapshot } from "@/lib/content/statsSnapshot";
import { getSpotlightStudents } from "@/lib/content/students";
import { getFeaturedSuccessStory } from "@/lib/content/successStories";
import { getFeaturedTestimonial } from "@/lib/content/testimonials";
import { HomeActivities } from "./_components/HomeActivities";
import { HomeCTAFooter } from "./_components/HomeCTAFooter";
import { HomeHero } from "./_components/HomeHero";
import { HomeMissionBand } from "./_components/HomeMissionBand";
import { HomeProgramsGrid } from "./_components/HomeProgramsGrid";
import { HomeSpotlightScroller } from "./_components/HomeSpotlightScroller";
import { HomeSuccessPanel } from "./_components/HomeSuccessPanel";
import { HomeTestimonialPanel } from "./_components/HomeTestimonialPanel";

export default async function Home() {
  const [stats, settings, projects, story, activities, students, testimonial, allSchools] =
    await Promise.all([
      getStatsSnapshot(),
      getSiteSettings(),
      getFeaturedProjects(2),
      getFeaturedSuccessStory(),
      getRecentActivities(2),
      getSpotlightStudents(6),
      getFeaturedTestimonial(),
      getAllSchools(),
    ]);

  // Match the /students + /about gate: schools whose description starts
  // with [CONFIRM:] are unverified and excluded from the live count.
  const confirmedSchoolCount = allSchools.filter(
    (school) => !school.description || !isPlaceholder(school.description),
  ).length;
  const liveStats = { ...stats, schoolCount: confirmedSchoolCount };

  return (
    <>
      <HomeHero stats={liveStats} />
      <HomeMissionBand missionFull={settings.missionFull} />
      <HomeProgramsGrid projects={projects} />
      {story ? <HomeSuccessPanel story={story} /> : null}
      <HomeActivities activities={activities} />
      <HomeSpotlightScroller students={students} />
      {testimonial ? <HomeTestimonialPanel testimonial={testimonial} /> : null}
      <HomeCTAFooter />
    </>
  );
}
