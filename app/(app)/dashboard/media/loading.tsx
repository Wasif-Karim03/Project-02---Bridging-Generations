import { SkeletonCardGrid, SkeletonHeader } from "@/components/ui/SkeletonBlock";

export default function MediaLoading() {
  return (
    <div className="flex flex-col gap-10">
      <SkeletonHeader />
      <SkeletonCardGrid count={6} cols={3} />
    </div>
  );
}
