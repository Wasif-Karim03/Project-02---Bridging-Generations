import { SkeletonCardGrid, SkeletonHeader } from "@/components/ui/SkeletonBlock";

export default function MentorLoading() {
  return (
    <div className="flex flex-col gap-10">
      <SkeletonHeader />
      <SkeletonCardGrid count={3} cols={3} />
    </div>
  );
}
