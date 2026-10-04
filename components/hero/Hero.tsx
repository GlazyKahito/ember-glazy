"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ease } from "@/components/motion";
import { intro, useIntro } from "@/lib/intro";
import { site } from "@/lib/site";
import { useServiceStatus, useWebGL } from "@/lib/use-client-value";
import { FireFallback } from "./FireFallback";

const FireCanvas = dynamic(
  () =>
    import("./FireCanvas").then((m) => {
      intro.mark("module");
      return m.FireCanvas;
    }),
  { ssr: false },
);

const letters = "EMBER".split("");

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
};

const line: Variants = {
  hidden: { y: "108%" },
  show: { y: "0%", transition: { duration: 1.1, ease } },
};

/** When the hero copy starts its entrance, relative to the intro handing over. */
export function useEntrance() {
  const { mode, phase, skipped } = useIntro();
  return {
    ready: phase !== "loading",
    delay: mode === "play" && !skipped ? 0.85 : 0.1,
  };
}

function OpenBadge() {
  const status = useServiceStatus();
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-char/55 px-4 py-3">
      <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
        {status?.open ? <span className="pulse-dot absolute inset-0 rounded-full bg-ember" /> : null}
        <span className={`relative size-2.5 rounded-full ${status?.open ? "bg-ember" : "bg-dim"}`} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-cream" aria-live="polite">
          {status ? status.label : "Tuesday to Sunday, from 6 pm"}
        </span>
        <span className="mt-0.5 text-xs text-muted">Concept hours · Mumbai time</span>
      </span>
    </div>
  );
}

export function Hero() {
  const hostRef = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const webgl = useWebGL();
  const reduced = useReducedMotion() ?? false;
  const { ready, delay } = useEntrance();
  const [active, setActive] = useState(true);
  const [glReady, setGlReady] = useState(false);
  const onTextReady = useCallback(() => setGlReady(true), []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "80px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (webgl === false) {
      intro.mark("module");
      intro.mark("gl");
      intro.mark("text");
    }
  }, [webgl]);

  return (
    <section
      ref={hostRef}
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex h-svh min-h-[600px] flex-col overflow-hidden"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-char">
        <FireFallback className={`transition-opacity duration-1000 ${glReady ? "opacity-0" : "opacity-100"}`} />
        {webgl ? (
          <div className={`absolute inset-0 transition-opacity duration-700 ${glReady ? "opacity-100" : "opacity-0"}`}>
            <FireCanvas
              wordRef={wordRef}
              hostRef={hostRef}
              active={active}
              reduced={reduced}
              onTextReady={onTextReady}
            />
          </div>
        ) : null}
        <div className="hero-shade absolute inset-0" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pt-20 pb-5 sm:px-8 md:pt-32 lg:px-12">
        <h1
          ref={wordRef}
          id="hero-title"
          data-gl={glReady ? "ready" : undefined}
          className="wordmark relative order-last mx-auto mt-auto mb-2 flex w-fit select-none md:mb-4"
        >
          <span className="sr-only">Ember</span>
          {letters.map((ch, i) => (
            <motion.span
              key={i}
              data-letter
              aria-hidden="true"
              className="inline-block"
              initial={{ opacity: 0, y: "0.06em" }}
              animate={ready ? { opacity: 1, y: "0em" } : { opacity: 0, y: "0.06em" }}
              transition={{ duration: 0.9, ease, delay: ready ? Math.max(0, delay - 0.45) + i * 0.12 : 0 }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.div
          className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-10"
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: delay } } }}
        >
          <div className="max-w-[46rem]">
            <motion.p variants={item} className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-ember" aria-hidden="true" />
              <span>
                Kitchen &amp; Bar · Bandra West<span className="hidden sm:inline">, Mumbai</span>
              </span>
            </motion.p>
            <p className="mt-4 font-display text-[clamp(2.3rem,5.2vw,4.6rem)] md:mt-5 leading-[0.98] tracking-[-0.025em] text-cream">
              <span className="block overflow-hidden pb-[0.08em]">
                <motion.span variants={line} className="block">
                  A kitchen built
                </motion.span>
              </span>
              <span className="-mt-[0.08em] block overflow-hidden pb-[0.08em]">
                <motion.span variants={line} className="block md:whitespace-nowrap">
                  around <em className="soft text-flame">one wood fire.</em>
                </motion.span>
              </span>
            </p>
            <motion.p
              variants={item}
              className="mt-4 max-w-[28rem] md:mt-5 text-[1.0625rem] leading-relaxed text-parchment text-pretty"
            >
              Small plates off the coals, whole fish from the hearth and a bar that pours late. Tuesday to Sunday, in
              Ranwar.
            </motion.p>
            <motion.div variants={item} className="mt-6 flex flex-wrap gap-2 sm:gap-3 md:mt-8">
              <a href="#reserve" className="btn btn-primary">
                Reserve a table
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </a>
              <a href="#menu" className="btn btn-ghost">
                See the menu
              </a>
            </motion.div>
          </div>
          <motion.div variants={item} className="flex flex-col items-start gap-5 md:items-end md:pt-10">
            <OpenBadge />
            <p className="hidden flex-col items-end gap-1.5 text-[0.68rem] tracking-[0.18em] text-muted uppercase md:flex">
              <span>{site.coordinates}</span>
              <span>Concept · 2026</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.a
          href="#menu"
          className="scroll-cue group absolute top-1/2 right-5 -translate-y-1/2 flex-col items-center gap-3 text-[0.68rem] tracking-[0.22em] text-muted uppercase transition-colors hover:text-cream lg:right-12"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.2, delay: ready ? delay + 0.9 : 0 }}
        >
          <span className="[writing-mode:vertical-rl]">Scroll</span>
          <span className="relative h-14 w-px overflow-hidden bg-[var(--line-strong)]" aria-hidden="true">
            <span className="scroll-tick absolute inset-x-0 top-0 h-5 bg-flame" />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
