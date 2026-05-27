import {
  SkeletonBlock,
  SkeletonCardGrid,
  SkeletonHeader,
  SkeletonStatTiles,
} from "@/components/ui/SkeletonBlock";

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8">
      <SkeletonBlock className="h-16 border-2 border-ink bg-ink/10" />
      <SkeletonHeader />
      <SkeletonStatTiles count={4} />
      <SkeletonCardGrid count={4} cols={2} />
    </div>
  );
}
