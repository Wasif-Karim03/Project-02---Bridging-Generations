import { TestimonialPanel } from "@/components/domain/TestimonialPanel";
import { Reveal } from "@/components/ui/Reveal";
import type { Testimonial } from "@/lib/content/testimonials";

type HomeTestimonialPanelProps = {
  testimonial: Testimonial;
};

export function HomeTestimonialPanel({ testimonial }: HomeTestimonialPanelProps) {
  return (
    <Reveal stagger="scale-in">
      <TestimonialPanel
        testimonial={testimonial}
        titleId="home-testimonial-title"
        id="testimonial"
        ctaLabel="Meet the students"
        ctaHref="/students"
      />
    </Reveal>
  );
}
