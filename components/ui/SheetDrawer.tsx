"use client";

import { type ReactNode, useEffect, useRef } from "react";

type SheetDrawerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Required — labels the drawer for assistive tech. */
  ariaLabel: string;
  /** Edge to anchor against. Defaults to "right". */
  side?: "right" | "left";
};

/**
 * Edge-anchored drawer built on the native <dialog> element.
 *
 * Native showModal() gives us:
 * - focus trap (browser-managed)
 * - ESC-close fires the "cancel" event
 * - inert background
 *
 * We add:
 * - body scroll lock while open
 * - backdrop-click-to-close (click on the dialog element itself)
 * - the .drawer-sheet animation (R4.9 keyframes in globals.css)
 *
 * Consumers control content; render their own close button inside
 * children for explicit dismissal.
 */
export function SheetDrawer({
  open,
  onClose,
  children,
  ariaLabel,
  side = "right",
}: SheetDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Body + html scroll lock + native dialog open/close as a single effect so
  // the lock applies BEFORE showModal(): the dialog's modal-promotion can
  // briefly nudge window.scrollY (Chromium scrolls the dialog into view
  // even though it's fixed-positioned), which leaks scroll into the page.
  // Locking first + restoring scroll position after showModal closes the gap.
  // <html> is the scrolling element in standards mode, so we lock both.
  //
  // showModal() is wrapped in queueMicrotask so it fires AFTER React's commit
  // phase. iPhone Safari can fail to promote the dialog to the top layer when
  // showModal() runs synchronously inside useEffect while Lenis's RAF tick is
  // mid-flight — el.open flips to true but the dialog never paints. Deferring
  // by a microtask lets iOS settle before the top-layer promotion.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      const html = document.documentElement;
      const body = document.body;
      const prevHtml = html.style.overflow;
      const prevBody = body.style.overflow;
      const prevScrollY = window.scrollY;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      queueMicrotask(() => {
        if (!el.isConnected || el.open) return;
        el.showModal();
        if (window.scrollY !== prevScrollY) window.scrollTo(0, prevScrollY);
      });
      return () => {
        html.style.overflow = prevHtml;
        body.style.overflow = prevBody;
      };
    }
    if (!open && el.open) el.close();
  }, [open]);

  // ESC (native cancel event) + backdrop click.
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const handleClick = (e: MouseEvent) => {
      // Fire only when the click target IS the dialog (the backdrop area),
      // not its inner content.
      if (e.target === el) onClose();
    };
    el.addEventListener("cancel", handleCancel);
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("cancel", handleCancel);
      el.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={ariaLabel}
      className={[
        "m-0 max-h-none max-w-none p-0",
        "fixed inset-y-0 h-dvh w-[min(85vw,360px)]",
        side === "right" ? "right-0 ml-auto" : "left-0 mr-auto",
        "bg-ground border-hairline",
        side === "right" ? "border-l" : "border-r",
        "backdrop:bg-ink/40 backdrop:backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="drawer-sheet h-full overflow-y-auto" data-lenis-prevent>
        {children}
      </div>
    </dialog>
  );
}
