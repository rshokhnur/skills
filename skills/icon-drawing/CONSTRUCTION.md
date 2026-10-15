# Construction: the numbers

The tables and rules every icon is built from. SKILL.md owns the process; this file owns the values. All values are at a 24 canvas unless a size column says otherwise.

## Default style (when no set exists)

This is the user's chosen house style, modelled on OpenAI's product icons, measured across about 900 shipped glyphs. It is Lucide's skeleton made quieter: the same 24/2px round-terminal base, with larger concentric corners, solid tiny details, softer forms, and evenly distributed ink.

| Property | Value | Why |
| --- | --- | --- |
| Canvas / live area | 24 / 20 (padding 2) | Keeps icons clear of their container edge; it matches Material, Fluent and OpenAI |
| Stroke | 2, centred, one weight everywhere | Internal lines too. Weight is never used for hierarchy inside a glyph |
| Caps / joins | round / round | Soft terminals give the friendly, quiet feel |
| Keylines (outer edge) | circle Ø20 · square 18 · portrait 16×20 (or 18×20) · landscape 20×16 (or 20×18) | Material, Fluent and OpenAI agree exactly. The circle is about 111% of the square, which equalises area |
| Container corners | outer 3 / inner 1 (centre-line radius 2) | Concentric: outer = inner + stroke. Large radii are what make the set quiet |
| Small shapes (< 8px) | centre-line radius 1 (outer 2) | A radius 2 would swallow a short side |
| Junctions (3+ lines meeting) | sharp | Rounded multi-line junctions render inconsistently across sizes |
| Minimum gap | 2 (equal to the stroke) | A gap smaller than the stroke closes up at 16px |
| Dots and tiny details | solid; dot Ø3 (1.5× stroke); "more" dots Ø4 | Outlined tiny details clog; solid marks read |
| Arrowheads | 90° chevron, arms about 5.5–7 long, joined to the shaft at its end | Matches the set's weight; long enough to read at 16 |
| Angles | 45° first, then 30° / 60°; never arbitrary | Diagonals at 45° render evenly and repeat across the family |
| Forms | flat, front-facing, soft (a gear is a rounded lobed flower, star tips rounded) | No perspective; no mechanical teeth |
| Detail | 1–3 shapes typical; 4–6 only for complex metaphors | The user's bar: simple at one glance |

**Optional corner smoothing.** OpenAI smooths the dominant container corners (iOS-style continuous curvature). Apply Figma's corner smoothing at about 60% to containers of 14px or more when drawing in Figma. In hand-written SVG, use plain arcs; the difference is invisible at 24px.

## Per-size table (default style)

Each size is redrawn from the 24 master's skeleton, never scaled. Weight steps by 0.25 and grows more slowly than the canvas, so small sizes are relatively heavier and don't look faint.

| Canvas | Stroke | Padding | Circle Ø | Square | Container radius (outer) | Gap min | Use |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 12 | 1 | 1 | 10 | 8 | 1.5 | 1 | Status only, never interactive |
| 16 | 1.5 | 1 (round) / 2 (square) | 14 | 12 | 2.25 | 1.5 | Dense UI, beside 13–14px text |
| 20 | 1.75 | 2 | 16 | 14 | 2.5 | 1.75 | Default desktop UI, beside 14–16px text |
| **24** | **2** | **2** | **20** | **18** | **3** | **2** | **Master; touch UI, toolbars** |
| 32 | 2.5 | 3 | 26 | 24 | 3.5 | 2.5 | Large controls, empty states |

- **Snapping at fractional strokes.** At 1.5 and 1.75, put the outer edge on a whole pixel. The centre-line then lands on .75 or .875, and that is correct (Polaris, Fluent, OpenAI).
- **When to redraw a small size.** At 16, drop any detail whose counter would fall under 1.5, and merge or remove repeats (three lines become two). Ask before shipping 12px versions of anything except status marks.
- **When fixed sizes are impossible.** If the stack can only scale one file, ship the 24 master and say so; it is the one sanctioned exception to redrawing.

## Library cards (when matching a known set)

Confirm these against three real icons before drawing. Libraries change.

