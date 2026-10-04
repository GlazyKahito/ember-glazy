"use client";

import { useEffect, useRef } from "react";

const words = ["Wood-fired small plates", "Coal-roasted seafood", "Indian spirits", "Late pours", "Bandra West"];

/** A slow ribbon of words. It stops when it is off screen. */
export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.toggleAttribute("data-paused", !entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const row = (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-6 font-display text-[clamp(1.6rem,3.4vw,2.8rem)] italic soft text-parchment sm:px-10">
            {w}
          </span>
          <svg viewBox="0 0 12 12" className="size-3 shrink-0 text-ember" aria-hidden="true">
            <path fill="currentColor" d="M6 0 7.3 4.7 12 6 7.3 7.3 6 12 4.7 7.3 0 6 4.7 4.7Z" />
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <div
      ref={ref}
      className="marquee relative overflow-hidden border-y border-[var(--line)] bg-soot py-6"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max">
        {row}
        {row}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-soot to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-soot to-transparent" />
    </div>
  );
}
