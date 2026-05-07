import Image from "next/image";
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";

type Aspect = "1/1" | "3/2" | "4/5" | "5/6";

const aspectClass: Record<Aspect, string> = {
  "1/1": "aspect-[1/1]",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
  "5/6": "aspect-[5/6]",
};

type TileProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

function TileRoot({ href, children, className, ariaLabel }: TileProps) {
  const base = "group block";
  const merged = className ? `${base} ${className}` : base;
  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={`${merged} focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent`}
      >
        {children}
      </Link>
    );
  }
  return <div className={merged}>{children}</div>;
}

type TileImageProps = {
  src: string;
  alt: string;
  aspect?: Aspect;
  sizes?: string;
  priority?: boolean;
};

function TileImage({ src, alt, aspect = "4/5", sizes, priority }: TileImageProps) {
  return (
    <div className={`relative w-full overflow-hidden bg-ground-3 ${aspectClass[aspect]}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        sizes={sizes ?? "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
        className="object-cover transition-[filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:saturate-[1.04] motion-safe:group-hover:brightness-[1.02] motion-safe:group-focus-visible:saturate-[1.04] motion-safe:group-focus-visible:brightness-[1.02] motion-safe:group-active:saturate-[1.04] motion-safe:group-active:brightness-[1.02]"
      />
    </div>
  );
}

type TileLabelProps = {
  children: ReactNode;
};

function TileLabel({ children }: TileLabelProps) {
  return (
    <p className="mt-3 text-meta uppercase tracking-[0.04em] text-ink-2 transition-colors duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent-2-text group-focus-visible:text-accent-2-text group-active:text-accent-2-text">
      {children}
    </p>
  );
}

export const Tile = Object.assign(TileRoot, {
  Image: TileImage,
  Label: TileLabel,
});
