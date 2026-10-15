# SVG: execution

How to turn a plan into clean geometry in code, Figma, or Paper, with the coordinate maths done rather than guessed.

## Root templates

Stroke icon (default style; Lucide-compatible root):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- geometry only: no stroke, fill, class, id or transform on children -->
</svg>
```

Filled or outlined icon (filled variants, icon fonts, sets that ship outlines):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="…"/>
</svg>
```

- **Presentation lives on the root, once.** Children carry geometry only. This is how Lucide enforces one weight: its pipeline deletes every child stroke attribute and re-applies the root's.
- **Allowed children:** `path`, `circle`, `rect` (with `rx`), `line`, `polyline`, `polygon`, `ellipse`. Prefer primitives where they exist: they are exact, readable, and easy to check. Use paths for everything else.
- **One exception to "children carry geometry only":** a solid detail inside a stroke icon. Prefer the stroke trick (see "Dots"). Otherwise use `<circle … fill="currentColor" stroke="none"/>`.
- **When matching a set, copy its root exactly,** including attribute order. Some sets forbid primitives (Tabler: paths only, no `z` in outlines).
- **Precision.** Write integers and halves where the plan puts them. Computed points (intersections, points on circles) get at most 3 decimals.

## Stroke arithmetic

| Fact | Consequence |
| --- | --- |
| Ink extends stroke/2 on each side of a centre-line | Outer edge = centre-line ± 1 at stroke 2 |
| Round caps extend stroke/2 past an open endpoint | Ink of `M12 3 V7` spans y 2..8 |
| Two parallel strokes need centre-lines ≥ stroke + gap apart | 4 apart at 2/2; 3 apart at 1.5/1.5 |
| A circle of centre-line r at stroke s has outer Ø 2r + s | Ø20 outer at s2 → r = 9 |
| A rect of outer size S at stroke s has centre-line size S − s | square 18 outer at s2 → `x4 y4 w16 h16` (not `x3 w18`) |
| A centre-line corner radius r gives outer r + s/2 and inner r − s/2 | r2 at s2 → outer 3, inner 1 |
| The default miter limit (4) bevels joins sharper than about 29° | Irrelevant with round joins; relevant when matching a miter set |

**Live-area test, per element.** The minimum coordinate minus stroke/2 must be ≥ the padding, and the maximum plus stroke/2 must be ≤ 24 − padding.

## Coordinate recipes

**Points on a circle** with centre (cx, cy) and radius r, at angle a measured clockwise from 3 o'clock (SVG's y-axis points down):
`x = cx + r·cos a`, `y = cy + r·sin a`. For "a degrees above horizontal", use `y = cy − r·sin a`.
Pick angles that give tidy numbers: 0/90/180/270 always, and 30/60 give halves when r is even. Example, centre 12,12 with r 9: 45° up-right is (18.364, 5.636).

**Rounded rectangle as a path** (x, y, w, h, r), when a set forbids `rect` or only some corners round:
```
M x+r y H x+w-r A r r 0 0 1 x+w y+r V y+h-r A r r 0 0 1 x+w-r y+h
H x+r A r r 0 0 1 x y+h-r V y+r A r r 0 0 1 x+r y Z
```

**Rounding a corner between two straight segments** meeting at interior angle θ with radius r:
- The tangent points sit t = r / tan(θ/2) from the vertex along each segment. At r 2: 90° gives t 2, 60° gives 3.464, 45° gives 4.828.
- Write `L tangent1 A r r 0 0 sweep tangent2`, with sweep 1 if the path turns clockwise there.
- If t exceeds a segment's length, the radius is too big for that corner. Reduce it.
- Two diagonals meeting at 90° use r = 1 + √2 ≈ 2.414 (the Lucide rule). The rounded apex then sits exactly 1 inside the sharp vertex, which keeps it on the grid.

