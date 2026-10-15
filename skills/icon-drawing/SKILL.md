---
name: icon-drawing
description: Draw UI icons that read at a glance and belong to one family: metaphor choice, grid and keyline shapes, stroke weight per size, corners, gaps, optical sizing and centring, filled variants, small-size redraws, and clean SVG, built by coordinates and checked by rendering. It works the same in Figma, in Paper, or in code. Grounded in Material, SF Symbols, IBM Carbon, Fluent, Polaris and Spectrum, the Lucide, Phosphor, Tabler and Heroicons specs, measurements of OpenAI's product icons, Bjango's optical formulas, NN/g recognition research, and studies of how language models fail at drawing SVG. Use when drawing a new icon or an icon family, adding a missing icon to an existing set (Lucide, Phosphor, Heroicons, Material, or a custom set), making a filled/active variant or a 16/20px version, fixing an icon that looks off, too heavy, blurry, or not centred, or reviewing a set for consistency. Not for illustrations, logos, app icons, or how icons are placed and labelled in a layout. Triggers on: icon, icons, draw an icon, design an icon, icon set, icon family, icon library, glyph, pictogram, system icon, UI icon, SVG icon, custom icon, missing icon, match Lucide, match Phosphor, match Heroicons, outline icon, filled icon, solid icon, active state icon, icon stroke width, icon stroke weight, keyline, keyshape, icon grid, icon live area, icon padding, icon optical size, optically centred icon, icon visual weight, icon pixel snapping, blurry icon, icon corner radius, icon SVG path, Figma icon, icon outline stroke, icon looks off, icon too heavy, inconsistent icons.
---

# Icon Drawing

## Initial Response

When this skill is invoked without a specific request, respond only with:

> Name the icon you need, or show me the set it has to join. I'll plan it in coordinates, draw it, and render it next to its neighbours before calling it done.

Do not provide any other information until the user asks.

How a single UI icon gets drawn so it reads in one glance and sits in its family: choosing the metaphor, fixing the grid, planning geometry in numbers, drawing it, correcting it optically, and checking it numerically and visually. Sibling skills: `ux-writing` owns the label next to the icon; `icon-usage` (future) owns sizing icons beside text, icon-only buttons, and accessibility; `text-layout` owns the text around them. Illustrations, brand logos, and app icons are out of scope; their rules differ (perspective, colour, detail).

## Operating posture

You are an icon designer working without eyes. You cannot see path data: in benchmarks, models answer questions about SVG code far worse than about the same image rendered (about 55% against 84%), and drawing accuracy halves between 2 and 16 paths. So you reason in coordinates, keep parts few, and trust only two things: the numbers you computed and the render you looked at. The bar comes from the user's taste and is minimal: **one idea per icon, simple and good at one glance.** When two versions both read, ship the simpler one.

## Hard rules

1. **Write the plan before any SVG.** Metaphor, keyline, then every part with its numbers, the shared points, and the gaps. Explicit planning measurably improves drawn SVG; improvising coordinates inside the markup is where shapes drift and parts fail to meet.
2. **Match before you invent.** If the icon joins an existing set, measure that set first (see "Step 0") and copy its numbers. Never lay the default style over another set: an icon that is better than its neighbours but different from them is a defect.
3. **One stroke weight per size, with no exceptions inside a glyph.** Internal lines use the full stroke. If detail won't fit at that weight, remove the detail or make it solid. Mixed weights are the most visible sign of an inconsistent set. The only sanctioned weight change is a whole separate variant (the +0.5 "selected" version of an open-line icon, below), never a line within one icon.
4. **One idea, few parts.** A part is one primitive or one subpath (each `M`). 1–3 parts is the target; 6 is a hard cap, and the checker fails anything above it. Above it, simplify or pick another metaphor. Every extra part costs recognition at 16px and raises the drawing error rate. Remove any detail that doesn't change recognition.
5. **Geometry only.** No transforms, masks, clip paths, groups, filters, `<use>`, opacity, or ids. Make gaps and cut-outs by cutting the geometry. Masks and ids collide when icons are inlined, break `currentColor`, can't become fonts, and can't be checked numerically. One exception: the 20% tint layer of a duotone icon, and only when the set already ships duotone (CONSTRUCTION.md).
6. **Shared points use identical numbers.** A stroke that joins another ends exactly on its centre-line, with the same coordinates written in both places. A miss of 0.1 shows as a notch at 48px and fails the checks.
7. **Never call an icon done unrendered.** Run `check-icons.mjs` and look at the contact sheet at real size next to the neighbours. Don't trust self-review on its own: models routinely miss their own geometric mistakes, which is why both a numeric check and a visual check are required. If you cannot render, deliver it marked "not visually verified", never as finished.
8. **At most three revision passes, and each must change the render.** A revision that changes nothing visible is not a fix. Stop when the checks pass, not when the result feels done. If the third pass still fails, stop: deliver the best version with what still fails, and propose a simpler metaphor. A fourth pass at the same idea rarely converges.

