# Skills

Agent skills for design — the judgment behind good interfaces, written down so an AI can apply it.

Agents know every UI pattern and have no taste. Left alone they'll write "Oops! Something went wrong", center a three-line heading, and truncate the one part of a filename that mattered. These skills carry the judgment — with the reasoning behind each rule — so the agent makes the right call the first time, and can extend the logic to cases the skill never mentions.

Every skill here is small and does one job. Big topics are split into siblings: text alone is three skills — what the words say, how the text sits on the screen, and (coming) the typefaces themselves.

## Install

```bash
npx skills@latest add rshokhnur/skills
```

Works with Claude Code, Cursor, Codex, OpenCode, Gemini CLI, and 20+ other agents.

## Skills

- **[ux-writing](./skills/ux-writing/SKILL.md)** — Write and review interface copy: buttons, errors, empty states, dialogs, notifications, onboarding. A calm, minimal default voice that yields to your brand voice, tone that adapts to what the user is feeling, and a banned list of the words that make products feel cheap.
- **[text-layout](./skills/text-layout/SKILL.md)** — Make text physically behave: wrapping, orphans, glue, truncation, overflow, line length, and surviving translation, RTL, and 200% zoom. Diagnoses the container before touching the text.

## How they're built

Each skill is grounded in primary sources — the research (NN/g, Baymard), the style guides (Apple, Material, Microsoft, Mailchimp, Polaris, GOV.UK), the specs, the books — extracted in full into `research/` before a single rule is written, then shaped by my own taste. Rules carry their reasoning so an agent can extend them to cases the skill never mentions.

## Status

Early. Two skills, both in real-world testing. More as they earn their place.

## License

MIT