**Arc flags and traps**
- `A rx ry rotation large-arc sweep x y`. Sweep 1 runs clockwise on screen. A 90° corner arc is never "large".
- **Endpoint equals start point:** the arc draws nothing. A full circle needs two arcs or `<circle>`.
- **Radius too small for the chord:** SVG silently enlarges it, so a typo becomes a semicircle instead of an error. Check that chord ≤ 2r.
- **Radius 0:** the arc becomes a straight line.

**Cubic quarter circle,** for targets without arcs, such as Figma's `vectorPaths`: the handle length is 0.5523 × r. For an arc of angle φ, the handle is (4/3)·tan(φ/4)·r.

**Line meets circle,** used to compute cut points for gaps and knock-outs. For a line through P with direction d (unit vector) and a circle centre C with radius R: solve `|P + t·d − C| = R`. With `f = P − C`: `t = −(f·d) ± √((f·d)² − (|f|² − R²))`. Use R = the front shape's centre-line distance plus gap plus stroke, so the back line stops leaving exactly one gap of clear space.

## Making shapes meet

- **One continuous stroke = one subpath.** Corners then get a real round join. Two separate segments meeting at a point leave a visible notch at large sizes.
- **T-junction:** the stem's endpoint is a point on the other element's centre-line, computed exactly, with the same numbers written in both elements. The checker flags any endpoint that lands within stroke/2 of another element without touching it.
- **Arrow:** shaft `M5 12 H19` and head `M12 5 L19 12 L12 19`. The tip (19,12) is shared exactly. Or draw the whole arrow as one path.
- **Overlap:** never draw the hidden part of the back object. Stop its path at the cut points computed above. Lucide's "copy" icon draws only the visible part of the back sheet.
- **Slash ("off"):** draw the slash `M3 3 L21 21` at padding 2 (`M2 2 L22 22` in a padding-1 set like Lucide). Split the base geometry where it comes within (gap + stroke) of the slash on one side, and leave those fragments out. Fragment endpoints become computed decimals, and that is correct.

## Dots

- **Dot equal to the stroke** (Lucide, Feather, Tabler): `M12 8h.01`. Round caps render a disc with diameter equal to the stroke. Check that it survives SVGO (see below).
- **Dot 1.5× the stroke** (default style, Phosphor): `<circle cx="12" cy="8" r="0.5"/>` stroked at 2 renders a solid disc of outer Ø3, because r − s/2 < 0 closes the hole. It stays pure geometry with no fill attribute. In general, outer Ø = 2r + s.
- **"More" dots, Ø4 at stroke 2:** `<circle r="1"/>` ×3, centres 7 apart (5, 12, 19).

## Filled variants in code

Without an outline-stroke tool, build the filled glyph as one compound path with `fill-rule="evenodd"`:

1. **Silhouette.** Offset the outline's centre-line outward by stroke/2. A circle of r 9 becomes r 10. A rect of x4 w16 rx2 becomes x3 w18 rx3.
2. **Holes,** one subpath each, inside the silhouette:
   - **Circle:** two arcs.
   - **Straight knock-out line** of width k from A to B: a capsule. Offset ±k/2 along the normal, with semicircle arcs at the ends. For a horizontal line from x1 to x2 at y: `M x1 y-k/2 H x2 A k/2 k/2 0 0 1 x2 y+k/2 H x1 A k/2 k/2 0 0 1 x1 y-k/2 Z`.
   - **Polyline knock-out** (a check mark inside a disc): offsetting a bent polyline by hand is error-prone. Either keep the outline icon as the "filled" state, or build it in Figma (outline stroke, then subtract, then flatten). Don't approximate.
3. **Nonzero instead of evenodd:** each hole must run in the opposite direction to the silhouette. Native `rect` and `circle` run clockwise, so holes use sweep 0.

## Workflow: code

1. Write each icon to its own `name.svg` (kebab-case, depicted-object naming) from the plan.
2. Run the checker with neighbours: `node <this skill's folder>/check-icons.mjs new.svg n1.svg n2.svg n3.svg --sheet /tmp/sheet.html`.
3. Open the sheet in a browser, the in-app browser, or a headless screenshot. Read the 16px row and the blur row at 100%.
4. Components: wrap the identical geometry, never redrawn. Keep `currentColor`. Size the component with width and height props. `aria-hidden` and labels belong to `icon-usage`.
5. Optimise with SVGO only using the settings below, then re-run the checker, since optimisers can move points.

