import { Hero } from "@/components/hero/Hero";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Marquee } from "@/components/Marquee";
import { MenuSection } from "@/components/menu/MenuSection";
import { ReserveSection } from "@/components/reserve/ReserveSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StorySection } from "@/components/story/StorySection";
import { VisitSection } from "@/components/visit/VisitSection";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-cream px-4 py-2 text-char focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <IntroOverlay />
      <SiteHeader />
      <main id="main" data-page data-behind-menu>
        <Hero />
        <Marquee />
        <MenuSection />
        <StorySection />
        <ReserveSection />
        <VisitSection />
      </main>
      <SiteFooter />
    </>
  );
}
