# Guidelines & evidence — design systems, WCAG, research, i18n

The rules' provenance and the per-system positions, for when a decision needs backing or a platform overrides the default. Full source extractions live in the source repo at `research/text-layout/sources/` (github.com/rshokhnur/skills) — not shipped with the skill.

## Design-system truncation matrix

| Surface | Material 3 | Apple HIG | Polaris | Atlassian |
|---|---|---|---|---|
| Button label | Never wrap, never truncate; 1 line, 1–3 words; container fits label | Prefer fitting; shorten copy | Verb+noun short labels (content side) | Icon-button labels: tooltip exception |
| Page / app-bar title | Don't truncate; long title → taller variant, wrap ≤2 lines (small bar: 1 line only) | Grow lines / restack / drop columns before ellipsizing | Don't truncate page titles — describe in fewer words | "Never truncate text" (headline rule) |
| List label / supporting text | May wrap or truncate; supporting text 1–3 lines | Ellipsis reserved semantically for "needs more input" (menus) | Keep the distinguishing part — often middle-truncate | User-generated content of unknown length = the sanctioned exception; `maxLines` 1–3 |
| Table cells | — | — | **Wrap, don't truncate** — same-prefix rows become identical when cut | Provide expand/tooltip to full text when truncation is unavoidable |
| Filter pills / summaries | — | — | Middle-truncate so first AND last values stay visible ("Paid, par… unpaid") | — |

Shared spine across all four: shorten or wrap first; truncation is last; whatever survives must be the distinguishing part; a reveal path is mandatory. Divergence worth knowing: Polaris optimizes *which part survives* (middle truncation doctrine); Atlassian optimizes *recovery* (expand + tooltip) and formatting (single-character ellipsis, flush against the last visible character: "Work in pro…").

Toggle-button nuance (M3): labels that change between states keep similar character counts — a label that grows on toggle shifts the whole layout.

## WCAG — where text layout becomes compliance

**SC 1.4.10 Reflow (AA):** content works at **320 CSS px width** (= 1280px window at 400% zoom) with vertical-only scrolling and nothing lost. Failure F102 = content that disappears or becomes unreachable when reflowed. Truncating/hiding at small widths is legal **only** with an on-page path to the full content (show-more, accordion, link to full view). Long URLs/strings must wrap (technique C33). Data tables may scroll as a unit, but prose inside cells still reflows. Sticky elements should un-fix at small widths (they eat reading space under zoom).

**SC 1.4.4 Resize Text (AA):** text reaches **200% at every increment** without clipping, overlap, or loss. Canonical failures: **F69** (fixed-height/width containers clipping enlarged text), **F80** (form controls that don't grow), **F94** (viewport-unit font sizes, which defeat zoom). Blocking pinch zoom (`user-scalable=no`) fails related SCs. Truncation at 200% passes only when the full content is reachable by focus or activation.

Distilled: every text container must survive two stress tests — 320px width and 200% text — and the fix is structural (no fixed heights, em/rem-sized or free-growing boxes), not copy-side.

AAA cousin for context (1.4.8): ≤80 chars per line (40 CJK), no justified text required, 200% without horizontal scroll — stricter, optional, but the same direction as this skill's defaults.

## Line length — what the research actually says

- **Speed vs comprehension split** (Dyson & Kipping 1998; Dyson & Haselgrove 2001): ~100 cpl lines are read *faster* on screens, but comprehension and subjective ease peak near ~55 cpl. The 45–75 band is a comprehension/comfort optimum — cite it as that, not as a reading-speed fact.
- Users *judge* ~55 cpl easiest even when longer lines measure faster — in products, perceived effort wins (people leave before they slow down).
- **Per-system numbers:** Material 40–60 (to 120 max with increased line-height, and their named failure mode is scaling a container without adjusting text width); Atlassian 60–80 (~10–12 English words); Butterick 45–90 (2–3 alphabets); GOV.UK caps measure structurally (two-thirds column even without a sidebar).
- **`ch` is false precision:** `1ch` = the width of "0" in the current font — `66ch` ranges from ~45 to ~80 actual characters across fonts. Cap prose in rem (`max-inline-size: 30–40rem`) or with layout columns.
- Long-line remedies in order: cap the text block's width, raise line-height (only up to ~120 cpl), or go multi-column — never letter-space body text to fill width.

## Alignment evidence

- **Left edge is the scanning rail:** F-pattern and list-scanning eyetracking show fixation on the first 1–2 words down the left edge. Multi-line centered text forces a hunt for every line start — centering is for ~1-line display text (hero titles, empty-state one-liners) only.
- Baymard (e-commerce lists): truncated product titles force per-item clicks to compare (abandonment risk); mobile titles past 3–4 wrapped lines stop being scanned as titles. Wrap to a limit, keep the distinguishing half.
- **Justified text on the web:** without robust hyphenation control, justification produces rivers; every guide that takes a position says ragged-right. Justification is acceptable only in print-like contexts with real hyphenation (lang set, `hyphens: auto`, narrow measure) — and still never for UI strings.
- Tables: numeric right / text left / never center; headers align with their data; units in the header once, not per cell.

## International text behavior — the numbers

**Expansion (IBM via W3C), English → European languages, by source-string length:**

| English length | Expect |
|---|---|
| ≤10 chars | 200–300% |
| 11–20 | 180–200% |
| 21–30 | 160–180% |
| 31–50 | 140–160% |
| 70+ | ~130% |

Real case: "views" → German 2.8×, Italian 3.0×. Meanwhile CJK translations typically *shrink* (Korean ~0.8×) — layouts must tolerate both directions. Consequences: no exact-fit text boxes, no fixed heights, test at 2× string length.

**Script-specific line breaking:**
- CJK breaks between characters with kinsoku rules (certain characters can't start/end lines); `word-break: keep-all` is for **Korean** (spaces between words exist) — applied to Chinese/Japanese it forbids breaking entirely.
- Thai/Lao/Khmer wrap without spaces (dictionary-based) — never assume space-delimited words in truncation logic.
- German compounds and Finnish agglutinatives are where `hyphens: auto` (with `lang`) earns its keep.
- CJK legibility: an ideograph carries ~2× the stroke detail of a Latin glyph — 12px body minimum, line-height ~1.7, no italics (synthetic slant mangles ideographs), no letter-spacing tricks.

**Bidi essentials:**
- Digits are direction-weak: they attach to an adjacent RTL run, so "{rtl-name} - 42" templates misorder. Isolate user content: `<bdi>` or `dir="auto"`.
- Ellipsis position follows resolved direction — the "ellipsis on the wrong side" bug is missing direction metadata, not broken CSS.
- Non-tailorable Unicode ground truth (reliable everywhere): NBSP, word joiner, and ZWSP behave identically in every engine; `word-break`/`line-break` are engine-dependent tailorings. UAX #14 self-protects numeric tokens ("1,234.56", "$100") but **not** number+unit — that's why "3 MB" needs explicit glue.

## Known open questions (kept honest)

- Chromium's `balance` line cap: WebKit's blog says 4, Chrome docs say 6 — unresolved; the skill's wording ("~4–6") depends on neither.
- Skeleton "feels faster" claims rest on one small study; treat skeleton-vs-spinner as layout guidance (full-page vs module), not proven perception gains.
- Standardized `line-clamp` (unprefixed) is not Baseline yet; ship the `-webkit-` recipe.
