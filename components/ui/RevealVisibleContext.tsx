"use client";

import { createContext, useContext } from "react";

// null = "not inside a count-up-wrapper." A boolean value means the nearest wrapper
// is propagating its visibility state to descendants (used by StatCard to align
// its count-up with the wrapper's fade rather than self-observing).
const RevealVisibleContext = createContext<boolean | null>(null);

export const RevealVisibleProvider = RevealVisibleContext.Provider;

export function useRevealVisible(): boolean | null {
  return useContext(RevealVisibleContext);
}
