"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";

type ScrollProgressBarProps = {
  color?: string;
};

export function ScrollProgressBar({ color = "#B8944F" }: ScrollProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 z-50 h-[2px] origin-left will-change-transform"
      style={{ scaleX: scrollYProgress, background: color }}
    />
  );
}
