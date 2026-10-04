import { Item, Rule, SplitHeading, Stagger } from "@/components/motion";
import { tagLabels, type Tag } from "@/lib/menu";
import { ChiliIcon, DietMark } from "./DietMark";
import { MenuTabs } from "./MenuTabs";

const legendTags: Tag[] = ["vegan", "gf", "nuts", "egg", "zero"];

export function MenuSection() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="relative bg-char py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Stagger className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Item as="p" className="eyebrow flex items-center gap-3">
              <span className="text-ember">01</span>
              <Rule className="w-10" />
              The menu
            </Item>
            <SplitHeading
              id="menu-title"
              text="Cooked over *wood,* served to share."
              className="mt-6 font-display text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.98] tracking-[-0.03em] text-cream text-balance"
            />
          </div>
          <Item className="md:col-span-4 md:col-start-9">
            <p className="text-parchment text-pretty">
              A sample of what comes off the fire. The list changes with the market and the mood of the coals, so ask
              what is new tonight.
            </p>
          </Item>
        </Stagger>

        <div className="mt-14 md:mt-20">
          <MenuTabs />
        </div>

        <Stagger className="mt-12 flex flex-col gap-6 border-t border-[var(--line)] pt-8 md:flex-row md:items-start md:justify-between">
          <Item as="ul" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted" variant="fade">
            <li className="flex items-center gap-2">
              <DietMark diet="veg" /> Vegetarian
            </li>
            <li className="flex items-center gap-2">
              <DietMark diet="nonveg" /> Meat, fish or seafood
            </li>
            <li className="flex items-center gap-2">
              <ChiliIcon className="size-3.5 text-ember" /> Spicy
            </li>
            {legendTags.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[0.68rem] tracking-[0.1em] text-parchment uppercase">
                  {tagLabels[t].short}
                </span>
                {tagLabels[t].long}
              </li>
            ))}
          </Item>
          <Item as="p" className="max-w-sm text-sm text-muted md:text-right" variant="fade">
            Prices in ₹, taxes extra. Tell us about allergies before you order; the kitchen shares one fire.
          </Item>
        </Stagger>
      </div>
    </section>
  );
}
