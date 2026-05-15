"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { useCallback, useEffect, useRef, useState } from "react";

const SMOOTH = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 6500;

type Slide = {
  eyebrow: string;
  headline: string;
  image: string;
  imageAlt: string;
  cta: { href: string; label: string };
};

// Spec slides — three full-bleed hero stages with the exact headlines from the
// owner doc. Each shows an eyebrow ("Help the Future"), a display headline
// ("Make a Better World"), and a single CTA → /students.
const SLIDES: Slide[] = [
  {
    eyebrow: "Help the Future",
    headline: "Make a Better World",
    image: "/home-hero.jpg",
    imageAlt: "Students in a Bangladesh classroom hold up their drawings beside their teacher",
    cta: { href: "/be-a-donor", label: "Be a Donor" },
  },
  {
    eyebrow: "Togetherness Empowers Us",
    headline: "Make the Children Smile",
    image: "/activity-visit.jpg",
    imageAlt: "A field visit at a Hill Tracts school — staff and students gathered outside",
    cta: { href: "/be-a-donor", label: "Be a Donor" },
  },
  {
    eyebrow: "The Child Education",
    headline: "Save the Children",
    image: "/home-mission.jpg",
    imageAlt: "A schoolboy in uniform reads a book in a library corner",
    cta: { href: "/be-a-donor", label: "Be a Donor" },
  },
];

export function HomeHeroCarousel() {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay. Skipped under reduced motion or when paused (hover/focus).
  useEffect(() => {
    if (shouldReduceMotion || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [shouldReduceMotion, paused]);

  // Keyboard nav: ArrowLeft / ArrowRight when focus is inside the carousel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const slide = SLIDES[index];

  return (
    <section
      id="hero"
      aria-roledescription="carousel"
      aria-label="Bridging Generations highlights"
      aria-labelledby="home-hero-title"
      ref={containerRef}
      tabIndex={-1}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        if (start == null || end == null) return;
        const dx = end - start;
        if (Math.abs(dx) > 40) {
          if (dx < 0) goNext();
          else goPrev();
        }
        touchStartX.current = null;
      }}
      className="relative scroll-mt-20 overflow-hidden bg-accent"
    >
      <div className="relative h-[clamp(420px,70vh,720px)] w-full">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: SMOOTH }}
            aria-roledescription="slide"
            aria-label={`Slide ${index + 1} of ${SLIDES.length}: ${slide.headline}`}
          >
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            {/* Darken overlay so white type clears AA on any photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/15"
            />
          </motion.div>
        </AnimatePresence>

        {/* Copy block */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1280px] px-[6%]">
            <AnimatePresence mode="sync">
              <motion.div
                key={`copy-${index}`}
                className="max-w-[34ch] text-white"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: SMOOTH }}
              >
                <p className="text-eyebrow uppercase text-accent-3">{slide.eyebrow}</p>
                <h1 id="home-hero-title" className="mt-4 text-balance text-display-1 text-white">
                  {slide.headline}
                </h1>
                <div className="mt-7">
                  <Link
                    href={slide.cta.href}
                    className="inline-flex min-h-[48px] items-center bg-accent-2 px-6 text-[19px] font-bold uppercase leading-none text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover active:bg-accent-2-hover"
                  >
                    {slide.cta.label}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controls — prev/next + pagination dots */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-4">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous slide"
          className="pointer-events-auto flex size-11 items-center justify-center text-white opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next slide"
          className="pointer-events-auto flex size-11 items-center justify-center text-white opacity-70 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center">
        {SLIDES.map((s, i) => (
          <button
            type="button"
            key={s.headline}
            aria-label={`Go to slide ${i + 1}: ${s.headline}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => goTo(i)}
            className="flex size-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span
              aria-hidden="true"
              className={
                i === index
                  ? "block h-2 w-8 bg-white transition-all"
                  : "block h-2 w-2 bg-white/50 transition-all hover:bg-white/80"
              }
            />
          </button>
        ))}
      </div>
    </section>
  );
}
