/**
 * A stylised, not-to-scale map of Bandra West. Hand-drawn in SVG so it needs
 * no map provider or API key.
 */

const coast =
  "M212 0 C202 60 197 112 189 160 C183 200 171 236 151 262 C129 290 105 312 99 338 C95 360 111 380 133 392 C151 402 161 418 171 436 C179 452 201 468 231 482 C261 496 291 508 321 520";

const roads = {
  major: [
    { id: "hill", d: "M640 318 C560 322 500 330 440 336 C380 342 320 352 270 364 C240 372 214 384 196 398" },
    { id: "linking", d: "M420 0 C424 80 430 160 436 240 C438 280 440 310 440 336" },
    { id: "sv", d: "M520 0 C522 120 526 240 532 330 C536 400 540 460 546 520" },
    { id: "carter", d: "M226 0 C216 60 211 112 203 160 C197 200 186 232 168 256" },
  ],
  minor: [
    "M300 230 C308 270 316 300 326 340 C332 364 338 392 346 420",
    "M246 296 C290 302 330 304 372 298 C400 294 420 290 437 288",
    "M196 398 C190 412 186 424 180 436",
    "M168 256 C190 270 214 284 246 296",
    "M346 420 C390 412 440 404 480 400 C500 398 520 398 536 400",
    "M436 240 C470 236 500 234 528 232",
    "M300 230 C340 222 390 216 434 214",
    "M270 364 C276 400 280 440 282 480 C283 496 284 508 284 520",
    "M440 336 C450 380 456 430 460 480",
    "M118 330 C116 352 128 370 148 382",
  ],
};

export function BandraMap() {
  return (
    <svg viewBox="0 0 640 520" className="block h-auto w-full" role="img" aria-labelledby="map-title map-desc">
      <title id="map-title">Map of Bandra West showing Ember in Ranwar</title>
      <desc id="map-desc">
        A stylised map, not to scale. Ember sits on Waroda Road in Ranwar, just north of Hill Road, between Bandra
        station to the east and Bandstand on the sea front to the west.
      </desc>
      <defs>
        <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="rgb(244 233 216 / 0.04)" strokeWidth="1" />
        </pattern>
        <pattern id="map-waves" width="36" height="14" patternUnits="userSpaceOnUse">
          <path
            d="M0 7 C6 3 12 3 18 7 C24 11 30 11 36 7"
            fill="none"
            stroke="rgb(244 233 216 / 0.07)"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="map-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff6b2c" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff6b2c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="520" fill="#15100d" />
      <rect width="640" height="520" fill="url(#map-grid)" />

      {/* Sea */}
      <path d={`${coast} H0 V0 Z`} fill="#0d0a08" />
      <path d={`${coast} H0 V0 Z`} fill="url(#map-waves)" />
      <path d={coast} fill="none" stroke="rgb(255 161 73 / 0.35)" strokeWidth="1.5" />

      {/* Mount Mary hill */}
      <g fill="none" stroke="rgb(244 233 216 / 0.1)" strokeDasharray="2 4">
        <ellipse cx="190" cy="350" rx="36" ry="24" />
        <ellipse cx="190" cy="350" rx="22" ry="14" />
      </g>

      {/* Roads */}
      <g fill="none" strokeLinecap="round">
        {roads.minor.map((d, i) => (
          <path key={i} d={d} stroke="rgb(244 233 216 / 0.12)" strokeWidth="2" />
        ))}
        {roads.major.map((r) => (
          <path key={r.id} d={r.d} stroke="rgb(244 233 216 / 0.24)" strokeWidth="4" />
        ))}
      </g>

      {/* Railway */}
      <g stroke="rgb(244 233 216 / 0.28)" fill="none">
        <path d="M588 0 L602 520" strokeWidth="1.2" />
        <path d="M597 0 L611 520" strokeWidth="1.2" />
        <path d="M592.5 0 L606.5 520" strokeWidth="6" strokeDasharray="1.2 9" />
      </g>
      <rect x="584" y="300" width="30" height="44" rx="4" fill="#1f1713" stroke="rgb(255 161 73 / 0.5)" />

      {/* Sea link */}
      <path
        d="M236 486 C214 500 196 510 176 520"
        fill="none"
        stroke="rgb(255 161 73 / 0.5)"
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      <rect
        x="166"
        y="430"
        width="12"
        height="12"
        transform="rotate(45 172 436)"
        fill="#15100d"
        stroke="rgb(244 233 216 / 0.4)"
      />

      {/* Labels */}
      <g fill="rgb(173 154 131)" fontSize="10.5" letterSpacing="2" style={{ textTransform: "uppercase" }}>
        <text x="236" y="96" transform="rotate(-82 236 96)">
          Carter Road
        </text>
        <text x="408" y="150" transform="rotate(87 408 150)">
          Linking Rd
        </text>
        <text x="510" y="190" transform="rotate(88 510 190)">
          S.V. Road
        </text>
        <text x="470" y="322" transform="rotate(-4 470 322)">
          Hill Road
        </text>
        <text x="350" y="452" transform="rotate(-6 350 452)">
          Turner Rd
        </text>
        <text x="30" y="326">
          Bandstand
        </text>
        <text x="150" y="314">
          Mount Mary
        </text>
        <text x="48" y="448">
          Bandra Fort
        </text>
        <text x="100" y="510" fill="rgb(255 161 73 / 0.75)">
          Sea Link
        </text>
        <text x="576" y="370" textAnchor="end">
          Bandra Stn
        </text>
        <text x="40" y="120" fill="rgb(173 154 131 / 0.6)" letterSpacing="5">
          Arabian Sea
        </text>
      </g>

      {/* Ember */}
      <g transform="translate(322 318)">
        <circle r="70" fill="url(#map-glow)" />
        <circle className="map-ring" r="10" fill="none" stroke="#ff6b2c" strokeWidth="1.5" />
        <circle className="map-ring delay" r="10" fill="none" stroke="#ff6b2c" strokeWidth="1.5" />
        <circle r="7" fill="#ff6b2c" stroke="#ffcf8a" strokeWidth="2" />
        <g transform="translate(18 -54)">
          <rect width="116" height="44" rx="10" fill="#0b0807" stroke="rgb(255 107 44 / 0.6)" />
          <text x="14" y="20" fill="#f4e9d8" fontSize="14" fontFamily="var(--font-fraunces), serif" letterSpacing="2">
            EMBER
          </text>
          <text x="14" y="34" fill="rgb(173 154 131)" fontSize="9.5" letterSpacing="1">
            18 Waroda Road
          </text>
        </g>
      </g>

      {/* Compass and scale */}
      <g transform="translate(600 46)" fill="none" stroke="rgb(244 233 216 / 0.45)">
        <circle r="16" />
        <path d="M0 -10 L4 4 L0 1 L-4 4 Z" fill="rgb(255 161 73 / 0.9)" stroke="none" />
        <text y="-22" textAnchor="middle" fill="rgb(173 154 131)" stroke="none" fontSize="10" letterSpacing="1">
          N
        </text>
      </g>
      <g
        transform="translate(470 490)"
        stroke="rgb(244 233 216 / 0.45)"
        fill="rgb(173 154 131)"
        fontSize="9.5"
        letterSpacing="1"
      >
        <path d="M0 0 H80 M0 -4 V4 M80 -4 V4" fill="none" />
        <text x="40" y="-9" textAnchor="middle" stroke="none">
          ~500 M
        </text>
      </g>
    </svg>
  );
}
