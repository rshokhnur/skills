# Test #1 for icon-drawing: a parenting app's home screen, in Figma

- **Date:** 2026-10-15
- **Skill tested:** `icon-drawing`, as pushed in ae14928
- **Run by:** the user, in Figma, through Claude with the skill loaded
- **Subject:** 8 icons at 24px for a mobile app's home screen: five tab-bar items (today, diary, month, ask, add) and three tracking types (feeding, sleep, nappy). Separate 20px drawings of the three tracking types were made for chips.
- **Baseline:** the same set drawn by eye in three earlier rounds without the skill. The best of those, "option B", is used for comparison.

## Verdict

The skill did what three rounds without it could not: it produced a set that sits right next to the UI text and the native system glyphs. Recognition was never the main problem, since both sets were named 8 of 8 in a blind test. The gain was in construction. The checker found 2 errors and 5 warnings in the old set and no errors in the new one. The per-size stroke table fixed the "icons look faint" complaint.

Two things cost real time. One icon (the bottle) needed all three allowed passes, and the checker raised warnings that had to be argued away.

| | Before (option B) | After (skill) |
| --- | --- | --- |
| Checker errors | 2 | 0 |
| Checker warnings | 5 | 3 (2 false alarms) |
| Stroke | 1.75px at every size | 2px at 24, 1.75px at 20 |
| Blind naming | 8/8 (6 high confidence, 2 medium) | 8/8 (7 high, 1 medium) |
| Revision passes | none (drawn by eye) | 1 per icon, 3 for the bottle |

## What worked

1. **The per-size stroke table.** Moving from a flat 1.75px to 2px at 24 and 1.75px at 20 fixed the weight mismatch with the medium-weight UI labels and the system glyphs. This was the main reason earlier rounds were rejected, and optical balancing alone had never fixed it.
2. **Planning in coordinates with shared points.** The new set had no junction errors. In the old set, a bottle's ring and body sat 0.03px apart; the checker caught it as a merge, and it was invisible by eye.
3. **Blind naming.** This was the most useful check in the skill. It caught the bottle reading as "a battery or jar" after the checker had already passed it.
4. **Redrawing at 20 instead of scaling.** The rule "drop a repeat when the gap gets too small" turned the bottle's two tick marks into one at 20px. That was the right call, and it wouldn't have been made without the size tree.
5. **The three-pass limit.** It forced a real change of shape on each pass instead of nudging numbers.

## Where it failed or needed manual work

1. **Look-alike silhouettes.** The bottle took three passes, and the second made it worse. Pass 1 read as a battery (a centred mark on a capsule). Pass 2 widened the ring and read as a bin (a lid wider than the body). Pass 3 worked: a nipple, a ring narrower than the body, and tick marks on one side. Nothing in the skill warned about confusable silhouettes, so each fix traded one confusion for another.
2. **The 6-part cap blocked a sun.** A sun with 8 rays is 9 parts, so it failed as an ERROR. The "today" icon had to become a calendar, which changes the meaning, not just the drawing. Radiating icons are a convention (sun, brightness, sparkle, loading).
3. **Gaps to filled shapes were measured as if stroked.** A solid crescent (`fill="currentColor" stroke="none"`) inside a speech bubble was reported as a 1px gap. The real gap is 2px.
4. **Gap warnings fired across a third part.** The bottle's nipple and body were reported as "1px apart", but the ring sits between them. There is no open counter there.
5. **The plus always read as "too light".** A two-line glyph never carries the median ink of a set of closed shapes. The warning fired on both sets and changed nothing.
6. **The contact sheet couldn't be viewed.** `--sheet` writes a local HTML file, and the in-app browser wouldn't render local files. The sheet was rebuilt by hand in Figma.
7. **Metaphors collided with system conventions.** A half-filled circle (for "month") read as a contrast or theme toggle. A small moon inside a speech bubble was read only at medium confidence.
8. **Figma drops `currentColor`.** `createNodeFromSvg` ignores it, so colours were replaced with `#000` before import and bound to variables afterwards.

## Refinements made to the skill (generic rules only)

| # | Finding | Change |
| --- | --- | --- |
| 1 | Look-alikes traded on each pass | SKILL.md Step 1: a confusables check (two closest look-alikes plus the separating feature, and "does this shape already mean something in system UI?"), re-run on every pass. CONSTRUCTION.md: a "Confusables" table, seeded with the pairs this test found |
| 2 | The sun blocked by the cap | Rule 4 and the checker: identical repeats (rays, ticks, dots) count as one part, up to 8 |
| 3 | Gaps to solid shapes | Checker: the ink edge of a `stroke="none"` element is the path itself; parts inside a solid shape aren't gap-checked |
| 4 | Gaps across a third part | Checker: skip the gap check when the midpoint of the closest pair lies inside a third part's ink |
| 5 | Plus "too light" | Checker: open-line glyphs (no closed subpath) are only compared for density with each other |
| 6 | Sheet not viewable | Checker: a new `--sheet-svg` option writes one SVG to import into Figma or Paper. SKILL.md Step 5 documents this and the localhost route for the HTML sheet |
| 7 | Taken metaphors | Covered by the confusables check in #1 |
| 8 | Figma drops `currentColor` | SVG.md Figma workflow: replace it with `#000` before import, then bind variables |
| + | Blind naming passed while the bottle lost to its neighbour | SKILL.md Step 5.4: name the icon twice, once blind and once next to its closest look-alike |

