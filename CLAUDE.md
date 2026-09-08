# Skills repo — instructions for Claude

This repo is a personal collection of agent skills about design (visual craft, design engineering, product/UX, workflows), built to be published later. **Read `PROJECT.md` first** — it is the living source of truth for scope, decisions, format conventions, and the creation pipeline.

## Rules for working here

- **Creating or editing a skill:** load the `writing-skills` skill before drafting. Follow the pipeline in PROJECT.md — interview the user for their taste before writing; their opinions are the spine, curated/researched material only supports.
- **Skills live in** `skills/<skill-name>/SKILL.md`, kebab-case names, English. Skills stay small and focused — one aspect per skill; split big topics into siblings (see the Decisions table in PROJECT.md).
- **Research convention:** before distilling, collect full-fidelity per-source extraction files into `skills/<name>/research/sources/` — one file per source with URL + access date, exhaustive, in our own words (direct quotes under 15 words only, never verbatim copies — copyright). `research/**` is committed to git but never published or shipped with installs.
- **After any session that touches a skill or a decision, update `PROJECT.md`:** the inventory table, the Decisions table (if a new decision was made), and the Learnings log. This file improving over time is a core goal of the project.
- **Quality bar:** the animations.dev skills in `~/.claude/skills` — match their density and trigger-rich descriptions. A skill that wouldn't change an agent's output gets rewritten or killed, not shipped.
- **Never publish, push, or make the repo public without an explicit ask.**
