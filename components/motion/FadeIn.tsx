"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const SMOOTH = [0.16, 1, 0.3, 1] as const;

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();
  const animate = !shouldReduceMotion;

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 40 } : false}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-100px" }}
      transition={animate ? { duration: 0.8, ease: SMOOTH, delay } : undefined}
      className={`${animate ? "will-change-transform will-change-opacity " : ""}${className}`}
    >
      {children}
    </motion.div>
  );
}
