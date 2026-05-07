type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
};

const sizeMap: Record<AvatarSize, { px: number; text: string }> = {
  sm: { px: 32, text: "text-[12px]" },
  md: { px: 48, text: "text-[16px]" },
  lg: { px: 80, text: "text-[24px]" },
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0] ?? "";
  if (words.length === 1) return first.slice(0, 2).toUpperCase();
  const second = words[1] ?? "";
  return ((first[0] ?? "") + (second[0] ?? "")).toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const { px, text } = sizeMap[size];
  const base = "inline-block overflow-hidden rounded-full";
  const classes = `${base}${className ? ` ${className}` : ""}`;

  if (src) {
    return (
      // biome-ignore lint/performance/noImgElement: primitive avoids next/image remotePatterns config for now
      <img
        src={src}
        alt={alt ?? name ?? ""}
        width={px}
        height={px}
        className={`${classes} object-cover`}
      />
    );
  }

  const initials = name ? getInitials(name) : "";
  const label = name || undefined;
  const fallbackBase = `flex items-center justify-center bg-ground-3 font-semibold text-accent ${text}`;
  const fallbackClasses = `${classes} ${fallbackBase}`;
  const style = { width: `${px}px`, height: `${px}px` };

  if (label) {
    return (
      <span role="img" aria-label={label} className={fallbackClasses} style={style}>
        {initials}
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={fallbackClasses} style={style}>
      {initials}
    </span>
  );
}
