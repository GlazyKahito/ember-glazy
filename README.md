# Ember

A site for a fictional wood-fire kitchen and bar in Bandra West, Mumbai, with a living WebGL fire as its hero. A concept site by [GLAZY](https://glazy-portfolio.vercel.app), a freelance web & SaaS agency.

**Live:** https://ember-glazy.vercel.app

## Technically interesting

- **Fire, embers and wordmark in custom GLSL** (React Three Fiber). The flame field is layered simplex noise. A few thousand embers rise on curl noise and drift away from the pointer. The EMBER wordmark is drawn from the page's own type, with heat haze and letters that catch one by one.
- **Opening sequence driven by real loading** (fonts, the scene module, shaders, the drawn wordmark). Shaders compile in parallel before the first frame, and while the opaque intro covers the fire the scene renders only on demand. It plays once per session and Escape skips it.
- **Adapts to the device.** Rendering pauses off screen, and the particle count and pixel ratio adapt to the device. Browsers without WebGL 2 get a still CSS and SVG fire (try `?gl=0`), and reduced motion gets a static frame.
- **One-glyph font subsets.** The ₹ in the menu comes from one-glyph cuts of the two typefaces, with all variation axes kept, so it no longer pulls in their Latin Extended files (about 124 KB).
- **Reservation form** with day, time, party and seating pickers, plus zod validation that loads only when someone starts on the form. Nothing is ever sent.
- **Menu and map.** Menu tabs work from the keyboard, the open-or-closed badge runs on Mumbai time, and the map of Bandra West is hand-drawn SVG, with no map API.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, three.js, @react-three/fiber, @react-three/drei, Motion, zod.

## Run locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint
npm run typecheck
```

## Credits and licences

- Simplex noise in the shaders follows [webgl-noise](https://github.com/ashima/webgl-noise) by Ian McEwan and Stefan Gustavson (MIT License).
- Fraunces by Undercase Type and Schibsted Grotesk by Schibsted: SIL Open Font License, from Google Fonts via `next/font`. The two ₹ subsets in `app/fonts/` are cut from the same files under the same licence.
- Everything else, including the map and the flame mark, was drawn for this project. Ember, its menu, hours and address are fictional.
