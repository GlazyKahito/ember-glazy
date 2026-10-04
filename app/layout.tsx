import type { Metadata, Viewport } from "next";
import { Fraunces, Schibsted_Grotesk } from "next/font/google";
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
      className={`${fraunces.variable} ${schibsted.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: introGate }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
