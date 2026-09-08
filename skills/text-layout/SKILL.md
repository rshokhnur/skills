---
name: text-layout
description: Make text physically behave in UI — wrapping, line breaks, orphans, truncation, overflow, line length, and how text survives translation, RTL, and zoom. Grounded in CSS specs/MDN, Chrome and WebKit engine docs, Butterick, Rutter, NN/g, Baymard, WCAG, W3C i18n, and the design systems (Material, Apple, Polaris, Atlassian). Use when text overflows or gets cut off, an ellipsis or line-clamp won't work, a long URL or ID blows out a card, a heading strands one word on its own line, choosing between wrapping and truncating, setting line length or text alignment, gluing pairs like "3 MB" together, or making text layout survive localization and 200% zoom. Not for wording (ux-writing) or typefaces/scale (typography). Triggers on — text overflow, cut off, truncate, truncation, ellipsis, line-clamp, -webkit-line-clamp, text-overflow, text-wrap, balance, pretty, orphan, widow, lone word on last line, word-break, overflow-wrap, break-word, break-all, long URL breaks layout, min-width 0, hyphens, hyphenation, white-space, nowrap, non-breaking space, nbsp, line length, measure, 66ch, max-width for text, centered text, justified text, rag, RTL, bidi, dir auto, CJK, text expansion, translation overflow, reflow, 320px, 200% zoom, "ellipsis not working", "text overflows the card".
---

# Text Layout

How text physically sits in an interface: where it wraps, when it breaks, what gets cut, and how it survives narrow screens, long translations, and zoom. Sibling skills: `ux-writing` owns what the words say; `typography` (future) owns typefaces and scale. This skill owns the space between — the layer where good copy ships broken.

## Operating posture

You are a design engineer who owns the text layer, not just the CSS around it. Diagnose before you patch: most text-layout bugs are misdiagnosed — a "truncation bug" is usually a container refusing to shrink. Make the call, apply the fix, state why in one line. The bar: the text survives 320px, 200% zoom, a 2× translation, and RTL without a follow-up ticket.

## Hard rules

1. **Walk the decision tree before touching a property.** Naming the failure correctly is the whole job; the CSS is usually one line.
2. **Container before text.** A long string blowing out a card is `min-width: 0` / `minmax(0, 1fr)` / `table-layout: fixed` first. `overflow-wrap: break-word` alone can't lower min-content size, so it silently does nothing there.
3. **Truncation is last, and never without a reveal path.** Rewrite shorter or wrap first. If anything is cut, an on-page way to the full text is mandatory — cutting without one is a WCAG failure, not a style choice.
4. **Never hand-place `<br>` or `&nbsp;` in stored content.** Breaking is a render-time decision: a hard break correct at one width is wrong at every other, and it gets baked into translations.
5. **Buttons never wrap and never truncate.** Fix the label, never the font size.
6. **Every glue gets a release valve.** A nowrap/nbsp pair is an unbreakable token; without a narrow-screen escape it trades a cosmetic flaw for a layout break.

## The baseline — apply to every project

```css
h1, h2, h3, h4 { text-wrap: balance; }   /* headings: even line lengths, no orphans */
p, li, figcaption, blockquote { text-wrap: pretty; } /* body: no lone last word */
```

Safe progressive enhancement: unsupported engines just wrap normally. Plus two non-CSS defaults: a correct `lang` attribute on `<html>` (hyphenation, quotes, and font selection silently depend on it — `hyphens: auto` is a spec-sanctioned no-op without it), and no `user-scalable=no` / `maximum-scale` in the viewport meta (blocking zoom is a WCAG failure).

## Decision tree — "the text doesn't fit"

Walk this before touching any property; most text-layout bugs are misdiagnosed at this step:

```
What exactly is failing?
├── A long unbreakable string (URL, email, ID) blows out the layout
│   → It's a CONTAINER problem before a text problem. In this order:
│     flex item → min-width: 0 · grid track → minmax(0, 1fr) ·
│     table → table-layout: fixed. THEN overflow-wrap: anywhere on the text.
│     (break-word alone can't fix these: it doesn't lower min-content size,
│     so the box never gets permission to shrink.)
├── Content must fit N lines (card, list row, table cell)
│   → First ask: can it wrap instead? (bigger variant, restack, shorten copy)
│     Only then the truncation ladder below.
├── A heading wraps with one stranded word, or an ugly rag
│   → Orphan ladder below (balance / pretty / glue / reword).
├── A pair splits across lines ("3 | MB", "Jan | 24")
│   → Glue below.
├── A text column beside a nowrap or fixed-width sibling collapses
│   into 1–3-word lines
│   → The SIBLING is hogging the width. Let it wrap or shrink
│     (drop its nowrap, flex: 0 1 auto), or stack the row under a
│     narrow breakpoint — before touching the text. Then
│     text-wrap: pretty on the column.
└── It fit in English but breaks in German / at 320px / at 200% zoom
    → Stress rules below. The layout was overfit to one language and
      one zoom level — fix the container, don't shorten the copy.
```

