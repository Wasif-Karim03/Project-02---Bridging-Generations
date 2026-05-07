import Image from "next/image";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

type AboutHeroProps = {
  foundingYear: number;
};

export function AboutHero({ foundingYear }: AboutHeroProps) {
  return (
    <section
      id="hero"
      aria-labelledby="about-hero-title"
      className="scroll-mt-20 overflow-x-clip bg-ground-3 px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
        <Reveal stagger="up">
          <div className="flex flex-col gap-6">
            <Eyebrow>About us</Eyebrow>
            <h1 id="about-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
              Empowering the Hill Tracts.
            </h1>
            <p className="max-w-[44ch] text-body-lg text-ink-2">
              Since {foundingYear}, Bridging Generations has sponsored students across the
              Chittagong Hill Tracts — covering tuition, books, daily meals, and the materials that
              keep a child in school instead of pulled into early labor.
            </p>
            <Link
              href="#mission"
              className="group inline-flex items-center gap-1 text-nav-link uppercase text-accent transition hover:text-accent-2"
            >
              Read our mission
              <span
                aria-hidden="true"
                className="transition-transform motion-safe:group-hover:translate-y-0.5"
              >
                ↓
              </span>
            </Link>
          </div>
        </Reveal>
        <Reveal stagger="right" delay={150}>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
            <Image
              src="/home-mission.jpg"
              alt="A schoolboy in uniform sits in a library corner reading a book"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
