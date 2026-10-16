#!/usr/bin/env node
// check-icons.mjs — numeric checks for UI icon SVGs. No dependencies (Node 18+).
//
//   node check-icons.mjs icon.svg [more.svg ...]        lint each file + the set
//   node check-icons.mjs icons/*.svg --sheet sheet.html  also write an HTML contact sheet (open via localhost)
//   node check-icons.mjs icons/*.svg --sheet-svg sheet.svg  one SVG contact sheet to import into Figma or Paper
//
//   node check-icons.mjs --pair line.svg filled.svg       a line + filled pair: silhouettes must match
//
// Options: --padding <px at 24>  live-area padding, default 2 (scaled to the viewBox)
//          --gap <px>            minimum gap between separate elements, default = stroke width
//          --max-parts <n>       hard cap on parts (each primitive or subpath; identical repeats
//                                such as rays, ticks or dots count once, up to 8) in stroke icons, default 6
//
// Exit code 1 if any ERROR. WARN = look at it, may be intentional. INFO = context.

import { readFileSync, writeFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  if (i === -1) return dflt;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const sheetPath = opt('--sheet', null);
const sheetSvgPath = opt('--sheet-svg', null);
const paddingAt24 = Number(opt('--padding', 2));
const gapOpt = opt('--gap', null);
const maxParts = Number(opt('--max-parts', 6));
let pair = null;
{ const i = args.indexOf('--pair'); if (i !== -1) { pair = [args[i + 1], args[i + 2]]; args.splice(i, 3); if (!pair[1]) { console.log('--pair needs two files: line.svg filled.svg'); process.exit(2); } } }
const files = [...args.filter((a) => !a.startsWith('--')), ...(pair || [])];
if (!files.length) {
  console.log('usage: node check-icons.mjs <file.svg ...> [--sheet out.html] [--sheet-svg out.svg] [--pair line.svg filled.svg] [--padding 2] [--gap 2] [--max-parts 6]');
  process.exit(2);
}

const FORBIDDEN = ['mask', 'clipPath', 'filter', 'use', 'style', 'image', 'text', 'foreignObject', 'script', 'symbol', 'defs', 'linearGradient', 'radialGradient', 'pattern'];
const SHAPES = ['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];
const EPS = 0.01;

// ---------- tiny XML reading ----------
function parseAttrs(s) {
  const out = {};
  for (const m of s.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[m[1]] = m[3] ?? m[4];
  return out;
}
function readSvg(src) {
  const root = src.match(/<svg\b([^>]*)>/);
  if (!root) return null;
  const elements = [];
  for (const m of src.matchAll(/<([a-zA-Z]+)\b([^>]*?)\/?>/g)) {
    if (m[1] === 'svg') continue;
    elements.push({ tag: m[1], attrs: parseAttrs(m[2]) });
  }
  return { root: parseAttrs(root[1]), elements };
}

// ---------- geometry: everything becomes sampled polylines ----------
const num = (v, d = 0) => (v === undefined ? d : parseFloat(v));
function pathTokens(d) {
  return d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) || [];
}
function arcPoints(x1, y1, rx, ry, phi, fa, fs, x2, y2) {
  // W3C SVG implementation notes B.2.4 (endpoint -> centre parameterisation)
  if (rx === 0 || ry === 0) return [[x2, y2]];
  rx = Math.abs(rx); ry = Math.abs(ry);
  const c = Math.cos(phi), s = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = c * dx + s * dy, y1p = -s * dx + c * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
  const sign = fa === fs ? -1 : 1;
  const num_ = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const co = sign * Math.sqrt(Math.max(0, num_ / (rx * rx * y1p * y1p + ry * ry * x1p * x1p)));
  const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
  const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dt > 0) dt -= 2 * Math.PI;
  if (fs && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(4, Math.ceil(Math.abs(dt) / (Math.PI / 24)));
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = t1 + (dt * i) / n;
    pts.push([cx + rx * Math.cos(t) * c - ry * Math.sin(t) * s, cy + rx * Math.cos(t) * s + ry * Math.sin(t) * c]);
  }
  return pts;
}
function bez(p0, p1, p2, p3, n = 16) {
  const pts = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}
// returns { subpaths: [{pts, closed}], numbers: [values written], axisCoords: [{axis, v}] }
function samplePath(d) {
  const tk = pathTokens(d);
  const subpaths = [];
  const numbers = [];
  const axisCoords = [];
  let i = 0, cmd = null, cur = [0, 0], start = [0, 0], sp = null, lastC = null, lastQ = null;
  const next = () => { const v = parseFloat(tk[i++]); numbers.push(tk[i - 1]); return v; };
  const newSub = () => { sp = { pts: [cur.slice()], closed: false }; subpaths.push(sp); };
  while (i < tk.length) {
    if (/[a-z]/i.test(tk[i])) cmd = tk[i++];
    if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? cur[0] : 0, oy = rel ? cur[1] : 0;
    if (C === 'Z') { if (sp) { sp.closed = true; sp.pts.push(start.slice()); } cur = start.slice(); lastC = lastQ = null; cmd = null; continue; }
    if (C === 'M') {
      cur = [ox + next(), oy + next()]; start = cur.slice(); newSub();
      cmd = rel ? 'l' : 'L'; lastC = lastQ = null; continue;
    }
    if (!sp) newSub();
    if (C === 'L') { const p = [ox + next(), oy + next()]; if (Math.abs(p[0] - cur[0]) < 1e-9) axisCoords.push({ axis: 'x', v: p[0] }); if (Math.abs(p[1] - cur[1]) < 1e-9) axisCoords.push({ axis: 'y', v: p[1] }); sp.pts.push(p); cur = p; lastC = lastQ = null; }
    else if (C === 'H') { const x = (rel ? cur[0] : 0) + next(); axisCoords.push({ axis: 'y', v: cur[1] }); cur = [x, cur[1]]; sp.pts.push(cur.slice()); lastC = lastQ = null; }
    else if (C === 'V') { const y = (rel ? cur[1] : 0) + next(); axisCoords.push({ axis: 'x', v: cur[0] }); cur = [cur[0], y]; sp.pts.push(cur.slice()); lastC = lastQ = null; }
    else if (C === 'C' || C === 'S') {
      let p1;
      if (C === 'C') p1 = [ox + next(), oy + next()];
      else p1 = lastC ? [2 * cur[0] - lastC[0], 2 * cur[1] - lastC[1]] : cur.slice();
      const p2 = [ox + next(), oy + next()], p3 = [ox + next(), oy + next()];
      sp.pts.push(...bez(cur, p1, p2, p3)); lastC = p2; lastQ = null; cur = p3;
    } else if (C === 'Q' || C === 'T') {
      let q;
      if (C === 'Q') q = [ox + next(), oy + next()];
      else q = lastQ ? [2 * cur[0] - lastQ[0], 2 * cur[1] - lastQ[1]] : cur.slice();
      const p = [ox + next(), oy + next()];
      const p1 = [cur[0] + (2 / 3) * (q[0] - cur[0]), cur[1] + (2 / 3) * (q[1] - cur[1])];
      const p2 = [p[0] + (2 / 3) * (q[0] - p[0]), p[1] + (2 / 3) * (q[1] - p[1])];
      sp.pts.push(...bez(cur, p1, p2, p)); lastQ = q; lastC = null; cur = p;
    } else if (C === 'A') {
      const rx = next(), ry = next(), rot = next(), fa = next(), fs = next();
      const p = [ox + next(), oy + next()];
      sp.pts.push(...arcPoints(cur[0], cur[1], rx, ry, (rot * Math.PI) / 180, fa, fs, p[0], p[1]));
      cur = p; lastC = lastQ = null;
    } else { i++; }
  }
  return { subpaths, numbers, axisCoords };
}
function ellipsePts(cx, cy, rx, ry) {
  const pts = [];
  for (let k = 0; k <= 64; k++) { const t = (k / 64) * 2 * Math.PI; pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); }
  return pts;
}
function elementGeometry(el) {
  const a = el.attrs;
  const raw = (keys) => keys.map((k) => a[k]).filter((v) => v !== undefined);
  switch (el.tag) {
    case 'path': return samplePath(a.d || '');
    case 'circle': {
      const cx = num(a.cx), cy = num(a.cy), r = num(a.r);
      return { subpaths: [{ pts: ellipsePts(cx, cy, r, r), closed: true }], numbers: raw(['cx', 'cy', 'r']), axisCoords: [{ axis: 'x', v: cx - r }, { axis: 'x', v: cx + r }, { axis: 'y', v: cy - r }, { axis: 'y', v: cy + r }] };
    }
    case 'ellipse': {
      const cx = num(a.cx), cy = num(a.cy), rx = num(a.rx), ry = num(a.ry);
      return { subpaths: [{ pts: ellipsePts(cx, cy, rx, ry), closed: true }], numbers: raw(['cx', 'cy', 'rx', 'ry']), axisCoords: [{ axis: 'x', v: cx - rx }, { axis: 'x', v: cx + rx }, { axis: 'y', v: cy - ry }, { axis: 'y', v: cy + ry }] };
    }
    case 'rect': {
      const x = num(a.x), y = num(a.y), w = num(a.width), h = num(a.height);
      let rx = a.rx !== undefined ? num(a.rx) : a.ry !== undefined ? num(a.ry) : 0;
      rx = Math.min(rx, w / 2, h / 2);
      const d = rx > 0
        ? `M${x + rx} ${y}H${x + w - rx}A${rx} ${rx} 0 0 1 ${x + w} ${y + rx}V${y + h - rx}A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${rx} 0 0 1 ${x} ${y + h - rx}V${y + rx}A${rx} ${rx} 0 0 1 ${x + rx} ${y}Z`
        : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      const g = samplePath(d);
      return { subpaths: g.subpaths, numbers: raw(['x', 'y', 'width', 'height', 'rx', 'ry']), axisCoords: [{ axis: 'x', v: x }, { axis: 'x', v: x + w }, { axis: 'y', v: y }, { axis: 'y', v: y + h }], rect: { w, h, rx } };
    }
    case 'line': {
      const p = [num(a.x1), num(a.y1)], q = [num(a.x2), num(a.y2)];
      const ac = [];
      if (Math.abs(p[0] - q[0]) < 1e-9) ac.push({ axis: 'x', v: p[0] });
      if (Math.abs(p[1] - q[1]) < 1e-9) ac.push({ axis: 'y', v: p[1] });
      return { subpaths: [{ pts: [p, q], closed: false }], numbers: raw(['x1', 'y1', 'x2', 'y2']), axisCoords: ac };
    }
    case 'polyline':
    case 'polygon': {
      const ns = (a.points || '').match(/-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi) || [];
      const pts = [];
      for (let k = 0; k + 1 < ns.length; k += 2) pts.push([parseFloat(ns[k]), parseFloat(ns[k + 1])]);
      const closed = el.tag === 'polygon';
      if (closed && pts.length) pts.push(pts[0].slice());
      return { subpaths: [{ pts, closed }], numbers: ns, axisCoords: [] };
    }
  }
  return { subpaths: [], numbers: [], axisCoords: [] };
}

