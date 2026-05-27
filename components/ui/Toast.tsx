"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";
type Toast = {
  id: number;
  variant: ToastVariant;
  message: string;
  // Render in DOM until autoClose fires; ~5s default for success/info,
  // longer for error so the user has time to read it.
  ttlMs: number;
};

type ToastApi = {
  push: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "info") => {
    counter += 1;
    const id = counter;
    const ttlMs = variant === "error" ? 7000 : 4000;
    setToasts((curr) => [...curr, { id, variant, message, ttlMs }]);
  }, []);

  // Auto-dismiss after ttlMs. Each toast manages its own timer via effect
  // below; clearing on unmount handles the "user navigated away mid-toast"
  // case without a leak.
  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const timer = setTimeout(() => {
      setToasts((curr) => curr.filter((t) => t.id !== oldest.id));
    }, oldest.ttlMs);
    return () => clearTimeout(timer);
  }, [toasts]);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === "error" ? "alert" : "status"}
            className={
              t.variant === "error"
                ? "pointer-events-auto max-w-[480px] border border-accent-2-text bg-ground-2 px-4 py-3 text-body-sm text-accent-2-text shadow-[var(--shadow-card)]"
                : t.variant === "success"
                  ? "pointer-events-auto max-w-[480px] border border-accent bg-ground-2 px-4 py-3 text-body-sm text-accent shadow-[var(--shadow-card)]"
                  : "pointer-events-auto max-w-[480px] border border-hairline bg-ground-2 px-4 py-3 text-body-sm text-ink shadow-[var(--shadow-card)]"
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook for components inside ToastProvider. Returns a no-op pusher when
// used outside the provider so unit tests + preview-mode pages don't
// throw.
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  return { push: () => {} };
}
