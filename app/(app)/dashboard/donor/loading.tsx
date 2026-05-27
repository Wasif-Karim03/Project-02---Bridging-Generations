import {
  SkeletonBlock,
  SkeletonCardGrid,
  SkeletonHeader,
  SkeletonStatTiles,
} from "@/components/ui/SkeletonBlock";

export default function DonorLoading() {
  return (
    <div className="flex flex-col gap-10">
      <SkeletonHeader />
      <SkeletonBlock className="h-16 border border-hairline" />
      <SkeletonStatTiles count={3} />
      <SkeletonCardGrid count={3} cols={3} />
    </div>
  );
}