// ---------- measurement helpers ----------
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = dx * dx + dy * dy;
  let t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function densify(pts, step = 0.25) {
  const out = [];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < n; j++) out.push([a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n]);
  }
  if (pts.length) out.push(pts[pts.length - 1]);
  return out;
}
function polyDist(p, pts) {
  let m = Infinity;
  if (pts.length === 1) return Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]);
  for (let k = 0; k < pts.length - 1; k++) m = Math.min(m, segDist(p, pts[k], pts[k + 1]));
  return m;
}
function segsCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function polysCross(P, Q) {
  for (let i = 0; i < P.length - 1; i++) for (let j = 0; j < Q.length - 1; j++) if (segsCross(P[i], P[i + 1], Q[j], Q[j + 1])) return true;
  return false;
}
function closestOnPoly(p, pts) {
  let best = Infinity, bp = pts[0];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    let t = L ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L : 0;
    t = Math.max(0, Math.min(1, t));
    const q = [a[0] + t * dx, a[1] + t * dy], d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < best) { best = d; bp = q; }
  }
  if (pts.length === 1) best = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1]);
  return [best, bp];
}
function inside(p, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
// blur test in numbers: box-blur an ink mask twice (≈ gaussian) and return its darkest spot
function blurPeak(mask, n, R) {
  let a = Float32Array.from(mask), b = new Float32Array(n * n);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { // horizontal
      let s = 0, c = 0;
      for (let k = -R; k <= R; k++) { const xx = x + k; if (xx >= 0 && xx < n) { s += a[y * n + xx]; c++; } }
      b[y * n + x] = s / (2 * R + 1);
    }
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { // vertical
      let s = 0;
      for (let k = -R; k <= R; k++) { const yy = y + k; if (yy >= 0 && yy < n) s += b[yy * n + x]; }
      a[y * n + x] = s / (2 * R + 1);
    }
  }
  let peak = 0, at = 0;
  for (let i = 0; i < n * n; i++) if (a[i] > peak) { peak = a[i]; at = i; }
  return { peak, x: at % n, y: Math.floor(at / n) };
}
function length(pts) {
  let L = 0;
  for (let k = 0; k < pts.length - 1; k++) L += Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
  return L;
}
const decimals = (s) => { const m = String(s).match(/\.(\d+)/); return m ? m[1].replace(/0+$/, '').length : 0; };
const onGrid = (v, step = 1) => Math.abs(v / step - Math.round(v / step)) < 0.02;
const r2 = (v) => Math.round(v * 100) / 100;

