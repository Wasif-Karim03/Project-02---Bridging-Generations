import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { testimonialCollection } from "@/keystatic/collections/testimonial";
import { reader } from "./reader";

export type Testimonial = Entry<typeof testimonialCollection> & { id: string };

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const entries = await reader.collections.testimonial.all();
  return entries.map(({ slug, entry }) => ({ ...entry, id: slug }));
}

export async function getFeaturedTestimonial(): Promise<Testimonial | undefined> {
  const all = await getAllTestimonials();
  return all[0];
}