## Step 0: establish the style card

Before drawing, write a style card. Every later number comes from it. The default style's card, as the template:

```
canvas 24 · stroke 2 (20: 1.75 · 16: 1.5) · caps/joins round · padding 2 (live area 20)
keylines: circle Ø20 · square 18 · portrait 16×20 · landscape 20×16
radius: containers outer 3 / inner 1 · shapes < 8px outer 2 · junctions sharp
gap ≥ 2 · dots solid Ø3 · arrowheads 90° chevron · angles 45°, then 30°/60°
modifier slot: bottom-right, Ø10, outer edge at 22,22 · names: object-modifier, kebab-case
delivery: live stroke (code) | outlined fill (font / filled variant)
```

First, does the icon already exist? Search the set and the library the project uses (names and tags). If it exists, use it: a second drawing of the same thing splits the family.

```
Does the icon join an existing set?
├── Yes, a known library (Lucide, Phosphor, Heroicons, Tabler, Material…)
│   → Use its published numbers (CONSTRUCTION.md → "Library cards"), then
│     confirm them against 3 real icons from that set (node_modules or the
│     project), and match its root markup and element rules exactly.
├── Yes, a custom set in the project
│   → Measure it: run check-icons.mjs on 5+ of its icons and read the stats
│     (stroke, caps, ink boxes); its warnings are judged against the default
│     style, so ignore them here. Read its circle- and square-based icons for
│     keylines, and rect rx for radii. Pass the set's padding as --padding
│     from now on. Write the card from the measurements. Where measurements
│     disagree, copy the majority and list the outliers to the user.
└── No set yet
    → Use the card above (CONSTRUCTION.md → "Default style", modelled on
      OpenAI's product icons). State that you're using it.
```

## Step 1: the metaphor

Most failed icons are the wrong idea, not a bad drawing. Walk this:

```
Is there an established icon for this concept (platform convention, the set
itself, the major libraries)?
├── Yes → Use that metaphor. Familiarity is most of recognition; a "better"
│         new symbol for search, home, settings, share, or close reads worse.
└── No
    ├── Is there a physical object people use for it?
    │   → Draw its most common, most culture-neutral form (envelope, not a
    │     postbox; a generic phone, not a specific model).
    ├── Is it an action on an existing object?
    │   → Base object + modifier (plus, slash, arrow, check) in the set's
    │     modifier slot. Don't invent a new silhouette.
    └── Is it abstract (a feature, a status)?
        → One basic shape plus at most one mark (a dot, a line, a modifier).
          Test: can you name the metaphor as one noun phrase a viewer would
          guess without a label ("a bell with a slash")? If not, it needs a
          label in the UI; tell the user so, don't add detail to compensate.
```

