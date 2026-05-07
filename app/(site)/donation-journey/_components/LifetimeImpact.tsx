"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { useRevealVisible } from "@/components/ui/RevealVisibleContext";

type LifetimeImpactProps = {
  totalRaisedAllTime: number;
  totalStudentsAllTime: number;
  totalDonorsAllTime: number;
};

function CountUpNumber({ target, prefix = "" }: { target: number; prefix?: string }) {
  const visible = useRevealVisible();
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1200;

  useEffect(() => {
    if (!visible) return;
    startRef.current = null;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const progress = Math.min((now - startRef.current) / DURATION, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayed(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, target]);

  return (
    <span>
      {prefix}
      {displayed.toLocaleString("en-US")}
    </span>
  );
}

export function LifetimeImpact({
  totalRaisedAllTime,
  totalStudentsAllTime,
  totalDonorsAllTime,
}: LifetimeImpactProps) {
  const stats = [
    { label: "Raised all time", value: totalRaisedAllTime, prefix: "$" },
    { label: "Students supported", value: totalStudentsAllTime },
    { label: "Individual donors", value: totalDonorsAllTime },
  ];

  return (
    <section
      aria-labelledby="lifetime-impact-title"
      className="bg-ground-2 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
    >
      <div className="mx-auto max-w-[1280px] flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>Impact to date</Eyebrow>
          <h2 id="lifetime-impact-title" className="text-balance text-display-2 text-ink">
            Five years of collective giving
          </h2>
        </div>
        <Reveal kind="count-up-wrapper" cascade className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 border-t border-hairline pt-6">
              <p className="text-display-1 font-bold tabular-nums text-ink">
                <CountUpNumber target={stat.value} prefix={stat.prefix} />
              </p>
              <p className="text-meta uppercase tracking-[0.1em] text-ink-2">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
