/*
 * GLSL for the hero. Simplex noise follows the MIT-licensed "webgl-noise"
 * implementation by Ian McEwan and Stefan Gustavson.
 */

const noiseCommon = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
`;

const noise2D = /* glsl */ `
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

const noise3D = /* glsl */ `
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

/* Divergence-free drift in the screen plane: the curl of a scalar noise field. */
vec2 curl2(vec3 p) {
  const float e = 0.12;
  float ny = snoise(p + vec3(0.0, e, 0.0)) - snoise(p - vec3(0.0, e, 0.0));
  float nx = snoise(p + vec3(e, 0.0, 0.0)) - snoise(p - vec3(e, 0.0, 0.0));
  return vec2(ny, -nx) / (2.0 * e);
}
`;

/* ------------------------------------------------------------------ */
/* Fire: a full-screen field drawn straight into clip space.           */
/* ------------------------------------------------------------------ */

export const fireVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
}
`;

export const fireFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform float uWind;
uniform float uIntensity;
uniform float uBase;
varying vec2 vUv;

${noiseCommon}
${noise2D}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * snoise(p);
    p = r * p;
    a *= 0.5;
  }
  return v;
}

float fbm3(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = r * p;
    a *= 0.5;
  }
  return v;
}

vec3 ramp(float t) {
  vec3 c = mix(vec3(0.0), vec3(0.36, 0.045, 0.012), smoothstep(0.0, 0.22, t));
  c = mix(c, vec3(0.86, 0.2, 0.035), smoothstep(0.18, 0.48, t));
  c = mix(c, vec3(1.0, 0.5, 0.12), smoothstep(0.44, 0.7, t));
  c = mix(c, vec3(1.0, 0.8, 0.46), smoothstep(0.68, 0.88, t));
  c = mix(c, vec3(1.0, 0.95, 0.84), smoothstep(0.88, 1.0, t));
  return c;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float I = uIntensity;
  vec3 bg = vec3(0.043, 0.031, 0.027);

  // Light from the hearth spilling up the wall.
  float centre = 1.0 - smoothstep(0.0, 0.75, abs(uv.x - 0.5));
  float spill = exp(-uv.y * 2.4) * 0.55 + exp(-uv.y * 8.0) * 0.35;
  vec3 col = bg + vec3(0.42, 0.1, 0.025) * spill * (0.35 + 0.65 * centre) * I;

  if (I > 0.001 && uv.y < 0.78) {
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
    float t = uTime;
    // The breeze bends the tips more than the base.
    p.x -= uWind * uv.y * uv.y * 0.9;

    vec2 w = vec2(
      fbm3(vec2(p.x * 1.5, p.y * 1.1 - t * 0.55)),
      fbm3(vec2(p.x * 1.5 + 5.2, p.y * 1.1 - t * 0.55 + 1.3))
    );
    float n = fbm(vec2(p.x * 3.1, p.y * 1.8 - t * 1.3) + w * 0.95);

    // Taller tongues in some places than others.
    float env = uBase + 0.12 * (0.5 + 0.5 * snoise(vec2(p.x * 0.9 + 3.0, t * 0.16)));
    env *= 0.12 + 0.88 * I;
    float h = uv.y / max(env, 0.001);
    float f = (1.0 - h) + n * (0.5 + 0.55 * h);
    f = clamp(f, 0.0, 1.0);
    // Edges of the frame burn lower.
    f *= 0.55 + 0.45 * centre;
    // The coal bed at the very bottom glows orange rather than white.
    float bed = mix(0.74, 1.0, smoothstep(0.0, 0.1, uv.y));
    float heat = pow(f, 1.45) * 0.86 * bed * min(I, 1.25);
    float a = smoothstep(0.0, 0.3, f) * clamp(I * 1.6, 0.0, 1.0);
    col += ramp(clamp(heat, 0.0, 1.0)) * a;
  }

  vec2 v = uv - vec2(0.5, 0.45);
  col *= 1.0 - dot(v * vec2(0.85, 1.05), v) * 0.85;
  gl_FragColor = vec4(col, 1.0);
}
`;

/* ------------------------------------------------------------------ */
/* Wordmark: a canvas texture of the DOM heading, lit and shimmering.  */
/* ------------------------------------------------------------------ */

