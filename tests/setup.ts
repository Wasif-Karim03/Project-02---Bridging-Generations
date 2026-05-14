import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { afterEach, vi } from "vitest";
import enMessages from "../messages/en.json";

// Walks a "namespace.path.to.key" against the imported messages/en.json so
// the next-intl mock returns the actual English copy. Falls back to the
// raw key when the path is missing — same behaviour as the real lib.
function lookupMessage(path: string): string {
  const parts = path.split(".");
  let cur: unknown = enMessages;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

vi.mock("next-view-transitions", () => ({
  Link: NextLink,
  ViewTransitions: ({ children }: { children: ReactNode }) => children,
}));

// `server-only` throws when imported outside a React Server Component. Stub it so
// unit tests can exercise pure helpers that live alongside server-only accessors.
vi.mock("server-only", () => ({}));

// next-intl mock — resolves translation keys against the imported messages/en.json
// so tests assert against the real English copy without needing a Provider.
vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    const t = (key: string) => lookupMessage(namespace ? `${namespace}.${key}` : key);
    return Object.assign(t, {
      rich: t,
      markup: t,
      raw: t,
    });
  },
  useLocale: () => "en",
  NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (namespace?: string) => {
    const t = (key: string) => lookupMessage(namespace ? `${namespace}.${key}` : key);
    return Promise.resolve(t);
  },
  getLocale: () => Promise.resolve("en"),
  getMessages: () => Promise.resolve(enMessages),
}));

// next/cache — revalidatePath is invoked by the locale switch server action.
// In tests we just make it a no-op.
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

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
