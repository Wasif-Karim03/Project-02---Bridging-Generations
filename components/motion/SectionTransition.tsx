"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

type SectionTransitionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionTransition({ children, className = "", id }: SectionTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  useEffect(() => setHydrated(true), []);

  const animate = hydrated && !shouldReduceMotion;

  return (
    <motion.section
      id={id}
      ref={ref}
      style={animate ? { opacity } : undefined}
      className={`${animate ? "will-change-opacity " : ""}${className}`}
    >
      {children}
    </motion.section>
  );
}
