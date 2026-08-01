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
 *
 * Mobile layout: the typed text wraps to at most 2 words per row so long
 * phrases never overflow the viewport. On >= sm breakpoints the text
 * flows naturally (single line, nowrap).
 *
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
      delay = pause;
      nextDeleting = true;
    } else if (deleting && sub === "") {
      delay = typingSpeed;
      nextDeleting = false;
      nextIndex = (index + 1) % phrases.length;
    } else {
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

  // Split the currently-typed substring into words so we can wrap 2-per-line
  // on mobile. Preserve trailing space so partially-typed words render.
  const words = sub.length ? sub.split(" ") : [];

  return (
    <span className={cn("relative inline-block align-top", className)}>
      <span className="sr-only">{phrases.join(", ")}</span>
      {/* Reserve layout width using the longest phrase (desktop) */}
      <span aria-hidden className="invisible whitespace-nowrap hidden sm:inline">
        {longest}
      </span>
      {/* Mobile spacer: longest phrase wrapped at 2 words/line so the block
          reserves enough vertical space and never overflows horizontally. */}
      <span aria-hidden className="invisible sm:hidden">
        {(() => {
          const w = longest.split(" ");
          const out: React.ReactNode[] = [];
          for (let i = 0; i < w.length; i += 2) {
            out.push(
              <span key={i} className="block">
                {w.slice(i, i + 2).join(" ")}
              </span>
            );
          }
          return out;
        })()}
      </span>

      {/* Visible typed text */}
      <span
        aria-hidden
        className="absolute inset-0 text-gradient-gold sm:whitespace-nowrap"
      >
        {words.map((word, i) => (
          <span key={i} className="sm:contents">
            {/* On mobile: every 2nd word starts a new line. On sm+: inline. */}
            <span className="inline-block sm:inline">{word}</span>
            {i < words.length - 1 && (
              <span className="inline-block sm:inline">
                {/* On mobile, insert a line break after every 2nd word */}
                <span className="hidden sm:inline">&nbsp;</span>
                <span className="sm:hidden">
                  {i % 2 === 1 ? <br /> : <>&nbsp;</>}
                </span>
              </span>
            )}
          </span>
        ))}
        <span className="ml-0.5 inline-block w-[3px] h-[0.85em] -mb-[0.1em] bg-primary animate-pulse align-middle" />
      </span>
    </span>
  );
}
