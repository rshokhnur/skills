# Skill test #1 — medical-team prototype: athlete check-in + pain report

**Date:** 2026-09-08 · **Skills run:** `ux-writing`, `text-layout` (loaded as written, followed as instructions)
**Subject:** a single-file HTML prototype — screens A03 consent, A10–A15 check-in → result, A20–A27 pain report → submitted, A63 ongoing, partial session
**Method:** source read for every string; screens rendered at 375px and 320px (WCAG reflow width); skill checks run in order.

## Verdict

The copy is already good — calm, specific, front-loaded, blame-free, no interjections, no exclamation marks, no "please", no "successfully". Both skills correctly recognised that and didn't manufacture problems. What they caught is the second tier: promises without controls, vocabulary drift, a missing confirm/undo, and a real layout failure that produces orphans on every result row. **12 copy findings, 4 layout findings, 6 skill refinements.**

## ux-writing — findings

| # | Screen | Current | Rule that caught it | Rewrite |
|---|---|---|---|---|
| 1 | Check-in kicker | "Question 1 of 4" over **5** progress segments | Numbers users scan must match the UI | Show 4 segments (result isn't a question), or "Step 1 of 5" |
| 2 | Check-in, last question | Button "Continue" | Button promises what happens next | "Show my readiness" |
| 3 | Result — attribution verdicts | "Pay attention" beside "Below baseline / Normal / Above baseline" | One concept, one grammatical form — an imperative among states | "Far below baseline" |
| 4 | Result — calculation toggle | "Show the full calculation" / "Hide the full calculation" | Buttons: verb + noun, no articles | "Show calculation" / "Hide calculation" |
| 5 | Result — empty attribution | "Complete a check-in to see what moved your score." (prose only) | Empty state: real control when a genuine next action exists | Add button "Start check-in" |
| 6 | Intensity at 0 | "Drag the scale to the number that matches what you feel right now." | Never explain mechanics; the slider + "No pain / Worst imaginable" already say it | Delete, or "Pick the number that matches how it feels right now" |
| 7 | Review — primary | "Send to my doctor" while the note says the doctor **and** coach receive it | A button is a promise (Sincere) — it under-states the audience | "Send report" (the note above already names both recipients) |
| 8 | Review — secondary | "Cancel this report" — silently discards 6 steps of input | Nothing is being cancelled; discarding a completed multi-step form is risky-but-recoverable → confirm or undo | "Discard report" → dialog "Discard this report? Your answers will be lost." · "Discard" / "Keep editing" |
| 9 | Submitted | "You can correct or withdraw this until she opens it." + only a **Withdraw** button | Every capability the copy names needs a visible control | Either add "Edit report", or "You can withdraw this until she opens it." |
| 10 | Submitted — Withdraw | One tap withdraws an urgent medical report; toast "Report withdrawn", no undo | Confirm/undo tree: reversible → act + undo toast | Toast "Report withdrawn · Undo" (≥10 s) |
| 11 | Ongoing — statuses | User picks "Better than yesterday" → toast "Knee marked improving" → status "Improving" | Two vocabularies for one concept | Toast "Knee marked better"; statuses Better / Same / Worse |
| 12 | Ongoing / Intensity | "7 / 10" here, "7/10" on review and case titles | Consistency grep | "7/10" everywhere |

Minor: "You can review this at any time in Profile → My data." — the arrow reads "right arrow" to screen readers and "review" undersells (the user can *change* it): "You can change this any time in Profile, under My data." · "This is somewhere new instead" (5-word secondary button) → "Report a new area".

**Validated passes worth noting** — things the skill checked and approved: "cannot be edited" / "cannot assign" spelled out (load-bearing negation); consent restated at the moment of submission, with names; "Once this goes…" consequence before the send button; relative timestamp "reported 3 days ago" on fresh content; "Report sent" past-tense confirmation; buttons user-voiced ("Send to my doctor", "See my training load") while titles are product-voiced ("your coach") — the role-play split, applied correctly.

## text-layout — findings

| # | Where | What renders | Diagnosis (decision tree) | Fix |
|---|---|---|---|---|
| 1 | Result — every attribution row | Subtitles strand a word: "7h 40m / **need**", "against your / **baseline**" ×2; at 320px the column collapses to 2-word lines and the detail reads "This cost you 19 / points, the / heaviest single / factor today." | **Container, not text:** the trailing verdict (`.aw`, `white-space: nowrap`) never yields, so the text column (`.ab`, `min-width: 0`) absorbs all the shrink | Let the verdict wrap or shrink (`.aw { white-space: normal; text-align: end; flex: 0 1 auto }`) or stack it under the title below ~360px; then `.arow .s, .det { text-wrap: pretty }` |
| 2 | Result — check-in row | "Fatigue / 2/7" splits label from value | Glue: label + value pairs in an inline list are one token | Render each pair in a `white-space: nowrap` span: `Sleep quality 2/7` · `Fatigue 2/7` … |
| 3 | Submitted at 320px | "Within 30 / minutes" | Glue: number + unit | `<span class="nowrap">30 minutes</span>`, and let the label/value row stack below 340px |
| 4 | Global | Only headings get `text-wrap: balance`; no `pretty` on body | Baseline missing half | `p, .qhint, .fread, .note, .opt .d, .arow .s, .det { text-wrap: pretty }` |

Passes: no horizontal scroll at 320px (`scrollWidth` 320 = viewport) — WCAG 1.4.10 reflow holds; `h2.title`/`.qtitle` already balanced ("How long, and / did it stop you?" breaks cleanly); all buttons stay on one line at 320px; `lang="en"` set; zoom not blocked. Out of this skill's scope but noted for the future `typography` skill: every font size is in px (40 rules at 12px), so user text-size preferences don't scale — browser zoom still works, Dynamic Type won't.

## What the test taught the skills (refinements applied 2026-09-08)

1. **ux-writing** — Person rule now states the role-play split explicitly: buttons/inputs are user-voiced, titles/body product-voiced; that's consistent, not mixed. (The skill handled it right but only by inference.)
2. **ux-writing** — Consistency check extended: numbers in copy match the UI they describe; scale/status words share one grammatical form; every capability the copy names has a visible control.
3. **ux-writing** — Confirm/undo tree: discarding a completed multi-step form counts as risky-but-recoverable. Banned list: "Cancel" for throwing away a draft → "Discard" + confirm or undo.
4. **text-layout** — Decision tree gains the branch this prototype failed on: a text column beside a nowrap/fixed sibling collapsing into 1–3-word lines is the *sibling* hogging width — let it wrap, shrink, or stack before touching the text.
5. **text-layout** — Glue list gains label + value pairs in inline metadata lists.
6. **Both** — both skills triggered correctly on the material and produced actionable rewrites without inventing problems in good copy. No description changes needed from this test.
