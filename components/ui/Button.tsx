import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";

type CommonProps = {
  variant?: Variant;
  loading?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonOnlyProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type LinkOnlyProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children"> & {
    href: string;
  };

export type ButtonProps = ButtonOnlyProps | LinkOnlyProps;

// Label size/weight are applied on the inner span (see ButtonInner) so the span
// directly meets WCAG 1.4.3 "large text" thresholds (14pt bold) — the only way
// white-on-accent-2 (3.09:1 per axe) passes AA without changing brand coral.
const base =
  "group inline-flex items-center transition focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "min-h-[44px] justify-center gap-2 bg-accent-2 px-6 py-3 text-white shadow-[var(--shadow-cta)] hover:bg-accent-2-hover motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]",
  secondary:
    "min-h-[44px] justify-center gap-2 border border-accent bg-transparent px-6 py-3 text-accent hover:bg-accent hover:text-white active:bg-accent active:text-white",
  tertiary: "gap-1 text-accent hover:text-accent-2-text active:text-accent-2-text",
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

function ButtonInner({
  variant,
  loading,
  children,
}: {
  variant: Variant;
  loading?: boolean;
  children: ReactNode;
}) {
  const labelClasses = ["text-[19px] font-bold leading-none", loading ? "opacity-70" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <>
      {loading ? <Spinner /> : null}
      <span className={labelClasses}>{children}</span>
      {variant === "tertiary" && !loading && (
        <span
          aria-hidden="true"
          className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-active:translate-x-1"
        >
          →
        </span>
      )}
    </>
  );
}

export function Button(props: ButtonProps) {
  const { variant = "primary", loading, className, children } = props;
  const classes = `${base} ${variants[variant]}${className ? ` ${className}` : ""}`;

  if ("href" in props && props.href !== undefined) {
    const { variant: _v, loading: _l, className: _c, children: _ch, href, ...rest } = props;
    return (
      <Link href={href} className={classes} aria-busy={loading || undefined} {...rest}>
        <ButtonInner variant={variant} loading={loading}>
          {children}
        </ButtonInner>
      </Link>
    );
  }

  const { variant: _v, loading: _l, className: _c, children: _ch, disabled, ...rest } = props;
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <ButtonInner variant={variant} loading={loading}>
        {children}
      </ButtonInner>
    </button>
  );
}