| Set | Canvas / stroke | Padding | Keylines (outer) | Corners | Caps / joins | Dots | Delivery and notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Lucide | 24 / 2 | 1 (circle reaches 1..23) | circle r10 → Ø22 · square 18 | radius 2 (≥8px), 1 (<8px), 2.41 where diagonals meet at 90° | round / round | = stroke (`h.01`) | live strokes; primitives allowed; 3 decimals; gap 2 |
| Feather | 24 / 2 | 1 | circle Ø22 · square 18 | radius 2 | round / round | = stroke | Lucide's ancestor; sharper corners |
| Tabler | 24 / 2 | 1 (square outer 2..22) | keylines are centre-line guides | radius 2 | round / round | = stroke (`l.01 0`) | paths only, no `z` in outlines; filled = outline's outer edge |
| Heroicons outline | 24 / 1.5 | 2.25 | circle r9 → Ø19.5 | radius ≈ 1.5× stroke | round / round | small ellipses | 0.75 coordinate grid; separate 20 (mini) and 16 (micro) solid sets |
| Phosphor | 16 master (256 units) / Regular 1 at 16 → 1.5 at 24 | ≈ 1.5–2 at 16 | circle 1px larger than square at 16 | centre-line r0.5 at 16; inner corners go sharp | round / round | 1.5× stroke | outlined fills; six weights share one skeleton; fill = Regular's outer edge |
| Material Symbols | 24 / 2 (weight axis) | 2 | circle 20 · square 18 · rect 20×16 | exterior 2, interior square (Outlined); Rounded theme differs | square terminals (Outlined/Sharp) | — | variable font; optical sizes 20/24/40/48 |
| Fluent 2 | 24 / 1.5 (20/16: 1, 32: 2) | 2 | circle 20 · square 18 | rounded | round / round | — | every size drawn separately; Regular + Filled (filled = selected) |
| Polaris | 20 / 1.5 | 2 (16 safe, nothing outside) | circle 14 · square 13 · rect 14×12 | 1–3 by object roundness | round | solid | one stroke edge on the pixel grid; 0.25 nudges; knock-outs 1.25 |
| SF Symbols | font glyph, 9 weights × 3 scales | margins, not padding | centred on cap height | — | — | — | not extendable as SVG: build custom symbols with Apple's template, outlined, 3 masters with matching paths |

## Keylines and optical size

- **Circles are drawn larger than squares.** A circle of the same width has 78.5% of a square's area, so it looks smaller. Area matching gives Ø ≈ 112.8% of the square's side. Grids land at 108–114%: Material, Fluent and OpenAI 20/18 = 111%, Font Awesome 16/14, Polaris 14/13.
- **Rectangles.** The long side matches the circle (20); the short side drops to 16. The more elongated the shape, the more of the live area it may use.
- **Pointed and radiating shapes overshoot.** Stars, warning triangles, suns and sparkles extend 0.5–2 past the circle keyline: star about 21, warning about 21.5, sun about 22. Points carry little area.
- **Long thin shapes** (pencil, wrench, diagonal arrow) may run corner to corner inside the live area, and may enter the padding.
- **Squarish shapes with large flat areas** (image, document) take extra padding. They look heavier than a circle of the same box.
- **Keylines are guides, not cages.** Break one when recognition or balance requires it, and say which and why.

## Optical rules

- **Centroid centring.** Align triangles by centroid, not bounding box. A right-pointing play triangle of width w moves w/6 toward its tip; one 9px wide moves 1.5px. Stars and warning triangles move up about 0.8–0.9 at 24.
- **Asymmetric icons** (a magnifier, a bell with clapper) are centred by visual mass. Nudge in 0.25 or 0.5 steps, and compare stacked against the reference circle.
- **Odd versus even.** Sometimes a shape can't be both centred and on whole pixels, as with an odd-height body on an even canvas. Keep it snapped and let it sit half a pixel high. Never go half a pixel low: bottom-heavy reads as sinking.
- **Visual weight** comes from the number and spacing of strokes, not the stroke width. Three parallel lines 4 apart read heavier than an empty square. Fix weight by removing elements, never by changing the stroke.
- **Counters.** Any enclosed space smaller than one gap either becomes solid or is removed. A ring inside a ring needs at least stroke + gap + stroke between the outer edges.
- **Knock-outs** (light lines cut into a solid) read wider than drawn lines, because of irradiation. Draw them at stroke − 0.25: 1.75 at 24, 1.25 at 16. If the set already has filled icons, match its knock-out width instead.

