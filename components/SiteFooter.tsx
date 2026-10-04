import { FlameMark } from "@/components/FlameMark";
import { Item, Stagger } from "@/components/motion";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer
      data-page
      data-behind-menu
      className="relative overflow-hidden border-t border-[var(--line)] bg-char pt-20 md:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-72 left-1/2 h-[36rem] w-[120%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(255_107_44/0.22),rgb(140_43_14/0.12)_55%,transparent)]"
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Stagger className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12" gap={0.08}>
          <Item className="col-span-2 md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3">
              <FlameMark id="flame-footer" className="size-8" />
              <span className="font-display text-3xl tracking-[0.06em] text-cream">EMBER</span>
            </div>
            <p className="mt-5 max-w-sm leading-relaxed text-parchment">
              A wood-fire kitchen and bar in Bandra West. Small plates off the coals, food from the hearth, late pours.
            </p>
            <a href="#reserve" className="btn btn-primary mt-8">
              Reserve a table
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </a>
          </Item>

          <Item className="md:col-span-2 md:col-start-6 lg:col-start-6">
            <h2 className="eyebrow">Explore</h2>
            <ul className="mt-5 flex flex-col gap-3 text-parchment">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-underline hover:text-cream">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </Item>

          <Item className="col-span-2 row-start-3 md:col-span-3 md:row-start-auto">
            <h2 className="eyebrow">Find us</h2>
            <p className="mt-5 leading-relaxed text-parchment">
              {site.address.street}
              <br />
              {site.address.area}
              <br />
              {site.address.city}
            </p>
          </Item>

          <Item className="md:col-span-2">
            <h2 className="eyebrow">Hours</h2>
            <p className="mt-5 leading-relaxed text-parchment">
              Tue – Sun from 6 pm
              <br />
              Sunday lunch 12:30 pm
              <br />
              Closed Mondays
            </p>
          </Item>
        </Stagger>

        <div
          aria-hidden="true"
          className="mt-20 bg-linear-to-t from-ember/45 via-coal/25 to-transparent bg-clip-text text-center font-display text-[23vw] leading-[0.76] tracking-[-0.04em] text-transparent select-none md:mt-24 lg:text-[21rem]"
        >
          EMBER
        </div>

        <div className="relative flex flex-col gap-4 border-t border-[var(--line)] py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            <a
              href={site.studio.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-parchment transition-colors hover:text-cream"
            >
              Ember is a concept site designed and built by{" "}
              <span className="font-semibold text-flame underline decoration-flame/40 underline-offset-4 group-hover:decoration-flame">
                GLAZY
              </span>
              .<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <p>Not a real restaurant. No bookings are taken.</p>
          <a href="#top" className="link-underline self-start text-parchment hover:text-cream md:self-auto">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
