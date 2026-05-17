import type { MetadataRoute } from "next";
import { getAllStudents } from "@/lib/content/students";
import { SITE_URL } from "@/lib/seo/siteUrl";

// Sitemap for the public marketing surfaces. Dashboards, auth pages, and
// /donate/thank-you are excluded — they're either gated (noindex) or
// per-user destinations that don't belong in search.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = SITE_URL.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/students",
    "/mentors",
    "/donors",
    "/projects",
    "/projects/scholarships",
    "/activities",
    "/gallery",
    "/blog",
    "/success-stories",
    "/testimonials",
    "/mission-vision",
    "/donation-journey",
    "/contact",
    "/donate",
    "/be-a-donor",
    "/apply/scholarship",
    "/apply/mentor",
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1.0 : 0.7,
  }));

  // Dynamic student profile pages — one per Keystatic entry. Resilient if
  // the content reader fails: skip and ship the static list.
  let studentRoutes: MetadataRoute.Sitemap = [];
  try {
    const students = await getAllStudents();
    studentRoutes = students.map((s) => ({
      url: `${base}/students/${s.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.warn("[sitemap] could not enumerate students", err);
  }

  return [...staticRoutes, ...studentRoutes];
}