Then reject any candidate that relies on any of the following:
- **Text or letters.** They don't localise and blur at 16px. Only use them when the letter is the convention, such as B for bold.
- **Hand gestures, puns, or religious and political symbols.** Their meaning flips across cultures.
- **Hardware that dates fast.** Exception: keep it when it's already the set's convention (the floppy disk for save is still legitimate).
- **Perspective or 3/4 views.** System icons are flat and seen straight on.
- **More than three distinguishable features** at 16px (a calendar's body, header and rings are three).

## Step 2: plan in coordinates

Write the plan as a list before any markup:

```
icon: calendar · metaphor: established (page with rings) · keyline: portrait 18×20 · stroke 2 → centre-lines 1 inside the outer edge
1 rect  x4 y5 w16 h16 rx2      body; ink 3..21 × 4..22 (shifted down 1 to make room for rings)
2 path  M4 11 H20              header rule; ends exactly on the rect's side centre-lines
3 path  M8 3 V7 · M16 3 V7     rings cross the top edge; ink top = 2 = padding ✓
gaps: ring end 7 → rule 11 = 4 ≥ stroke 2 + gap 2 ✓ · ink box 18×20, centre (12,12) ✓
```

- **Keyline by silhouette.** Round → circle; boxy → square; tall → portrait; wide → landscape. Pointed and radiating shapes (star, warning, sun) overshoot the circle by 0.5–2. Long thin shapes (pencil, arrow) may run corner to corner.
- **Compute, don't eyeball.** Ink extends stroke/2 past every centre-line and past round caps. Two parallel strokes need centre-lines ≥ stroke + gap apart, which is 4 at 2/2. Points on circles, corner tangents and arc flags are in SVG.md → "Coordinate recipes".
- **Snap when free.** Outer edges go on whole pixels, so the centre-line = edge ± stroke/2: integers at stroke 2, .5 at 1, .75/.25 at 1.5, .875/.125 at 1.75. Never distort a shape to snap it: snapping matters on 1x screens and barely shows on 2x, while a distorted shape shows everywhere.
- **Plan for the boldest version.** If a filled variant or heavier weight will exist, leave the counters and padding it needs now.

## Step 3: draw

Write the SVG from the plan using the root template and allowed elements in SVG.md. Prefer primitives (`circle`, `rect` with `rx`, `line`) and simple absolute commands, unless the set you match forbids them (Tabler: paths only); use one subpath per continuous stroke so corners get real joins. Then follow the path for where the icon lives:

- **Code:** save `.svg` files or a component.
- **Figma:** build the SVG string, import it with `createNodeFromSvg`, and never assemble icons from rotated lines.
- **Paper:** inline the `<svg>` in a fixed 24×24 box.

Each workflow is in SVG.md.

## Step 4: optical pass

- **Weight.** Compare the icon against the reference circle and square in the blur row. The checker's density warning flags the same thing numerically. If it reads darker, remove detail. If it reads lighter, grow it to its full keyline. Never change the stroke to fix weight.
- **Centring.**
  - Symmetric icons are centred geometrically.
  - Triangles are centred on their centroid. A play triangle moves w/6 toward its tip; a star or warning triangle moves up about 0.8 at 24.
  - Badge variants keep the base glyph where the plain icon has it.
- **Small details.** An enclosed counter smaller than one gap becomes solid: a cramped counter closes into a blur at 16px anyway.

The numbers behind each of these are in CONSTRUCTION.md → "Optical rules".

## Step 5: verify (numbers, then eyes)

```bash
node <this skill's folder>/check-icons.mjs new-icon.svg neighbour1.svg neighbour2.svg --sheet sheet.html [--padding 1]
```

Pass `--padding` when the set's padding differs from 2 at 24 (Lucide uses 1).

1. **Fix every ERROR.** These are clipping, merged strokes, mixed weights, near-miss junctions and forbidden markup.
2. **Act on each WARN or justify it in one line.** These are padding intrusion, tight gaps, density outliers and precision.
3. **Render the sheet** in a browser, or screenshot the Figma or Paper node. Judge from a zoomed crop of the 16 and 24 rows, never a scaled-down full-page screenshot: downscaling hides exactly the blur and merging you're looking for.
4. **Name it cold.** If you can spawn a fresh agent, give it only a crop of the sheet's blind row (no names) and ask "what is this icon?". It has no knowledge of your intent; you do, and you can't unsee it. Only without a subagent, write what the 16px render shows before rereading your plan. If the name differs from the intent, the metaphor or the silhouette failed: go back to Step 1, not Step 4.
5. **Check it against the family.** In the blur row it is no darker and no lighter than the references; next to the reference circle it looks centred; on the dark row no gap visibly closes (light strokes on dark read heavier).

## Variants and sizes

```
Filled / active variant?
├── Outline has a closed body (bell, heart, folder, user)
│   → Fill the outline's OUTER silhouette exactly, so swapping states never
│     changes size. Interior lines become knock-outs, width = stroke − 0.25:
│     a light line cut into a dark mass reads wider than it is (irradiation).
│     1–3 solid shapes.
├── Outline is open lines (arrows, chevrons, x, menu)
│   → No filled form: filling lines produces nothing. Use the outline, or a
│     separate +0.5 heavier variant if a selected weight is required.
└── A knock-out would sit closer than one gap to the silhouette's edge
    → Drop that detail in the filled version; keep recognition.

Smaller size (16 or 20)?
├── Redraw from the master's skeleton with that size's stroke and keylines
│   (CONSTRUCTION.md → "Per-size table"). Never ship a scaled 24 as a 16
│   or 20 asset. If the stack can only scale one file, ship the 24 and say so.
└── For each detail: does its counter stay ≥ one gap at the new size?
    ├── Yes → keep it.
    └── No → merge it solid, drop a repeat (3 lines → 2), or remove it.
```

**Modifiers.** Badges such as plus, check or x go bottom-right, with a gap cut out of the base. One fixed slot keeps the base glyph's recognisable top and left intact, and lets the eye find the modifier in the same place on every icon. A slash runs top-left to bottom-right, and the base is cut beside it. The modifier's size and position stay identical across the whole family.

**Names** describe what is drawn, not the action (`floppy-disk`, not `save`): the same picture means different actions in different products. Kebab-case, base object first, modifiers after (`bell-off`, `folder-plus`).

## Checks before shipping

Step 5 passed in full, plus what it doesn't cover:

1. **Family:** the icon shares the style card's caps, joins, radius system, angle set, modifier slot and naming grammar with its neighbours (CONSTRUCTION.md → "Family consistency checklist").
2. **Variants:** a filled version matches the outline's outer silhouette; a smaller size was redrawn, not scaled.
3. **Root:** attributes match the template or the set's root exactly, colour is `currentColor`, numbers have at most 3 decimals.

## Invocation Variants

| Invocation | Behavior |
| --- | --- |
| `<concept or icon name>` | Style card → metaphor → plan → draw → verify; deliver the icon, then stop |
| `<icon names> for <set or file>` | Measure the set, then draw each icon to its card; one sheet with all new icons beside 4 existing ones |
| `new set: <list>` | Default style (or the brief's); draw the 2–3 hardest first, show them and wait for approval, then the rest on the same card. The hardest icons force the style decisions; locking them early saves redrawing the whole set |
| `<icon> + filled` / `+ 16` / `+ 20` | Derive the variant or size by the trees above |
| `review <icons or folder>` | Run the checks and the sheet, return the report below, then stop |
| `review … + fix` / `fix 1, 3` | Apply the fixes, re-run the checks, and show the before and after sheet |

## Required Output Format

**When drawing**, deliver:
- **The style card,** in one block.
- **Per icon:** the plan (the coordinates list), the final SVG, and the check result. One plan line per part.
- **The rendered sheet.** Show the screenshot, or state "not visually verified" with the reason.
- **Decisions for you:** metaphor alternatives or deviations from the set, one line each, with a recommendation.

**When reviewing:**

**Part 1: Findings.** One row per defect, worst first. Severity levels:
- **Broken:** unreadable at 16px, clipped, or wrong metaphor.
- **Off:** reads, but weight, size, centring, radius or stroke doesn't match the family.
- **Rough:** code hygiene (precision, stray attributes, a junction that's exact visually but not numerically).

| # | Severity | Icon | What renders | Cause | Fix |
| --- | --- | --- | --- | --- | --- |
| 1 | Off | `export` | Darker than neighbours in blur row | 3 parallel lines 1px apart | Drop to 2 lines, 4 apart |

**Part 2: Decisions for you.** Metaphor swaps, whether to redraw a size, or set-wide changes, each with a recommendation.

**Part 3: What held up.** The checks the set already passes.

## Going deeper

- Numbers and rules: the default style, the per-size table, library cards, keyline maths, optical rules, filled and duotone derivation, modifiers, angles, arrows, dots: [CONSTRUCTION.md](CONSTRUCTION.md)
- Execution: the SVG template, allowed elements, coordinate recipes, stroke arithmetic, knock-outs, the Figma, Paper and code workflows, SVGO settings, and exporting filled versions: [SVG.md](SVG.md)
- The checker: [check-icons.mjs](check-icons.mjs), with no dependencies. `--sheet` writes an HTML contact sheet: five sizes, a blur row, a dark row, and a 10× grid with the live area marked.
