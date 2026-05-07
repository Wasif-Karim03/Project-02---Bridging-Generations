"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CoralArc } from "@/components/motif/CoralArc";
import { Button } from "@/components/ui/Button";
import type { StatsSnapshot } from "@/lib/content/statsSnapshot";

type HomeHeroProps = {
  stats: StatsSnapshot;
};

const SMOOTH = [0.16, 1, 0.3, 1] as const;

export function HomeHero({ stats }: HomeHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasHydrated, setHasHydrated] = useState(false);
  const canAnimate = hasHydrated && !shouldReduceMotion;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const headlineLines = stats.homeHeroHeadline
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const closingLine = headlineLines[headlineLines.length - 1] ?? "";
  const leadingLines = headlineLines.slice(0, -1);

  const fadeUp = (delayMs: number, durationMs = 600) =>
    canAnimate
      ? {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: durationMs / 1000, delay: delayMs / 1000, ease: SMOOTH },
        }
      : undefined;

  return (
    <section
      id="hero"
      aria-labelledby="home-hero-title"
      className="relative scroll-mt-20 overflow-hidden bg-ground"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-8 px-[6%] py-12 sm:gap-10 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
        {/* LEFT — the image, nothing else */}
        <motion.div
          className="relative aspect-[3/2] w-full overflow-hidden bg-ground-3 lg:order-1 lg:aspect-[4/5]"
          initial={canAnimate ? { opacity: 0, y: 12 } : false}
          animate={canAnimate ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: SMOOTH }}
        >
          <Image
            src="/home-hero.jpg"
            alt="Students in a Bangladesh classroom hold up their drawings beside their teacher"
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </motion.div>

        {/* RIGHT — four elements, generous breathing room */}
        <div className="flex flex-col gap-7 lg:order-2 lg:gap-8">
          <motion.p className="text-eyebrow uppercase text-accent" {...fadeUp(200, 500)}>
            {stats.homeHeroEyebrow}
          </motion.p>

          <motion.h1
            id="home-hero-title"
            className="text-pretty text-display-2 leading-[1.05] text-ink"
            {...fadeUp(300, 700)}
          >
            {leadingLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <span className="inline-block max-w-full">
              <span className="block">{closingLine}</span>
              <motion.span
                aria-hidden="true"
                className="-mt-1 block"
                style={{ transformOrigin: "left" }}
                initial={canAnimate ? { scaleX: 0 } : false}
                animate={canAnimate ? { scaleX: 1 } : undefined}
                transition={{ duration: 0.8, delay: 0.95, ease: SMOOTH }}
              >
                <CoralArc className="block w-full" />
              </motion.span>
            </span>
          </motion.h1>

          <motion.p className="max-w-[44ch] text-body-lg text-ink-2" {...fadeUp(500, 600)}>
            {stats.homeHeroSubhead}
          </motion.p>

          <motion.div {...fadeUp(650, 500)}>
            <Button variant="primary" href="/donate">
              Sponsor a Student
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
