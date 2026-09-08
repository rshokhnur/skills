# Skill test #2 — personal portfolio site (Next 16, Tailwind 4): whole site

**Date:** 2026-09-08 · **Skills run:** `ux-writing`, `text-layout` (loaded as written)
**Subject:** `Portfolio website/apps/web` — home, /work + case study, /shots, /skills + essay, 404, error boundary, header/footer, shot dialog, install command
**Method:** every user-facing string read from source; all routes rendered at 375px and 320px; skill checks run in order. Contrast with test #1: this site already applies the text-layout baseline by hand (`text-balance` on every heading, `text-pretty` on body, a 601px measure in px, rem type tokens) and its functional copy is sparse and deliberate. A test of what the skills add on top of craft.

## Verdict

Both skills held their scope and found second-tier issues on an already-crafted site. **ux-writing stayed off the bio, lede, and essays** (persuasion — out of scope by its own rule) and worked only the functional strings; its brand-voice override correctly cleared two deliberate deviations (terminal periods on display headlines, first-person "my end" on the error page). **text-layout found three real rendering defects** the source didn't show. 6 copy findings, 4 layout findings, 6 skill refinements.

## ux-writing — findings (functional copy only)

| # | Where | Current | Rule that caught it | Rewrite |
|---|---|---|---|---|
| 1 | Hero CTA | "Get in touch" — opens the mail app | Button promises what happens next; names no channel | "Email me" (the site's first-person persona makes "me" the honest voice) |
| 2 | Shot dialog | `aria-label="{title} — shot. Press Escape or click outside to close."` and no visible close control | Accessible names name the thing, never instruct; "click" fails touch and voice; dialogs need a labeled Close | `aria-label="{title}"` + a visible button labeled "Close" |
| 3 | Copy button | Clipboard failure is `catch { return }` — no feedback | Every action gets an acknowledgment, including failure; silence makes users click again then blame the site | Failure state: "Couldn't copy. Select the command to copy it." |
| 4 | "Show all work ↗" (×3) | Internal links carry the ↗ that conventionally means "leaves the site"; the Row component reserves "(opens in a new tab)" for real external links | Consistency: a meaningful icon means one thing everywhere | → (or no icon) for internal navigation; ↗ only for external |
| 5 | Work meta | "Brand & site" | Ampersand → "and" unless a brand name (localization, screen readers) | "Brand and site" |
| 6 | Case-study bodies | "Draft. Replace this body with the real write-up…" renders in the UI | Content stub shipping as copy — flagged, not a copy defect | Fill or hide until written |

**Validated passes:** 404 — what happened + one way out ("See the work"), no blame, no route echo; error page — what/why/fix, "Try again" + "Go home", blame explicitly taken; "Copied" live region; "(opens in a new tab)" screen-reader text; sentence case everywhere; curly quotes; page titles front-loaded ("Work — Name"); relative-vs-absolute dates used correctly ("2026 — Now", "Jun 2026"); the live clock's "still at it" passes the humor gate (idle, low stakes, zero comprehension cost).

## text-layout — findings

| # | Where | What renders | Diagnosis | Fix |
|---|---|---|---|---|
| 1 | Filter strip (home, /work, /skills) | Last chip hard-cut mid-word at the viewport edge ("Templ", "E") at every phone width; scrollbar hidden, no fade, no end padding | Horizontal overflow with no continuation signal — users read a cut chip as truncation or a bug (Baymard) | Trailing fade mask on the scroller (`mask-image: linear-gradient(to right, #000 calc(100% - 28px), transparent)`) + end padding so the last chip can scroll fully into view — or let the next chip peek, as the shots scroller already does |
| 2 | 404 + error routes | Footer text sits under the floating dock at 375 and 320 | These routes reserve `pb-12`/`py-12`; every other route reserves `pb-30 sm:pb-50` for the dock | Same dock clearance on both, or reserve it globally in the layout |
| 3 | Install command at 320 | `npx skills add rshokhnur/s…` — truncated; full text only via the copy button | Truncation with no on-page reveal; a clipboard write is not a reveal path (invisible to a sighted reader); the string is 31 chars | Wrap at narrow widths (`overflow-wrap: anywhere`, drop `truncate` below ~360px) — two lines beat a cut command |
| 4 | Skills rows | Description column beside a fixed category label: 4–5 words per line at 320 — holds | The pattern that broke the medical-team prototype; survives here only because labels are short | Watch item: stack the category under the title below ~360px before translation doubles "Foundations" |

**Validated passes:** no horizontal scroll at 320px; `lang="en"`; `balance` on every heading incl. the two-line hero; `pretty` on paragraphs, list items, and row meta; measure capped in px, not `ch` (the code even documents the 57.7ch equivalence — honest); `tabular` on the live clock, years, and facts (no jitter); Facts rows stack on mobile; no fixed-height text containers; every button on one line at 320.

## What the test taught the skills (refinements applied 2026-09-08)

1. **text-layout** — new rule: horizontal chip/tab strips that overflow must signal continuation (trailing fade or a peeking next item + end padding); never a hard cut mid-word, and never hide the scrollbar without a fade to replace it.
2. **text-layout** — new check: fixed/floating chrome (docks, bars) never covers the last line of content — every route reserves bottom padding ≥ the element's height plus the safe area, including 404 and error routes.
3. **text-layout** — truncation section: a copy-to-clipboard control is not a reveal path; short strings (commands, emails, IDs under ~40 chars) wrap at narrow widths instead of truncating.
4. **ux-writing** — accessibility bullet: accessible names name the thing, never instruct; "click" never appears in an aria-label; dialogs get a visible, labeled Close.
5. **ux-writing** — universal rule: every action has a failure string; an empty `catch` is a copy defect, not just a code smell.
6. **ux-writing** — consistency check: an icon that carries meaning (↗ = leaves the site) means one thing everywhere.

**Scope discipline confirmed:** ux-writing did not touch the bio/lede/essays. Brand-voice override (hard rule 6) cleared two deliberate style choices without edits. Descriptions unchanged.
