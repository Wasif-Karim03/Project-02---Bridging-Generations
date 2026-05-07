import Image from "next/image";

type StudentPlaceholderProps = {
  /**
   * Alt is intentionally privacy-preserving — the label should not identify a
   * specific student. The image is a soft photographic stand-in (open
   * notebook with dried botanical, neutral palette) rather than an abstract
   * texture, per the user's "real CC0 photos, never abstract" rule. Source:
   * Pexels photo 8947762 by Karola G (kaboompics.com), Pexels license — free
   * commercial use, no attribution required.
   */
  label?: string;
  className?: string;
  sizes?: string;
};

export function StudentPlaceholder({
  label = "Portrait not shown to protect the student's privacy",
  className,
  sizes,
}: StudentPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative h-full w-full overflow-hidden bg-ground-3 ${className ?? ""}`.trim()}
    >
      <Image
        src="/images/student-placeholder.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}
