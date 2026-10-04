"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Item, Rule, SplitHeading, Stagger } from "@/components/motion";

const manifesto =
  "Every plate at Ember starts as wood. We light the hearth at four, let it burn down to a bed of *glowing* coals by six, and cook on it until the last order. No gas on the line, no shortcuts, just heat we learn to read by eye.";

const beats = [
  {
    title: "Babool and mango wood",
    body: "Split by hand every morning. Babool burns hot and clean for searing; mango wood gives a softer, sweeter smoke for the slow cooks.",
  },
  {
    title: "A six-metre open hearth",
    body: "The whole kitchen is one fire in full view of the room: grills over the coals, pans in the embers, hooks above for the long roasts.",
  },
  {
    title: "Plates, as they are ready",
    body: "Small plates leave the fire one by one, made for the middle of the table. The bar keeps pouring after the kitchen rests.",
  },
];

const stats = [
  { value: "6 m", label: "of open hearth, in full view" },
  { value: "0", label: "gas burners on the line" },
  { value: "4 pm", label: "when the fire is lit" },
  { value: "1:30", label: "last pour on Fridays and Saturdays" },
];

function Word({
  children,
  progress,
  range,
  hot,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  hot: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={hot ? "soft italic text-flame" : undefined}>
      {children}
    </motion.span>
  );
}

/** A paragraph whose words catch, one by one, as it scrolls through the viewport. */
function LitParagraph({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = text.split(" ");
  const className =
    "font-display text-[clamp(1.85rem,4.1vw,3.9rem)] leading-[1.12] tracking-[-0.02em] text-cream text-pretty";

  if (reduced) {
    return (
      <p ref={ref} className={className}>
        {text.replace(/\*/g, "")}
      </p>
    );
  }

  return (
    <p ref={ref} className={className}>
      {words.map((raw, i) => {
        const start = i / words.length;
        return (
          <span key={`${raw}-${i}`}>
            <Word progress={scrollYProgress} range={[start, start + 1.5 / words.length]} hot={raw.includes("*")}>
              {raw.replace(/\*/g, "")}
            </Word>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </p>
  );
}

function Gauge({ progress }: { progress: MotionValue<number> }) {
  const temp = useTransform(progress, [0, 1], [180, 480]);
  const label = useTransform(temp, (v) => `${Math.round(v)}`);
  const y = useTransform(progress, [0, 1], ["0vh", "44vh"]);
  return (
    <div className="sticky top-32 flex gap-6">
      <div className="relative h-[44vh] w-px bg-[var(--line)]">
        <motion.div
          style={{ scaleY: progress }}
          className="absolute inset-0 origin-top bg-linear-to-b from-coal via-ember to-gold"
        />
        <motion.div
          style={{ y }}
          className="absolute -top-[5px] -left-[5px] size-[11px] rounded-full bg-gold shadow-[0_0_18px_4px_rgb(255_140_60/0.7)]"
        />
      </div>
      <div className="pt-1">
        <p className="eyebrow">Heart of the coals</p>
        <p className="mt-3 flex items-start font-display text-6xl leading-none text-cream tabular-nums">
          <motion.span>{label}</motion.span>
          <span className="mt-1 ml-1 font-sans text-sm text-flame">°C</span>
        </p>
        <p className="mt-4 max-w-[13rem] text-sm leading-relaxed text-muted">
          From first light at four to full heat by service.
        </p>
      </div>
    </div>
  );
}

export function StorySection() {
  const beatsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: beatsRef, offset: ["start 0.65", "end 0.55"] });

  return (
    <section id="story" aria-labelledby="story-title" className="relative overflow-hidden bg-soot py-24 md:py-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[38rem] rounded-full bg-[radial-gradient(circle,rgb(255_107_44/0.16),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-56 size-[44rem] rounded-full bg-[radial-gradient(circle,rgb(140_43_14/0.22),transparent_65%)]"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Stagger className="max-w-5xl">
          <Item as="p" className="eyebrow flex items-center gap-3">
            <span className="text-ember">02</span>
            <Rule className="w-10" />
            The fire
          </Item>
        </Stagger>
        <h2 id="story-title" className="sr-only">
          The fire
        </h2>

        <div className="mt-10 max-w-6xl md:mt-14">
          <LitParagraph text={manifesto} />
        </div>

        <div ref={beatsRef} className="mt-24 grid gap-10 md:mt-36 md:grid-cols-12">
          <div className="hidden md:col-span-4 md:block lg:col-span-3">
            <Gauge progress={scrollYProgress} />
          </div>
          <Stagger as="ol" className="md:col-span-8 lg:col-span-8 lg:col-start-5" gap={0.12} amount={0.15}>
            {beats.map((b, i) => (
              <Item
                as="li"
                key={b.title}
                className="grid gap-4 border-t border-[var(--line)] py-10 sm:grid-cols-[7rem_minmax(0,1fr)] md:py-14"
              >
                <span
                  className="font-display text-5xl leading-none text-ember/80 italic soft md:text-6xl"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-[clamp(1.7rem,2.8vw,2.5rem)] leading-tight text-cream">{b.title}</h3>
                  <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-parchment text-pretty">{b.body}</p>
                </div>
              </Item>
            ))}
          </Stagger>
        </div>

        <Stagger className="mx-auto mt-24 max-w-5xl text-center md:mt-36" amount={0.4}>
          <figure>
            <Item variant="fade">
              <svg viewBox="0 0 48 36" className="mx-auto h-9 w-12 text-ember" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M0 36V22.6C0 9.8 6.4 2.3 19.2 0l2 4.6C14 6.6 10.6 10.6 10 16.6h9.4V36H0Zm26.6 0V22.6C26.6 9.8 33 2.3 45.8 0l2 4.6c-7.2 2-10.6 6-11.2 12h9.4V36H26.6Z"
                />
              </svg>
            </Item>
            <SplitHeading
              as="p"
              text="We don’t hide anything behind the pass. If it reaches your table, it met the *fire* first."
              className="mt-8 font-display text-[clamp(2rem,4.6vw,4.1rem)] leading-[1.06] tracking-[-0.02em] text-cream text-balance"
            />
            <Item variant="fade">
              <figcaption className="eyebrow mt-8">The kitchen</figcaption>
            </Item>
          </figure>
        </Stagger>

        <Stagger
          as="dl"
          className="mt-24 grid grid-cols-2 border-t border-[var(--line)] md:mt-32 lg:grid-cols-4"
          gap={0.1}
        >
          {stats.map((s, i) => (
            <Item
              key={s.label}
              className={`flex flex-col-reverse gap-3 border-b border-[var(--line)] py-8 pr-4 lg:border-b-0 lg:py-10 ${
                i % 2 === 1 ? "border-l pl-5 lg:pl-8" : ""
              } ${i >= 1 ? "lg:border-l lg:pl-8" : ""}`}
            >
              <dt className="max-w-[12rem] text-sm leading-snug text-muted">{s.label}</dt>
              <dd className="font-display text-[clamp(2.6rem,5vw,4.5rem)] leading-none text-cream">{s.value}</dd>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
