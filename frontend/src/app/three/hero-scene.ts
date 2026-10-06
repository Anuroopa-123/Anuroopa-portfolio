import type * as TS from 'three';

/**
 * The hero scene: CODE -> DATA -> AI -> PRODUCT.
 *
 * A sphere of dots joined by lines sits in the middle (a kolam wrapped around a ball, and also a neural network).
 * Four small objects orbit it, one per stage. The active stage is highlighted and reported back to the page,
 * where the same four words are shown as buttons.
 *
 * This file is loaded on demand (dynamic import) so the three.js library never slows the first paint.
 */
export interface HeroScene {
  /** Highlight a stage and restart the automatic cycle from it. */
  focus(stage: number): void;
  /** Change the four label texts (used when the language changes). */
  setLabels(labels: string[]): void;
  dispose(): void;
}

export interface HeroSceneOptions {
  /** Reduced motion: draw still frames only, no animation loop. */
  reduced: boolean;
  labels: string[];
  onStage: (stage: number) => void;
}

const COLOR = {
  royal: 0x2638c9,
  ink: 0x101a52,
  turmeric: 0xffbf1f,
  kumkum: 0xe63946,
  neem: 0x0a9a76,
  sky: 0x8da0ff,
};

interface Stage {
  group: TS.Group;
  label: TS.Sprite;
  labelCanvas: HTMLCanvasElement;
  base: number;
  scale: number;
  update: (dt: number) => void;
}

