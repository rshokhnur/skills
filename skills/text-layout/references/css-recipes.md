# CSS recipes — copy-paste implementations

Verified patterns with their gotchas attached. Sources: MDN, CSSWG, Chrome/WebKit engine docs, Comeau, Shadeed, CSS-Tricks, Working Concept. Full extractions in `../research/sources/`.

## The baseline reset

```css
html { hanging-punctuation: first last; } /* Safari only; harmless elsewhere */
h1, h2, h3, h4 { text-wrap: balance; }
p, li, figcaption, blockquote { text-wrap: pretty; }
```

- `balance`: evens all lines. Chromium caps at ~4–6 lines, Firefox at 10 — past the cap it silently no-ops. Never global: it costs extra layout passes and does nothing on long text. It does NOT narrow the box — the text tightens, the container keeps its width.
- `pretty`: Chromium fixes short last lines (last 4 lines only); WebKit re-optimizes the whole paragraph (rag + hyphen ladders). Cost scales with element length, not element count — safe as a body default.
- Longhand trap: both `white-space` and `text-wrap` set `text-wrap-mode`. Setting one shorthand resets the shared longhand — `white-space: nowrap` kills balance; `text-wrap: balance` re-enables wrapping over an inherited nowrap.

## Single-line truncation — the trio

```css
.truncate {
  overflow: hidden;
  white-space: nowrap;   /* modern: text-wrap-mode: nowrap */
  text-overflow: ellipsis;
}
```

- All three or nothing: `text-overflow` doesn't force overflow — it only styles overflow that `hidden` + `nowrap` create. If there's no room for even the marker, the marker itself clips.
- RTL: the ellipsis renders on the line's overflow side automatically, but mixed-direction strings need `dir="auto"` on the element or the marker lands on the wrong side.

## Multi-line clamp

```css
.clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;   /* standardized `line-clamp` not yet Baseline */
  overflow: hidden;
}
```

Gotchas, each verified:
- **`overflow: hidden` is mandatory** — without it the ellipsis still draws but the "clipped" lines remain visible below.
- **Padding leaks clipped lines**: padding-bottom on the clamped box creates a window showing the next line. Pad a wrapper, not the clamped element.
- Screen readers still read the full text (it's in the DOM) — clamping is visual only; that's a feature, keep it that way.
- `text-overflow` has no multi-line or middle mode; clamp is the only CSS multi-line cut.

## The truncation-isn't-working checklist

Truncation CSS is correct but nothing truncates → the ancestor is refusing to shrink:

```css
.flex-item  { min-width: 0; }              /* flex: min-width:auto ≥ content */
.grid       { grid-template-columns: minmax(0, 1fr) auto; } /* 1fr = minmax(auto,1fr) */
table       { table-layout: fixed; width: 100%; }
```

`overflow-wrap: break-word` cannot fix these — it doesn't lower min-content size, so the container never gets permission to shrink. `overflow-wrap: anywhere` does lower it; the min-width releases above are still the primary fix.

## Long unbreakable strings (URLs, IDs, user input)

```css
.user-text { overflow-wrap: anywhere; }  /* or break-word + the min-width fixes */
```

- `break-word` vs `anywhere`: identical wrapping, different min-content — only `anywhere` lets boxes size below the longest word.
- `word-break: break-all` is NOT for this: it breaks *every* word, including short ones, mid-word. Reserve for CJK-adjacent edge cases; `word-break: break-word` is deprecated.
- Targeted break opportunities instead of blanket breaking: `<wbr>` (bare break point, bidi-neutral — put before punctuation in long URLs) and `&shy;` (breaks with a hyphen when needed).

## Middle truncation (filenames, addresses, hashes)

CSS has no middle ellipsis. Two approaches:

1. **JS measurement (correct):** keep the string's start and end, cut the middle to fit, re-run on resize (ResizeObserver). Slice on grapheme boundaries (`Intl.Segmenter`), not code units — naive `slice()` corrupts emoji/combining marks.
2. **The two-span CSS trick (fragile):** first span truncates normally, second span holds the tail with `direction: rtl` to clip from the left. Known bidi hazard: RTL direction on a span reorders neutral characters (dashes, dots) in the tail — test with real filenames; prefer the JS route for anything user-generated.

## Fade-out + expand (long prose)

```css
.fade { position: relative; max-height: 8lh; overflow: hidden; }
.fade::after {
  content: ""; position: absolute; inset-block-end: 0; inline-size: 100%;
  block-size: 2lh; background: linear-gradient(transparent, var(--bg));
}
```

- Show the fade **only on true overflow**: compare `scrollHeight > clientHeight` and toggle a class — a fade on non-overflowing text implies missing content that isn't there.
- The expand control ("Show more") sits directly below, styled as a real control. Never hide a single line behind a one-line button.
- The gradient must use the actual background token — a hardcoded white fade breaks in dark mode.

## Glue

```html
<span class="nowrap">3 MB</span> · <span class="nowrap">I-94</span>
```

```css
.nowrap { white-space: nowrap; }
@media (max-width: 24rem) { .nowrap { white-space: normal; } } /* release valve */
```

- Prefer the span: searchable, copy-safe, font-safe, and switch-off-able. `&nbsp;` only where markup can't reach; U+2011 non-breaking hyphen breaks find-in-page and many fonts — avoid.
- The release valve matters: every glue is an unbreakable token; on narrow screens an unconditional glue forces overflow instead of wrapping (the responsive-widon't lesson).
- Character reference when entities are unavoidable: U+00A0 nbsp · U+202F narrow no-break (SI number spacing) · U+2060 word joiner (zero-width glue) · U+2212 real minus (never a hyphen as minus).

## Orphan control beyond the baseline

Escalation when `pretty`/`balance` aren't available or a *specific* pair must hold:

```html
<h2>Ship the quarterly <span class="nowrap">report today</span></h2>
```

- Render-time only — never store `&nbsp;`/`<br>` in content (leaks into feeds/share/translations; a break correct at one width is wrong at all others).
- Server/build-side "widon't" filters (glue last two words of titles) are acceptable **only** with the media-query release and entity-free output (swap the nbsp for a nowrap span at render).
- Legacy JS widon't: guard against single-word strings and never use `.text()`-based rewriting — it flattens inline markup (links, `<em>`) inside the heading.

## Hyphenation setup

```html
<html lang="de">
```
```css
.narrow-column { hyphens: auto; hyphenate-limit-chars: 6 3 3; } /* limit-chars: Chromium */
```

- No correct `lang`, no hyphenation — engines are allowed to skip it entirely, and dictionaries are per-language (they can even change spelling: Dutch café → café-tje forms, Hungarian összeg → ösz-szeg).
- Scope it: narrow columns and long-compound languages. Headlines: `hyphens: none`. CJK: never.
- Manual override for a single stubborn word: `&shy;` at permitted break points.

## Direction-safe text layout

```css
.text { text-align: start; margin-inline: auto; padding-inline: 1rem; }
```

- Logical properties + `start`/`end` make RTL mirroring free; physical `left/right` values are per-direction bugs waiting.
- User-generated strings in templates: `<bdi>{username}</bdi>` (or `dir="auto"`) — otherwise RTL names reorder surrounding numbers and punctuation ("{name} - 42" misorders).
- Truncation direction follows content direction only when direction metadata is correct — the wrong-side-ellipsis bug is a missing `dir`, not a CSS bug.
