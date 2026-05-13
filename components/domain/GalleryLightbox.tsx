"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { GalleryImage } from "@/lib/content/galleryImages";

type GalleryLightboxProps = {
  images: readonly GalleryImage[];
  open: boolean;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

// Native <dialog>: ESC + backdrop click are platform-native; focus trap is
// also native when opened with showModal(). We add ←/→ for navigation and
// restore focus to the trigger on close. Reduced-motion respects the user
// setting via Tailwind's `motion-safe:` utilities.
export function GalleryLightbox({
  images,
  open,
  index,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Open / close the dialog when `open` flips. Capture the activeElement at
  // open so focus can be restored on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
    }
  }, [open]);

  // The native dialog cancel event fires on ESC. Forward it to onClose so the
  // parent state stays consistent.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const handleClose = () => {
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  const handlePrev = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    if (images.length === 0) return;
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  // ←/→ keyboard navigation while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, handlePrev, handleNext]);

  // Backdrop click. The native ::backdrop pseudo-element does not bubble click
  // events to React, so we attach onMouseDown to the dialog's content layer and
  // close only when the press lands on that layer (not on its inner figure).
  const handleBackdropMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const current = images[index];
  if (!current) {
    return (
      <dialog
        ref={dialogRef}
        className="m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/80"
      />
    );
  }

  const captionId = `lightbox-caption-${current.id}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={captionId}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/85 backdrop:backdrop-blur-sm"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop close pattern — ESC closes natively via dialog cancel for keyboard users; this onMouseDown is the mouse-only close path */}
      <div
        onMouseDown={handleBackdropMouseDown}
        className="flex h-full w-full flex-col items-center justify-center gap-6 p-6 sm:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute top-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ground/90 text-ink transition-colors hover:bg-ground active:bg-ground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true" className="text-heading-5">
            ×
          </span>
        </button>

        <figure className="flex max-h-full max-w-[min(96rem,100%)] flex-col items-center gap-4">
          <div className="relative flex w-full flex-1 items-center justify-center">
            <Image
              src={current.image.src ?? ""}
              alt={current.image.alt || current.caption}
              width={current.width}
              height={current.height}
              sizes="100vw"
              className="max-h-[80vh] w-auto object-contain"
              priority
            />
          </div>
          <figcaption
            id={captionId}
            className="flex flex-col items-center gap-1 text-center text-ground"
          >
            <span className="text-body-lg text-ground">{current.caption}</span>
            <span className="text-meta uppercase tracking-[0.12em] text-ground/80">
              {[
                current.location,
                current.takenAt ? new Date(current.takenAt).getFullYear() : null,
                current.photographerCredit,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </figcaption>
        </figure>

        {images.length > 1 ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photograph"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ground/90 text-ink transition-colors hover:bg-ground active:bg-ground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden="true" className="text-heading-5">
                ←
              </span>
            </button>
            <span className="text-meta uppercase tracking-[0.12em] text-ground/80">
              {index + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photograph"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ground/90 text-ink transition-colors hover:bg-ground active:bg-ground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span aria-hidden="true" className="text-heading-5">
                →
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
