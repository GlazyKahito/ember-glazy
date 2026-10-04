"use client";

import { motion } from "motion/react";
import { useState, type KeyboardEvent } from "react";
import { ease } from "@/components/motion";
import { formatPrice, menu, tagLabels, type MenuCategory } from "@/lib/menu";
import { ChiliIcon, DietMark } from "./DietMark";

export function MenuTabs() {
  const [active, setActive] = useState(0);

  const select = (i: number, focus = false) => {
    setActive(i);
    if (focus) document.getElementById(`tab-${menu[i].id}`)?.focus();
  };

  // Roving tabindex: arrows move between tabs, Home and End jump to the ends.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = menu.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Menu sections"
        onKeyDown={onKeyDown}
        className="-mx-5 flex gap-1 overflow-x-auto border-b border-[var(--line)] px-5 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {menu.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.id}
              id={`tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={`relative flex shrink-0 items-baseline gap-2 px-2 pt-3 pb-4 text-sm transition-colors xs:px-2.5 sm:px-5 sm:text-base ${
                selected ? "text-cream" : "text-muted hover:text-parchment"
              }`}
            >
              <span
                className={`hidden text-[0.65rem] tracking-[0.14em] tabular-nums sm:inline ${selected ? "text-ember" : "text-dim"}`}
              >
                0{i + 1}
              </span>
              {c.label}
              {selected ? (
                <motion.span
                  layoutId="menu-tab-line"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ember shadow-[0_0_14px_rgb(255_107_44/0.8)] sm:inset-x-4"
                  transition={{ duration: 0.6, ease }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {menu.map((c, i) => (
        <div
          key={c.id}
          id={`panel-${c.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${c.id}`}
          tabIndex={0}
          hidden={i !== active}
          className="pt-8 focus-visible:outline-offset-8 md:pt-10"
        >
          <Panel category={c} key={i === active ? "on" : "off"} />
        </div>
      ))}
    </div>
  );
}

function Panel({ category }: { category: MenuCategory }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
    >
      <motion.p
        className="max-w-xl text-parchment text-pretty"
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
      >
        {category.intro}
      </motion.p>
      <ul className="mt-6 grid gap-x-16 md:grid-cols-2">
        {category.items.map((item) => (
          <motion.li
            key={item.name}
            className="group relative border-b border-[var(--line)] py-6"
            variants={{
              hidden: { opacity: 0, y: 22 },
              show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
            }}
          >
            <div className="flex items-baseline gap-4">
              <h3 className="flex min-w-0 items-baseline gap-2.5 font-display text-[1.45rem] leading-tight text-cream sm:text-[1.6rem]">
                {item.diet ? <DietMark diet={item.diet} className="translate-y-[1px] self-center" /> : null}
                <span className="min-w-0">{item.name}</span>
              </h3>
              <span
                aria-hidden="true"
                className="min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-[var(--line-strong)]"
              />
              <p className="shrink-0 font-display text-xl text-flame">
                <span className="sr-only">Price: </span>₹{formatPrice(item.price)}
              </p>
            </div>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{item.description}</p>
            {item.tags?.length || item.signature ? (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Notes">
                {item.signature ? (
                  <li className="rounded-full border border-ember/50 bg-ember/10 px-2.5 py-0.5 text-[0.68rem] tracking-[0.12em] text-flame uppercase">
                    From the hearth
                  </li>
                ) : null}
                {item.tags?.map((t) => (
                  <li
                    key={t}
                    title={tagLabels[t].long}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-2.5 py-0.5 text-[0.68rem] tracking-[0.1em] text-parchment uppercase"
                  >
                    {t === "spicy" ? <ChiliIcon className="size-3 text-ember" /> : null}
                    <span aria-hidden="true">{tagLabels[t].short}</span>
                    <span className="sr-only">{tagLabels[t].long}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
