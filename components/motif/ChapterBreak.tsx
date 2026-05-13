"use client";

import { useEffect, useRef, useState } from "react";
import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";

export function ChapterBreak() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`chapter-break${visible ? " is-visible" : ""}`}>
      <HandDrawnUnderline className="chapter-break__mark" />
    </div>
  );
}
