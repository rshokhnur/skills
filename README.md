# Skills

Agent skills for design — the judgment behind good interfaces, written down so an AI can apply it.

Agents know every UI pattern and have no taste. Left alone they'll write "Oops! Something went wrong", center a three-line heading, and truncate the one part of a filename that mattered. These skills carry the judgment — with the reasoning behind each rule — so the agent makes the right call the first time, and can extend the logic to cases the skill never mentions.

Every skill here is small and does one job. Big topics are split into siblings: text alone is three skills — what the words say, how the text sits on the screen, and (coming) the typefaces themselves.

## Install

```bash
npx skills@latest add rshokhnur/skills
```

Works with Claude Code, Cursor, Codex, OpenCode, Gemini CLI, and 20+ other agents.

## Why use it?

Agents don't have taste. They know every pattern and pick the median one: "Successfully saved!" in a toast, "Are you sure?" with OK and Cancel, `text-overflow: ellipsis` that never draws because the flex item refuses to shrink, a heading that strands its last word on a line of its own.

Each of those is small. Together they're the difference between an interface that feels made and one that feels generated. These skills list the mistakes, explain why each one is a mistake, and give the agent a procedure to get it right — tested on real products, not just written down.

## Skills

- **[ux-writing](./skills/ux-writing/SKILL.md)** — Write and review interface copy: buttons, errors, empty states, dialogs, notifications, onboarding. A calm, minimal default voice that yields to your brand voice, tone that adapts to what the user is feeling, and a banned list of the words that make products feel cheap.
- **[text-layout](./skills/text-layout/SKILL.md)** — Make text physically behave: wrapping, orphans, glue, truncation, overflow, line length, and surviving translation, RTL, and 200% zoom. Diagnoses the container before touching the text.

## How they're built

Each skill is grounded in primary sources — the research (NN/g, Baymard), the style guides (Apple, Material, Microsoft, Mailchimp, Polaris, GOV.UK), the specs, and the books — read in full before a single rule is written, then shaped by my own taste. Rules carry their reasoning so an agent can extend them to cases the skill never mentions. The source notes stay private; the test reports are public in [`tests/`](./tests).

## Status

Two skills, both shipped. Each one passed two tests on real products and a trigger test, where fresh agents with no skill named had to pick it up on their own. Test reports are in `tests/`. More skills as they earn their place.

## License

MIT
