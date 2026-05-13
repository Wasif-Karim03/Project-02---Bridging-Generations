"use client";

import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/domain/StudentCard";
import { MuseumWall, ScaleGrid } from "@/components/ui/editorial";
import { type FilterChipOption, FilterChips } from "@/components/ui/FilterChips";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import type { School } from "@/lib/content/schools";
import type { Student } from "@/lib/content/students";

type StudentDirectoryProps = {
  students: Student[];
  schools: School[];
};

type SchoolFilter = "all" | string;
type StatusFilter = "all" | "sponsored" | "waiting";

export function StudentDirectory({ students, schools }: StudentDirectoryProps) {
  const [schoolFilter, setSchoolFilter] = useState<SchoolFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // School + status counts respect the *other* filter so the chip totals reflect
  // what selecting that chip would actually surface, not the unfiltered population.
  const schoolOptions = useMemo<FilterChipOption<SchoolFilter>[]>(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      if (statusFilter !== "all" && s.sponsorshipStatus !== statusFilter) continue;
      counts.set(s.schoolId, (counts.get(s.schoolId) ?? 0) + 1);
    }
    const total = Array.from(counts.values()).reduce((sum, n) => sum + n, 0);
    const opts: FilterChipOption<SchoolFilter>[] = [
      { value: "all", label: "All schools", count: total },
    ];
    for (const school of schools) {
      const count = counts.get(school.id) ?? 0;
      if (count === 0 && schoolFilter !== school.id) continue;
      opts.push({ value: school.id, label: school.name, count });
    }
    return opts;
  }, [students, schools, statusFilter, schoolFilter]);

  const statusOptions = useMemo<FilterChipOption<StatusFilter>[]>(() => {
    const within = (s: Student) => schoolFilter === "all" || s.schoolId === schoolFilter;
    const total = students.filter(within).length;
    const sponsored = students.filter(
      (s) => within(s) && s.sponsorshipStatus === "sponsored",
    ).length;
    const waiting = students.filter((s) => within(s) && s.sponsorshipStatus === "waiting").length;
    return [
      { value: "all", label: "All status", count: total },
      { value: "sponsored", label: "Sponsored", count: sponsored },
      { value: "waiting", label: "Awaiting sponsor", count: waiting },
    ];
  }, [students, schoolFilter]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (schoolFilter !== "all" && s.schoolId !== schoolFilter) return false;
      if (statusFilter !== "all" && s.sponsorshipStatus !== statusFilter) return false;
      return true;
    });
  }, [students, schoolFilter, statusFilter]);

  const featured = useMemo(
    () =>
      filtered.filter((s) => canShowPortrait(s.consent) && Boolean(s.portrait?.src)).slice(0, 8),
    [filtered],
  );

  const schoolById = useMemo(() => new Map(schools.map((s) => [s.id, s])), [schools]);

  // Group filtered students by school for the directory wall, alphabetically by
  // displayName within each group. School ordering follows the canonical schools
  // list (already sorted by name in groupStudentsBySchool consumers).
  const grouped = useMemo(() => {
    const map = new Map<string, Student[]>();
    for (const s of filtered) {
      const bucket = map.get(s.schoolId) ?? [];
      bucket.push(s);
      map.set(s.schoolId, bucket);
    }
    return Array.from(map.entries())
      .map(([schoolId, list]) => ({
        school: schoolById.get(schoolId),
        students: [...list].sort((a, b) => a.displayName.localeCompare(b.displayName)),
      }))
      .filter((g): g is { school: School; students: Student[] } => Boolean(g.school))
      .sort((a, b) => a.school.name.localeCompare(b.school.name));
  }, [filtered, schoolById]);

  return (
    <section
      aria-labelledby="students-directory-title"
      className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
    >
      <div className="mx-auto max-w-[1280px] flex flex-col gap-12">
        <header className="flex flex-col gap-6 border-t border-hairline pt-12">
          <h2
            id="students-directory-title"
            className="text-balance text-heading-3 text-ink lg:text-heading-2"
          >
            Browse the directory.
          </h2>
          <div className="flex flex-col gap-3">
            <FilterChips
              ariaLabel="Filter by school"
              options={schoolOptions}
              value={schoolFilter}
              onChange={setSchoolFilter}
            />
            <FilterChips
              ariaLabel="Filter by sponsorship status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </header>

        {featured.length > 0 ? (
          <ScaleGrid>
            {featured.map((student, index) => (
              <ScaleGrid.Cell key={student.id} span={index === 0 ? 6 : 3}>
                <StudentCard student={student} />
              </ScaleGrid.Cell>
            ))}
          </ScaleGrid>
        ) : null}

        {grouped.length === 0 ? (
          <p className="text-body text-ink-2">No students match the current filter.</p>
        ) : (
          <MuseumWall ariaLabel="Student directory">
            <MuseumWall.Caption>
              {filtered.length} {filtered.length === 1 ? "student" : "students"}
            </MuseumWall.Caption>
            {grouped.map(({ school, students: list }) => (
              <div key={school.id} className="break-inside-avoid">
                <MuseumWall.Tier label={school.name} count={list.length} scale="lg" />
                <ul className="mt-3 flex flex-col gap-3">
                  {list.map((student) => (
                    <li key={student.id}>
                      <Link
                        href={`/students/${student.id}`}
                        className="group/link inline-block text-heading-5 text-ink transition-colors hover:text-accent-2-text focus-visible:text-accent-2-text focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
                      >
                        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:bg-[length:100%_1px] group-focus-visible/link:bg-[length:100%_1px]">
                          {student.displayName}
                        </span>
                        <span className="ml-2 text-meta uppercase tracking-[0.04em] text-ink-2">
                          Grade {student.grade}
                          {" · "}
                          {student.sponsorshipStatus === "sponsored"
                            ? "sponsored"
                            : "awaiting sponsor"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </MuseumWall>
        )}
      </div>
    </section>
  );
}
