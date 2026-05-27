import { SkeletonBlock, SkeletonHeader } from "@/components/ui/SkeletonBlock";

export default function StudentLoading() {
  return (
    <div className="flex flex-col gap-8">
      <SkeletonHeader />
      <SkeletonBlock className="h-40 border border-hairline" />
    </div>
  );
}
