"use client";

import { useSyncExternalStore } from "react";
import { istParts, serviceStatus } from "./hours";

const never = () => () => {};

let webgl: boolean | undefined;

function detectWebGL() {
  if (webgl === undefined) {
    try {
      // ?gl=0 forces the still fallback, which is handy for checking it.
      const forced = new URLSearchParams(window.location.search).get("gl") === "0";
      const canvas = document.createElement("canvas");
      const ctx = forced ? null : canvas.getContext("webgl2");
      webgl = !!ctx;
      ctx?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

/** null on the server and during hydration, then whether WebGL 2 is usable. */
export function useWebGL() {
  return useSyncExternalStore<boolean | null>(never, detectWebGL, () => null);
}

const everyMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

const statusSnapshot = () => {
  const s = serviceStatus(new Date());
  return `${s.open ? 1 : 0}|${s.label}`;
};

/** Live open/closed label in Mumbai time; null until the client knows the time. */
export function useServiceStatus() {
  const raw = useSyncExternalStore<string | null>(everyMinute, statusSnapshot, () => null);
  if (!raw) return null;
  const [open, label] = raw.split("|");
  return { open: open === "1", label };
}

const todaySnapshot = () => istParts(new Date()).iso;
const weekdaySnapshot = () => istParts(new Date()).weekday;

/** Today's date in Mumbai as YYYY-MM-DD; null until the client knows it. */
export function useTodayIso() {
  return useSyncExternalStore<string | null>(everyMinute, todaySnapshot, () => null);
}

export function useTodayWeekday() {
  return useSyncExternalStore<number | null>(everyMinute, weekdaySnapshot, () => null);
}

/** Minutes past midnight in Mumbai, refreshed every half minute. */
export function useNowMinutes() {
  return useSyncExternalStore<number | null>(
    everyMinute,
    () => istParts(new Date()).minutes,
    () => null,
  );
}
