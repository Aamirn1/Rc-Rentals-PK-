"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Trigger when this much of the element is visible (0-1). Default 0.15 */
  threshold?: number;
  /** Only fire once. Default true. */
  once?: boolean;
  as?: "div" | "li" | "article" | "section";
}

/**
 * Reveals its children with a glow + fade-up animation when scrolled into view.
 * Uses IntersectionObserver (performant). Respects prefers-reduced-motion
 * (renders visible immediately, no animation).
 */
export function ScrollReveal({
  children,
  className,
  threshold = 0.15,
  once = true,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      // respect reduced-motion: show immediately, no observer needed
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <Tag
      ref={ref as never}
      className={cn("scroll-glow", (inView || reduceMotion) && "in-view", className)}
    >
      {children}
    </Tag>
  );
}
