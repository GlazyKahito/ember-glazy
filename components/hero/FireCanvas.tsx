"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { intro } from "@/lib/intro";
import { emberFragment, emberVertex, fireFragment, fireVertex, textFragment, textVertex } from "./shaders";

type Input = { x: number; y: number; vx: number; vy: number; t: number };

type Props = {
  wordRef: RefObject<HTMLElement | null>;
  hostRef: RefObject<HTMLElement | null>;
  active: boolean;
  reduced: boolean;
  onTextReady: () => void;
};

const MAX_DPR = 1.75;

function particleBudget() {
  const w = window.innerWidth;
  let n = w < 640 ? 900 : w < 1100 ? 1700 : 3000;
  const cores = navigator.hardwareConcurrency || 4;
  if (cores <= 4) n = Math.round(n * 0.65);
  return n;
}

/** Small deterministic PRNG so the ember field is identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (k: number) => k * k * (3 - 2 * k);

/** Fire intensity over the opening: dark, a flare past full, then it settles. */
function fireCurve(since: number | null) {
  if (since === null) return 0;
  if (!Number.isFinite(since)) return 1;
  if (since < 0.75) return 1.45 * (1 - Math.pow(1 - since / 0.75, 3));
  return 1.45 - 0.45 * smooth(clamp((since - 0.75) / 1.25, 0, 1));
}

function igniteCurve(since: number | null) {
  if (since === null) return 0;
  if (!Number.isFinite(since)) return 1;
  return clamp((since - 0.3) / 1.0, 0, 1);
}

export function FireCanvas({ wordRef, hostRef, active, reduced, onTextReady }: Props) {
  const [dpr, setDpr] = useState(MAX_DPR);
  const [lowPower, setLowPower] = useState(false);
  const [count] = useState(particleBudget);
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);
  const input = useRef<Input>({ x: 0, y: -0.35, vx: 0, vy: 0, t: 0 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      const host = hostRef.current;
      if (!host) return;
      const r = host.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = 1 - ((e.clientY - r.top) / r.height) * 2;
      const s = input.current;
      const dt = Math.max((e.timeStamp - s.t) / 1000, 1 / 240);
      if (s.t > 0 && dt < 0.25) {
        s.vx = clamp((x - s.x) / dt, -6, 6);
        s.vy = clamp((y - s.y) / dt, -6, 6);
      }
      s.x = x;
      s.y = y;
      s.t = e.timeStamp;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [hostRef, reduced]);

  return (
    <Canvas
      frameloop={!compiled ? "never" : reduced ? "demand" : active ? "always" : "never"}
      dpr={dpr}
      flat
      gl={{
        antialias: false,
        alpha: false,
        depth: false,
        stencil: false,
        powerPreference: "high-performance",
      }}
      camera={{ fov: 50, position: [0, 0, 6], near: 0.1, far: 30 }}
      aria-hidden="true"
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          setDpr(1);
          setLowPower(true);
        }}
        onIncline={() => setDpr(MAX_DPR)}
        onFallback={() => {
          setDpr(1);
          setLowPower(true);
        }}
      />
      <Scene
        wordRef={wordRef}
        input={input}
        reduced={reduced}
        count={count}
        lowPower={lowPower}
        compiled={compiled}
        onCompiled={onCompiled}
        onTextReady={onTextReady}
      />
    </Canvas>
  );
}

type SceneProps = {
  wordRef: RefObject<HTMLElement | null>;
  input: RefObject<Input>;
  reduced: boolean;
  count: number;
  lowPower: boolean;
  compiled: boolean;
  onCompiled: () => void;
  onTextReady: () => void;
};

