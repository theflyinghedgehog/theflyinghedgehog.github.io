import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const mount = document.getElementById("laptop-3d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CODE = [
  "// matte.js",
  "const matte = {",
  '  role: "developer + designer",',
  '  based: "Italy",',
  '  stack: ["React", "Vue", "Python"],',
  '  editor: "neovim",',
  "};",
  "",
  "function build(idea) {",
  "  const sketch = design(idea);",
  "  const app = code(sketch);",
  "  return ship(app); // same thing, shipped",
  "}",
];

const COLORS = {
  text: "#c6d0f5",
  dim: "#737994",
  keyword: "#ca9ee6",
  string: "#a6d189",
  comment: "#737994",
  func: "#8caaee",
  number: "#ef9f76",
  punct: "#949cbb",
};

const KEYWORDS = new Set(["const", "function", "return", "for", "of", "let", "if"]);

function highlight(line) {
  const parts = [];
  const re = /(\/\/.*$)|("[^"]*"?)|(\b[A-Za-z_]\w*\b)|(\d+)|(\s+)|([^\w\s])/g;
  let m;
  while ((m = re.exec(line))) {
    const [tok, comment, str, word, num] = m;
    let color = COLORS.punct;
    if (comment) color = COLORS.comment;
    else if (str) color = COLORS.string;
    else if (num) color = COLORS.number;
    else if (word) {
      if (KEYWORDS.has(word)) color = COLORS.keyword;
      else if (line[m.index + word.length] === "(") color = COLORS.func;
      else color = COLORS.text;
    }
    parts.push([tok, color]);
  }
  return parts;
}

const SCREEN_W = 1024;
const SCREEN_H = 576;
const screenCanvas = document.createElement("canvas");
screenCanvas.width = SCREEN_W;
screenCanvas.height = SCREEN_H;
const ctx = screenCanvas.getContext("2d");

const FONT_SIZE = 28;
const LINE_H = 35;
const PAD_X = 22;
const TOP = 54;

function drawScreen(charsTyped, cursorOn) {
  ctx.fillStyle = "#303446";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  ctx.fillStyle = "#292c3c";
  ctx.fillRect(0, 0, SCREEN_W, 40);
  ctx.fillStyle = "#8caaee";
  ctx.fillRect(0, 0, 190, 40);
  ctx.font = `600 20px "IBM Plex Mono", monospace`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#232634";
  ctx.fillText("matte.js", 22, 21);
  ctx.fillStyle = COLORS.dim;
  ctx.fillText("projects.js", 214, 21);

  ctx.font = `400 ${FONT_SIZE}px "IBM Plex Mono", monospace`;
  const charW = ctx.measureText("M").width;
  const gutter = PAD_X + charW * 3;
  let left = charsTyped;
  let cursor = null;

  for (let i = 0; i < CODE.length; i++) {
    const y = TOP + i * LINE_H + LINE_H / 2;
    if (y > SCREEN_H - 48) break;
    const full = CODE[i];
    const shown = full.slice(0, Math.max(0, left));
    const done = left >= full.length;

    if (left > 0 || i === 0) {
      ctx.fillStyle = COLORS.dim;
      ctx.fillText(String(i + 1).padStart(2, " "), PAD_X, y);
    }

    let x = gutter + charW;
    for (const [tok, color] of highlight(shown)) {
      ctx.fillStyle = color;
      ctx.fillText(tok, x, y);
      x += charW * tok.length;
    }

    if (!done && left >= 0 && cursor === null) cursor = { x, y };
    left -= full.length + 1;
  }
  if (cursor === null) {
    const y = TOP + CODE.length * LINE_H + LINE_H / 2;
    cursor = { x: gutter + charW, y };
  }

  if (cursorOn) {
    ctx.fillStyle = "#f2d5cf";
    ctx.fillRect(cursor.x, cursor.y - LINE_H / 2 + 3, charW, LINE_H - 6);
  }

  ctx.fillStyle = "#292c3c";
  ctx.fillRect(0, SCREEN_H - 40, SCREEN_W, 40);
  ctx.fillStyle = "#a6d189";
  ctx.fillRect(0, SCREEN_H - 40, 128, 40);
  ctx.font = `600 20px "IBM Plex Mono", monospace`;
  ctx.fillStyle = "#232634";
  ctx.fillText("INSERT", 26, SCREEN_H - 19);
  ctx.fillStyle = COLORS.punct;
  ctx.fillText("matte@arch  ~/portfolio", 150, SCREEN_H - 19);
  ctx.fillText("utf-8  javascript", SCREEN_W - 240, SCREEN_H - 19);

  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  for (let sy = 0; sy < SCREEN_H; sy += 4) ctx.fillRect(0, sy, SCREEN_W, 1);
}

function makeLogoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 110;
  const g = c.getContext("2d");
  g.fillStyle = "#8caaee";
  g.beginPath();
  g.roundRect(0, 0, 110, 110, 25);
  g.fill();
  g.fillStyle = "#232634";
  const px = [
    [1, 3, 1, 5], [2, 4, 1, 1], [3, 5, 1, 1], [4, 4, 1, 1], [5, 3, 1, 5],
    [7, 3, 1, 5], [8, 3, 1, 1], [8, 5, 1, 1], [8, 7, 1, 1], [9, 4, 1, 1], [9, 6, 1, 1],
  ];
  for (const [x, y, w, h] of px) g.fillRect(x * 10, y * 10, w * 10, h * 10);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

async function init() {
  if (!mount || !supportsWebGL()) return;

  try {
    await Promise.all([
      document.fonts.load(`400 ${FONT_SIZE}px "IBM Plex Mono"`),
      document.fonts.load(`600 20px "IBM Plex Mono"`),
      document.fonts.load(`600 40px "IBM Plex Sans"`),
    ]);
  } catch { }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 50);

  scene.add(new THREE.HemisphereLight(0xdfe4f5, 0x232634, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8caaee, 1.6);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  const laptop = new THREE.Group();
  const body = new THREE.Group();
  body.position.z = 0.3;
  laptop.add(body);
  scene.add(laptop);

  const W = 3.2, D = 2.22, BASE_T = 0.12, LID_T = 0.075;
  const shell = new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.8, metalness: 0.05 });
  const wellMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.9 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.45, metalness: 0.05 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.7 });

  const base = new THREE.Mesh(new RoundedBoxGeometry(W, BASE_T, D, 4, 0.045), shell);
  base.position.y = BASE_T / 2;
  body.add(base);

  const U = 0.181;
  const GAP = 0.03;
  const KEY_T = 0.026;
  const KB_W = 15 * U;
  const kbLeft = -KB_W / 2;
  const kbTop = -D / 2 + 0.2;

  const k = (id, w = 1, label = id) => ({ id, w, label });
  const chars = (s) => [...s].map((c) => k(c, 1, c.toUpperCase()));
  const FN_W = (15 - 0.8) / 17;
  const fnKeys = (names) => names.map((n) => k(n, FN_W));
  const spacer = (w) => ({ spacer: true, w });

  const ROWS = [
    { h: 0.62, keys: [k("Esc", FN_W), spacer(0.2), ...fnKeys(["F1", "F2", "F3", "F4"]), spacer(0.2),
      ...fnKeys(["F5", "F6", "F7", "F8"]), spacer(0.2), ...fnKeys(["F9", "F10", "F11", "F12"]), spacer(0.2),
      ...fnKeys(["Home", "End", "Insert", "Delete"])], after: 0.18 },
    { h: 1, keys: [...chars("`1234567890-="), k("Backspace", 2)] },
    { h: 1, keys: [k("Tab", 1.5), ...chars("qwertyuiop[]"), k("\\", 1.5, "\\")] },
    { h: 1, keys: [k("Caps", 1.75, "Caps Lock"), ...chars("asdfghjkl;'"), k("Enter", 2.25)] },
    { h: 1, keys: [k("ShiftL", 2.25, "Shift"), ...chars("zxcvbnm,./"), k("ShiftR", 2.75, "Shift")] },
    { h: 1, keys: [k("Fn"), k("Ctrl", 1.25), k("Win", 1, "⊞"), k("Alt"), k("Space", 4.75, ""),
      k("AltR", 1, "Alt"), k("PrtSc"), k("CtrlR", 1, "Ctrl"), { arrows: true, w: 3 }] },
  ];

  const capCache = new Map();
  function capGeometry(w, d) {
    const id = `${w.toFixed(4)}x${d.toFixed(4)}`;
    if (capCache.has(id)) return capCache.get(id);
    const r = Math.min(0.016, w / 4, d / 4);
    const smile = Math.min(0.011, d * 0.09);
    const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
    const s = new THREE.Shape();
    s.moveTo(x0 + r, y1);
    s.lineTo(x1 - r, y1);
    s.quadraticCurveTo(x1, y1, x1, y1 - r);
    s.lineTo(x1, y0 + r);
    s.quadraticCurveTo(x1, y0, x1 - r, y0);
    s.quadraticCurveTo(0, y0 - smile * 2, x0 + r, y0);
    s.quadraticCurveTo(x0, y0, x0, y0 + r);
    s.lineTo(x0, y1 - r);
    s.quadraticCurveTo(x0, y1, x0 + r, y1);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: KEY_T - 0.008, bevelEnabled: true, bevelThickness: 0.004,
      bevelSize: 0.004, bevelSegments: 2, curveSegments: 6,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0.004, 0);
    capCache.set(id, g);
    return g;
  }

  const atlas = document.createElement("canvas");
  atlas.width = 2048;
  atlas.height = 1024;
  const actx = atlas.getContext("2d");
  actx.textAlign = "center";
  actx.textBaseline = "middle";
  actx.fillStyle = "#d9dce6";
  const atlasTex = new THREE.CanvasTexture(atlas);
  atlasTex.colorSpace = THREE.SRGBColorSpace;
  atlasTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const legendMat = new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, depthWrite: false });
  const cells = new Map();

  function legendCell(label) {
    if (cells.has(label)) return cells.get(label);
    const i = cells.size;
    const cx = (i % 16) * 128, cy = Math.floor(i / 16) * 64;
    let size = label.length === 1 ? 40 : 30;
    actx.font = `600 ${size}px "IBM Plex Sans", sans-serif`;
    const tw = actx.measureText(label).width;
    if (tw > 116) {
      size = Math.floor(size * 116 / tw);
      actx.font = `600 ${size}px "IBM Plex Sans", sans-serif`;
    }
    actx.fillText(label, cx + 64, cy + 33);
    cells.set(label, i);
    return i;
  }

  function legendPlane(label, capW, capD) {
    const lw = Math.min(capW * 0.95, capD * 0.75 * 2);
    const g = new THREE.PlaneGeometry(lw, lw / 2);
    g.rotateX(-Math.PI / 2);
    const i = legendCell(label);
    const u0 = (i % 16) / 16, u1 = u0 + 1 / 16;
    const v1 = 1 - Math.floor(i / 16) / 16, v0 = v1 - 1 / 16;
    const uv = g.attributes.uv;
    for (let n = 0; n < uv.count; n++) {
      uv.setXY(n, uv.getX(n) ? u1 : u0, uv.getY(n) ? v1 : v0);
    }
    const m = new THREE.Mesh(g, legendMat);
    m.position.y = KEY_T + 0.0015;
    return m;
  }

  const keyMeshes = new Map();
  function addKey(spec, x, wU, zc, hU) {
    const capW = wU * U - GAP;
    const capD = hU * U - GAP * (hU < 0.6 ? 0.6 : 1);
    const mesh = new THREE.Mesh(capGeometry(capW, capD), capMat);
    mesh.position.set(x + (wU * U) / 2, BASE_T, zc);
    mesh.userData.restY = BASE_T;
    if (spec.label) mesh.add(legendPlane(spec.label, capW, capD));
    body.add(mesh);
    keyMeshes.set(spec.id, mesh);
  }

  let z = kbTop;
  const rowTops = [];
  for (const row of ROWS) {
    rowTops.push(z);
    let x = kbLeft;
    const zc = z + (row.h * U) / 2;
    for (const spec of row.keys) {
      if (spec.spacer) { x += spec.w * U; continue; }
      if (spec.arrows) {
        const top = [k("PgUp", 1, "PgUp"), k("Up", 1, "▲"), k("PgDn", 1, "PgDn")];
        const bottom = [k("Left", 1, "◀"), k("Down", 1, "▼"), k("Right", 1, "▶")];
        top.forEach((s, i) => addKey(s, x + i * U, 1, z + U / 4, 0.5));
        bottom.forEach((s, i) => addKey(s, x + i * U, 1, z + (3 * U) / 4, 0.5));
        x += 3 * U;
        continue;
      }
      addKey(spec, x, spec.w, zc, row.h);
      x += spec.w * U;
    }
    z += row.h * U + (row.after || 0) * U;
  }
  const kbBottom = z;

  const well = new THREE.Mesh(
    new RoundedBoxGeometry(KB_W + 0.07, 0.01, kbBottom - kbTop + 0.07, 2, 0.004),
    wellMat
  );
  well.position.set(0, BASE_T - 0.003, (kbTop + kbBottom) / 2);
  body.add(well);

  const tpX = kbLeft + 6.75 * U;
  const tpZ = rowTops[4];
  const red = new THREE.MeshStandardMaterial({ color: 0xd4232b, roughness: 0.95 });
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.03, KEY_T + 0.012, 16), red);
  nub.position.set(tpX, BASE_T + (KEY_T + 0.012) / 2, tpZ);
  body.add(nub);

  const btnZ = kbBottom + 0.075;
  const btnD = 0.09;
  const btnMat = new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: 0.6 });
  [[-0.3, 0.38], [0, 0.2], [0.3, 0.38]].forEach(([dx, w], i) => {
    const b = new THREE.Mesh(new RoundedBoxGeometry(w - 0.012, 0.016, btnD, 2, 0.006), i === 1 ? darkMat : btnMat);
    b.position.set(tpX + dx, BASE_T + 0.004, btnZ);
    body.add(b);
  });
  for (const side of [-1, 1]) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.017, btnD - 0.012), red);
    stripe.position.set(tpX + side * 0.105, BASE_T + 0.005, btnZ);
    body.add(stripe);
  }

  const padD = 0.56, padW = 1.0;
  const padZ = btnZ + btnD / 2 + 0.03 + padD / 2;
  const padBorder = new THREE.Mesh(new RoundedBoxGeometry(padW + 0.03, 0.01, padD + 0.03, 2, 0.004), darkMat);
  padBorder.position.set(tpX, BASE_T - 0.003, padZ);
  body.add(padBorder);
  const pad = new THREE.Mesh(
    new RoundedBoxGeometry(padW, 0.01, padD, 2, 0.004),
    new THREE.MeshStandardMaterial({ color: 0x1e1f23, roughness: 0.65 })
  );
  pad.position.set(tpX, BASE_T - 0.002, padZ);
  body.add(pad);

  const fp = new THREE.Mesh(
    new RoundedBoxGeometry(0.12, 0.008, 0.12, 2, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x0b0c0e, roughness: 0.25, metalness: 0.4 })
  );
  fp.position.set(W / 2 - 0.45, BASE_T, padZ - 0.05);
  body.add(fp);

  const power = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.012, 0.07, 2, 0.01), btnMat);
  power.position.set(W / 2 - 0.2, BASE_T + 0.002, -D / 2 + 0.11);
  body.add(power);
  const led = new THREE.Mesh(
    new THREE.CircleGeometry(0.008, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  led.rotation.x = -Math.PI / 2;
  led.position.set(W / 2 - 0.2, BASE_T + 0.0085, -D / 2 + 0.11);
  body.add(led);

  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x232428, roughness: 0.5, metalness: 0.3 });
  for (const side of [-1, 1]) {
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 16), barrelMat);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(side * (W / 2 - 0.45), BASE_T + 0.01, -D / 2 + 0.03);
    body.add(barrel);
  }

  const hinge = new THREE.Group();
  hinge.position.set(0, BASE_T, -D / 2 + 0.03);
  const LID_OPEN = -0.28;
  hinge.rotation.x = LID_OPEN;
  body.add(hinge);

  const lidH = D * 0.95;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W, lidH, LID_T, 4, 0.035), shell);
  lid.position.set(0, lidH / 2, 0);
  hinge.add(lid);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const screenW = 2.95;
  const screenH = screenW * (SCREEN_H / SCREEN_W);
  const BOTTOM_BEZEL = 0.24;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    new THREE.MeshBasicMaterial({ map: screenTex })
  );
  screen.position.set(0, BOTTOM_BEZEL + screenH / 2, LID_T / 2 + 0.002);
  hinge.add(screen);

  const cam = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 16),
    new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.2, metalness: 0.5 })
  );
  cam.position.set(0, BOTTOM_BEZEL + screenH + (lidH - BOTTOM_BEZEL - screenH) / 2, LID_T / 2 + 0.002);
  hinge.add(cam);

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshStandardMaterial({ map: makeLogoTexture(), roughness: 0.5 })
  );
  logo.position.set(-(W / 2 - 0.42), lidH - 0.38, -LID_T / 2 - 0.002);
  logo.rotation.y = Math.PI;
  hinge.add(logo);
  const lidLed = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 16),
    new THREE.MeshBasicMaterial({ color: 0xe0303a })
  );
  lidLed.position.set(-(W / 2 - 0.42) + 0.22, lidH - 0.28, -LID_T / 2 - 0.003);
  lidLed.rotation.y = Math.PI;
  hinge.add(lidLed);

  const shadowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.55)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 1.5, D * 1.7),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.01;
  scene.add(shadow);

  mount.appendChild(renderer.domElement);
  mount.classList.add("is-3d");

  const box = new THREE.Box3().setFromObject(body);
  const mid = box.getCenter(new THREE.Vector3());
  body.position.x -= mid.x;
  body.position.z -= mid.z;
  box.setFromObject(body);
  let radius = 0;
  for (const x of [box.min.x, box.max.x]) {
    for (const z of [box.min.z, box.max.z]) radius = Math.max(radius, Math.hypot(x, z));
  }
  const yMin = box.min.y - 0.05;
  const yMax = box.max.y + 0.05;
  const center = new THREE.Vector3(0, (yMin + yMax) / 2, 0);
  const viewDir = new THREE.Vector3(0, 0.22, 1).normalize();
  const samples = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    for (const y of [yMin, yMax]) {
      samples.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
    }
  }
  const MARGIN = 0.97;
  const v = new THREE.Vector3();

  function fitsAt(dist) {
    camera.position.copy(center).addScaledVector(viewDir, dist);
    camera.lookAt(center);
    camera.updateMatrixWorld();
    return samples.every((p) => {
      v.copy(p).project(camera);
      return Math.abs(v.x) <= MARGIN && Math.abs(v.y) <= MARGIN;
    });
  }

  function fitCamera() {
    let lo = radius, hi = 40;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      fitsAt(mid) ? (hi = mid) : (lo = mid);
    }
    fitsAt(hi);
  }

  function resize() {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fitCamera();
  }
  new ResizeObserver(() => {
    resize();
    if (!running) render();
  }).observe(mount);
  resize();

  let yaw = -0.5;
  let spin = 0.55;
  let dragging = false;
  let lastX = 0;
  let velocity = 0;

  const el = renderer.domElement;
  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    velocity = 0;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
    yaw += dx;
    velocity = dx * 60;
    if (!running) render();
  });
  const endDrag = () => { dragging = false; };
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);

  const totalChars = CODE.reduce((sum, l) => sum + l.length + 1, 0);
  const FLAT = CODE.join("\n") + "\n";

  const SHIFTED = {
    "{": "[", "}": "]", "(": "9", ")": "0", '"': "'", ":": ";", "<": ",", ">": ".",
    "+": "=", "_": "-", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6",
    "&": "7", "*": "8", "?": "/", "|": "\\", "~": "`",
  };
  const pressed = new Map();
  function pressKey(id) {
    const mesh = keyMeshes.get(id);
    if (mesh) pressed.set(mesh, 0.09);
  }
  function pressChar(c) {
    if (c === "\n") return pressKey("Enter");
    if (c === " ") return pressKey("Space");
    if (/[A-Z]/.test(c)) { pressKey("ShiftL"); return pressKey(c.toLowerCase()); }
    if (SHIFTED[c]) { pressKey("ShiftL"); return pressKey(SHIFTED[c]); }
    pressKey(c);
  }
  function animateKeys(dt) {
    for (const [mesh, left] of pressed) {
      const t = left - dt;
      if (t <= 0) {
        mesh.position.y = mesh.userData.restY;
        pressed.delete(mesh);
      } else {
        mesh.position.y = mesh.userData.restY - 0.011 * Math.min(1, t / 0.03);
        pressed.set(mesh, t);
      }
    }
  }
  let prevChars = 0;
  const CPS = 26;
  const HOLD = 4;
  let lastDrawn = "";

  function updateScreen(t) {
    let chars, cursorOn;
    if (reduceMotion) {
      chars = totalChars;
      cursorOn = true;
    } else {
      const cycle = totalChars / CPS + HOLD;
      const local = t % cycle;
      chars = Math.min(totalChars, Math.floor(local * CPS));
      cursorOn = chars < totalChars || Math.floor(t * 2) % 2 === 0;
    }
    if (!reduceMotion && chars > prevChars && chars - prevChars < 5) {
      for (let i = prevChars; i < chars; i++) pressChar(FLAT[i]);
    }
    prevChars = chars;
    const keyState = `${chars}:${cursorOn}`;
    if (keyState !== lastDrawn) {
      drawScreen(chars, cursorOn);
      screenTex.needsUpdate = true;
      lastDrawn = keyState;
    }
  }

  const clock = new THREE.Clock();
  let running = false;
  let elapsed = 0;
  const heroSection = mount.closest(".section") || document.body;
  let lastScrollY = window.scrollY;

  function render() {
    laptop.rotation.y = yaw;
    renderer.render(scene, camera);
  }

  function tick() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt;

    if (!dragging) {
      const target = spin * (1.5 - Math.cos(yaw));
      velocity += (target - velocity) * Math.min(1, dt * 2.5);
      yaw += velocity * dt;
    }
    laptop.position.y = Math.sin(elapsed * 1.2) * 0.04;

    const sy = window.scrollY;
    if (!dragging) velocity = Math.max(-6, Math.min(6, velocity + (sy - lastScrollY) * 0.008));
    lastScrollY = sy;
    const out = Math.min(1, Math.max(0, sy / heroSection.offsetHeight));
    const lidTarget = LID_OPEN + out * 1.3;
    hinge.rotation.x += (lidTarget - hinge.rotation.x) * Math.min(1, dt * 6);

    updateScreen(elapsed);
    animateKeys(dt);
    render();
    requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    clock.getDelta();
    requestAnimationFrame(tick);
  }
  function stop() { running = false; }

  if (reduceMotion) {
    updateScreen(0);
    render();
  } else {
    velocity = spin;
    let visible = true;
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible && !document.hidden ? start() : stop();
    }).observe(mount);
    document.addEventListener("visibilitychange", () => {
      visible && !document.hidden ? start() : stop();
    });
    updateScreen(0);
    render();
    start();
  }
}

init();