## Workflow: Figma (Plugin API / use_figma)

1. **Build geometry as an SVG string** in a 24 viewBox with explicit `width="24" height="24"`, and import it with `figma.createNodeFromSvg(svg)`.
   - Never assemble icons from `createLine()` or rectangles plus `rotation`. Rotation pivots on the node's corner, so chevrons collapse and arrowheads detach.
2. **If writing `vectorPaths` directly,** use only absolute `M L Q C Z`: no arcs, H/V or relative commands. Convert arcs to cubics with the 0.5523 handle.
   - Figma re-bases coordinates to the node's position. Set x and y after creation and read back before trusting numbers.
3. **Strokes stay CENTER-aligned.** Inside and outside alignment exports as approximations or masks. Use round caps and joins, and don't set per-vertex caps on one path, because mixed endings export as fills.
4. **Keep an editable stroke master.** For filled variants or font export, duplicate it and run `outlineStroke()`. Then use `figma.subtract` for knock-outs (it takes the bottom layer's style) and `figma.flatten` the result into one vector with one fill.
5. **Component per icon,** named by the depicted object, with a variant per size (`size=16|20|24`). Each variant is drawn separately, not scaled. Children use SCALE constraints.
6. **Verify:**
   - Run `exportAsync({ format: 'SVG_STRING', useAbsoluteBounds: true })` so the 24 frame and its padding survive.
   - Save the string, run the checker on it, then screenshot the node at 1× and 4×.
   - Use a keyline-grid component (circle 20, square 18, rects 16×20 and 20×16, diagonals, centre lines, at 10% red) as a hidden layer while drawing, never in the export.

## Workflow: Paper (MCP)

Paper has no booleans, outline stroke or shape-to-path, so all cut-outs must already be in the SVG geometry.

1. Load Paper's guide first (`get_guide`), as its MCP requires.
2. Write the icon with `write_html` as inline `<svg>` markup inside a fixed box: `width:24px;height:24px;flex-shrink:0`.
3. Paper's pixel snapping goes to half-pixels, which suits odd strokes only. Write your coordinates explicitly; never drag points with snapping on for a 2px set.
4. Read the result back with `get_jsx` or `get_computed_styles`. Confirm `viewBox`, `stroke-linecap`/`linejoin` and `currentColor` survived. Never read sizes from a screenshot.
5. Run the checker on the SVG string. Then `get_screenshot` the icon at 1× and enlarged, next to existing icons in the file.
6. Call `finish_working_on_nodes` when done.

## SVGO for icons

```js
// svgo.config.mjs
export default {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    { name: 'preset-default', params: { overrides: {
      convertShapeToPath: false, // keep circle/rect/line: exact and readable
      mergePaths: false,         // keep elements separate: editable, checkable
    } } },
    { name: 'removeAttrs', params: { attrs: '(fill|stroke.*)', elemSeparator: ':' } }, // stroke sets only; re-add the root attrs after
  ],
};
```

- **Never remove the `viewBox`.** It is what makes the icon scale. SVGO v4 no longer removes it by default; don't enable `removeViewBox`.
- **Dots survive** only if the path keeps its zero-length segment. Re-render after optimising and check that every dot is still there.
- **Re-run the checker after optimising.** Rounding can open a junction that was exact before.

## Delivery formats

- **Inline SVG or components:** the default. They recolour with `currentColor`, scale crisply, and need no extra requests.
- **Sprite (`<symbol>` + `<use>`):** one file and cacheable. This is the only place `<use>` and ids are allowed, and the build step generates them, not the source.
- **Icon fonts:** require outlined, filled geometry (strokes don't survive). They have accessibility and alignment drawbacks, so produce them only when the user's stack demands it.
- **Several sizes in one file** (as openai.com does): `<symbol id="size-16">`, `size-20`, `size-24`, each separately drawn and selected by the component's size prop.
