import { Item, Rule, SplitHeading, Stagger } from "@/components/motion";
import { ReservationForm } from "./ReservationForm";

const notes = [
  { title: "Fifteen minutes", body: "We hold every table for a quarter of an hour, then offer it to the bar." },
  { title: "The hearth counter", body: "Eight stools facing the fire. They go first, so book early in the week." },
  { title: "Walk-ins welcome", body: "The bar keeps a few seats back every night for whoever finds us." },
];

export function ReserveSection() {
  return (
    <section id="reserve" aria-labelledby="reserve-title" className="relative overflow-hidden bg-char py-24 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-64 size-[52rem] rounded-full bg-[radial-gradient(circle,rgb(255_107_44/0.1),transparent_62%)]"
      />
      <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12">
        <Stagger className="lg:col-span-5 lg:pr-6">
          <div className="lg:sticky lg:top-32">
            <Item as="p" className="eyebrow flex items-center gap-3">
              <span className="text-ember">03</span>
              <Rule className="w-10" />
              Reserve
            </Item>
            <SplitHeading
              id="reserve-title"
              text="Pull up a chair by the *fire.*"
              className="mt-6 font-display text-[clamp(2.6rem,5.6vw,5rem)] leading-[0.98] tracking-[-0.03em] text-cream text-balance"
            />
            <Item as="p" className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-parchment text-pretty">
              Tables open two weeks ahead, Tuesday to Sunday. Pick a day and a seating, and tell us anything the kitchen
              should know.
            </Item>
            <Item as="ul" className="mt-10 flex flex-col border-t border-[var(--line)]">
              {notes.map((n) => (
                <li
                  key={n.title}
                  className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b border-[var(--line)] py-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1.5 rounded-full bg-ember shadow-[0_0_10px_rgb(255_107_44/0.9)]"
                  />
                  <p className="text-sm leading-relaxed text-muted">
                    <span className="block text-base text-cream">{n.title}</span>
                    {n.body}
                  </p>
                </li>
              ))}
            </Item>
          </div>
        </Stagger>

        <Stagger className="lg:col-span-7" amount={0.1}>
          <Item>
            <ReservationForm />
          </Item>
        </Stagger>
      </div>
    </section>
  );
}
