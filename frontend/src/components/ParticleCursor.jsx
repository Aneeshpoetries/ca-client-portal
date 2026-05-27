import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

// ── Simplex Noise GLSL ──────────────────────────────────────────────────────
const noiseGLSL = `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  float permute(float x){ return floor(mod(((x*34.0)+1.0)*x, 289.0)); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float taylorInvSqrt(float r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0)) + i.x + vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0,1.0/3.0);
    const vec4 D = vec4(0.0,0.5,1.0,2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0*C.xxx;
    vec3 x2 = x0 - i2 + 2.0*C.xxx;
    vec3 x3 = x0 - 1. + 3.0*C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0,i1.z,i2.z,1.0))
            + i.y + vec4(0.0,i1.y,i2.y,1.0))
            + i.x + vec4(0.0,i1.x,i2.x,1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

// ── Poisson Disk Sampling ───────────────────────────────────────────────────
function poissonDiskSample(width, height, minDist, maxDist, tries = 20) {
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.ceil(width / cellSize);
  const gridH = Math.ceil(height / cellSize);
  const grid = new Int32Array(gridW * gridH).fill(-1);
  const points = [];
  const active = [];

  const gridIndex = (x, y) => Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridW;

  function addPoint(p) {
    const i = points.length;
    points.push(p);
    active.push(i);
    grid[gridIndex(p[0], p[1])] = i;
  }
  function inNeighbourhood(p) {
    const gx = Math.floor(p[0] / cellSize);
    const gy = Math.floor(p[1] / cellSize);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;
        const idx = grid[nx + ny * gridW];
        if (idx !== -1) {
          const ex = points[idx][0] - p[0], ey = points[idx][1] - p[1];
          if (ex * ex + ey * ey < minDist * minDist) return true;
        }
      }
    }
    return false;
  }

  addPoint([width * Math.random(), height * Math.random()]);
  while (active.length > 0) {
    const ri = Math.floor(Math.random() * active.length);
    const base = points[active[ri]];
    let found = false;
    for (let t = 0; t < tries; t++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = minDist + Math.random() * (maxDist - minDist);
      const np    = [base[0] + Math.cos(angle) * dist, base[1] + Math.sin(angle) * dist];
      if (np[0] >= 0 && np[0] < width && np[1] >= 0 && np[1] < height && !inNeighbourhood(np)) {
        addPoint(np);
        found = true;
        break;
      }
    }
    if (!found) active.splice(ri, 1);
  }
  return points;
}

// ── 1D Noise ────────────────────────────────────────────────────────────────
class Noise1D {
  constructor() {
    this.MAX_VERTICES = 256;
    this.MAX_VERTICES_MASK = 255;
    this.amplitude = 1;
    this.scale = 1;
    this.r = Array.from({ length: 256 }, () => Math.random());
  }
  getVal(x) {
    const t = x * this.scale;
    const i = Math.floor(t);
    const f = t - i;
    const s = f * f * (3 - 2 * f);
    const a = i & this.MAX_VERTICES_MASK;
    const b = (a + 1) & this.MAX_VERTICES_MASK;
    return (this.r[a] * (1 - s) + this.r[b] * s) * this.amplitude;
  }
}

const linearMap = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

const DENSITY    = 120;
const SIZE       = 256;
const LENGTH     = SIZE * SIZE;
const RING_WIDTH       = 0.107;
const RING_WIDTH2      = 0.05;
const RING_DISPLACEMENT = 0.15;

export default function ParticleCursor() {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colors = isDark
      ? { c1: '#20b89a', c2: '#6366f1', c3: '#a78bfa' }
      : { c1: '#2c64ed', c2: '#20b89a', c3: '#6366f1' };
    const colorScheme = isDark ? 0 : 1;

    // ── Renderer ────────────────────────────────────────────────────────────
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      precision: 'highp',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(pixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 0.1, 1000);
    camera.position.z = 3.1;

    const raycastPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(12.5, 12.5),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    );
    scene.add(raycastPlane);

    // ── Particles ────────────────────────────────────────────────────────────
    const minDist = linearMap(DENSITY, 0, 300, 10, 2);
    const maxDist = linearMap(DENSITY, 0, 300, 11, 3);
    const rawPoints = poissonDiskSample(500, 500, minDist, maxDist, 20);
    const pointsData = [];
    for (const p of rawPoints) pointsData.push(p[0] - 250, p[1] - 250);
    const count = pointsData.length / 2;

    const arr = new Float32Array(LENGTH * 4);
    const n = Math.min(count, LENGTH);
    for (let i = 0; i < n; i++) {
      arr[i * 4]     = pointsData[i * 2]     * (1 / 250);
      arr[i * 4 + 1] = pointsData[i * 2 + 1] * (1 / 250);
    }
    const posTex = new THREE.DataTexture(arr, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
    posTex.needsUpdate = true;

    // ── Render Targets (ping-pong) ───────────────────────────────────────────
    const rtOpts = {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthBuffer: false,
      stencilBuffer: false,
    };
    let rt1 = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOpts);
    let rt2 = new THREE.WebGLRenderTarget(SIZE, SIZE, rtOpts);
    renderer.setRenderTarget(rt1); renderer.setClearColor(0, 0); renderer.clear();
    renderer.setRenderTarget(rt2); renderer.setClearColor(0, 0); renderer.clear();
    renderer.setRenderTarget(null);

    // ── Simulation shader ────────────────────────────────────────────────────
    const simScene    = new THREE.Scene();
    const simCamera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition:         { value: posTex },
        uPosRefs:          { value: posTex },
        uRingPos:          { value: new THREE.Vector2(0, 0) },
        uRingRadius:       { value: 0.2 },
        uDeltaTime:        { value: 0 },
        uRingWidth:        { value: RING_WIDTH },
        uRingWidth2:       { value: RING_WIDTH2 },
        uRingDisplacement: { value: RING_DISPLACEMENT },
        uTime:             { value: 0 },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform sampler2D uPosition;
        uniform sampler2D uPosRefs;
        uniform vec2  uRingPos;
        uniform float uTime;
        uniform float uDeltaTime;
        uniform float uRingRadius;
        uniform float uRingWidth;
        uniform float uRingWidth2;
        uniform float uRingDisplacement;
        ${noiseGLSL}
        void main() {
          vec2 simTexCoords = gl_FragCoord.xy / vec2(${SIZE}.0, ${SIZE}.0);
          vec4 pFrame  = texture2D(uPosition, simTexCoords);
          float scale  = pFrame.z;
          float velocity = pFrame.w;
          vec2 refPos  = texture2D(uPosRefs, simTexCoords).xy;
          float time   = uTime * .5;
          vec2 curentPos = refPos;
          vec2 pos = pFrame.xy;
          pos *= .8;
          float dist  = distance(curentPos.xy, uRingPos);
          float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924,72.9744), time * 0.5));
          float dist1  = distance(curentPos.xy + (noise0 * .005), uRingPos);
          float t  = smoothstep(uRingRadius-(uRingWidth*2.),  uRingRadius, dist)  - smoothstep(uRingRadius, uRingRadius+uRingWidth,  dist1);
          float t2 = smoothstep(uRingRadius-(uRingWidth2*2.), uRingRadius, dist)  - smoothstep(uRingRadius, uRingRadius+uRingWidth2, dist1);
          float t3 = smoothstep(uRingRadius+uRingWidth2, uRingRadius, dist);
          t  = pow(t,  2.);
          t2 = pow(t2, 3.);
          t  += t2 * 3.;
          t  += t3 * .4;
          t  += snoise(vec3(curentPos.xy * 30. + vec2(11.4924,12.9744), time * 0.5)) * t3 * .5;
          float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924,72.9744), time * 0.5));
          t += pow((nS + 1.5) * .5, 2.) * .6;
          float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397),  time * 0.35));
          float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947),  time * 0.35));
          float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924,72.9744), time * .5));
          float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904,120.947),  time * .5));
          vec2 disp = vec2(noise1,noise2) * .03;
          disp += vec2(noise3,noise4) * .005;
          disp.x += sin((refPos.x*20.)+(time*4.)) * .02 * clamp(dist,0.,1.);
          disp.y += cos((refPos.y*20.)+(time*3.)) * .02 * clamp(dist,0.,1.);
          pos -= (uRingPos - (curentPos + disp)) * pow(t2,.75) * uRingDisplacement;
          float scaleDiff = t - scale; scaleDiff *= .2; scale += scaleDiff;
          vec2 finalPos = curentPos + disp + (pos * .25);
          velocity *= .5;
          velocity += scale * .25;
          gl_FragColor = vec4(finalPos, scale, velocity);
        }
      `,
    });
    simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMaterial));

    // ── Render shader ────────────────────────────────────────────────────────
    const pScale = (renderer.domElement.width / pixelRatio / 2000);
    const uvs       = new Float32Array(count * 2);
    const positions = new Float32Array(count * 3);
    const seeds     = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      uvs[i * 2]     = (i % SIZE) / SIZE;
      uvs[i * 2 + 1] = Math.floor(i / SIZE) / SIZE;
      seeds[i * 4]     = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv',       new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute('seeds',    new THREE.BufferAttribute(seeds, 4));

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPosition:      { value: posTex },
        uTime:          { value: 0 },
        uColor1:        { value: new THREE.Color(colors.c1) },
        uColor2:        { value: new THREE.Color(colors.c2) },
        uColor3:        { value: new THREE.Color(colors.c3) },
        uAlpha:         { value: 0.72 },
        uRingPos:       { value: new THREE.Vector2(0, 0) },
        uRez:           { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
        uParticleScale: { value: pScale },
        uPixelRatio:    { value: pixelRatio },
        uColorScheme:   { value: colorScheme },
      },
      vertexShader: `
        precision highp float;
        attribute vec4 seeds;
        uniform sampler2D uPosition;
        uniform float uTime;
        uniform float uParticleScale;
        uniform float uPixelRatio;
        uniform int uColorScheme;
        varying vec4 vSeeds;
        varying float vVelocity;
        varying vec2 vLocalPos;
        varying vec2 vScreenPos;
        varying float vScale;
        void main() {
          vec4 pos   = texture2D(uPosition, uv);
          vSeeds     = seeds;
          vVelocity  = pos.w;
          vScale     = pos.z;
          vLocalPos  = pos.xy;
          vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);
          gl_Position = projectionMatrix * viewSpace;
          vScreenPos  = gl_Position.xy;
          gl_PointSize = ((vScale * 5.) * (uPixelRatio * 0.5) * uParticleScale);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec4  vSeeds;
        varying vec2  vScreenPos;
        varying vec2  vLocalPos;
        varying float vScale;
        varying float vVelocity;
        uniform vec3  uColor1;
        uniform vec3  uColor2;
        uniform vec3  uColor3;
        uniform vec2  uRingPos;
        uniform vec2  uRez;
        uniform float uAlpha;
        uniform float uTime;
        uniform int   uColorScheme;
        ${noiseGLSL}
        #define PI 3.1415926535897932384626433832795
        float sdRoundBox(in vec2 p, in vec2 b, in vec4 r) {
          r.xy = (p.x>0.0) ? r.xy : r.zw;
          r.x  = (p.y>0.0) ? r.x  : r.y;
          vec2 q = abs(p) - b + r.x;
          return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
        }
        vec2 rotate(vec2 v, float a) {
          float s = sin(a); float c = cos(a);
          return mat2(c,s,-s,c) * v;
        }
        void main() {
          float ratio = uRez.x / uRez.y;
          float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924,72.9744), uTime * .85));
          float noiseColor = snoise(vec3(vLocalPos * 2.  + vec2(74.664, 91.556),  uTime * .5));
          noiseColor = (noiseColor + 1.) * .5;
          float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);
          vec2 uv = gl_PointCoord.xy - vec2(0.5);
          uv.y *= -1.;
          uv = rotate(uv, -angle + (noiseAngle * .5));
          float h = 0.8;
          float progress = smoothstep(0., .75, pow(noiseColor, 2.));
          vec3 col = mix(
            mix(uColor1, uColor2, progress/h),
            mix(uColor2, uColor3, (progress - h)/(1.0 - h)),
            step(h, progress)
          );
          float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25));
          rounded = smoothstep(.1, 0., rounded);
          float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);
          if (a < 0.01) discard;
          vec3 color = clamp(col, 0., 1.);
          color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));
          gl_FragColor = vec4(color, clamp(a, 0., 1.));
        }
      `,
      transparent: true,
      depthTest:  false,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geo, renderMaterial);
    mesh.scale.set(5, 5, 5);
    scene.add(mesh);

    // ── Input ────────────────────────────────────────────────────────────────
    const cursor     = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouseNDC   = new THREE.Vector2();
    const ringPos    = new THREE.Vector2(0, 0);
    const cursorPos  = new THREE.Vector2(0, 0);
    const intersection = new THREE.Vector3();
    const raycaster  = new THREE.Raycaster();
    const noise1D    = new Noise1D();
    let isIntersecting = false;
    let skipFrame      = false;
    let everRendered   = false;
    let time = 0;

    const onMouseMove = e => { cursor.x = e.clientX; cursor.y = e.clientY; };
    window.addEventListener('mousemove', onMouseMove);

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderMaterial.uniforms.uRez.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ───────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let lastT = 0;
    let animId;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const dt = elapsed - lastT;
      lastT = elapsed;
      time += dt;

      // NDC mouse
      mouseNDC.x = (cursor.x / window.innerWidth)  *  2 - 1;
      mouseNDC.y = (cursor.y / window.innerHeight) * -2 + 1;
      const over = mouseNDC.x >= -1 && mouseNDC.x <= 1 && mouseNDC.y >= -1 && mouseNDC.y <= 1;

      skipFrame = !skipFrame;
      if (!skipFrame) {
        raycaster.setFromCamera(mouseNDC, camera);
        const hits = raycaster.intersectObject(raycastPlane);
        if (hits.length > 0 && over) {
          intersection.copy(hits[0].point);
          isIntersecting = true;
        } else {
          isIntersecting = false;
        }
      }

      // Ring position with autonomous wander
      const noiseX = (noise1D.getVal(time * 0.66 + 94.234) - 0.5) * 2;
      const noiseY = (noise1D.getVal(time * 0.75 + 21.028) - 0.5) * 2;

      if (isIntersecting) {
        cursorPos.set(
          intersection.x * 0.175 + noiseX * 0.1,
          intersection.y * 0.175 + noiseY * 0.1,
        );
        ringPos.set(
          ringPos.x + (cursorPos.x - ringPos.x) * 0.02,
          ringPos.y + (cursorPos.y - ringPos.y) * 0.02,
        );
      } else {
        cursorPos.set(noiseX * 0.2, noiseY * 0.1);
        ringPos.set(
          ringPos.x + (cursorPos.x - ringPos.x) * 0.01,
          ringPos.y + (cursorPos.y - ringPos.y) * 0.01,
        );
      }

      // Sim uniforms
      simMaterial.uniforms.uPosition.value   = everRendered ? rt1.texture : posTex;
      simMaterial.uniforms.uTime.value        = elapsed;
      simMaterial.uniforms.uDeltaTime.value   = dt;
      simMaterial.uniforms.uRingRadius.value  = 0.175 + Math.sin(time * 1) * 0.03 + Math.cos(time * 3) * 0.02;
      simMaterial.uniforms.uRingPos.value     = ringPos;

      renderer.setRenderTarget(rt2);
      renderer.render(simScene, simCamera);
      renderer.setRenderTarget(null);

      // Render uniforms
      renderMaterial.uniforms.uPosition.value      = everRendered ? rt2.texture : posTex;
      renderMaterial.uniforms.uTime.value           = elapsed;
      renderMaterial.uniforms.uRingPos.value        = ringPos;
      renderMaterial.uniforms.uParticleScale.value  = renderer.domElement.width / pixelRatio / 2000;

      renderer.autoClear = false;
      renderer.clear();
      renderer.render(scene, camera);

      const tmp = rt1; rt1 = rt2; rt2 = tmp;
      everRendered = true;
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      rt1.dispose();
      rt2.dispose();
      posTex.dispose();
      geo.dispose();
      simMaterial.dispose();
      renderMaterial.dispose();
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
