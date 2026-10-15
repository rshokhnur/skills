#!/usr/bin/env node
// check-icons.mjs — numeric checks for UI icon SVGs. No dependencies (Node 18+).
//
//   node check-icons.mjs icon.svg [more.svg ...]        lint each file + the set
//   node check-icons.mjs icons/*.svg --sheet sheet.html  also write a contact sheet to render
//
// Options: --padding <px at 24>  live-area padding, default 2 (scaled to the viewBox)
//          --gap <px>            minimum gap between separate elements, default = stroke width
//          --max-parts <n>       hard cap on parts (each primitive or subpath) in stroke icons, default 6
//
// Exit code 1 if any ERROR. WARN = look at it, may be intentional. INFO = context.

import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  if (i === -1) return dflt;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const sheetPath = opt('--sheet', null);
const paddingAt24 = Number(opt('--padding', 2));
const gapOpt = opt('--gap', null);
const maxParts = Number(opt('--max-parts', 6));
const files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  console.log('usage: node check-icons.mjs <file.svg ...> [--sheet out.html] [--padding 2] [--gap 2] [--max-parts 6]');
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
function length(pts) {
  let L = 0;
  for (let k = 0; k < pts.length - 1; k++) L += Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
  return L;
}
const decimals = (s) => { const m = String(s).match(/\.(\d+)/); return m ? m[1].replace(/0+$/, '').length : 0; };
const onGrid = (v, step = 1) => Math.abs(v / step - Math.round(v / step)) < 0.02;
const r2 = (v) => Math.round(v * 100) / 100;

// ---------- per-file check ----------
function checkFile(file) {
  const out = { file: basename(file), errors: [], warns: [], infos: [], stats: {} };
  const E = (m) => out.errors.push(m), W = (m) => out.warns.push(m), I = (m) => out.infos.push(m);
  let src;
  try { src = readFileSync(file, 'utf8'); } catch (e) { E(`cannot read: ${e.message}`); return out; }
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
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const { g } of geoms) for (const sp of g.subpaths) for (const [x, y] of sp.pts) {
    minX = Math.min(minX, x - half); minY = Math.min(minY, y - half);
    maxX = Math.max(maxX, x + half); maxY = Math.max(maxY, y + half);
  }
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
  out.stats.elements = shapes.length;
  out.stats.subpaths = subCount;
  out.stats.parts = subCount;
  if (mode === 'stroke' && subCount > maxParts) E(`${subCount} parts (each primitive or subpath; cap ${maxParts}) — simplify, or pick a metaphor that needs fewer`);

  // corner radii on rects
  for (const { el, g } of geoms) if (g.rect && g.rect.rx === 0 && mode === 'stroke') I(`<rect> ${g.rect.w}×${g.rect.h} has sharp corners — the default style rounds every corner except multi-line junctions`);

  // gaps and near-misses (stroke sets): compare centre-lines of different elements / subpaths
  if (mode === 'stroke') {
    const gap = gapOpt !== null ? Number(gapOpt) : sw;
    const parts = [];
    geoms.forEach(({ el, g }, ei) => g.subpaths.forEach((sp, si) => parts.push({ name: `${el.tag}#${ei + 1}${g.subpaths.length > 1 ? '.' + (si + 1) : ''}`, pts: sp.pts, dense: densify(sp.pts), closed: sp.closed })));
    const TOUCH = 0.02; // closer than this = a deliberate join (computed points carry rounding)
    const flagged = new Set();
    for (let a = 0; a < parts.length; a++) for (let b = a + 1; b < parts.length; b++) {
      let m = Infinity;
      for (const p of parts[a].dense) { m = Math.min(m, polyDist(p, parts[b].pts)); if (m < TOUCH) break; }
      for (const p of parts[b].dense) { if (m < TOUCH) break; m = Math.min(m, polyDist(p, parts[a].pts)); }
      if (m < TOUCH) continue;
      const key = `${a}|${b}`;
      if (m < sw - EPS) { E(`${parts[a].name} and ${parts[b].name}: centre-lines ${r2(m)} apart, under one stroke width — the inks merge into a blob. Make the shared point identical, or move them ≥ ${r2(sw + gap)} apart`); flagged.add(key); }
      else if (m < sw + gap - EPS) { W(`${parts[a].name} and ${parts[b].name}: visible gap ${r2(m - sw)}px, minimum ${r2(gap)} — widen it, or fill the counter solid`); flagged.add(key); }
    }
    // endpoints that land near, but not on, another part
    parts.forEach((p, pi) => {
      if (p.closed || p.pts.length < 2) return;
      for (const end of [p.pts[0], p.pts[p.pts.length - 1]]) parts.forEach((q, qi) => {
        if (qi === pi || flagged.has(`${Math.min(pi, qi)}|${Math.max(pi, qi)}`)) return;
        const d = polyDist(end, q.pts);
        if (d > TOUCH && d < half + EPS) { W(`${p.name} ends ${r2(d)} from ${q.name} — a junction must end exactly on the other centre-line`); flagged.add(`${Math.min(pi, qi)}|${Math.max(pi, qi)}`); }
      });
    });
    // ink density proxy: stroke area / live area
    const L = parts.reduce((s, p) => s + length(p.pts), 0);
    out.stats.density = (L * sw) / Math.pow(size - 2 * pad, 2);
  } else {
    // rough filled-area proxy via shoelace on closed subpaths (holes subtract with evenodd only approx.)
    let A = 0;
    for (const { g } of geoms) for (const sp of g.subpaths) {
      let s = 0;
      for (let k = 0; k < sp.pts.length - 1; k++) s += sp.pts[k][0] * sp.pts[k + 1][1] - sp.pts[k + 1][0] * sp.pts[k][1];
      A += s / 2;
    }
    out.stats.density = Math.abs(A) / Math.pow(size - 2 * pad, 2);
  }
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
  if (modes.length > 1) console.log(`  WARN  mixed stroke and fill files: ${modes.join(', ')} — fine for outline/filled pairs, not within one style`);
  if (sizes.length === 1 && strokes.filter(Boolean).length > 1) { console.log(`  ERROR mixed stroke widths at one size: ${strokes.join(', ')}`); errorCount++; }
  if (caps.filter(Boolean).length > 1) console.log(`  WARN  mixed linecaps: ${caps.join(', ')}`);
  if (joins.filter(Boolean).length > 1) console.log(`  WARN  mixed linejoins: ${joins.join(', ')}`);
  const ds = ok.filter((r) => r.stats.mode === 'stroke').map((r) => r.stats.density).sort((a, b) => a - b);
  if (ds.length >= 3) {
    const med = ds[Math.floor(ds.length / 2)];
    for (const r of ok) if (r.stats.mode === 'stroke') {
      const k = r.stats.density / med;
      if (k > 1.6) console.log(`  WARN  ${r.file} carries ${r2(k)}× the set's median ink — too dense, remove detail`);
      else if (k < 0.5) console.log(`  WARN  ${r.file} carries ${r2(k)}× the set's median ink — reads light or small next to the others — check the blur row`);
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

process.exit(errorCount ? 1 : 0);
