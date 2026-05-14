"use client";

import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/domain/StudentCard";
import { MuseumWall, ScaleGrid } from "@/components/ui/editorial";
import { canShowPortrait } from "@/lib/content/canShowPortrait";
import type { SchoolSummary } from "@/lib/content/schools";
import type { Student } from "@/lib/content/students";

type StudentDirectoryProps = {
  students: Student[];
  schools: SchoolSummary[];
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type FilterState = {
  name: string;
  village: string;
  grade: string; // "" = any, "10" = grade 10
  region: string;
  area: string;
  schoolId: string; // "" = any
  status: string; // "", "sponsored", "waiting"
  year: string; // "" = any, "2025" = enrolled year
  month: string; // "" = any, "1"..."12"
};

const EMPTY_FILTERS: FilterState = {
  name: "",
  village: "",
  grade: "",
  region: "",
  area: "",
  schoolId: "",
  status: "",
  year: "",
  month: "",
};

function safe(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().trim();
}

function enrolledYear(student: Student): number | null {
  if (!student.enrolledAt) return null;
  const d = new Date(student.enrolledAt);
  return Number.isNaN(d.getTime()) ? null : d.getUTCFullYear();
}

function enrolledMonth(student: Student): number | null {
  if (!student.enrolledAt) return null;
  const d = new Date(student.enrolledAt);
  return Number.isNaN(d.getTime()) ? null : d.getUTCMonth() + 1;
}

export function StudentDirectory({ students, schools }: StudentDirectoryProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  const grades = useMemo(() => {
    const set = new Set<number>();
    for (const s of students) set.add(s.grade);
    return Array.from(set).sort((a, b) => a - b);
  }, [students]);

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const s of students) {
      const y = enrolledYear(s);
      if (y) set.add(y);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [students]);

  const filtered = useMemo(() => {
    const nameQ = safe(filters.name);
    const villageQ = safe(filters.village);
    const regionQ = safe(filters.region);
    const areaQ = safe(filters.area);

    return students.filter((s) => {
      if (nameQ && !safe(s.displayName).includes(nameQ)) return false;
      if (villageQ && !safe(s.village).includes(villageQ)) return false;
      if (regionQ && !safe(s.region).includes(regionQ)) return false;
      if (areaQ && !safe(s.area).includes(areaQ)) return false;
      if (filters.grade && String(s.grade) !== filters.grade) return false;
      if (filters.schoolId && s.schoolId !== filters.schoolId) return false;
      if (filters.status && s.sponsorshipStatus !== filters.status) return false;
      if (filters.year) {
        const y = enrolledYear(s);
        if (y === null || String(y) !== filters.year) return false;
      }
      if (filters.month) {
        const m = enrolledMonth(s);
        if (m === null || String(m) !== filters.month) return false;
      }
      return true;
    });
  }, [students, filters]);

  const activeCount = useMemo(() => {
    return Object.entries(filters).filter(([, v]) => Boolean(v)).length;
  }, [filters]);

  const featured = useMemo(
    () =>
      filtered.filter((s) => canShowPortrait(s.consent) && Boolean(s.portrait?.src)).slice(0, 6),
    [filtered],
  );

  const schoolById = useMemo(() => new Map(schools.map((s) => [s.id, s])), [schools]);

  // Group filtered students by school then alphabetical.
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
      .filter((g): g is { school: SchoolSummary; students: Student[] } => Boolean(g.school))
      .sort((a, b) => a.school.name.localeCompare(b.school.name));
  }, [filtered, schoolById]);

  return (
    <section
      aria-labelledby="students-directory-title"
      className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
    >
      <div className="mx-auto max-w-[1280px] flex flex-col gap-8 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
        {/* Left sidebar — multi-field search */}
        <aside
          aria-labelledby="students-filter-title"
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <div className="flex flex-col gap-5 border-t border-hairline pt-6 lg:border-t-0 lg:pt-0">
            <div className="flex items-baseline justify-between">
              <h2
                id="students-filter-title"
                className="text-eyebrow uppercase tracking-[0.1em] text-ink"
              >
                Search & Filter
              </h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-meta text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <FilterText
              label="Name"
              value={filters.name}
              onChange={(v) => updateFilter("name", v)}
              placeholder="First name"
            />
            <FilterText
              label="Village"
              value={filters.village}
              onChange={(v) => updateFilter("village", v)}
              placeholder="Village name"
            />
            <FilterSelect
              label="Class"
              value={filters.grade}
              onChange={(v) => updateFilter("grade", v)}
            >
              <option value="">All classes</option>
              {grades.map((g) => (
                <option key={g} value={String(g)}>
                  Grade {g}
                </option>
              ))}
            </FilterSelect>
            <FilterText
              label="Region"
              value={filters.region}
              onChange={(v) => updateFilter("region", v)}
              placeholder="e.g. Rangamati"
            />
            <FilterText
              label="Area"
              value={filters.area}
              onChange={(v) => updateFilter("area", v)}
              placeholder="Narrower area"
            />
            <FilterSelect
              label="School"
              value={filters.schoolId}
              onChange={(v) => updateFilter("schoolId", v)}
            >
              <option value="">All schools</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Sponsorship"
              value={filters.status}
              onChange={(v) => updateFilter("status", v)}
            >
              <option value="">All status</option>
              <option value="sponsored">Sponsored</option>
              <option value="waiting">Awaiting sponsor</option>
            </FilterSelect>
            <FilterSelect
              label="Year (enrolled)"
              value={filters.year}
              onChange={(v) => updateFilter("year", v)}
            >
              <option value="">Any year</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label="Month (enrolled)"
              value={filters.month}
              onChange={(v) => updateFilter("month", v)}
            >
              <option value="">Any month</option>
              {MONTHS.map((label, i) => (
                <option key={label} value={String(i + 1)}>
                  {label}
                </option>
              ))}
            </FilterSelect>

            <p className="border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
              {filtered.length} of {students.length} students
            </p>
          </div>
        </aside>

        {/* Right — results */}
        <div className="flex flex-col gap-12">
          <header className="flex flex-col gap-3 border-t border-hairline pt-6">
            <h2
              id="students-directory-title"
              className="text-balance text-heading-3 text-ink lg:text-heading-2"
            >
              Browse the directory.
            </h2>
            <p className="max-w-[60ch] text-body-sm text-ink-2">
              First names only. Portraits render only when a signed, in-scope release is on file —
              otherwise a neutral placeholder takes its place.
            </p>
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
      </div>
    </section>
  );
}

function FilterText({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 border border-hairline bg-ground-2 px-3 text-body-sm text-ink placeholder:text-ink-2/60 focus:border-accent focus:outline-none"
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border border-hairline bg-ground-2 px-3 text-body-sm text-ink focus:border-accent focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}
