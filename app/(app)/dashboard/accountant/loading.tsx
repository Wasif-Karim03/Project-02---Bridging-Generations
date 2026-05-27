import { SkeletonBlock, SkeletonHeader, SkeletonStatTiles } from "@/components/ui/SkeletonBlock";

export default function AccountantLoading() {
  return (
    <div className="flex flex-col gap-10">
      <SkeletonHeader />
      <SkeletonStatTiles count={3} />
      <SkeletonBlock className="h-12 w-72" />
      <SkeletonBlock className="h-64 border border-hairline" />
    </div>
  );
}
