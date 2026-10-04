"use client";

import { useSyncExternalStore } from "react";

/**
 * The opening sequence, shared between the loader overlay, the hero copy and
 * the WebGL scene. It lives outside React so the render loop can read it
 * every frame without re-rendering anything.
 *
 * mode
 *   play    full sequence (first visit this session)
 *   static  reduced motion: a still loader that disappears when ready
 *   none    already seen this session
 *
 * phase
 *   loading  counter running, page underneath is dark
 *   flare    spark flares, overlay fades, the fire catches (or a quick fade when skipped)
 *   reveal   overlay gone, hero settling
 */
export type IntroMode = "play" | "static" | "none";
export type IntroPhase = "loading" | "flare" | "reveal";
type Step = "fonts" | "module" | "gl" | "text";

export type IntroState = {
  mode: IntroMode;
  phase: IntroPhase;
  skipped: boolean;
};

const weights: Record<Step, number> = { fonts: 0.35, module: 0.2, gl: 0.15, text: 0.3 };
const SESSION_KEY = "ember:intro";
const FLARE_MS = 800;
const SKIP_MS = 320;
const GIVE_UP_MS = 7000;

const serverState: IntroState = { mode: "play", phase: "loading", skipped: false };

let state: IntroState | null = null;
const done = new Set<Step>();
const listeners = new Set<() => void>();
let started = false;
let igniteAt: number | null = null;

function initial(): IntroState {
  const flag = document.documentElement.dataset.intro;
  if (flag === "seen") return { mode: "none", phase: "reveal", skipped: false };
  return { mode: flag === "static" ? "static" : "play", phase: "loading", skipped: false };
}

function read(): IntroState {
  if (!state) {
    state = initial();
    if (state.mode === "none") igniteAt = -Infinity;
  }
  return state;
}

function set(next: Partial<IntroState>) {
  state = { ...read(), ...next };
  listeners.forEach((l) => l());
}

function setInert(on: boolean) {
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
    el.inert = on;
  });
}

function finish() {
  set({ phase: "reveal" });
  setInert(false);
  document.documentElement.dataset.intro = "seen";
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage can be blocked; the intro will simply play again */
  }
}

export const intro = {
  get: read,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Called once on the client. Starts the readiness checks. */
  start() {
    if (started) return;
    started = true;
    const s = read();
    if (s.mode === "none") return;
    setInert(true);
    document.fonts?.ready.then(() => intro.mark("fonts"));
    if (!document.fonts) intro.mark("fonts");
    window.setTimeout(() => {
      if (read().phase === "loading") (["fonts", "module", "gl", "text"] as Step[]).forEach((k) => intro.mark(k));
    }, GIVE_UP_MS);
  },

  mark(step: Step) {
    if (done.has(step)) return;
    done.add(step);
    listeners.forEach((l) => l());
  },

  /** Real loading progress, 0 to 1. */
  progress() {
    let p = 0;
    done.forEach((k) => (p += weights[k]));
    // Rounded so the weights always add up to exactly 1.
    return Math.min(1, Math.round(p * 1000) / 1000);
  },

  /** The counter reached 100: flare and hand over to the hero. */
  flare() {
    const s = read();
    if (s.phase !== "loading") return;
    if (s.mode === "static") {
      igniteAt = -Infinity;
      finish();
      return;
    }
    igniteAt = performance.now();
    set({ phase: "flare" });
    window.setTimeout(finish, FLARE_MS);
  },

  skip() {
    const s = read();
    if (s.phase !== "loading" && !(s.phase === "flare" && !s.skipped)) return;
    igniteAt = -Infinity;
    set({ phase: "flare", skipped: true });
    window.setTimeout(finish, SKIP_MS);
  },

  /** Seconds since the fire caught; Infinity when it is already burning, null while dark. */
  sinceIgnite() {
    read();
    if (igniteAt === null) return null;
    if (igniteAt === -Infinity) return Infinity;
    return (performance.now() - igniteAt) / 1000;
  },
};

export function useIntro() {
  return useSyncExternalStore(intro.subscribe, intro.get, () => serverState);
}