// ---------- per-file check ----------
// show the relative path when two files share a basename (line/24/x.svg vs filled/24/x.svg)
function displayName(file) {
  const dup = files.filter((f) => basename(f) === basename(file)).length > 1;
  return dup ? relative(process.cwd(), file) : basename(file);
}
function checkFile(file) {
  const out = { file: displayName(file), path: file, src: '', errors: [], warns: [], infos: [], stats: {} };
  const E = (m) => out.errors.push(m), W = (m) => out.warns.push(m), I = (m) => out.infos.push(m);
  let src;
  try { src = readFileSync(file, 'utf8'); out.src = src; } catch (e) { E(`cannot read: ${e.message}`); return out; }
  const svg = readSvg(src);
  if (!svg) { E('no <svg> root'); return out; }
  const { root, elements } = svg;

  // gate: canvas
  const vb = (root.viewBox || '').trim().split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || vb.some(Number.isNaN)) { E('missing or invalid viewBox'); return out; }
  const [vx, vy, vw, vh] = vb;
  if (vx !== 0 || vy !== 0) W(`viewBox origin is ${vx} ${vy}, expected 0 0`);
  if (vw !== vh) E(`canvas is not square (${vw}×${vh})`);
  const size = vw;
  out.stats.size = size;
  const unit = size / 24;
  const pad = paddingAt24 * unit;

  // gate: structure
  for (const el of elements) {
    if (FORBIDDEN.includes(el.tag)) E(`forbidden element <${el.tag}> — build cut-outs and shapes in the geometry itself`);
    if (el.attrs.transform) E(`transform on <${el.tag}> — bake it into coordinates`);
    if (el.attrs.opacity || el.attrs['fill-opacity'] || el.attrs['stroke-opacity']) E(`opacity on <${el.tag}> — icons are one solid colour`);
    if (el.attrs.id || el.attrs.class || el.attrs.style) W(`id/class/style on <${el.tag}> — strip it (ids collide when inlined)`);
    if (el.tag === 'g') W('<g> group — flatten it, children should carry geometry only');
  }
  const shapes = elements.filter((e) => SHAPES.includes(e.tag));
  if (!shapes.length) { E('no drawable elements'); return out; }

  // style: stroke set or fill set
  const rootStroke = root.stroke && root.stroke !== 'none';
  const sw = num(root['stroke-width'], rootStroke ? 1 : 0);
  const mode = rootStroke ? 'stroke' : 'fill';
  out.stats.mode = mode;
  out.stats.stroke = mode === 'stroke' ? sw : null;
  if (mode === 'stroke') {
    if (root.fill !== 'none') W('stroke icon without fill="none" on the root — closed shapes will fill black');
    if (root.stroke !== 'currentColor') W(`root stroke is "${root.stroke}", use currentColor so the icon inherits text colour`);
    out.stats.cap = root['stroke-linecap'] || 'butt';
    out.stats.join = root['stroke-linejoin'] || 'miter';
    for (const el of shapes) {
      const a = el.attrs;
      if (a['stroke-width'] !== undefined && num(a['stroke-width']) !== sw) E(`<${el.tag}> overrides stroke-width (${a['stroke-width']} vs ${sw}) — one weight per size`);
      if (a.fill && a.fill !== 'none' && a.fill !== 'currentColor') W(`<${el.tag}> has fill="${a.fill}" — use currentColor or none`);
      if (a.stroke && a.stroke !== 'currentColor' && a.stroke !== 'none') W(`<${el.tag}> has stroke="${a.stroke}" — colour belongs to currentColor`);
    }
  } else {
    if (root.fill && root.fill !== 'currentColor') W(`root fill is "${root.fill}", use currentColor`);
  }

  // geometry
  const geoms = shapes.map((el) => ({ el, g: elementGeometry(el) }));
  const allNumbers = geoms.flatMap((x) => x.g.numbers);
  const maxDec = Math.max(0, ...allNumbers.map(decimals));
  if (maxDec > 3) W(`coordinates with ${maxDec} decimals — round to 3 at most (2 is plenty on a 24 grid)`);

  const half = mode === 'stroke' ? sw / 2 : 0;
  // ink half-width per element: a solid detail with stroke="none" has its ink edge on the path itself
  const halfOf = (el) => (mode === 'stroke' && el.attrs.stroke !== 'none' ? sw / 2 : 0);
  const filledOf = (el) => mode === 'stroke' && el.attrs.fill !== undefined && el.attrs.fill !== 'none';
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const { el, g } of geoms) { const h = halfOf(el); for (const sp of g.subpaths) for (const [x, y] of sp.pts) {
    minX = Math.min(minX, x - h); minY = Math.min(minY, y - h);
    maxX = Math.max(maxX, x + h); maxY = Math.max(maxY, y + h);
  } }
  const ink = { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
  out.stats.ink = ink;
  if (minX < -EPS || minY < -EPS || maxX > size + EPS || maxY > size + EPS) E(`ink leaves the canvas (${r2(minX)},${r2(minY)} → ${r2(maxX)},${r2(maxY)}) — it will be clipped`);
  else if (minX < pad - EPS || minY < pad - EPS || maxX > size - pad + EPS || maxY > size - pad + EPS)
    W(`ink enters the ${r2(pad)}px padding (${r2(minX)},${r2(minY)} → ${r2(maxX)},${r2(maxY)}) — fine for pointed or long-thin shapes that overshoot on purpose, or a set with smaller padding (pass --padding)`);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const off = Math.hypot(cx - size / 2, cy - size / 2);
  if (off > 0.5 * unit) I(`ink box centre is (${r2(cx)}, ${r2(cy)}), ${r2(off)} from canvas centre — correct only if it is a deliberate optical offset or a badge variant`);
  I(`ink box ${r2(ink.w)}×${r2(ink.h)} at ${r2(minX)},${r2(minY)}`);

  // grid: axis-aligned edges on whole pixels (outer stroke edge for stroke sets)
  const off_ = [];
  for (const { el, g } of geoms) for (const { axis, v } of g.axisCoords) {
    if (el.tag === 'circle' && num(el.attrs.r) < sw) continue; // stroked dots: centre matters, not edges
    const ok = mode === 'stroke' ? onGrid(v - half) || onGrid(v + half) : onGrid(v);
    if (!ok) off_.push(`${el.tag} ${axis}=${r2(v)}`);
  }
  if (off_.length) I(`off-grid straight edges (snap when it costs nothing, never distort a shape for it): ${[...new Set(off_)].slice(0, 6).join(', ')}${off_.length > 6 ? ' …' : ''}`);

  // complexity
  const subCount = geoms.reduce((n, x) => n + x.g.subpaths.length, 0);
  // identical repeats (rays, ticks, dots, rings): same closedness, point count and length → one group
  const groups = new Map();
  for (const { g } of geoms) for (const sp of g.subpaths) {
    const key = `${sp.closed}|${sp.pts.length}|${Math.round(length(sp.pts) / 0.05)}`;
    groups.set(key, (groups.get(key) || 0) + 1);
  }
  let parts_ = 0, repeats = 0;
  for (const n of groups.values()) { parts_ += n > 1 ? 1 + Math.max(0, n - 8) : 1; if (n > 1) repeats += n; }
  out.stats.elements = shapes.length;
  out.stats.subpaths = subCount;
  out.stats.parts = parts_;
  out.stats.open = geoms.every(({ el, g }) => el.tag !== 'circle' && el.tag !== 'ellipse' && g.subpaths.every((sp) => !sp.closed));
  if (repeats) I(`${repeats} identical repeated parts counted as ${[...groups.values()].filter((n) => n > 1).length} (rays, ticks, dots)`);
  if (mode === 'stroke' && parts_ > maxParts) E(`${parts_} parts (each primitive or subpath, repeats counted once; cap ${maxParts}) — simplify, or pick a metaphor that needs fewer`);

  // corner radii on rects
  for (const { el, g } of geoms) if (g.rect && g.rect.rx === 0 && mode === 'stroke') I(`<rect> ${g.rect.w}×${g.rect.h} has sharp corners — the default style rounds every corner except multi-line junctions`);

  // gaps and near-misses (stroke sets): compare centre-lines of different elements / subpaths
  if (mode === 'stroke') {
    const gap = gapOpt !== null ? Number(gapOpt) : sw;
    const parts = [];
    geoms.forEach(({ el, g }, ei) => g.subpaths.forEach((sp, si) => parts.push({ name: `${el.tag}#${ei + 1}${g.subpaths.length > 1 ? '.' + (si + 1) : ''}`, pts: sp.pts, dense: densify(sp.pts), closed: sp.closed, half: halfOf(el), filled: filledOf(el) && sp.closed, sig: `${sp.closed}|${sp.pts.length}|${Math.round(length(sp.pts) / 0.05)}` })));
    const said = new Map(); // collapse identical findings across repeated parts (rays, ticks)
    const once = (fn, A, B, kind, val, msg) => { const k = `${kind}|${[A.sig, B.sig].sort().join('/')}|${r2(val)}`; if (said.has(k)) { said.get(k).n++; return; } const rec = { n: 1, fn, msg }; said.set(k, rec); };
    // is point m covered by the ink of some part other than a and b?
    const covered = (m, a, b) => parts.some((q, qi) => qi !== a && qi !== b && (polyDist(m, q.pts) <= q.half + EPS || (q.filled && inside(m, q.pts))));
    const TOUCH = 0.02; // closer than this = a deliberate join (computed points carry rounding)
    const flagged = new Set();
    for (let a = 0; a < parts.length; a++) for (let b = a + 1; b < parts.length; b++) {
      const A = parts[a], B = parts[b];
      // a part lying inside a solid filled part is a deliberate overlap, not a gap
      if ((A.filled && inside(B.pts[0], A.pts)) || (B.filled && inside(A.pts[0], B.pts))) continue;
      let m = Infinity, pa = null, pb = null;
      for (const p of A.dense) { const [d, q] = closestOnPoly(p, B.pts); if (d < m) { m = d; pa = p; pb = q; } if (m < TOUCH) break; }
      for (const p of B.dense) { if (m < TOUCH) break; const [d, q] = closestOnPoly(p, A.pts); if (d < m) { m = d; pa = q; pb = p; } }
      if (m < TOUCH || polysCross(A.pts, B.pts)) { flagged.add(`${a}|${b}`); continue; } // touching or crossing: a deliberate junction
      const inkGap = m - A.half - B.half; // real distance between ink edges
      const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      if (inkGap < gap - EPS && covered(mid, a, b)) continue; // a third part fills the space: no counter here
      const key = `${a}|${b}`;
      if (inkGap < -EPS) { once(E, A, B, 'overlap', inkGap, `${A.name} and ${B.name}: inks overlap by ${r2(-inkGap)} without meeting near (${r2(mid[0])}, ${r2(mid[1])}) — they merge into a blob. Make the shared point identical, or move them ≥ ${r2(gap)} apart`); flagged.add(key); }
      else if (inkGap < gap - EPS) { once(W, A, B, 'gap', inkGap, `${A.name} and ${B.name}: visible gap ${r2(inkGap)}px near (${r2(mid[0])}, ${r2(mid[1])}), minimum ${r2(gap)} — widen it, or fill the counter solid`); flagged.add(key); }
    }
    for (const { n, fn, msg } of said.values()) fn(n > 1 ? `${msg} (same on ${n} repeated parts)` : msg);
    // endpoints that land near, but not on, another part
    parts.forEach((p, pi) => {
      if (p.closed || p.pts.length < 2) return;
      for (const end of [p.pts[0], p.pts[p.pts.length - 1]]) parts.forEach((q, qi) => {
        if (qi === pi || flagged.has(`${Math.min(pi, qi)}|${Math.max(pi, qi)}`)) return;
        const d = polyDist(end, q.pts);
        if (d > TOUCH && d < half + EPS) { W(`${p.name} ends ${r2(d)} from ${q.name} — a junction must end exactly on the other centre-line`); flagged.add(`${Math.min(pi, qi)}|${Math.max(pi, qi)}`); }
      });
    });
  }

  // ink coverage by sampling: works for stroke and fill icons alike
  const strokes = [], solids = [];
  for (const { el, g } of geoms) {
    const h = halfOf(el);
    const solid = mode === 'fill' ? el.attrs.fill !== 'none' : filledOf(el);
    if (solid) solids.push(g.subpaths.filter((sp) => sp.closed || sp.pts.length > 2).map((sp) => sp.pts)); // even-odd within one element
    if (h > 0) for (const sp of g.subpaths) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [x, y] of sp.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      strokes.push({ pts: sp.pts, h, box: [x0 - h, y0 - h, x1 + h, y1 + h] });
    }
  }
  const step = size / 96, n = 96;
  const mask = new Uint8Array(n * n);
  let inkN = 0, solidN = 0;
  for (let iy = 0; iy < n; iy++) for (let ix = 0; ix < n; ix++) {
    const x = (ix + 0.5) * step, y = (iy + 0.5) * step;
    const p = [x, y];
    const isSolid = solids.some((polys) => polys.filter((poly) => inside(p, poly)).length % 2 === 1);
    const isStroke = !isSolid && strokes.some((st) => x >= st.box[0] && x <= st.box[2] && y >= st.box[1] && y <= st.box[3] && polyDist(p, st.pts) <= st.h);
    if (isSolid) solidN++;
    if (isSolid || isStroke) { inkN++; mask[iy * n + ix] = 1; }
  }
  // blur radius ≈ 1/16 of the canvas (1.5px at 24), as in the visual blur test
  // two box passes of radius 7 cells ≈ a gaussian of σ 1.5px at 24 (calibrated: crossings and
  // arrow tips reach ~1.4× the reference; packed detail 1.6× and up)
  const R = 7;
  const bp = blurPeak(mask, n, R);
  out.stats.blurPeak = bp.peak;
  out.stats.blurAt = [r2((bp.x + 0.5) * step), r2((bp.y + 0.5) * step)];
  if (mode === 'stroke') {
    // reference: the default square keyline (outer 18 at 24) at this stroke
    const ref = new Uint8Array(n * n), lo = 3 * unit + sw / 2, hi = size - 3 * unit - sw / 2;
    for (let iy = 0; iy < n; iy++) for (let ix = 0; ix < n; ix++) {
      const x = (ix + 0.5) * step, y = (iy + 0.5) * step;
      const dx = Math.max(lo - x, 0, x - hi), dy = Math.max(lo - y, 0, y - hi);
      const d = dx || dy ? Math.hypot(dx, dy) : Math.min(x - lo, hi - x, y - lo, hi - y);
      if (d <= sw / 2) ref[iy * n + ix] = 1;
    }
    out.stats.blurRatio = bp.peak / blurPeak(ref, n, R).peak;
    I(`blur test: darkest point ${r2(out.stats.blurRatio)}× the reference square's`);
    if (out.stats.blurRatio > 1.5) W(`blur test: a dark clump near (${out.stats.blurAt.join(', ')}) is ${r2(out.stats.blurRatio)}× as dark as the reference square's darkest point — detail is packed too tight there; remove or space it`);
  }
  out.stats.inkArea = inkN * step * step;
  out.stats.solidShare = inkN ? solidN / inkN : 0;
  out.stats.density = out.stats.inkArea / Math.pow(size - 2 * pad, 2);
  I(`ink covers ${Math.round(out.stats.density * 100)}% of the live area${mode === 'stroke' && solidN ? `, ${Math.round(out.stats.solidShare * 100)}% of it solid` : ''}`);
  if (mode === 'stroke' && out.stats.solidShare > 0.25) W(`${Math.round(out.stats.solidShare * 100)}% of this line icon's ink is solid fill — its filled version won't read as a different state. Open it up, or use it as the filled icon and draw a new line one. Exception: an icon with no filled form (pause, stop, a dot), whose filled sibling is an exact copy`);
  return out;
}

