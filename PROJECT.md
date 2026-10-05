# Skills — Project Doc

> A personal collection of agent skills about design and beyond — written for myself first, published for everyone second.
>
> This is the living document for the project. Every working session that creates or changes a skill should also update this file: the inventory, the decisions, and the learnings log. It gets smarter as the collection grows.

**Status:** 2 skills **shipped** (`ux-writing`, `text-layout` — 2026-09-09), ~110 sources archived, 3 tests in tests/. Installed locally via symlinks into all 5 agents; installable anywhere via `npx skills@latest add rshokhnur/skills`. Public repo: https://github.com/rshokhnur/skills (public since 2026-10-05). (Updated 2026-09-08)

---

## Goals

1. **Encode taste.** Turn design judgment — mine, and the best published thinking — into skills that actually change how an agent works, not vague "make it nice" advice.
2. **Use them daily.** Every skill must earn its place by being useful in my own real work before it ships.
3. **Publish.** A public GitHub repo, then an `npx` installer that puts the skills into every major coding agent in one command.

## Scope — four pillars

| Pillar | Territory |
|---|---|
| **Visual design craft** | Hierarchy, spacing, typography, color, layout — the judgment that makes UI look right |
| **Design engineering** | Implementing design in code: CSS, React components, motion, polish details |
| **Product & UX thinking** | User flows, information architecture, UX writing/copy, product decisions |
| **Personal workflows** | My own process: review checklists, project setup, conventions, how I work |

"Beyond design" = anything from these pillars that I genuinely have opinions about. Depth over coverage: one sharp skill beats three shallow ones.

## Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-08-28 | Multi-agent from day one (Claude Code, Cursor, Codex, OpenCode, Gemini CLI) | Publishing is a goal, and the SKILL.md format is already portable across these agents — no reason to lock in |
| 2026-08-28 | Canonical source format: Claude `SKILL.md` (frontmatter + markdown body), one folder per skill | It's the richest format; other agents consume the same file or a light transform. Author once, install everywhere |
| 2026-08-28 | Publish via public GitHub repo first, `npx` installer second | Repo is the credible start; installer (like animations.dev's) comes once there are enough skills to be worth installing |
| 2026-08-28 | Content = my taste + curated masters + per-topic research, blended per skill | Interview me for opinions, synthesize published wisdom (HIG, Refactoring UI, Emil Kowalski, …) in my own words, research to fill gaps |
| 2026-08-28 | Raw research reports live in `skills/<name>/research/`, kept in the repo but excluded from installs | Research is reusable when refining a skill later; shipping it would bloat installs and dilute the skill |
| 2026-08-28 | Skills stay small and focused — one per aspect; big topics split into siblings (text → `ux-writing` / `text-layout` / `typography`) | The user's explicit call: "useful small (not too small) skills for each aspect." Matches the animations.dev model; mega-skills dilute attention |
| 2026-08-28 | Research convention v2: full-fidelity per-source extraction files, one file per source, exhaustive, in our own words (quotes <15 words), committed to git, never installed. Path moved 2026-09-08 to top-level `research/<name>/sources/` | Distilled reports lose the detail needed for later refinement. Verbatim full copies would be copyright infringement once the repo goes public — exhaustive extraction keeps the fidelity without republishing anyone's text |
| 2026-09-08 | Local install = symlinks from every agent's skill folder (`~/.claude/skills`, `~/.cursor/skills`, `~/.codex/skills`, `~/.config/opencode/skills`, `~/.gemini/skills`) to `skills/<name>` in this repo | Edits in the repo are live in every agent instantly — the right loop while skills are in testing. The future npx installer copies instead; symlinks are the dev-mode equivalent |
| 2026-09-08 | Installer = the universal skills.sh CLI (`npx skills@latest add rshokhnur/skills`); no custom npx installer | Verified on our repo: discovers `skills/*/SKILL.md`, installs to 20+ agents, lockfile + updates. Building our own would duplicate it |
| 2026-09-08 | Research lives at top-level `research/<skill>/`, never inside `skills/` | The installer copies the entire skill folder — verified: 41 research files landed in a test install |
| 2026-09-08 | Reference files are UPPERCASE siblings of SKILL.md (`COMPONENTS.md`, `CSS-RECIPES.md`); no `references/` subfolder | emilkowalski/skills convention — flat, visually distinct from SKILL.md, what the ecosystem expects |
| 2026-09-08 | Skill body skeleton: scope with sibling delegation → Operating posture → Hard rules → process/decision trees → checks → reference links | Emil's shape. Posture sets the bar and bans option-menus; numbered absolutes at the top are the rules agents obey most reliably |
| 2026-09-08 | Descriptions keep their trigger lists until real-world testing shows over- or under-triggering | The description is the only thing an agent reads to decide invocation — changing it blind is a gamble; testing produces the data |
| 2026-09-09 | Descriptions stay as they are (trigger lists kept). Shipping bar = two real-project tests + a passed trigger test (fresh agents, 3 positive + 1 negative control) | Trigger test #3: 4/4 — fired on vague phrasing, stayed out of persuasion copy. Data beats taste on this one |
| 2026-10-05 | Every skill opens with `## Initial Response` (one fixed sentence on bare invocation) and ends with `## Invocation Variants` + `## Required Output Format` (findings / decisions for you / what held up) | Emil's house conventions as of Oct 2026, present in all 14 of his skills. Bare `/skill` calls stop dumping the whole skill; reviews come back in one comparable shape |
| 2026-09-08 | License: MIT | Standard for skills repos; permissive copying is the point of publishing |

## Planned repo structure

```
Skills/
├── PROJECT.md          # this file — the living doc
├── CLAUDE.md           # instructions for Claude sessions in this repo
├── README.md           # public-facing
├── LICENSE             # MIT
├── skills/             # installable — exactly what `npx skills add` copies
│   └── <skill-name>/
│       ├── SKILL.md    # scope → posture → hard rules → process → checks
│       └── RECIPES.md  # optional UPPERCASE reference files beside SKILL.md
└── research/           # never installed — full-fidelity source extractions
    └── <skill-name>/
        ├── 0N-*.md     # distilled slices
        └── sources/    # one file per source, URL + access date
```

## Skill format conventions

- Frontmatter: `name` (kebab-case), `description` — the description is the trigger surface: what it does + when to use it + concrete trigger words. An agent decides to load the skill from the description alone.
- Body follows the `writing-skills` principles:
  - Encode **process and decisions**, not example output.
  - Every rule ships with its **why** — rules without reasons get ignored or misapplied.
  - **Strict beats vague**: "never X, always Y" with stated exceptions, not "consider X".
  - Cut every line that doesn't change the agent's behavior.
  - One skill, one job. If a skill covers two jobs, it's two skills.
- Quality bar: the animations.dev skills installed in `~/.claude/skills` — study how they structure descriptions, decision trees, and trigger lists.
- Language: English (it's getting published).

## The pipeline — how we create each skill

1. **Pick** a topic from the backlog; define the one job it does.
2. **Interview** — Claude grills me for my actual opinions, rules, and pet peeves on the topic. My answers are the spine.
3. **Curate & research** — pull in the best published thinking; it supports my taste, never replaces it.
4. **Draft** the SKILL.md (load the `writing-skills` skill first).
5. **Test by running** — two real projects of different kinds (reports in `tests/`), then a trigger test: fresh subagents, natural tasks, no skill named, at least one negative control. A skill that doesn't change the output, or doesn't fire when it should, gets rewritten or killed.
6. **Ship** — mark it `shipped` in the inventory.
7. **Log** — add what we learned to the Learnings log below.

## Skill inventory

| Skill | Pillar | Status | Notes |
|---|---|---|---|
| `ux-writing` | Product & UX | **shipped** (2026-09-09) | Interface copy only (marketing copy = later skill). Default voice: Apple-calm (minimal, plain, no exclamation) + tone-adaptation procedure by user emotional state. SKILL.md + references/. Research: NN/g, Baymard, IxDF, UX Collective, Material, HIG, Microsoft, Mailchimp, Polaris, GOV.UK, Podmajersky, Yifrah, Saito. 71 source extractions in research/. **Tests:** #1 medical-team prototype (12 findings, 3 refinements) · #2 portfolio site (6 findings, 3 refinements; scope discipline + brand-voice override confirmed) — see tests/ |
| `text-layout` | Design engineering | **shipped** (2026-09-09) | Skill #2, born from the orphans question. How text physically sits in UI: wrapping, breaking, orphans (`text-wrap: balance/pretty`), glue pairs, truncation/`line-clamp`, overflow, line length, alignment/rag, i18n text behavior (CJK/RTL/expansion). Sibling of `ux-writing` (words) and future `typography` (typefaces/scale). Research: MDN/web.dev/CSSWG, Comeau, Shadeed, Butterick, Rutter, NN/g, Baymard, WCAG, W3C i18n — 41 source extractions in research/. **Tests:** #1 medical-team prototype (4 findings incl. an orphan-producing layout bug, 2 refinements) · #2 portfolio site (4 findings: cut chip strip, dock covering footer, truncated command; 3 refinements) — see tests/ |

Statuses: `idea → drafting → testing → shipped`

## Backlog (proposals — react, reorder, kill freely)

- **Text family:** `typography` (typefaces, scale, weight, leading; note from test #1: px-only font sizes block user text scaling — a rule for this skill) — completes the trio with `ux-writing` (words) and `text-layout` (wrapping/breaking); `marketing-copy` (persuasion surfaces, explicitly excluded from ux-writing)
- **Visual craft:** a spacing-system skill (when 4/8/12/16, when to break the grid); a "make this UI look expensive" audit skill
- **Design engineering:** a component polish checklist skill; a CSS layout decision skill (flex vs grid vs flow, with the why)
- **Product & UX:** a flow-mapping skill (UX copy → done as `ux-writing`)
- **Workflows:** a project-kickoff skill (how I start any design project); a design-review skill encoding what I look for

## Publishing plan

- **Phase 1 — build (now):** write skills, use them locally; private repo at github.com/rshokhnur/skills (created 2026-09-08).
- **Phase 2 — GitHub:** once ~5 skills are `shipped`: flip github.com/rshokhnur/skills to public, add the skills.sh badge. README and MIT license already in place (2026-09-08).
- **Phase 3 — installer: solved for free.** `npx skills@latest add rshokhnur/skills` (the skills.sh CLI: 20+ agents, symlink or copy, lockfile, updates) — verified 2026-09-08. No custom installer. Optional someday: an extended/paid tier via our own installer, the way animations.dev layers over its public repo.

## Open questions

- [x] Project name → `skills` (2026-09-08); GitHub: rshokhnur/skills (private until ~5 skills shipped); npm scope TBD at Phase 3
- [ ] Author byline for published skills
- [x] License → MIT (2026-09-08); LICENSE names the GitHub handle — swap in a legal name before going public if preferred
- [x] Which skill do we write first? → `ux-writing` (2026-08-28)
- [x] `git init` → done 2026-09-08; first commit + push to GitHub same day

## Learnings log

Newest first. What we learned about writing skills, from writing skills.

- **2026-10-05 — Repo made public at 2 shipped skills** (the plan said ~5; the user chose to launch early so real users can surface trigger and taste gaps). Verified a fresh `npx skills add rshokhnur/skills` finds both skills.

- **2026-10-05 — Re-aligned with emilkowalski/skills.** Re-cloned his repo: structure unchanged since Sept, but three sections are now universal in his skills — Initial Response, Invocation Variants, Required Output Format. Added all three to both skills; README gained a "Why use it" section and an honest shipped status. Lesson: a reference repo drifts — re-check it before each release instead of trusting the last analysis.

- **2026-09-09 — Trigger test passed 4/4; `ux-writing` and `text-layout` shipped.** Fresh subagents (same roster as a user session, no skill named) invoked the right skill on three natural tasks — including a jargon-free "one word sits alone on the second line" — and correctly skipped `ux-writing` for persuasion headlines, citing the description's own exclusion. Lessons: (1) subagents are a cheap, honest trigger test — they see only the description, exactly like a user's session; (2) the "Not for…" clause is load-bearing: it's what kept the skill out of marketing copy; (3) the shipping bar is now written down: two real-project tests + a passed trigger test. Report: tests/2026-09-09-trigger-test.md

- **2026-09-08 — Test #2 (portfolio site, whole site).** The opposite subject from test #1: a site that already applies the text-layout baseline by hand and has sparse, deliberate copy. Both skills held scope — ux-writing left the bio and essays alone and its brand-voice override cleared two deliberate deviations without edits — and still found real defects the source hid: a chip strip hard-cut mid-word, the floating dock covering the 404 footer, an install command truncated to clipboard-only. Six refinements. Lessons: (1) a second, *different* kind of project is what exposes missing categories — horizontal scrollers and fixed chrome never came up in a phone-frame prototype; (2) rendering finds what grep can't: every layout finding here was invisible in the source; (3) the override rule is load-bearing on opinionated sites — without it the skill would have "fixed" the site's voice. Report: tests/2026-09-08-portfolio-site.md

- **2026-09-08 — First real-world test (medical-team prototype, athlete check-in + pain report).** Ran both skills as written against 12 screens, rendered at 375px and 320px. Result: the copy was already good and neither skill invented problems — they found the second tier (a button promising less than it does, copy naming a control that doesn't exist, a 6-step form discarded on one tap with no confirm/undo, vocabulary drift across screens) plus one genuine layout bug (a nowrap sibling squeezing every result row into orphans). Six refinements landed. Lessons: (1) a good test subject has *good* copy — mediocre copy makes any skill look smart; (2) render at 320px, always — the 375px view hid the worst wrapping; (3) the decision tree missed a whole branch (sibling hogging width) that one real screen exposed in seconds — trees are hypotheses until they meet layouts; (4) keep test reports in `tests/` so the next test can be compared. Report: tests/2026-09-08-medical-prototype.md

- **2026-09-08 — Repo design aligned with emilkowalski/skills; installer problem solved for free.** Studied Emil's public repo: flat `skills/<name>/SKILL.md` + UPPERCASE references, frontmatter = name + description only (`disable-model-invocation` for deliberately-invoked skills), MIT, `.gitattributes`, no installer code — he uses the universal `skills` CLI. Ours was already discoverable by it, so Phase 3 is deleted. Caught only by running a real install: the CLI copies the whole skill folder, so `research/` moved to top level. Retrofitted Operating posture + Hard rules to both skills. Left descriptions untouched pending trigger data. Lesson: test the install path, not just the file layout — a "compatible" repo was shipping 41 research files per install.

- **2026-08-28 — Skill #2 (`text-layout`) drafted; sources convention proven.** ~100 full-fidelity source extractions now in `research/sources/` across both skills (39 text-layout, ~60 ux-writing incl. backfill). The backfill's accuracy audit justified the whole convention: it caught that summaries had drifted from sources — the 52%/8% tone stat's real meaning, the 12%/81% permission numbers' attribution (Tan et al.), NN/g's ~2–9s spinner band, "no preselected default" in dialogs (NN/g + current HIG), and that the oft-quoted HIG alert-pronoun ban is legacy, removed from current HIG. Lesson: popular summaries of style guides lag the guides themselves — extract from the live source, date the access, and re-verify "famous" rules before encoding them. Also learned: agents writing files incrementally survive usage-limit kills with zero loss — make write-as-you-go a standing instruction for research agents.

- **2026-08-28 — Skill #1 (`ux-writing`) drafted.** Pipeline worked: 4 scoping questions → 5 parallel research agents (NN/g, Baymard, IxDF, UX Collective, Apple/Material/MS/Mailchimp/Polaris/GOV.UK guides, Podmajersky/Yifrah/Saito) → synthesis into SKILL.md + 3 references. Learnings: (1) asking researchers to flag **source disagreements** was the highest-value instruction — the 12 documented conflicts (sentence vs title case, my/your, "sorry", OK, …) are exactly where a skill must make a call instead of staying vague; (2) research agents die on usage limits but resume cleanly with context intact — resume, don't restart; (3) archive raw research in `research/` immediately, before synthesis — reports only live in conversation memory otherwise; (4) numbers make rules land ("79% scan" beats "users scan") — demand exact figures in research prompts; (5) first feedback round: research misses the boundary topics — the user's "one word alone on a line" question added a whole copy-meets-layout section (orphans, glue pairs, wrap rules) the five research slices never surfaced. The user's pet peeves ARE the differentiator; harvest them deliberately. Still to do: test on real tasks, then ship.
- **2026-08-28 — Project created.** Scope, format, pipeline, and publishing path decided (see Decisions). Installed the animations.dev skill set globally as a reference-quality example of the genre. Next session: pick a name and write skill #1.
