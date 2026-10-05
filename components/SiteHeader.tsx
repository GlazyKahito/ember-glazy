"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { FlameMark } from "@/components/FlameMark";
import { useEntrance } from "@/components/hero/Hero";
import { ease } from "@/components/motion";
import { nav } from "@/lib/site";

export function SiteHeader() {
  const { ready, delay } = useEntrance();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 160], ["rgba(11,8,7,0)", "rgba(11,8,7,0.84)"]);
  const border = useTransform(scrollY, [0, 160], ["rgba(244,233,216,0)", "rgba(244,233,216,0.1)"]);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (y < 480) setHidden(false);
    else if (y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const behind = document.querySelectorAll<HTMLElement>("[data-behind-menu]");
    root.style.overflow = "hidden";
    behind.forEach((el) => (el.inert = true));
    document.getElementById(menuId)?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
    };
  }, [open, menuId]);

  return (
    <header data-page className="fixed inset-x-0 top-0 z-50">
      <motion.div animate={{ y: hidden && !open ? "-100%" : "0%" }} transition={{ duration: 0.6, ease }}>
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -14 }}
          transition={{ duration: 0.9, ease, delay: ready ? delay * 0.8 : 0 }}
        >
          <motion.div style={{ backgroundColor: bg, borderColor: border }} className="border-b">
            <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 md:h-20 lg:px-12">
              <a href="#top" className="group flex items-center gap-2.5" aria-label="Ember Concept, back to top">
                <FlameMark
                  id="flame-header"
                  className="size-6 transition-transform duration-500 group-hover:-translate-y-0.5"
                />
                <span className="font-display text-[1.35rem] tracking-[0.06em] text-cream">EMBER</span>{" "}
                <span className="ml-1 inline-block rounded-full border border-[var(--line-strong)] px-2 py-0.5 text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                  Concept
                </span>
              </a>

              <nav aria-label="Main" className="hidden md:block">
                <ul className="flex items-center gap-8 text-sm text-parchment">
                  {nav.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className="link-underline py-1 transition-colors hover:text-cream">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex items-center gap-2">
                <a href="#reserve" className="btn btn-primary h-10 px-4 text-sm max-xs:hidden">
                  Reserve
                </a>
                <button
                  ref={toggleRef}
                  type="button"
                  className="relative z-10 flex size-10 items-center justify-center rounded-full border border-[var(--line-strong)] text-cream md:hidden"
                  aria-expanded={open}
                  aria-controls={menuId}
                  aria-label={open ? "Close menu" : "Open menu"}
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className="relative block h-3 w-4" aria-hidden="true">
                    <span
                      className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0.5"}`}
                    />
                    <span
                      className={`absolute left-0 h-px w-4 bg-current transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            className="fixed inset-0 -z-10 flex flex-col bg-char bg-[radial-gradient(90%_50%_at_50%_110%,rgb(255_107_44/0.18),transparent_70%)] px-5 pt-24 pb-8 sm:px-8 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
          >
            <nav aria-label="Sections">
              <motion.ul
                className="flex flex-col"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } } }}
              >
                {nav.map((l, i) => (
                  <motion.li
                    key={l.href}
                    className="border-b border-[var(--line)]"
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
                    }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-5 font-display text-4xl text-cream"
                    >
                      {l.label}
                      <span className="font-sans text-xs tracking-[0.18em] text-dim">0{i + 1}</span>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </nav>
            <div className="mt-auto">
              <a href="#reserve" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                Reserve a table
              </a>
              <p className="mt-5 text-center text-xs text-muted">
                Ember is a concept restaurant. No real bookings are taken.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