// ---------- run ----------
const results = files.map(checkFile);
let errorCount = 0;
for (const r of results) {
  const s = r.stats;
  const head = s.mode ? `${s.mode}${s.stroke ? ' ' + s.stroke : ''} · ${s.size}px · ${s.parts ?? 0} parts` : '';
  console.log(`\n${r.file}  ${head}`);
  for (const m of r.errors) console.log(`  ERROR ${m}`);
  for (const m of r.warns) console.log(`  WARN  ${m}`);
  for (const m of r.infos) console.log(`  info  ${m}`);
  if (!r.errors.length && !r.warns.length) console.log('  ok');
  errorCount += r.errors.length;
}

// set-level consistency
const ok = results.filter((r) => r.stats.size);
if (ok.length > 1) {
  console.log('\nSET');
  const uniq = (f) => [...new Set(ok.map(f))];
  const sizes = uniq((r) => r.stats.size), modes = uniq((r) => r.stats.mode);
  const strokes = uniq((r) => r.stats.stroke), caps = uniq((r) => r.stats.cap), joins = uniq((r) => r.stats.join);
  if (sizes.length > 1) console.log(`  WARN  mixed canvas sizes: ${sizes.join(', ')} — compare icons of one size at a time`);
  if (modes.length > 1 && !pair) console.log(`  WARN  mixed stroke and fill files: ${modes.join(', ')} — fine for outline/filled pairs, not within one style`);
  if (sizes.length === 1 && strokes.filter(Boolean).length > 1) { console.log(`  ERROR mixed stroke widths at one size: ${strokes.join(', ')}`); errorCount++; }
  if (caps.filter(Boolean).length > 1) console.log(`  WARN  mixed linecaps: ${caps.join(', ')}`);
  if (joins.filter(Boolean).length > 1) console.log(`  WARN  mixed linejoins: ${joins.join(', ')}`);
  // density: open-line glyphs (plus, x, chevrons, arrows) only compare with each other
  for (const [mode, open] of [['stroke', false], ['stroke', true], ['fill', false]]) {
    const grp = ok.filter((r) => r.stats.mode === mode && (mode === 'fill' || !!r.stats.open === open));
    const ds = grp.map((r) => r.stats.density).sort((a, b) => a - b);
    if (ds.length < 3) continue;
    const med = ds[Math.floor(ds.length / 2)];
    const what = mode === 'fill' ? 'filled icons' : open ? 'open-line glyphs' : 'closed-shape icons';
    for (const r of grp) {
      const k = r.stats.density / med;
      if (k > 1.6) console.log(`  WARN  ${r.file} carries ${r2(k)}× the median ink of the set's ${what} — too dense, remove detail`);
      else if (k < 0.5) console.log(`  WARN  ${r.file} carries ${r2(k)}× the median ink of the set's ${what} — reads light or small; check the blur row`);
    }
  }
  console.log('  done');
}