## Gaps, junctions, overlaps

- **Gap minimum is the stroke width** (2 at 24). Test it: a circle of gap diameter fits between the inks without touching.
- **Where one object passes behind another,** cut the back object so a gap sits around the front one. Never let the lines cross. The visible gap is the same minimum.
- **T-junction:** the stem ends exactly on the other stroke's centre-line, and the round cap hides inside it.
- **Corner:** both segments belong to one subpath, so the join is real.
- **Arrowhead:** either one polyline (`M a L tip L b`) with the shaft ending exactly at the tip, or two paths that share the identical tip coordinate.

## Modifiers, badges, slashes

- **Slot.** A modifier (plus, minus, check, x, clock, alert) sits bottom-right, about Ø10 at 24 with its outer edge at 22,22. Cut the base glyph with a gap around it. The size and slot are identical across the whole family.
- **The base doesn't move.** A `-plus` or `-off` variant keeps the base glyph's coordinates exactly as in the plain icon. Swapping states must not jump.
- **Slash ("off").** Its ink spans the live area corner to corner: centre-line (3,3) → (21,21) at padding 2, or (2,2) → (22,22) in a padding-1 set like Lucide. Remove the base on one side of the slash with a gap (usually the lower-left side), so the slash reads in front.
- **Modifiers are reused,** never redrawn. Copy the coordinates from the first icon that defined them.

## Filled and duotone variants

- **Filled = the outline's outer silhouette, exactly.** For a centre-line radius r, the filled radius is r + stroke/2. Swapping outline and filled (inactive and active) never changes size.
- **Interior details become knock-outs** at stroke − 0.25. Build filled variants from 1–3 contiguous solid shapes.
- **Open-line icons** (arrows, chevrons, x, menu, check) have no filled form. Use the outline, or the stroke + 0.5 if a heavier selected state is required.
- **Recompose when a plain fill erases meaning.** For example, a filled house needs its door cut out, and a filled user needs a gap between head and shoulders kept as a knock-out.
- **Duotone.** A tint shape at 20% opacity sits under the regular outline. It is drawn to the stroke's centre-line, so its edge hides under the stroke, and covers only the object's body. Duotone is the one place opacity is allowed, and only when the set already ships duotone.
- **Usage, briefly** (the full rules belong to `icon-usage`): filled marks selected or active state and main navigation. It is never for emphasis or decoration.

## Family consistency checklist

Every icon in a family shares the following. Write any deviation down:

1. Canvas, padding, and the keyline table.
2. Stroke per size.
3. Caps, joins, and the radius system.
4. Gap minimum and the dot style.
5. Angle set.
6. Arrowhead geometry and modifier slot.
7. View: flat and front-facing.
8. Level of detail (similar ink density; the checker's density warning flags outliers).
9. Delivery format (live stroke or outlined fill).
10. Naming grammar: depicted object first, modifiers after, kebab-case.

## Metaphor guardrails

- **Universal icons are rare.** Only home, print, search (magnifier) and cart read without labels for most people. Everything else needs a label in the UI. Note that in the delivery; don't over-draw to compensate.
- **Keep the meaning you inherit.** Heart and star compete for favourite and save, and hamburger means menu. Use the meaning the set already gives an icon, never a second one.
- **Depict the actual object in its most common form.** Use an envelope, not a mailbox. Avoid model-specific devices.
- **Avoid icons that won't carry across cultures.** That means hands and gestures (thumbs-up, OK), checkmarks in contexts where a check means wrong, puns, and religious or political symbols.
- **Complexity costs recognition speed,** and practice doesn't remove that cost. Pick the simpler metaphor even when the richer one is more literal.
