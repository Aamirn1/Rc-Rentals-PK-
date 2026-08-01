"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pause?: number;
}

/**
 * SEO-friendly rotating typewriter.
 * The full set of phrases is rendered for crawlers (sr-only) while a
 * visible caret + per-frame text reveals each phrase letter-by-letter.
 * All state transitions happen inside async setTimeout callbacks (never
 * synchronous setState in the effect body) to avoid cascading renders.
 */
export function Typewriter({
  phrases,
  className,
  typingSpeed = 70,
  deletingSpeed = 40,
  pause = 1800,
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length];
    let delay: number;
    let nextSub: string | null = null;
    let nextDeleting: boolean | null = null;
    let nextIndex: number | null = null;

    if (!deleting && sub === current) {
      // finished typing -> pause, then start deleting
      delay = pause;
      nextDeleting = true;
    } else if (deleting && sub === "") {
      // finished deleting -> move to next phrase, start typing
      delay = typingSpeed;
      nextDeleting = false;
      nextIndex = (index + 1) % phrases.length;
    } else {
      // mid-word: type or delete one char
      delay = deleting ? deletingSpeed : typingSpeed;
      nextSub = deleting ? current.slice(0, sub.length - 1) : current.slice(0, sub.length + 1);
    }

    const t = setTimeout(() => {
      if (nextSub !== null) setSub(nextSub);
      if (nextDeleting !== null) setDeleting(nextDeleting);
      if (nextIndex !== null) setIndex(nextIndex);
    }, delay);

    return () => clearTimeout(t);
  }, [sub, deleting, index, phrases, typingSpeed, deletingSpeed, pause]);

  const longest = phrases.reduce((a, b) => (a.length > b.length ? a : b), "");

  return (
    <span className={cn("relative inline-block align-top", className)}>
      <span className="sr-only">{phrases.join(", ")}</span>
      {/* Reserve layout width using the longest phrase */}
      <span aria-hidden className="invisible whitespace-nowrap">
        {longest}
      </span>
      <span aria-hidden className="absolute inset-0 whitespace-nowrap text-gradient-gold">
        {sub}
        <span className="ml-0.5 inline-block w-[3px] h-[0.85em] -mb-[0.1em] bg-primary animate-pulse align-middle" />
      </span>
    </span>
  );
}