function Scene({ wordRef, input, reduced, count, lowPower, compiled, onCompiled, onTextReady }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);

  const fireMat = useRef<THREE.ShaderMaterial>(null);
  const textMat = useRef<THREE.ShaderMaterial>(null);
  const emberMat = useRef<THREE.ShaderMaterial>(null);
  const sim = useRef({ fire: 0, embers: 0, wind: 0, px: 0, py: -0.35, pvx: 0, pvy: 0, textFrames: -1 });
  const readyRef = useRef(onTextReady);

  useEffect(() => {
    readyRef.current = onTextReady;
  }, [onTextReady]);

  // Compile every shader off the main thread before the first frame, so the
  // opening counter keeps moving instead of freezing on a driver compile.
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (!alive) return;
      intro.mark("gl");
      onCompiled();
    };
    if (gl.extensions.has("KHR_parallel_shader_compile")) {
      gl.compileAsync(scene, camera).then(done, done);
    } else {
      gl.compile(scene, camera);
      done();
    }
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onCompiled]);

  useEffect(() => {
    if (compiled) invalidate();
  }, [compiled, invalidate]);

  const fireUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uWind: { value: 0 },
      uIntensity: { value: 0 },
      uBase: { value: 0.27 },
    }),
    [],
  );

  const textUniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uIgnite: { value: 0 },
      uIntensity: { value: 0 },
      uShimmer: { value: 1 },
      uLetters: { value: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      uGlyphY: { value: new THREE.Vector2(0.2, 0.8) },
      uBlur: { value: 4 },
      uRect: { value: new THREE.Vector4(0, 0, 0, 0) },
    }),
    [],
  );

  const emberUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uHalf: { value: new THREE.Vector2(1, 1) },
      uCamZ: { value: 6 },
      uPointer: { value: new THREE.Vector2(0, -0.35) },
      uPointerVel: { value: new THREE.Vector2(0, 0) },
      uWind: { value: 0 },
      uSize: { value: 30 },
      uIntensity: { value: 0 },
    }),
    [],
  );

  const geometry = useMemo(() => {
    const rand = mulberry32(1337);
    const seeds = new Float32Array(count * 4);
    const depth = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      seeds[i * 4] = rand();
      seeds[i * 4 + 1] = rand();
      seeds[i * 4 + 2] = rand();
      seeds[i * 4 + 3] = rand();
      depth[i] = rand() < 0.07 ? 1.8 + rand() * 1.6 : -4.5 + rand() * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    g.setAttribute("aDepth", new THREE.BufferAttribute(depth, 1));
    return g;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    geometry.setDrawRange(0, lowPower ? Math.round(count * 0.55) : count);
  }, [geometry, lowPower, count]);

  // Draw the DOM wordmark into a texture, letter by letter, at its exact layout position.
  useEffect(() => {
    const word = wordRef.current;
    if (!word) return;
    let cancelled = false;
    let texture: THREE.CanvasTexture | null = null;
    let timer = 0;

    const build = async () => {
      const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-letter]"));
      if (!letters.length) return;
      const style = getComputedStyle(letters[0]);
      const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      try {
        await document.fonts.ready;
        await document.fonts.load(font, "EMBER");
      } catch {
        /* draw with whatever is available */
      }
      if (cancelled) return;

      const host = gl.domElement.getBoundingClientRect();
      const box = word.getBoundingClientRect();
      if (!host.width || !box.width) return;
      const size = parseFloat(style.fontSize);
      const padX = size * 0.3;
      const padY = size * 0.35;
      const w = box.width + padX * 2;
      const h = box.height + padY * 2;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(w * ratio);
      canvas.height = Math.ceil(h * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.font = font;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      const metrics = ctx.measureText("EMBER");
      const ascent = metrics.fontBoundingBoxAscent;
      const descent = metrics.fontBoundingBoxDescent;
      const lineHeight = style.lineHeight === "normal" ? ascent + descent : parseFloat(style.lineHeight);

      const edges: number[] = [];
      let baseline = 0;
      for (const el of letters) {
        const x = el.offsetLeft + padX;
        baseline = el.offsetTop + padY + (lineHeight - (ascent + descent)) / 2 + ascent;
        ctx.fillText(el.textContent ?? "", x, baseline);
        edges.push(x / w);
      }
      while (edges.length < 6) edges.push(1);

      texture?.dispose();
      texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const capHeight = metrics.actualBoundingBoxAscent;
      const x0 = box.left - host.left - padX;
      const y0 = box.top - host.top - padY;
      const u = textMat.current?.uniforms;
      if (!u) return;
      u.uTex.value = texture;
      u.uLetters.value = edges.slice(0, 6);
      u.uBlur.value = Math.max(2, Math.log2((size * ratio) / 14));
      (u.uGlyphY.value as THREE.Vector2).set((h - baseline) / h, (h - baseline + capHeight) / h);
      (u.uRect.value as THREE.Vector4).set(
        (x0 / host.width) * 2 - 1,
        1 - ((y0 + h) / host.height) * 2,
        ((x0 + w) / host.width) * 2 - 1,
        1 - (y0 / host.height) * 2,
      );
      if (sim.current.textFrames < 0) sim.current.textFrames = 0;
      invalidate();
    };

    build();
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 120);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(word);
    ro.observe(gl.domElement);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      ro.disconnect();
      texture?.dispose();
    };
  }, [gl, wordRef, invalidate]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const s = sim.current;
    const since = reduced ? Infinity : intro.sinceIgnite();
    const intensity = fireCurve(since);
    const ignite = igniteCurve(since);
    const burst = since !== null && Number.isFinite(since) ? Math.exp(-Math.pow((since - 0.6) / 0.55, 2)) : 0;

    if (reduced) {
      s.fire = 4.2;
      s.embers = 18;
      s.wind = 0;
    } else {
      s.fire += dt * (1 + burst * 0.9);
      s.embers += dt * (1 + burst * 2.4);
      const inp = input.current;
      const follow = 1 - Math.exp(-dt * 5);
      s.px += (inp.x - s.px) * follow;
      s.py += (inp.y - s.py) * follow;
      // The last pointer velocity fades out the longer the pointer rests.
      const rest = Math.exp(-Math.max(0, (performance.now() - inp.t) / 1000) * 3.5);
      const settle = 1 - Math.exp(-dt * 3);
      s.pvx += (inp.vx * rest - s.pvx) * settle;
      s.pvy += (inp.vy * rest - s.pvy) * settle;
      const sway = Math.sin(state.clock.elapsedTime * 0.35) * 0.07;
      const target = clamp(s.pvx * 0.32, -1, 1) + sway;
      s.wind += (target - s.wind) * (1 - Math.exp(-dt * 2));
    }

    const { width, height } = state.size;
    const camera = state.camera as THREE.PerspectiveCamera;
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

    const f = fireMat.current;
    if (f) {
      f.uniforms.uTime.value = s.fire;
      (f.uniforms.uRes.value as THREE.Vector2).set(width, height);
      f.uniforms.uWind.value = s.wind;
      f.uniforms.uIntensity.value = intensity;
      f.uniforms.uBase.value = width < 700 ? (height > width * 1.4 ? 0.27 : 0.2) : 0.23;
    }

    const t = textMat.current;
    if (t) {
      t.uniforms.uTime.value = s.fire;
      t.uniforms.uIgnite.value = ignite;
      t.uniforms.uIntensity.value = intensity;
      t.uniforms.uShimmer.value = reduced ? 0 : 1;
    }

    const e = emberMat.current;
    if (e) {
      e.uniforms.uTime.value = s.embers;
      e.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
      (e.uniforms.uHalf.value as THREE.Vector2).set(halfH * (width / height), halfH);
      e.uniforms.uCamZ.value = camera.position.z;
      (e.uniforms.uPointer.value as THREE.Vector2).set(s.px, s.py);
      (e.uniforms.uPointerVel.value as THREE.Vector2).set(clamp(s.pvx, -3, 3), clamp(s.pvy, -3, 3));
      e.uniforms.uWind.value = s.wind;
      e.uniforms.uSize.value = width < 700 ? 26 : 32;
      e.uniforms.uIntensity.value = clamp(intensity, 0, 1.2);
    }

    // Report ready once the wordmark has actually been drawn a couple of times.
    if (s.textFrames >= 0 && s.textFrames < 3) {
      s.textFrames += 1;
      if (s.textFrames === 3) {
        intro.mark("text");
        readyRef.current();
      } else {
        invalidate();
      }
    }
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={fireMat}
          vertexShader={fireVertex}
          fragmentShader={fireFragment}
          uniforms={fireUniforms}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh frustumCulled={false} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={textMat}
          vertexShader={textVertex}
          fragmentShader={textFragment}
          uniforms={textUniforms}
          transparent
          premultipliedAlpha
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <points geometry={geometry} frustumCulled={false} renderOrder={2}>
        <shaderMaterial
          ref={emberMat}
          vertexShader={emberVertex}
          fragmentShader={emberFragment}
          uniforms={emberUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
        />
      </points>
    </>
  );
}