// contact sheet
if (sheetPath) {
  const size = ok[0]?.stats.size || 24;
  const sw = ok.find((r) => r.stats.stroke)?.stats.stroke || 2 * (size / 24);
  const u = size / 24;
  // reference keylines in the default proportions: circle 20/24, square 18/24 outer
  const rc = (10 * u) - sw / 2, sq = 18 * u - sw, so = (size - sq) / 2, rr = Math.max(0, 3 * u - sw / 2);
  const refs = {
    'ref-circle': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><circle cx="${size / 2}" cy="${size / 2}" r="${rc}"/></svg>`,
    'ref-square': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><rect x="${so}" y="${so}" width="${sq}" height="${sq}" rx="${rr}"/></svg>`,
  };
  const icons = files.map((f) => ({ name: basename(f, '.svg'), svg: readFileSync(f, 'utf8').replace(/<\?xml[^>]*>/, '') }));
  const all = [...Object.entries(refs).map(([name, svg]) => ({ name, svg })), ...icons];
  const cell = (svg, px, cls = '') => `<div class="ic ${cls}" style="width:${px}px;height:${px}px">${svg}</div>`;
  // blind row first: new icons only, shuffled, no captions — crop this for cold naming by a fresh agent
  const shuffled = icons.map((i, k) => ({ i, k: (k * 7919) % 101 })).sort((a, b) => a.k - b.k).map((x) => x.i);
  const blind = `<section id="blind"><h2>blind (no names): crop this row for cold naming</h2>${[16, 24].map((px) => `<div class="row" style="margin-bottom:12px">${shuffled.map((i) => cell(i.svg, px)).join('')}</div>`).join('')}</section>`;
  const rows = [16, 20, 24, 32, 48].map((px) => `<section><h2>${px}px</h2><div class="row">${all.map((i) => `<figure>${cell(i.svg, px)}<figcaption>${i.name}</figcaption></figure>`).join('')}</div></section>`).join('');
  const blur = `<section><h2>blur test (24px) — no icon should look darker or lighter than the references</h2><div class="row">${all.map((i) => `<figure>${cell(i.svg, 24, 'blur')}<figcaption>${i.name}</figcaption></figure>`).join('')}</div></section>`;
  const grid = `<section><h2>${size}-grid overlay at 10×</h2><div class="row">${icons.map((i) => `<figure><div class="ic big" style="width:${size * 10}px;height:${size * 10}px;background-size:10px 10px">${i.svg}<div class="live" style="inset:${pad10(u)}px"></div></div><figcaption>${i.name}</figcaption></figure>`).join('')}</div></section>`;
  function pad10(unit) { return paddingAt24 * unit * 10; }
  const html = `<!doctype html><meta charset="utf-8"><title>Icon sheet</title><style>
body{font:12px system-ui;margin:24px;background:#fff;color:#111}
section{margin-bottom:28px}h2{font-size:12px;font-weight:600;color:#666;margin:0 0 10px}
.row{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-end}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}
figcaption{color:#888;font-size:10px;max-width:90px;text-align:center;overflow-wrap:anywhere}
.ic{position:relative;display:block}.ic svg{width:100%;height:100%;display:block}
.blur svg{filter:blur(1.2px)}
.big{background-image:linear-gradient(#0000000f 1px,transparent 1px),linear-gradient(90deg,#0000000f 1px,transparent 1px);outline:1px solid #ddd}
.live{position:absolute;outline:1px dashed #e5484d88;pointer-events:none}
.dark{background:#111;color:#eee;padding:16px;border-radius:8px}
</style>${blind}${rows}${blur}<section class="dark"><h2>on dark, 24px</h2><div class="row">${all.map((i) => `<figure>${cell(i.svg, 24)}<figcaption>${i.name}</figcaption></figure>`).join('')}</div></section>${grid}`;
  writeFileSync(sheetPath, html);
  console.log(`\nsheet → ${sheetPath} (open it; capture rows with a zoomed crop, never a scaled-down full page; give the #blind row alone to a fresh agent for naming)`);
}

