# Skill test #3 — trigger test (fresh agents, no skill named)

**Date:** 2026-09-09 · **Question:** do the skills fire on their own from the description alone, and only when they should?
**Method:** four fresh subagents with the same skill roster as a user session; natural tasks; no skill mentioned anywhere in the prompt; each asked to list skills invoked at the end.

| # | Prompt (paraphrased) | Expected | Result |
|---|---|---|---|
| 1 | Write all strings for a settings page's API-keys section (labels, errors, empty state, delete dialog, toasts) | `ux-writing` fires | **Fired** (SKILL.md + COMPONENTS.md). Output was the skill end to end: verb+noun buttons, mirror-label errors, on-blur timing with hidden "Error:" prefix, named-object dialog with verb-echo buttons and no focused default, dialog-over-undo reasoned from irreversibility, past-tense toasts, inline failure strings, one-term vocabulary note |
| 2 | Product card: ellipsis never appears; long SKU pushes price out of the card (code given) | `text-layout` fires | **Fired.** "Both bugs are the same bug" — `min-width: auto`; ellipsis trio; `anywhere` vs `break-word` by min-content; SKU wraps not truncates (tail is the distinguishing part); price glued; `minmax(0,1fr)` grid trap; reveal-path note. Verified in Chromium at 320px before answering |
| 3 | "The word 'faster' sits alone on the second line, looks bad" — no jargon | `text-layout` fires on vague phrasing | **Fired.** `text-wrap: balance`, shared-longhand trap, no `<br>`/`&nbsp;`, site-wide baseline. One tool call, 10 s |
| 4 | Three persuasive hero headlines for a landing page (negative control) | `ux-writing` does NOT fire | **Did not fire** — agent's own note: "skipped since it excludes persuasion-first landing pages" |

**Verdict:** 3/3 positive triggers, 1/1 negative control. The trigger-word descriptions work, including on jargon-free phrasing, and the "Not for…" clause is read and respected. **Decision resolved: descriptions stay as they are.**

Both skills move to `shipped`.
