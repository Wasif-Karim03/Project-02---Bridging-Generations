// Circular donor avatar. Shows the uploaded photo when present, otherwise the
// Bridging Generations "BG" monogram as a branded placeholder.
export function DonorAvatar({
  name,
  photoUrl,
  className = "size-24",
  monogramClassName = "text-heading-3",
}: {
  name: string;
  photoUrl: string | null;
  className?: string;
  monogramClassName?: string;
}) {
  if (photoUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: arbitrary external donor photo URL
      <img
        src={photoUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      aria-label="Bridging Generations"
      className={`grid shrink-0 place-items-center rounded-full bg-accent font-bold tracking-[-0.02em] text-white ${monogramClassName} ${className}`}
    >
      BG
    </span>
  );
}