## Wrapping and orphans

- **`balance` is a headings-only tool by construction.** Engines cap it (Chromium ~4–6 lines, Firefox 10) and it silently no-ops past the cap — so applying it to body text does nothing but cost layout passes. It also never narrows the element's box: the text block tightens, the empty space stays, so cards keep their width.
- **`pretty` is the body-text orphan fix, with per-engine meaning:** Chromium only rescues the last four lines from a short last line; Safari re-optimizes the whole paragraph's rag and hyphenation. Both are what you want; cost scales with element length, so it's fine as a default.
- **The shared-longhand trap:** `white-space` and `text-wrap` both set `text-wrap-mode`. `white-space: nowrap` silently kills an inherited `balance`; `text-wrap: balance` silently re-enables wrapping on something you'd pinned with `nowrap`. When a wrap setting "mysteriously doesn't apply," look for the other property.
- **Orphan escalation ladder** — in order, stop at the first that works:
  1. `text-wrap: pretty` (body) / `balance` (headings) — zero markup, survives resizing and translation.
  2. A `white-space: nowrap` span around the pair you must keep together — **with a release valve**: un-nowrap it under a narrow-viewport media query, because any glue is an unbreakable token that will force overflow on small screens instead of wrapping.
  3. Reword the line — the writer's fix, and often the best one.
- **Never hand-place `<br>` or `&nbsp;` inside stored content.** Line breaking is a rendering decision: a hard break that looks right at one width is wrong at every other width, leaks into feeds and share tools as literal entities, and gets baked into translations. Widow control happens at render time (CSS, or an output filter), never in the content itself.
- **CSS `orphans`/`widows` properties are not this.** They count lines across page/column breaks — print and multicol only, no effect in normal screen layout. Reaching for them to fix a headline orphan is a category error.

## Glue — pairs that must not split

Glue by default: number + unit ("3 MB", "10 min"), number + counted noun ("page 7"), date parts ("Jan 24"), amount + currency, honorific + name, §/Fig./Ex. + reference, hyphenated codes ("I-94"), and label + value pairs in inline lists ("Sleep 7h 20m · Steps 8,200" — each pair is one token). Unicode's own line-breaking rules protect "1,234.56" and "$100" — but **not** number + unit; that glue is on you.

Mechanism, in order of preference:

