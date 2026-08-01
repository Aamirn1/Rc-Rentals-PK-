"use client";

import { useEffect, useRef } from "react";
import { useAppStore, type ViewName } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * View navigation graph — where each view should "go back" to.
 * Falls back to "home" for any unlisted view.
 */
const BACK_TARGET: Partial<Record<ViewName, ViewName>> = {
  cars: "home",
  "car-details": "cars",
  booking: "car-details",
  about: "home",
  contact: "home",
  login: "home",
  signup: "home",
  profile: "home",
  admin: "home",
};

/**
 * A small back arrow button fixed to the top-left of every non-home view.
 * Uses a view-history stack so it genuinely steps back to the previous view
 * (e.g. car-details -> cars -> home), falling back to the graph above.
 */
export function BackButton() {
  const view = useAppStore((s) => s.view);
  const setView = useAppStore((s) => s.setView);
  const historyRef = useRef<ViewName[]>([]);

  // Track view history for genuine back navigation (no setState in effect)
  useEffect(() => {
    if (view === "home") {
      historyRef.current = [];
      return;
    }
    const hist = historyRef.current;
    if (hist[hist.length - 1] !== view) {
      hist.push(view);
    }
  }, [view]);

  // Hidden on home (no back target) and on car-details (has its own "Back to all cars" button)
  if (view === "home" || view === "car-details") return null;

  const handleBack = () => {
    const hist = historyRef.current;
    hist.pop();
    const target: ViewName = hist[hist.length - 1] || BACK_TARGET[view] || "home";
    setView(target);
  };

  return (
    <button
      onClick={handleBack}
      aria-label="Go back"
      className={cn(
        "fixed top-[68px] left-3 sm:left-5 z-40 grid place-items-center w-9 h-9 rounded-full",
        "glass border border-border text-foreground/80 hover:text-primary hover:border-primary/40",
        "transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg",
        "animate-fade-up"
      )}
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
