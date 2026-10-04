"use client";

import { motion, type Variants } from "motion/react";
import { Fragment, type ReactNode } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.95, ease } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease } },
};

const tags = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  dl: motion.dl,
  p: motion.p,
  header: motion.header,
  span: motion.span,
};

type Tag = keyof typeof tags;

type StaggerProps = {
  as?: Tag;
  children: ReactNode;
  className?: string;
  /** Seconds before the first child starts. */
  delay?: number;
  /** Seconds between children. */
  gap?: number;
  /** How much of the block must be visible before it plays. */
  amount?: number;
  id?: string;
};

/** Plays its children's entrances in sequence when it scrolls into view. */
export function Stagger({ as = "div", children, className, delay = 0, gap = 0.09, amount = 0.25, id }: StaggerProps) {
  const Comp = tags[as];
  return (
    <Comp
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </Comp>
  );
}

type ItemProps = {
  as?: Tag;
  children?: ReactNode;
  className?: string;
  variant?: "rise" | "fade";
};

export function Item({ as = "div", children, className, variant = "rise" }: ItemProps) {
  const Comp = tags[as];
  return (
    <Comp className={className} variants={variant === "rise" ? rise : fade}>
      {children}
    </Comp>
  );
}

/** A hairline that draws itself from the left. */
export function Rule({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px origin-left bg-[var(--line-strong)] ${className ?? ""}`}
      variants={{
        hidden: { scaleX: 0 },
        show: { scaleX: 1, transition: { duration: 1.4, ease } },
      }}
    />
  );
}

type SplitProps = {
  /** Words wrapped in *asterisks* are set in italic. */
  text: string;
  as?: "h2" | "h3" | "p";
  className?: string;
  id?: string;
};

const headingTags = { h2: motion.h2, h3: motion.h3, p: motion.p };

/** A heading whose words rise out of a mask, one after another. */
export function SplitHeading({ text, as = "h2", className, id }: SplitProps) {
  const Comp = headingTags[as];
  const words = text.split(" ");
  return (
    <Comp id={id} className={className} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055 } } }}>
      {words.map((raw, i) => {
        const italic = raw.startsWith("*");
        const word = raw.replace(/\*/g, "");
        return (
          <Fragment key={`${word}-${i}`}>
            <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
              <motion.span
                className={`inline-block ${italic ? "soft italic text-flame" : ""}`}
                variants={{
                  hidden: { y: "105%" },
                  show: { y: "0%", transition: { duration: 1.05, ease } },
                }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Comp>
  );
}
