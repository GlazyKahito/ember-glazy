import type { Metadata, Viewport } from "next";
import { Fraunces, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  display: "swap",
});

/*
 * The ₹ in the menu is the only character outside the Latin subsets. These one-glyph
 * cuts of the same two fonts (axes intact) sit first in each stack and cover only U+20B9,
 * so the rupee no longer pulls in both Latin Extended files (about 124 KB).
 */
const frauncesRupee = localFont({
  src: "./fonts/fraunces-rupee.woff2",
  variable: "--font-fraunces-rupee",
  weight: "100 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9" }],
});

const schibstedRupee = localFont({
  src: "./fonts/schibsted-rupee.woff2",
  variable: "--font-schibsted-rupee",
  weight: "400 900",
  style: "normal",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9" }],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} · Concept`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.studio.name, url: site.studio.url }],
  creator: site.studio.name,
  keywords: [
    "Ember",
    "wood-fire restaurant",
    "Bandra West",
    "Mumbai restaurant concept",
    "restaurant website",
    "WebGL",
    "GLAZY",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.title} · Concept`,
    description: site.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.title} · Concept`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0807",
  colorScheme: "dark",
};

/*
 * Decides before the first paint whether the opening sequence plays:
 * once per browser session, and as a still frame for reduced motion.
 */
const introGate = `try{var d=document.documentElement,s=null;try{s=sessionStorage.getItem('ember:intro')}catch(e){}d.dataset.intro=s==='1'?'seen':(matchMedia('(prefers-reduced-motion: reduce)').matches?'static':'play')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      data-intro="seen"
      className={`${fraunces.variable} ${schibsted.variable} ${frauncesRupee.variable} ${schibstedRupee.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