export const textVertex = /* glsl */ `
uniform vec4 uRect;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec2 p = mix(uRect.xy, uRect.zw, uv);
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

export const textFragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uIgnite;
uniform float uIntensity;
uniform float uShimmer;
uniform float uLetters[6];
uniform vec2 uGlyphY;
uniform float uBlur;
varying vec2 vUv;

${noiseCommon}
${noise2D}

float letterIndex(float x) {
  float idx = 0.0;
  for (int i = 1; i < 5; i++) {
    if (x > uLetters[i]) idx += 1.0;
  }
  return idx;
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  // Height within the glyphs: 0 at the baseline, 1 at cap height.
  float gy = clamp((uv.y - uGlyphY.x) / (uGlyphY.y - uGlyphY.x), 0.0, 1.0);

  // Heat haze, strongest near the flames.
  float heat = mix(1.0, 0.4, gy) * uShimmer;
  float n1 = snoise(vec2(uv.x * 7.0, uv.y * 3.0 - t * 1.4));
  float n2 = snoise(vec2(uv.x * 19.0 + 4.0, uv.y * 9.0 - t * 2.6));
  vec2 off = vec2(n1 * 0.0022 + n2 * 0.0011, n2 * 0.007 + n1 * 0.003) * heat;

  float a = texture2D(uTex, uv + off).a;
  // Blur comes from the mip chain; uBlur keeps it proportional to the type size.
  float edges = smoothstep(0.0, 0.14, uv.y) * (1.0 - smoothstep(0.86, 1.0, uv.y))
    * smoothstep(0.0, 0.06, uv.x) * (1.0 - smoothstep(0.94, 1.0, uv.x));
  float halo = texture2D(uTex, uv + off * 1.5, uBlur - 1.2).a * edges;
  float shade = texture2D(uTex, uv, uBlur + 0.4).a * edges;

  // Letters catch one after another, each burning upward from its base.
  float idx = letterIndex(uv.x);
  float local = clamp(uIgnite * 2.1 - idx * 0.27, 0.0, 1.0);
  float edge = snoise(vec2(uv.x * 16.0, gy * 5.0 + t * 0.6)) * 0.09;
  float front = local * 1.35 - 0.15;
  float d = front - (gy + edge);
  float shown = smoothstep(0.0, 0.03, d);
  float rim = (1.0 - smoothstep(0.0, 0.14, d)) * step(0.0, d) * (1.0 - smoothstep(0.85, 1.0, local));

  float flick = 0.82 + 0.18 * snoise(vec2(uv.x * 2.5, t * 1.7));
  vec3 cream = vec3(0.957, 0.914, 0.847);
  vec3 ember = vec3(1.0, 0.43, 0.13);
  vec3 white = vec3(1.0, 0.93, 0.78);
  float glowLow = (1.0 - smoothstep(0.0, 0.62, gy)) * flick * min(uIntensity, 1.2);
  vec3 gold = vec3(1.0, 0.74, 0.45);
  vec3 glyph = mix(cream, gold, glowLow * 0.75);

  vec3 rgb = glyph * a * shown;
  rgb += white * rim * a * 1.4;
  rgb += ember * halo * 0.4 * local * flick * min(uIntensity, 1.3);
  float alpha = a * shown + shade * 0.72 * local;
  gl_FragColor = vec4(rgb, clamp(alpha, 0.0, 1.0));
}
`;

/* ------------------------------------------------------------------ */
/* Embers: instanced points rising on curl noise.                      */
/* ------------------------------------------------------------------ */

export const emberVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uHalf;
uniform float uCamZ;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform float uWind;
uniform float uSize;
uniform float uIntensity;
attribute vec4 aSeed;
attribute float aDepth;
varying float vAlpha;
varying float vHeat;

${noiseCommon}
${noise3D}

void main() {
  float depthScale = (uCamZ - aDepth) / uCamZ;
  vec2 hv = uHalf * depthScale;
  float speed = 0.05 + 0.09 * aSeed.z;
  float life = fract(aSeed.y + uTime * speed);

  float sx = aSeed.x * 2.0 - 1.0;
  sx = sign(sx) * pow(abs(sx), 1.35);
  vec3 pos = vec3(sx * hv.x * 1.05, -hv.y * 1.08 + life * hv.y * 2.35, aDepth);

  vec2 c = curl2(vec3(pos.x * 0.3, pos.y * 0.28 - uTime * 0.12, aDepth * 0.35 + aSeed.w * 7.0)) * 0.4;
  float cl = length(c);
  if (cl > 1.4) c *= 1.4 / cl;
  pos.xy += c * (0.12 + life * 0.85) * depthScale;

  // The breeze carries older embers further.
  pos.x += uWind * life * life * hv.x * 0.55;

  // A local gust around the pointer.
  vec2 pAt = uPointer * hv;
  vec2 d = pos.xy - pAt;
  float dist2 = dot(d, d) / (depthScale * depthScale);
  float push = exp(-dist2 * 1.4);
  pos.xy += normalize(d + vec2(1e-4)) * push * 0.5 * depthScale;
  pos.xy += uPointerVel * hv * push * 0.18;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float flicker = 0.6 + 0.4 * sin(uTime * (5.0 + aSeed.w * 9.0) + aSeed.y * 40.0);
  float size = uSize * (0.35 + aSeed.w * aSeed.w * 1.5) * (1.0 - life * 0.45);
  float nearF = smoothstep(1.6, 3.4, aDepth);
  size *= 1.0 + nearF * 3.5;
  gl_PointSize = size * uPixelRatio / -mv.z;

  vAlpha = smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.4, 0.92, life)) * flicker;
  vAlpha *= (1.0 - nearF * 0.78) * uIntensity;
  vHeat = 1.0 - life;
}
`;

export const emberFragment = /* glsl */ `
precision highp float;
varying float vAlpha;
varying float vHeat;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 8.0);
  float glow = exp(-d * d * 2.4) * 0.3;
  vec3 hot = vec3(1.0, 0.88, 0.6);
  vec3 warm = vec3(1.0, 0.47, 0.14);
  vec3 cool = vec3(0.72, 0.15, 0.03);
  vec3 col = mix(cool, warm, smoothstep(0.1, 0.55, vHeat));
  col = mix(col, hot, smoothstep(0.7, 1.0, vHeat));
  gl_FragColor = vec4(col * (core + glow) * vAlpha, 1.0);
}
`;