Also: identical findings on repeated parts are now reported once ("same on 8 repeated parts"), and a part that touches another is no longer flagged as a near-miss junction.

## Not exercised yet

Filled variants, 16px sizes, modifiers and badges, and the `review` mode. The next batch of icons (wet, dirty, timer, edit, delete) will test the filled and modifier rules.

---

# Test #1, part 2: filled variants

Run the same afternoon: filled versions of seven of the 24px icons (all except the add icon), and of the three tracking icons at 20px. After that, a new line icon for "month".

## Verdict

Filled went faster and cleaner than line. The checker reported no errors and no warnings on all ten filled icons on the first pass. A fresh agent named all seven blind, five at high confidence. The main rule did most of the work: a filled icon is the line icon's outer silhouette exactly, and inner lines become cut-outs 0.25 thinner than the stroke. The weak spots were the same two moon metaphors as in the line set, plus a case the skill didn't cover at all: a line icon that already reads as filled.

| | Line set | Filled set |
| --- | --- | --- |
| Checker errors / warnings | 0 / 3 | 0 / 0 |
| Blind naming | 8/8, 7 high | 7/7, 5 high |
| Revision passes | 3 for the bottle | 1 each |

## What worked

1. **Filled = the line icon's outer silhouette, exactly.** Switching between selected and unselected never changes size or position, and nobody has to check that by eye.
2. **Cut-outs at stroke − 0.25.** At 1.75 (24) and 1.5 (20), the cut-outs read as the same weight as the lines in the line set. The irradiation rationale held.
3. **The open-line rule** settled in advance that the add icon has no filled form.
4. **The Figma route.** Outline stroke, then subtract, then flatten, then export and check. It produced clean single paths with no masks, and the checker accepted the export unchanged.
5. **Cutting all the way through.** Cut-outs that run past the edge (a calendar header, a waistband, a book spine) split the solid cleanly and read better than cuts that stop inside.

## Where it failed or needed manual work

1. **A line icon that already looks filled.** The "month" half-moon is half solid, so its line and filled versions looked the same, and the user spotted it. The fix was to promote the half-moon to the filled icon and draw a new line moon (an outline with a curved phase line), which was named "moon phase" blind.
2. **Filling can erase meaning, and the skill gave only examples.** The first filled moon (a disc with a curved cut-out rim) read as a letter C. The blind test caught it; the checker couldn't have.
3. **Notches from the edge.** The bottle's ticks start at the body's edge and cut inward. That read well, but the skill only described cut-outs inside the shape.
4. **Symbol inside a container.** The crescent cut out of the filled bubble is about 7px at 24. It reads at medium confidence. The skill had no minimum size.
5. **Filled icons in 20px chips** looked heavier than the line chips. That's a usage decision, out of scope for this skill (the user kept line icons in the chips).
6. **No density check on filled icons.** The checker's set comparison skipped fill files.

## Refinements made to the skill (generic rules only)

| # | Finding | Change |
| --- | --- | --- |
| 1 | Line icon already solid | SKILL.md filled tree, first branch: more than 25% solid → open the line version, or promote it to filled and draw a new line icon. Checker: reports each line icon's solid share and warns above 25% |
| 2 | Filling erased meaning | CONSTRUCTION.md "the meaning test": the features that separated the line icon from its look-alikes must survive the fill as cut-out or silhouette. The blind test is now required for filled icons too |
| 3 | Edge notches | CONSTRUCTION.md "where cut-outs go": inside (at least one gap from the edge), through the edge (preferred for header lines and spines), or a notch from the edge running at least two gaps inward |
| 4 | Symbol in a container | CONSTRUCTION.md: at least 7px at 24 and 6px at 20, one gap to the container's inner edge, or drop it. Applies to line icons too |
| 5 | Chips | Logged for the future `icon-usage` skill; out of scope here |
| 6 | No density check on fills | Checker: coverage is now measured by sampling for both stroke and fill icons; filled icons are compared with each other |
| 7 | Pair checking by eye | Checker: `--pair line.svg filled.svg` fails if the silhouettes differ by more than 0.1, reports the line icon's solid share, and warns when the filled icon is barely heavier |
| 8 | Figma route undocumented | SVG.md: the filled recipe step by step, including restoring `fill="currentColor"` after export |

Still not exercised: 16px sizes, modifiers and badges, and the `review` mode.
