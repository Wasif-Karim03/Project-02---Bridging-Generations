"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TestimonialCard } from "@/components/domain/TestimonialCard";
import { type FilterChipOption, FilterChips } from "@/components/ui/FilterChips";
import type { Testimonial } from "@/lib/content/testimonials";

const ALL = "all" as const;

const ROLE_VALUES = [
  "parent",
  "teacher",
  "student",
  "alum",
  "board",
  "partner",
  "volunteer",
  "donor",
] as const;

type RoleValue = (typeof ROLE_VALUES)[number];
type Selection = typeof ALL | RoleValue;

const ROLE_LABELS: Record<RoleValue, string> = {
  parent: "Parents",
  teacher: "Teachers",
  student: "Students",
  alum: "Alumni",
  board: "Board",
  partner: "Partners",
  volunteer: "Volunteers",
  donor: "Donors",
};

type TestimonialsGridProps = {
  testimonials: Testimonial[];
  roleCounts: Record<Selection, number>;
};

function isValidRole(value: string | null): value is RoleValue {
  return value != null && (ROLE_VALUES as readonly string[]).includes(value);
}

function readSelectionFromParam(raw: string | null): Selection {
  if (isValidRole(raw)) return raw;
  return ALL;
}

export function TestimonialsGrid({ testimonials, roleCounts }: TestimonialsGridProps) {
  const searchParams = useSearchParams();
  const initial = readSelectionFromParam(searchParams.get("role"));
  const [selection, setSelection] = useState<Selection>(initial);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    function onPop() {
      const params = new URLSearchParams(window.location.search);
      setSelection(readSelectionFromParam(params.get("role")));
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleChange = useCallback((next: Selection) => {
    setSelection(next);
    const target = next === ALL ? "/testimonials" : `/testimonials?role=${next}`;
    window.history.pushState(null, "", target);
  }, []);

  const options: FilterChipOption<Selection>[] = useMemo(() => {
    const availableRoles = ROLE_VALUES.filter((r) => (roleCounts[r] ?? 0) > 0);
    return [
      { value: ALL, label: "All", count: roleCounts[ALL] },
      ...availableRoles.map((r) => ({ value: r, label: ROLE_LABELS[r], count: roleCounts[r] })),
    ];
  }, [roleCounts]);

  const filtered = useMemo(() => {
    const selected =
      selection === ALL ? testimonials : testimonials.filter((t) => t.speakerRole === selection);
    // Order by scale: Feature (partner/board) → Row (alum/donor/teacher) → Tile (student/parent/volunteer).
    // Within a scale, preserve YAML order. Without this, alphabetical slug ordering buries the institutional
    // voice at the bottom of the wall.
    const scale = (role: string) => {
      if (role === "partner" || role === "board") return 0;
      if (role === "alum" || role === "donor" || role === "teacher") return 1;
      return 2;
    };
    return [...selected].sort((a, b) => scale(a.speakerRole) - scale(b.speakerRole));
  }, [selection, testimonials]);

  // Featured panel always renders at the top of the grid: the first testimonial
  // of the highest-priority role available is forced to Feature scale via
  // scaleOverride. Without this, filter selections like "students" rendered as
  // an all-Tile wall with no editorial monument.
  const featuredId = filtered[0]?.id;

  const transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div className="flex flex-col gap-10">
      <FilterChips
        options={options}
        value={selection}
        onChange={handleChange}
        ariaLabel="Filter testimonials by speaker role"
      />
      {filtered.length === 0 ? (
        <p className="text-body text-ink-2" aria-live="polite">
          No testimonials in this group yet.
        </p>
      ) : (
        <div className="flex flex-col" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              >
                <TestimonialCard
                  testimonial={testimonial}
                  scaleOverride={testimonial.id === featuredId ? "feature" : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
