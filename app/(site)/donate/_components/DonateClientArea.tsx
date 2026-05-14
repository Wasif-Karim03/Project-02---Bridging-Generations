"use client";

import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/content/projects";
import { ProjectBanner } from "./ProjectBanner";
import { StripeDonateForm } from "./StripeDonateForm";

type DonateClientAreaProps = {
  projects: Project[];
  suggestedAmounts: number[];
  defaultAmount: number;
  stripeConfigured: boolean;
  fallbackEmail: string;
};

export function DonateClientArea({
  projects,
  suggestedAmounts,
  defaultAmount,
  stripeConfigured,
  fallbackEmail,
}: DonateClientAreaProps) {
  const params = useSearchParams();
  const projectId = params.get("project") ?? "";
  const studentId = params.get("student") ?? "";
  const project = projectId ? projects.find((p) => p.id === projectId) : undefined;

  return (
    <div className="flex flex-col gap-6">
      {project ? <ProjectBanner project={project} /> : null}
      <StripeDonateForm
        suggestedAmounts={suggestedAmounts}
        defaultAmount={defaultAmount}
        preselectedProjectId={project ? projectId : undefined}
        preselectedStudentId={studentId || undefined}
        stripeConfigured={stripeConfigured}
        fallbackEmail={fallbackEmail}
      />
    </div>
  );
}
