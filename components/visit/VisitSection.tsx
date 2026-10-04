import { Item, Rule, SplitHeading, Stagger } from "@/components/motion";
import { site } from "@/lib/site";
import { BandraMap } from "./BandraMap";
import { HoursTable } from "./HoursTable";

const directions = [
  { title: "By train", body: "Bandra station on the Western line, then ten minutes by rickshaw up Hill Road." },
  {
    title: "By car",
    body: "Valet from 7 pm. The lanes in Ranwar are narrow, so drop off and walk the last bit.",
  },
];

export function VisitSection() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="relative bg-soot py-24 md:py-36">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:px-12">
        <Stagger className="lg:col-span-5 lg:pr-8">
          <Item as="p" className="eyebrow flex items-center gap-3">
            <span className="text-ember">04</span>
            <Rule className="w-10" />
            Visit
          </Item>
          <SplitHeading
            id="visit-title"
            text="Find us in *Ranwar.*"
            className="mt-6 font-display text-[clamp(2.6rem,5.6vw,5rem)] leading-[0.98] tracking-[-0.03em] text-cream"
          />
          <Item className="mt-8">
            <address className="font-display text-xl leading-snug text-cream not-italic sm:text-2xl">
              {site.address.street}
              <br />
              {site.address.area}
              <br />
              {site.address.city}
            </address>
            <p className="mt-3 text-xs tracking-[0.14em] text-muted uppercase">Concept address · {site.coordinates}</p>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost mt-6 h-11 px-5 text-sm"
            >
              Open the area in Maps
              <span className="arrow" aria-hidden="true">
                ↗
              </span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Item>
          <Item className="mt-12">
            <h3 className="eyebrow mb-4">Hours</h3>
            <HoursTable />
            <p className="mt-4 text-sm text-muted">
              The kitchen takes last orders 45 minutes before close. The bar keeps going.
            </p>
          </Item>
        </Stagger>

        <Stagger className="flex flex-col gap-8 lg:col-span-7" amount={0.15}>
          <Item className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-ash">
            <BandraMap />
            <div className="flex items-center justify-between gap-4 border-t border-[var(--line)] px-5 py-3 text-[0.7rem] tracking-[0.16em] text-muted uppercase">
              <span>Bandra West, Mumbai</span>
              <span>Concept map · not to scale</span>
            </div>
          </Item>
          <Item
            as="ul"
            className="grid gap-px overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2"
          >
            {directions.map((d) => (
              <li key={d.title} className="bg-soot p-5">
                <p className="text-cream">{d.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{d.body}</p>
              </li>
            ))}
          </Item>
        </Stagger>
      </div>
    </section>
  );
}