export async function createHeroScene(canvas: HTMLCanvasElement, opts: HeroSceneOptions): Promise<HeroScene | null> {
  const THREE: typeof TS = await import('three');

  let renderer: TS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // WebGL unavailable: the page shows its CSS fallback instead
  }

  const small = window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  const root = new THREE.Group(); // placed and scaled by layout()
  const spin = new THREE.Group(); // follows the mouse
  root.add(spin);
  scene.add(root);

  /* ---------- the core: a sphere of dots joined by lines ---------- */
  const R = 1.75;
  const N = small ? 210 : 380;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts: TS.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = golden * i;
    pts.push(new THREE.Vector3(Math.cos(a) * r * R, y * R, Math.sin(a) * r * R));
  }

  const core = new THREE.Group();
  spin.add(core);

  const nodePos = new Float32Array(N * 3);
  pts.forEach((p, i) => p.toArray(nodePos, i * 3));
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
  core.add(new THREE.Points(nodeGeo, new THREE.PointsMaterial({ color: COLOR.royal, size: 0.075, transparent: true, opacity: 0.95 })));

  // Join each dot to up to three close neighbours.
  const maxDist = R * Math.sqrt((4 * Math.PI) / N) * 1.45;
  const seg: number[] = [];
  for (let i = 0; i < N; i++) {
    let links = 0;
    for (let j = i + 1; j < N && links < 3; j++) {
      if (pts[i].distanceTo(pts[j]) < maxDist) {
        seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        links++;
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
  core.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.22 })));

  // A few turmeric dots: "lit" nodes.
  const lit: number[] = [];
  for (let k = 0; k < 14; k++) pts[Math.floor(((k + 0.5) / 14) * N)].toArray(lit, lit.length);
  const litGeo = new THREE.BufferGeometry();
  litGeo.setAttribute('position', new THREE.Float32BufferAttribute(lit, 3));
  core.add(new THREE.Points(litGeo, new THREE.PointsMaterial({ color: COLOR.turmeric, size: 0.17, transparent: true, opacity: 1 })));

  // A faint glass body so the core reads as a ball on a light page.
  core.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.985, 32, 24),
      new THREE.MeshBasicMaterial({ color: COLOR.sky, transparent: true, opacity: 0.12, depthWrite: false }),
    ),
  );

  const inner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.78, 0)),
    new THREE.LineBasicMaterial({ color: COLOR.kumkum, transparent: true, opacity: 0.95 }),
  );
  core.add(inner);

  /* ---------- the orbit ---------- */
  const RR = 3.9;
  const orbit = new THREE.Group();
  orbit.rotation.set(1.05, 0, -0.32);
  spin.add(orbit);

  const ringPts: TS.Vector3[] = [];
  for (let i = 0; i < 160; i++) {
    const t = (i / 160) * Math.PI * 2;
    ringPts.push(new THREE.Vector3(Math.cos(t) * RR, Math.sin(t) * RR, 0));
  }
  orbit.add(
    new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.3 }),
    ),
  );

  // Small red dots travelling along the ring: data in motion.
  const FLOW = 16;
  const flowPos = new Float32Array(FLOW * 3);
  const flowGeo = new THREE.BufferGeometry();
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
  orbit.add(new THREE.Points(flowGeo, new THREE.PointsMaterial({ color: COLOR.kumkum, size: 0.11, transparent: true, opacity: 0.95 })));

  /* ---------- labels ---------- */
  const labelTextures: TS.CanvasTexture[] = [];
  function drawLabel(c: HTMLCanvasElement, text: string): void {
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.font = '800 34px Manrope, "Noto Sans Tamil", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const w = Math.min(c.width - 6, g.measureText(text).width + 56);
    const x = (c.width - w) / 2;
    const y = 12;
    const h = 56;
    const r = 28;
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fillStyle = 'rgba(255,255,255,0.94)';
    g.fill();
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(38,56,201,0.4)';
    g.stroke();
    g.fillStyle = '#101a52';
    g.fillText(text, c.width / 2, y + h / 2 + 1);
  }
  function makeLabel(text: string): { sprite: TS.Sprite; canvas: HTMLCanvasElement } {
    const c = document.createElement('canvas');
    c.width = 320;
    c.height = 80;
    drawLabel(c, text);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    labelTextures.push(tex);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.scale.set(1.9, 0.475, 1);
    sprite.renderOrder = 10;
    scene.add(sprite);
    return { sprite, canvas: c };
  }

  /* ---------- the four stages ---------- */
  const edged = (geo: TS.BufferGeometry, color: number, fill: number, fillOpacity: number): TS.Group => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: fill, transparent: true, opacity: fillOpacity, depthWrite: false })));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color })));
    return g;
  };

  // 1. CODE: an editor window drawn on a texture.
  function codeObject(): TS.Group {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 192;
    const g = c.getContext('2d')!;
    g.fillStyle = '#141d86';
    g.beginPath();
    g.moveTo(24, 4);
    g.arcTo(252, 4, 252, 188, 22);
    g.arcTo(252, 188, 4, 188, 22);
    g.arcTo(4, 188, 4, 4, 22);
    g.arcTo(4, 4, 252, 4, 22);
    g.closePath();
    g.fill();
    ['#e63946', '#ffbf1f', '#0a9a76'].forEach((col, i) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(30 + i * 20, 28, 6, 0, Math.PI * 2);
      g.fill();
    });
    const lines: [number, number, string][] = [
      [0, 120, '#ffbf1f'], [20, 90, '#ffffff'], [20, 140, '#8da0ff'], [40, 70, '#ffffff'], [20, 110, '#8da0ff'], [0, 60, '#ffbf1f'],
    ];
    lines.forEach(([indent, width, col], i) => {
      g.fillStyle = col;
      g.globalAlpha = col === '#ffffff' ? 0.75 : 1;
      g.fillRect(26 + indent, 56 + i * 20, width, 9);
    });
    g.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    labelTextures.push(tex);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.scale.set(2.0, 1.5, 1);
    const grp = new THREE.Group();
    grp.add(sprite);
    return grp;
  }

  // 2. DATA: three stacked discs, like a database cylinder.
  function dataObject(): TS.Group {
    const grp = new THREE.Group();
    [-0.32, 0, 0.32].forEach((y) => {
      const disc = edged(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 32), COLOR.neem, COLOR.neem, 0.22);
      disc.position.y = y;
      grp.add(disc);
    });
    grp.rotation.x = 0.45;
    return grp;
  }

  // 3. AI: a small neural network.
  function aiObject(): TS.Group {
    const grp = new THREE.Group();
    const centre = new THREE.Vector3();
    const ringNodes = Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 0.78, Math.sin(a) * 0.78, (i % 2 ? 1 : -1) * 0.25);
    });
    const lines: number[] = [];
    ringNodes.forEach((p, i) => {
      const q = ringNodes[(i + 1) % 6];
      lines.push(centre.x, centre.y, centre.z, p.x, p.y, p.z, p.x, p.y, p.z, q.x, q.y, q.z);
    });
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    grp.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: COLOR.ink, transparent: true, opacity: 0.7 })));
    ringNodes.forEach((p) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), new THREE.MeshBasicMaterial({ color: COLOR.kumkum }));
      s.position.copy(p);
      grp.add(s);
    });
    grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), new THREE.MeshBasicMaterial({ color: COLOR.turmeric })));
    return grp;
  }

  // 4. PRODUCT: a finished cube with a smaller one inside.
  function productObject(): TS.Group {
    const grp = new THREE.Group();
    grp.add(edged(new THREE.BoxGeometry(0.95, 0.95, 0.95), COLOR.royal, COLOR.royal, 0.16));
    const innerBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(0.4, 0.4, 0.4)),
      new THREE.LineBasicMaterial({ color: COLOR.turmeric }),
    );
    grp.add(innerBox);
    return grp;
  }

  const builders = [codeObject, dataObject, aiObject, productObject];
  const spinSpeed = [0, 0.5, 0.6, 0.45];
  const stages: Stage[] = builders.map((build, i) => {
    const group = build();
    orbit.add(group);
    const { sprite, canvas: labelCanvas } = makeLabel(opts.labels[i] ?? '');
    return {
      group,
      label: sprite,
      labelCanvas,
      base: (i / 4) * Math.PI * 2 + 0.6,
      scale: 1,
      update: (dt) => {
        if (spinSpeed[i]) group.rotation.y += dt * spinSpeed[i];
      },
    };
  });

  /* ---------- state ---------- */
  let active = 0;
  let stageTimer = 0;
  let orbitAngle = 0;
  let time = 0;
  let rootScale = 1;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const worldPos = new THREE.Vector3();

  function setActive(next: number): void {
    active = next;
    stageTimer = 0;
    opts.onStage(active);
  }
  opts.onStage(0);

  function layout(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const halfH = Math.tan((38 / 2) * (Math.PI / 180)) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const extent = RR + 1.6;
    let s: number;
    if (w < 760) {
      s = Math.min(1, (halfW * 0.96) / extent);
      root.position.set(0, halfH * 0.22, 0);
    } else {
      s = Math.min((halfH * 0.92) / (RR * 0.95 + 1.2), (halfW * 0.5) / extent, 1.1);
      root.position.set(halfW - extent * s - halfW * 0.02, -halfH * 0.02, 0);
    }
    root.scale.setScalar(s);
    rootScale = s;
    draw(0);
  }

  function draw(dt: number): void {
    time += dt;
    current.x += (target.x - current.x) * 0.05;
    current.y += (target.y - current.y) * 0.05;
    spin.rotation.y = current.x * 0.7 + time * 0.07;
    spin.rotation.x = current.y * 0.4;
    core.rotation.y += dt * 0.12;
    inner.rotation.y -= dt * 0.5;
    inner.rotation.z += dt * 0.2;

    orbitAngle += dt * 0.16;
    stages.forEach((st, i) => {
      const a = st.base + orbitAngle;
      st.group.position.set(Math.cos(a) * RR, Math.sin(a) * RR, 0);
      st.scale += ((i === active ? 1.3 : 1) - st.scale) * 0.1;
      st.group.scale.setScalar(st.scale);
      st.update(dt);
    });
    for (let k = 0; k < FLOW; k++) {
      const a = orbitAngle * 2.2 + (k / FLOW) * Math.PI * 2;
      flowPos[k * 3] = Math.cos(a) * RR;
      flowPos[k * 3 + 1] = Math.sin(a) * RR;
      flowPos[k * 3 + 2] = 0;
    }
    flowGeo.attributes['position'].needsUpdate = true;

    // Labels live in scene space so they stay upright and sit just under their object.
    root.updateMatrixWorld(true);
    stages.forEach((st, i) => {
      st.group.getWorldPosition(worldPos);
      st.label.position.set(worldPos.x, worldPos.y - 1.05 * rootScale * st.scale, worldPos.z);
      const k = rootScale * (i === active ? 1.08 : 0.9);
      st.label.scale.set(1.9 * k, 0.475 * k, 1);
      st.label.material.opacity = i === active ? 1 : 0.7;
    });

    renderer.render(scene, camera);
  }

  /* ---------- loop, visibility, input ---------- */
  let running = false;
  let raf = 0;
  let last = 0;
  let visible = true;

  function loop(now: number): void {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stageTimer += dt;
    if (stageTimer > 3.4) setActive((active + 1) % 4);
    draw(dt);
    raf = requestAnimationFrame(loop);
  }
  function sync(): void {
    const shouldRun = visible && !document.hidden && !opts.reduced;
    if (shouldRun && !running) {
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    } else if (!shouldRun && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  const onMove = (e: PointerEvent) => {
    target.x = e.clientX / window.innerWidth - 0.5;
    target.y = e.clientY / window.innerHeight - 0.5;
  };
  if (!opts.reduced) window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', sync);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  io.observe(canvas);
  const ro = new ResizeObserver(() => layout());
  ro.observe(canvas);

  layout();
  sync();

  return {
    focus(stage: number): void {
      setActive(((stage % 4) + 4) % 4);
      if (opts.reduced) draw(0);
    },
    setLabels(labels: string[]): void {
      stages.forEach((st, i) => drawLabel(st.labelCanvas, labels[i] ?? ''));
      labelTextures.forEach((t) => (t.needsUpdate = true));
      if (opts.reduced) draw(0);
    },
    dispose(): void {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', sync);
      scene.traverse((obj) => {
        const o = obj as TS.Mesh;
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        mats.forEach((m) => m.dispose());
      });
      labelTextures.forEach((t) => t.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