// line + filled pair
if (pair) {
  const [L, F] = pair.map((f) => results.find((r) => r.path === f));
  console.log(`\nPAIR ${L.file} + ${F.file}`);
  if (L.src.replace(/\s+/g, ' ').trim() === F.src.replace(/\s+/g, ' ').trim()) {
    console.log('  ok    identical files: an icon with no filled form (open lines, already solid, or slashed), filled sibling = exact copy');
  } else if (L.stats.ink && F.stats.ink) {
    const d = Math.max(...['minX', 'minY', 'maxX', 'maxY'].map((k) => Math.abs(L.stats.ink[k] - F.stats.ink[k])));
    if (d > 0.1 + EPS) { console.log(`  ERROR silhouettes differ by up to ${r2(d)}px — the filled icon must fill the line icon's outer shape exactly, or switching states jumps`); errorCount++; }
    else console.log(`  ok    silhouettes match (within ${r2(d)}px)`);
    if ((L.stats.solidShare || 0) > 0.25) console.log(`  WARN  the line icon is already ${Math.round(L.stats.solidShare * 100)}% solid — the pair won't read as two states`);
    const k = F.stats.inkArea / (L.stats.inkArea || 1);
    console.log(`  info  filled carries ${r2(k)}× the line icon's ink`);
    if (k < 1.3) console.log(`  WARN  the filled version is barely heavier than the line one — the selected state won't show`);
  }
}

