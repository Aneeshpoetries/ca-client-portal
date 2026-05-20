import { useEffect, useRef } from 'react';

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smoothNoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  return (
    hash(ix,     iy)     * (1 - u) * (1 - v) +
    hash(ix + 1, iy)     * u       * (1 - v) +
    hash(ix,     iy + 1) * (1 - u) * v       +
    hash(ix + 1, iy + 1) * u       * v
  );
}
function flowNoise(x, y) {
  return (
    smoothNoise(x,        y)        * 0.50 +
    smoothNoise(x * 2.1,  y * 2.1)  * 0.25 +
    smoothNoise(x * 4.37, y * 4.37) * 0.125
  );
}

function scatter(w, h, n) {
  const pts = [];
  const minD = Math.sqrt((w * h) / n) * 0.55;
  let tries = 0;
  while (pts.length < n && tries < n * 40) {
    tries++;
    const x = Math.random() * w;
    const y = Math.random() * h;
    let ok = true;
    for (const p of pts) {
      const dx = p[0] - x, dy = p[1] - y;
      if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
    }
    if (ok) pts.push([x, y]);
  }
  return pts;
}

const PAL_DARK  = ['#a5b4fc', '#c4b5fd', '#818cf8', '#93c5fd', '#e0e7ff', '#ddd6fe'];
const PAL_LIGHT = ['#0e8a74', '#148a74', '#1aaa8a', '#0d7060', '#10a080', '#16947e'];

export default function ParticleField({ count = 170, dark = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr     = Math.min(window.devicePixelRatio || 1, 2);
    const PAL      = dark ? PAL_DARK : PAL_LIGHT;
    const rBase    = dark ? 1.2 : 1.1;
    const rRange   = dark ? 2.2 : 2.4;
    const glowMult = dark ? 4.5 : 5.0;
    const SPOT_R   = 260;
    const PHYS_R   = 115;
    const LIT_FLOOR = 0.18;

    let w, h, particles = [], animId;
    const mouse = { x: -9999, y: -9999 };

    const setup = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = scatter(w, h, count).map(([ox, oy], i) => ({
        x: ox, y: oy, ox, oy,
        vx: 0, vy: 0,
        r:     rBase + Math.random() * rRange,
        phase: Math.random() * Math.PI * 2,
        speed: 0.18 + Math.random() * 0.55,
        color: PAL[i % PAL.length],
        nOff:  Math.random() * 200,
        nFreq: 0.7 + Math.random() * 0.9,
        alpha: dark ? (0.35 + Math.random() * 0.30) : (0.7 + Math.random() * 0.3),
        lit:   dark ? 1 : LIT_FLOOR,
      }));
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top + window.scrollY; // account for scroll
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let frame = 0;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      frame++;
      const t = frame * 0.007;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        const nx    = (p.ox / w) * p.nFreq + t * 0.11 + p.nOff;
        const ny    = (p.oy / h) * p.nFreq + t * 0.085;
        const angle = flowNoise(nx, ny) * Math.PI * 4 - Math.PI * 2;

        p.vx += (p.ox - p.x) * 0.011;
        p.vy += (p.oy - p.y) * 0.011;
        p.vx += Math.cos(angle) * 0.055;
        p.vy += Math.sin(angle) * 0.055;

        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;

        if (md2 < PHYS_R * PHYS_R && md2 > 0.01) {
          const md  = Math.sqrt(md2);
          const str = (1 - md / PHYS_R) * 0.85;
          p.vx += (mdx / md)  * str * 0.50;  // push
          p.vy += (mdy / md)  * str * 0.50;
          p.vx += (-mdy / md) * str * 0.30;  // swirl
          p.vy += ( mdx / md) * str * 0.30;
        }

        p.vx *= 0.87; p.vy *= 0.87;
        p.x  += p.vx; p.y  += p.vy;

        if (!dark) {
          let target = LIT_FLOOR; // always-on faint baseline
          if (mouse.x > -9000 && md2 < SPOT_R * SPOT_R) {
            const dist  = Math.sqrt(md2);
            const t01   = dist / SPOT_R;
            const boost = (1 - LIT_FLOOR) * (1 - t01 * t01 * (3 - 2 * t01));
            target = LIT_FLOOR + boost;
          }
          if (target > p.lit) {
            p.lit += (target - p.lit) * 0.10;
          } else {
            p.lit += (target - p.lit) * 0.03; // slow trail fade
          }
        }

        const effectiveAlpha = dark ? p.alpha : p.alpha * p.lit;
        if (effectiveAlpha < 0.005) continue; // skip invisible particles

        const pulse = 1 + Math.sin(t * p.speed + p.phase) * 0.22;
        const r     = p.r * pulse;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * glowMult);
        const toHex = (v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0');
        g.addColorStop(0,   p.color + toHex(effectiveAlpha * 0.60));
        g.addColorStop(0.4, p.color + toHex(effectiveAlpha * 0.18));
        g.addColorStop(1,   p.color + '00');
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * glowMult, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + toHex(effectiveAlpha * 0.90);
        ctx.fill();
      }
    };

    const onResize = () => {
      cancelAnimationFrame(animId);
      setup();
      draw();
    };
    window.addEventListener('resize', onResize);

    setup();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [count, dark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
