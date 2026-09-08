# Voice & tone — defining, adapting, testing

Load this when a product needs its voice defined or documented, when tone for a specific moment is contested, or when copy needs validating with users.

## Voice ≠ tone

Voice is the product's stable personality — it never changes. Tone is how that personality adapts to the reader's moment — it always changes (Mailchimp's canonical distinction). Redesigning the voice per screen is the failure mode; modulating tone per moment is the job. The one-line law: **tone moves down (calmer, plainer) as user stress rises; it may move up (warmer) only right after the user succeeds.**

## Defining a voice — the procedure

1. **Place the product on NN/g's four dimensions** — every string sits somewhere on all four whether chosen or not:
   - Funny ↔ Serious
   - Formal ↔ Casual
   - Respectful ↔ Irreverent
   - Enthusiastic ↔ Matter-of-fact

   Evidence for defaults: NN/g tested identical content in different tones across 4 industries (100 respondents, p < 0.05). Casual-but-serious beat formal on *both* friendliness (+0.7) and trust (+0.3) — formality does not buy credibility. Irreverence cost 0.3 trust even while gaining friendliness. And **trust explains 52% of willingness to act/recommend; friendliness 8%** — when a tone choice trades trust for charm, refuse the trade.

2. **Write 3–5 tone words, each with a "but not" qualifier** (NN/g's method). Unqualified "friendly" specifies nothing; the qualifier is what makes it actionable:
   - "sympathetic but not cheerful" (a hospital)
   - "confident but not boastful"
   - "playful but never in failure paths"
   Build a DO list and a DON'T list from the ~37-word tone vocabulary (authoritative, caring, conversational, dry, matter-of-fact, playful, professional, quirky, respectful, serious, sympathetic, trustworthy, upbeat, witty, …).

3. **Fill a voice chart** (Podmajersky) — one column per product principle, rows are only things you can actually change about text. Once filled, every copy decision is a lookup, not a taste call:

   | Row | Example cell (principle: "calm expertise") |
   |---|---|
   | Concepts to emphasize | control, reversibility, progress |
   | Vocabulary | prefer "workspace", never "dashboard"; no jargon |
   | Verbosity | one clause per sentence; cut qualifiers |
   | Grammar | imperative for actions; present tense |
   | Punctuation | no exclamation marks; periods only in body |
   | Capitalization | sentence case everywhere |

4. **Derive from audience and stakes, not preference** (Apple): a banking app's words convey trust and stability; a game's convey excitement. Account for the user's physical context too — in a hurry at a terminal vs. relaxing on a couch.

Inputs worth interrogating before writing the chart (Yifrah's method): brand personality, brand values, and the audience's motivations *and mental barriers* — the fears the copy must quiet.

## Reference voices — what each register sounds like

- **Apple** — calm, minimal, direct. No interjections, no self-reference, no exclamation inflation; every word audited; impersonal about the system ("Unable to load content"), direct to the user about actions. **This skill's default.**
- **Microsoft** — "warm and relaxed, crisp and clear": write like you speak, contractions, sentence fragments fine, bigger ideas in fewer words.
- **Mailchimp** — plainspoken translator, dry humor ("wry over farcical, winking over shouting") with the brake applied: clarity above all, humor never forced, never in failures.
- **GOV.UK** — radical plainness, personality zero, reading age ~9. The register for services where failure has legal or financial consequences.

Picking a register other than the default is fine when the product's brand demands it — but the failure-path rules (no humor, no interjections, blame-free, fix-first) hold in *every* register. No source disagrees there.

## Tone by moment — extended map

| Moment | User's state | Do | Don't |
|---|---|---|---|
| First run | Hopeful, uncertain | Welcome briefly, get them to a first completed task | Feature tours, "We're excited to have you!" |
| Routine use | Flow | Be invisible; instruct in imperative | Personality that interrupts |
| Form (payment/personal data) | Anxious | Precise reassurance beside the anxious field | Playfulness near money; vague "we care about privacy" |
| Error | Frustrated | Matter-of-fact, cause + fix, preserve their work | Apology theater, jokes (stale on 2nd view), blame |
| Waiting | Uncertain | Name the work, honest estimates rounded up | Entertainment, fake precision |
| Destructive decision | Cautious | Concrete consequence, named object, serious | Softening the stakes, cute button labels |
| Success (routine) | Relieved | Quiet past-tense confirmation | "…successfully!", confetti |
| Success (their milestone) | Proud | Warm, specific to *their* achievement | Congratulating the product; celebrating admin steps |
| Churn-risk / re-engagement | Detached | Real value, real urgency, easy opt-out | Guilt ("We miss you"), manufactured scarcity |

## The humor gate (all three, or no)

1. Stakes are low (no money, data, health, work at risk)
2. User is in a positive or idle state (never blocked, never failed)
3. The joke costs zero comprehension (test: does the message work with the joke deleted? It must)

Even then: dry beats loud, one wink per screen, and repetition kills any joke — copy seen daily must be plain. Sole sanctioned exception to the failure rule: total-outage pages (server down, 404) where no user data is at risk.

## The celebration gate (Intuit)

Before celebrating, all four must pass:
1. The **user** accomplished it (not the product, not a signup)
2. It's infrequent (frequent celebration wears out and implies routine success is rare)
3. It can't backfire emotionally (money freed by a tragedy; a goal tied to a loss)
4. The words scale to the achievement (draft saved ≠ debt paid off)

Celebrate realized value, not administrative milestones: first task done, not account created.

## Testing copy with users — methods and thresholds

- **Cloze test** (comprehension): delete every 6th word, users fill blanks; average ≥ **60%** correct = comprehensible for that audience; below → rewrite. Readability formulas estimate; cloze measures your text against your users. [Nielsen/Budiu]
- **Highlighter test**: users mark green = clear/useful, blue = confusing/unnecessary (digital.gov's actual colors); aggregate across participants; rewrite the most-marked sentences. Localizes failure to the exact sentence (A/B only says which whole variant won); ~1–2 hours per test. [digital.gov]
- **Naming interviews**: "What would you call this?" — **3–5 users** reveals the vocabulary pattern (Intuit's general interview guidance; codesign sessions are their dedicated microcopy method); use the users' words, not the org chart's. [Intuit]
- **A/B copy tests**: minimum **20 users**; only for headlines/CTAs at high-stakes moments with genuinely different variants — never trivial synonym swaps. [Intuit]
- **Read-aloud role-play** (Erika Hall): two voices — product reads titles/body, user reads buttons/inputs. Write the conversation first; derive the UI from it. The agent-runnable test, free, catches register breaks instantly.
- **Content-first rule**: never design or accept layouts around lorem ipsum — placeholder text hides the real hierarchy and produces boxes real words can't fit. Draft real (or realistically sized) copy before layout.