// one-file SVG contact sheet: imports into Figma (createNodeFromSvg) or Paper, where you can screenshot it
if (sheetSvgPath) {
  const items = files.map((f) => {
    const src = readFileSync(f, 'utf8');
    const m = src.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/);
    if (!m) return null;
    const a = parseAttrs(m[1]);
    const vb = (a.viewBox || '0 0 24 24').split(/[\s,]+/).map(Number);
    const keep = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule'];
    return { name: basename(f, '.svg'), size: vb[2], inner: m[2], attrs: keep.filter((k) => a[k] !== undefined).map((k) => [k, a[k]]) };
  }).filter(Boolean);
  // reference circle and square in the set's stroke, for the blur row
  const ref0 = ok.find((r) => r.stats.stroke);
  const rsz = ref0?.stats.size || 24, rsw = ref0?.stats.stroke || 2, ru = rsz / 24;
  const rattrs = [['fill', 'none'], ['stroke', 'currentColor'], ['stroke-width', String(rsw)], ['stroke-linecap', 'round'], ['stroke-linejoin', 'round']];
  const sq = 18 * ru - rsw, so = (rsz - sq) / 2;
  const refs = [
    { name: 'ref-circle', size: rsz, attrs: rattrs, inner: `<circle cx="${rsz / 2}" cy="${rsz / 2}" r="${10 * ru - rsw / 2}"/>` },
    { name: 'ref-square', size: rsz, attrs: rattrs, inner: `<rect x="${so}" y="${so}" width="${sq}" height="${sq}" rx="${Math.max(0, 3 * ru - rsw / 2)}"/>` },
  ];
  const colour = (attrs, c) => attrs.map(([k, v]) => `${k}="${v === 'currentColor' ? c : v}"`).join(' ');
  const glyph = (it, x, y, px, c) => `<g transform="translate(${x} ${y}) scale(${px / it.size})" ${colour(it.attrs, c)}>${it.inner.replace(/currentColor/g, c)}</g>`;
  const order = items.map((it, k) => ({ it, k: (k * 7919) % 101 })).sort((a, b) => a.k - b.k).map((x) => x.it);
  const col = 64, W = Math.max(400, (items.length + 2) * col + 40);
  let y = 20, body = '';
  const label = (t, yy) => `<text x="20" y="${yy}" font-family="system-ui, sans-serif" font-size="11" fill="#777">${t}</text>`;
  body += label('blind (no names): crop for cold naming', y); y += 14;
  for (const px of [16, 24]) { order.forEach((it, i) => { body += glyph(it, 20 + i * col, y, px, '#000'); }); y += px + 14; }
  for (const px of [16, 20, 24, 48]) {
    y += 10; body += label(`${px}px`, y); y += 8;
    items.forEach((it, i) => { body += glyph(it, 20 + i * col, y, px, '#000'); body += `<text x="${20 + i * col}" y="${y + px + 12}" font-family="system-ui, sans-serif" font-size="9" fill="#999">${it.name.slice(0, 11)}</text>`; });
    y += px + 20;
  }
  // blur row: the icons next to the reference circle and square, gaussian σ = 1/16 of 24px
  y += 10; body += label('blur test, 24px: nothing darker or lighter than the references, no dark clumps, silhouette still reads', y); y += 8;
  body += '<g filter="url(#blur)">';
  [...refs, ...items].forEach((it, i) => { body += glyph(it, 20 + i * col, y, 24, '#000'); });
  body += '</g>';
  y += 44;
  y += 10; body += `<rect x="10" y="${y}" width="${W - 20}" height="52" rx="8" fill="#111"/>`;
  body += `<text x="20" y="${y + 16}" font-family="system-ui, sans-serif" font-size="11" fill="#aaa">on dark, 24px</text>`;
  items.forEach((it, i) => { body += glyph(it, 20 + i * col, y + 22, 24, '#fff'); });
  y += 62;
  writeFileSync(sheetSvgPath, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}"><defs><filter id="blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.5"/></filter></defs><rect width="${W}" height="${y}" fill="#fff"/>${body}</svg>`);
  console.log(`\nsvg sheet → ${sheetSvgPath} (import into Figma or Paper, then screenshot: no local server needed)`);
}

process.exit(errorCount ? 1 : 0);