1. **`white-space: nowrap` span** — searchable, copy-safe, font-safe, and switchable off at narrow widths. Use wherever you control markup.
2. **`&nbsp;`** — only in generated/plain-text pipelines where markup can't reach. Never runs of them for spacing.
3. **U+2011 non-breaking hyphen — know the cost:** it breaks find-in-page and search ("I-94" won't match "I‑94"), fails in many fonts, and corrupts data contexts. Wikipedia's own guideline prefers nowrap markup around a regular hyphen; so do we.

Every glue is an overflow bet: glue short pairs only, and give anything glued a narrow-screen release.

## Truncation — a last resort with rules

The design systems are unanimous: **rewrite shorter or wrap first; truncate only when space is genuinely fixed.** And truncation without a reveal path is not a style choice — it's a WCAG failure (1.4.10/1.4.4): if anything is cut, an on-page way to the full content must exist.

**Never truncate:**
- **Button labels** — never wrap, never truncate; the container fits the label, not vice versa (1–3 words makes this possible).
- **Page/app-bar titles** — shorten the copy or use a taller variant that wraps to ≤2 lines.
- **Table rows that share a prefix** — truncation deletes exactly the differentiating tail, making rows identical; tables wrap instead.
- **Across focusable elements**, ever.

**When forced, pick by content type:**
- Single line of prose → `text-overflow: ellipsis` (requires `overflow: hidden` + `white-space: nowrap` — the marker draws only when all three are present).
- Multi-line prose → `line-clamp` recipe (needs `overflow: hidden` or clipped lines leak below; padding on the clamped box also leaks them).
- Filenames, IDs, addresses → **middle truncation**: the distinguishing part is usually the end ("…-v2.pdf"); JS measurement, not CSS (CSS has no middle ellipsis).
- Long expandable prose → **fade-out + expand control**: Baymard found users mistake truncated content for complete content and abandon — a fade signals continuation better than an ellipsis. Show the fade only on true overflow; the expand control must look like a control and sit directly below.

**Short strings wrap, they don't truncate.** A command, email, or ID under ~40 characters wraps to two lines at narrow widths (`overflow-wrap: anywhere`) instead of ending in "…" — a cut command is unusable, a wrapped one is still readable and copyable. A copy-to-clipboard button is not a reveal path: it's invisible to a sighted reader.

**Accessibility of the cut:** the `title` attribute is never the reveal mechanism — invisible to keyboard, touch, and voice. CSS truncation leaves the full text in the DOM (screen readers read it all), so the reveal is for sighted users: a disclosure/expand beats a tooltip. In RTL or mixed-direction text, set `dir="auto"` / wrap user content in `<bdi>` or the ellipsis renders on the wrong side.

## Horizontal scrollers — chips, tabs, carousels

An overflowing strip must signal that it continues: a trailing fade mask (`mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent)`), or the next item visibly peeking, plus end padding so the last item can scroll fully into view. Never a hard cut mid-word at the viewport edge — users read a cut chip as truncation or a bug and stop (Baymard: cut content reads as complete or broken). Hiding the scrollbar is fine only when a fade replaces the signal it removed.

## Line length and alignment

- **Measure: 45–75 characters per line, tuned for comprehension, not speed.** The research nuance: long lines (~100 cpl) actually read *faster* on screens, but comprehension and comfort peak near 55 — and in products, comfort wins. Design systems agree on the band (Material 40–60, Atlassian 60–80; up to ~120 only with increased line-height).
- **Cap the measure in `rem`, not `ch`.** `1ch` is the width of the digit "0", so `max-width: 66ch` is false precision that swings wildly across fonts. `max-inline-size: 30–40rem` is honest and RTL-safe.
- **Center only display text of ~one line.** The left edge is the scanning rail (eyetracking: users lock onto first words down the left); every line of centered multi-line text makes the reader hunt for the next line's start. Body, lists, and forms: left-aligned (logical `start`), always.
- **Never justify text on the web.** Browser justification has no real hyphenation control, so it produces rivers of white space. Ragged-right is correct.
- **Tables:** numeric columns right-aligned, text left-aligned, never centered; units live in the header, not repeated per cell.

## Stress rules — translation, zoom, direction

Text layout isn't done when it fits your language at your zoom level:

- **Budget for expansion both ways.** Short English strings grow 2–3× translated (≤10 chars: 200–300%; the word "views": Italian 3.0×) while CJK *shrinks* (~0.8×) — the same component must survive overflow and underflow. Never fixed-height text containers, never exact-fit boxes.
- **The two mandatory stress tests (WCAG):** 320 CSS px width with no horizontal scroll and nothing silently dropped; 200% text size with no clipping or overlap at any step. Fixed heights and viewport-unit font sizes are the canonical failures.
- **Direction:** use logical properties (`text-align: start`, `margin-inline`, `padding-inline`) so RTL mirrors free; `dir="auto"`/`<bdi>` around user-generated strings; templates mixing RTL text with numbers misorder without them.
- **CJK floors:** ideographs need ~2× the pixel detail of Latin — 12px minimum body, line-height ~1.7, no italics, no ALL-CAPS equivalents; `word-break: keep-all` is for Korean only (it makes Chinese and Japanese unbreakable).
- **Hyphenation:** `hyphens: auto` only for narrow columns and long-compound languages (German), requires the correct `lang`, off in headlines, never in CJK.

## Checks before shipping

1. **320px + 400% zoom pass:** no horizontal scroll, nothing unreachable.
2. **200% text-size pass:** nothing clipped, nothing overlapping.
3. **Hostile-string paste:** a 40-character unbroken ID and a long URL into every text slot — cards, table cells, toasts. Nothing blows out.
4. **2× length test:** double the words in labels and headings (fake German). Layout holds.
5. **Orphan sweep:** view headings at three widths; no lone last words.
6. **`dir="rtl"` smoke test:** ellipses, alignment, and icons land on the correct side.
7. **Find-in-page still works** on glued text (no U+2011 where a nowrap span would do).
8. **Fixed chrome covers nothing:** docks, bars, and floating controls never sit on the last line of content — every route (404 and error included) reserves bottom padding ≥ the element's height plus the safe area.

## Going deeper

- Copy-paste implementations — truncation recipes, clamp gotchas, middle-truncation, fade + expand, min-width fixes, responsive glue, hyphenation setup: [CSS-RECIPES.md](CSS-RECIPES.md)
- The evidence and per-system rules — design-system truncation matrix, WCAG requirements in full, line-length research, i18n tables: [GUIDELINES.md](GUIDELINES.md)
