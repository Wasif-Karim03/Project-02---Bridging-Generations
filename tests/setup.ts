import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { afterEach, vi } from "vitest";

vi.mock("next-view-transitions", () => ({
  Link: NextLink,
  ViewTransitions: ({ children }: { children: ReactNode }) => children,
}));

// `server-only` throws when imported outside a React Server Component. Stub it so
// unit tests can exercise pure helpers that live alongside server-only accessors.
vi.mock("server-only", () => ({}));

class StubIntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  readonly scrollMargin = "";
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ??
  (StubIntersectionObserver as unknown as typeof IntersectionObserver);

// Default matchMedia stub — reports prefers-reduced-motion: reduce so effects that
// animate don't schedule work during tests. Tests that need a different preference
// should reassign window.matchMedia in beforeEach.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

// jsdom 25 doesn't ship a <dialog> polyfill — showModal/close/cancel are missing.
// Stub them globally so any component built on the native dialog API (SheetDrawer,
// Nav drawer, etc.) doesn't throw inside useEffect.
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      (this as HTMLDialogElement).setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      (this as HTMLDialogElement).removeAttribute("open");
    };
  }
}

afterEach(() => {
  cleanup();
});
