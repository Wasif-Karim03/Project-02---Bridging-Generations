"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { StudentCard } from "@/components/domain/StudentCard";
import type { SchoolSummary } from "@/lib/content/schools";
import type { Student } from "@/lib/content/students";

type StudentDirectoryProps = {
  students: Student[];
  schools: SchoolSummary[];
};

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
  const t = useTranslations("students");
  const locale = useLocale();
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);
  const MONTHS = useMemo(() => {
    const monthFmt = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
      month: "long",
    });
    return Array.from({ length: 12 }, (_, i) => monthFmt.format(new Date(2000, i)));
  }, [locale]);

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
                {t("searchFilter")}
              </h2>
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-meta text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  {t("clearAll")}
                </button>
              ) : null}
            </div>

            <FilterText
              label={t("labelName")}
              value={filters.name}
              onChange={(v) => updateFilter("name", v)}
              placeholder={t("placeholderFirstName")}
            />
            <FilterText
              label={t("labelVillage")}
              value={filters.village}
              onChange={(v) => updateFilter("village", v)}
              placeholder={t("placeholderVillageName")}
            />
            <FilterSelect
              label={t("labelClass")}
              value={filters.grade}
              onChange={(v) => updateFilter("grade", v)}
            >
              <option value="">{t("optionAllClasses")}</option>
              {grades.map((g) => (
                <option key={g} value={String(g)}>
                  {t("gradeOption", { grade: fmt.format(g) })}
                </option>
              ))}
            </FilterSelect>
            <FilterText
              label={t("labelRegion")}
              value={filters.region}
              onChange={(v) => updateFilter("region", v)}
              placeholder={t("placeholderRegion")}
            />
            <FilterText
              label={t("labelArea")}
              value={filters.area}
              onChange={(v) => updateFilter("area", v)}
              placeholder={t("placeholderArea")}
            />
            <FilterSelect
              label={t("labelSchool")}
              value={filters.schoolId}
              onChange={(v) => updateFilter("schoolId", v)}
            >
              <option value="">{t("optionAllSchools")}</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label={t("labelSponsorship")}
              value={filters.status}
              onChange={(v) => updateFilter("status", v)}
            >
              <option value="">{t("optionAllStatus")}</option>
              <option value="sponsored">{t("optionSponsored")}</option>
              <option value="waiting">{t("optionAwaitingSponsor")}</option>
            </FilterSelect>
            <FilterSelect
              label={t("labelYear")}
              value={filters.year}
              onChange={(v) => updateFilter("year", v)}
            >
              <option value="">{t("optionAnyYear")}</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  {fmt.format(y)}
                </option>
              ))}
            </FilterSelect>
            <FilterSelect
              label={t("labelMonth")}
              value={filters.month}
              onChange={(v) => updateFilter("month", v)}
            >
              <option value="">{t("optionAnyMonth")}</option>
              {MONTHS.map((label, i) => (
                <option key={label} value={String(i + 1)}>
                  {label}
                </option>
              ))}
            </FilterSelect>

            <p className="border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
              {t("studentCount", {
                filtered: fmt.format(filtered.length),
                total: fmt.format(students.length),
              })}
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

          {filtered.length === 0 ? (
            <p className="text-body text-ink-2">No students match the current filter.</p>
          ) : (
            <>
              <p className="text-meta uppercase tracking-[0.12em] text-ink-2">
                {filtered.length} {filtered.length === 1 ? "student" : "students"}
              </p>
              {/* Uniform grid — every student card is the same size. */}
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((student) => (
                  <li key={student.id} className="h-full">
                    <StudentCard student={student} />
                  </li>
                ))}
              </ul>
            </>
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
