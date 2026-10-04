# Ember — Kitchen & Bar, Bandra

A concept website for a wood-fire restaurant and bar in Bandra West, Mumbai. Ember is not a real place: the menu, hours
and address are made up, and the reservation form never sends anything anywhere.

The hero is a living fire drawn in WebGL: a GLSL flame field made of layered simplex noise, a few thousand embers rising
on curl noise that drift away from the pointer, and the EMBER wordmark rendered from the page's own type, with heat haze
and letters that catch one by one after a short opening sequence.

**Live:** https://ember-glazy.vercel.app

## What is in it

- Opening sequence with a real loading counter (fonts, scene and shaders), skippable with a button or Escape, shown once
  per session and still under reduced motion
- Fire, embers and wordmark built with React Three Fiber and custom shaders; shaders compile asynchronously, rendering
  pauses off screen, particle count and pixel ratio adapt to the device
- A still CSS and SVG fire for browsers without WebGL 2 (try `?gl=0`) and a static frame for `prefers-reduced-motion`
- Menu with keyboard-accessible tabs, veg and non-veg marks and dietary tags
- Scroll-driven story section, live open or closed badge in Mumbai time
- Reservation form with day, time, party size and seating pickers, zod validation and a confirmation state
- Hand-drawn SVG map of Bandra West, no map API

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, three.js with @react-three/fiber and drei, Motion, zod.
Fonts are Fraunces and Schibsted Grotesk via `next/font`.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. `npm run build` makes a production build and `npm run lint` checks the code.

## Credits

- Simplex noise in the shaders follows the MIT-licensed [webgl-noise](https://github.com/ashima/webgl-noise) by Ian
  McEwan and Stefan Gustavson.
- Fraunces by Undercase Type and Schibsted Grotesk by Schibsted, both from Google Fonts under the SIL Open Font License.
- Everything else, including the map and the flame mark, is drawn for this project.

---

Concept site by GLAZY — https://glazy-portfolio.vercel.app
