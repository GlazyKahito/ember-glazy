/**
 * A still, CSS and SVG version of the fire. It sits under the WebGL canvas
 * while that loads, and stands in for it where WebGL is not available.
 */

const W = 1440;
const H = 560;

/** Rounded so server and browser always print identical path data. */
const n = (v: number) => Math.round(v * 10) / 10;

function tongue(cx: number, width: number, height: number, lean: number) {
  const b = H + 10;
  const top = b - height;
  return [
    `M ${n(cx - width)} ${b}`,
    `C ${n(cx - width * 0.85)} ${n(b - height * 0.45)}, ${n(cx - width * 0.15 + lean * 0.4)} ${n(b - height * 0.6)}, ${n(cx + lean)} ${n(top)}`,
    `C ${n(cx + width * 0.25 + lean * 0.4)} ${n(b - height * 0.62)}, ${n(cx + width * 0.9)} ${n(b - height * 0.42)}, ${n(cx + width)} ${b}`,
    "Z",
  ].join(" ");
}

const tongues = Array.from({ length: 15 }, (_, i) => {
  const x = (i + 0.5) / 15;
  const centre = 1 - Math.abs(x - 0.5) * 1.6;
  const wobble = Math.sin(i * 2.7) * 0.5 + 0.5;
  return tongue(
    x * W,
    70 + wobble * 40,
    120 + Math.max(centre, 0.15) * 300 * (0.7 + wobble * 0.5),
    Math.sin(i * 1.3) * 40,
  );
});

const sparks = Array.from({ length: 26 }, (_, i) => ({
  x: (((i * 97) % 100) / 100) * W * 0.8 + W * 0.1,
  y: H - 80 - ((i * 53) % 100) * 4.4,
  r: 1 + ((i * 31) % 10) / 6,
  o: 0.35 + ((i * 17) % 10) / 16,
}));

export function FireFallback({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden ${className}`}>
      <div className="fallback-glow absolute inset-0" />
      <svg
        className="absolute inset-x-0 bottom-0 h-[62%] w-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="ff-flame" gradientUnits="userSpaceOnUse" x1="0" y1={H} x2="0" y2={H - 440}>
            <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" />
            <stop offset="0.18" stopColor="#ffc06a" />
            <stop offset="0.45" stopColor="#ff6b2c" stopOpacity="0.85" />
            <stop offset="0.8" stopColor="#8c2b0e" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8c2b0e" stopOpacity="0" />
          </linearGradient>
          <filter id="ff-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="ff-spark" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>
        <g filter="url(#ff-soft)" fill="url(#ff-flame)" opacity="0.9">
          {tongues.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g filter="url(#ff-spark)" fill="#ffb066">
          {sparks.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
