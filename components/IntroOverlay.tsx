"use client";

import { useEffect, useRef } from "react";
import { intro, useIntro } from "@/lib/intro";

/** Minimum time the counter takes on a warm cache, so the sequence never just blinks. */
const MIN_COUNT_MS = 1000;

export function IntroOverlay() {
  const { mode, phase, skipped } = useIntro();
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    intro.start();
  }, []);

  // The counter follows real progress, eased, and never faster than MIN_COUNT_MS.
  useEffect(() => {
    if (mode === "none" || phase !== "loading") return;
    let raf = 0;
    let shown = 0;
    const t0 = performance.now();
    let last = t0;
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      const real = intro.progress();
      const pace = mode === "play" ? (now - t0) / MIN_COUNT_MS : 1;
      const target = Math.min(real, pace);
      // Eased by time, not frames, so a slow device does not stretch the count.
      shown += (target - shown) * (mode === "play" ? 1 - Math.exp(-dt * 9) : 1);
      if (Math.abs(target - shown) < 0.004) shown = target;
      const pct = Math.round(shown * 100);
      if (countRef.current) countRef.current.textContent = String(pct).padStart(2, "0");
      barRef.current?.setAttribute("aria-valuenow", String(pct));
      rootRef.current?.style.setProperty("--p", shown.toFixed(4));
      if (shown >= 0.999 && real >= 0.999) {
        intro.flare();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, phase]);

  useEffect(() => {
    if (mode === "none") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") intro.skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  if (mode === "none" || phase === "reveal") return null;

  return (
    <div ref={rootRef} className="intro" data-phase={phase} data-mode={mode} data-skipped={skipped ? "" : undefined}>
      <div className="intro-bg" />

      <div className="intro-stage" aria-hidden="true">
        <div className="intro-trail" />
        <div className="intro-rise">
          <div className="intro-flare" />
          <span className="intro-spark" />
          <span className="intro-count">
            <span ref={countRef}>00</span>
            <small>%</small>
          </span>
        </div>
      </div>

      <div
        ref={barRef}
        role="progressbar"
        aria-label="Lighting the fire"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="sr-only"
      />

      <p className="intro-caption eyebrow absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap sm:top-8">
        Lighting the fire
      </p>

      <div className="intro-meta absolute bottom-6 left-5 hidden text-[0.7rem] leading-relaxed tracking-[0.16em] text-muted uppercase sm:bottom-8 sm:left-8 sm:block">
        <span className="block text-parchment">Ember</span>
        Kitchen &amp; Bar · Bandra West
      </div>

      <button
        type="button"
        onClick={() => intro.skip()}
        className="intro-skip absolute right-5 bottom-5 flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2.5 text-xs tracking-[0.12em] text-parchment uppercase transition-colors hover:border-flame hover:text-cream sm:right-8 sm:bottom-7"
      >
        Skip intro
        <kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 font-sans text-[0.65rem] text-muted">Esc</kbd>
      </button>
    </div>
  );
}
