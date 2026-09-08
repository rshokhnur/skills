---
name: ux-writing
description: Write and review interface copy — microcopy, buttons, errors, empty states, dialogs, notifications, onboarding — at a professional UX-writing bar, grounded in NN/g and Baymard research and the major product style guides (Apple, Material, Microsoft, Mailchimp, Polaris, GOV.UK). Use when writing or editing any user-facing string in a product or site UI, naming a button, menu item, or setting, wording an error or validation message, filling an empty state, a confirmation dialog, a toast, a tooltip, a push notification, or permission prompt, choosing voice and tone, or when copy sounds wordy, robotic, or off. Not for persuasion-first marketing/landing pages. Triggers on — UX writing, microcopy, copy, UI text, button label, CTA, call to action, error message, validation message, empty state, placeholder, form label, helper text, hint text, tooltip, confirmation dialog, "are you sure", destructive action, toast, snackbar, notification, push, onboarding copy, permission request, loading text, progress, success message, voice and tone, wording, phrasing, rename, label, sentence case, title case, "what should this say", "make this friendlier", i18n strings, localization-safe copy.
---

# UX Writing

Interface copy is design material, not decoration: rewriting the same page to be concise + scannable + objective measured a **+124% usability gain** (NN/g). This skill encodes how to write every user-facing string in a product or functional site UI. Persuasion-first marketing pages are a different job — not this skill.

## Ground truth — why every rule below exists

- **79% of users scan; 16% read word-by-word. At best they read 28% of the words on a page.** Copy that requires linear reading fails 4 out of 5 users. [NN/g]
- **Scanners fixate on the first 2 words (~11 characters) of any string.** What isn't front-loaded effectively doesn't exist. [NN/g eyetracking]
- **Trustworthiness explains ~52% of the variance in how desirable users find a message (willingness to act and recommend); friendliness adds only ~8%.** When a tone choice trades trust for charm, refuse the trade. [NN/g, 4-industry tone study]
- Copy placed before or outside the moment of need is skipped, resented, or habituated away (upfront tutorials, launch-time permission dialogs, routine confirmations). **Move words to the point of action.**

## The process — walk it every time

1. **Name the surface.** Which pattern is this string: button, error, empty state, dialog, toast, notification, form field, loading, onboarding, setting? Each has a formula — load [references/components.md](references/components.md) and use it. Never freestyle a pattern that has a formula.
2. **Read the user's moment.** What just happened, and what is the user feeling — neutral, frustrated (error), anxious (payment, delete), waiting, or successful? This sets tone (table below).
3. **Choose the voice.** The project has an explicit brand voice or content guide → follow it, including where it contradicts this skill's defaults. No explicit voice → use the default voice below. Never invent a personality per screen.
4. **Draft with the message skeleton** (below), front-loaded, in the pattern's formula.
5. **Edit in four passes, in order** (Podmajersky): **Purposeful** — does this string serve the user's goal on this screen? If not, delete it, don't polish it. **Concise** — cut to the glance; target ≤15–20 words per sentence. **Conversational** — would a person say it, in this order? **Clear** — zero ambiguity about what happens next.
6. **Run the checks** (bottom of this file) before shipping.

## Default voice: calm and minimal

The register of Apple's HIG — chosen because calm copy is what the trust data rewards:

- **Say it in fewer words.** Check each word; if the string survives without it, cut it. "Your changes have been successfully saved!" → "Changes saved". The shorter the string, the more likely it is read at all.
- **No interjections, ever: "Oops", "Uh-oh", "Whoops", "Yay".** They read as insincere, waste the most-read first words, and go stale on the second encounter. State the thing instead.
- **Exclamation marks: budget zero.** Exception: at most one, only for a genuine user accomplishment (not a routine completion, never a failure). They read as shouting; a calm product doesn't shout.
- **No marketese.** No "powerful", "seamless", "world-class", "revolutionary". Hype forces readers to filter exaggeration to find facts (−27% usability measured) and burns credibility. State the fact; let it persuade.
- **Warmth goes to the user's outcome, never the product.** "Your site is live" is warm. "Our amazing platform published your site" is marketing.
- **Humor gate — all three or none:** stakes are low AND the user just succeeded or is idle AND the joke costs zero comprehension. Errors, billing, security, deletion, legal: never. When in doubt, the answer is no — forced humor is worse than none (Mailchimp's own rule).
- **Consistent to the point of boredom.** One concept = one word everywhere ("delete" or "remove", not both). Rotating synonyms makes users wonder if the actions differ.

## Tone: the voice never moves, the tone does

Tone moves **down** (calmer, plainer, more serious) as user stress rises; it may move **up** (warmer) only just after the user succeeded. Map the moment before writing:

| Moment | User feels | Tone | Sounds like |
|---|---|---|---|
| Routine action | Neutral | Invisible, instructive | "Add a filter to narrow results" |
| Error / blocked | Frustrated | Matter-of-fact, blame-free, fix-first | "That code has expired. Request a new one." |
| Payment, personal data | Anxious | Precise, reassuring, zero playfulness | "You won't be charged until the trial ends on Mar 3" |
| Destructive decision | Cautious | Maximum seriousness, concrete consequences | "Delete 82 photos? This cannot be undone." |
| Waiting | Uncertain | Honest, specific about what's happening | "Uploading 3 of 12 photos…" |
| Genuine success | Relieved, proud | Warm, brief; celebration scaled to *their* achievement | "Invoice sent" · big milestone: "You paid off your $6,420 balance" |

Celebrate only what the **user** accomplished, never what the product did ("You've been successfully onboarded!" is the product congratulating itself). Frequent events never get celebration — it wears out and implies the operation usually fails.

## The message skeleton

Nearly every interface message is these three parts, in this order — include a part only when it isn't obvious:

1. **What happened / what's true** — named object, specific number, no abstraction. "Your card ending in 4242 was declined", not "There was a problem with your payment."
2. **Why / consequence** — only if non-obvious. "This can't be undone."
3. **Next action, labeled with its verb** — a real control, not prose. Button: "Update card".

**Verb-echo principle** (the strongest cross-source consensus — Apple, Material, NN/g, Polaris all state it): any button that answers a message repeats the message's verb + object. Title "Discard draft?" → buttons "Discard draft" / "Keep editing". Never Yes / No / OK / Got it as answers to a real question — users click those from muscle memory without reading, which is precisely how data gets destroyed.

## Universal rules — apply to every string

- **Front-load the keyword.** The information-bearing word goes first; qualifiers after. "Pricing details", not "Click here to learn about pricing".
- **Buttons: verb + noun, 1–3 words, no articles, sentence case.** "Create order", "Delete photo". Universal one-worders allowed: Save, Cancel, Close, Done, OK (OK only for pure acknowledgment of information — any real choice gets the verb). Never "Submit" (name the outcome: "Place order"), never bare "Get started" / "Learn more" / "Click here" as the only label — generic labels destroyed task success in NN/g testing (6 of 8 users misled) and read identically ("Learn more, Learn more…") to screen-reader users navigating by link list.
- **The button promises what happens next, not the eventual goal.** A "Book now" that opens room selection lies; it's "Show rooms". "Send a code", not "Get a code" — you can't guarantee receipt.
- **Plain language: US grade-7 reading level, sentences ≤20 words.** Experts prefer plain language too (NN/g: plain rewrites raise perceived competence). "purchase" → "buy", "assist" → "help", "in order to" → "to".
- **Numerals always, even 1–9.** "You have 3 messages." Numbers are what users scan for.
- **Concrete beats abstract.** "Until Jan 31, you can deposit $400 more" beats "Your deposit limit is $1,000 per calendar month."
- **Positive framing.** Say what to do, not what not to do: "Use only letters and numbers", not "Don't use special characters". Negation forces the user to invert the logic; and spell out load-bearing negations — "cannot be undone", not "can't" (users misread negative contractions as positive; GOV.UK research). Everywhere else, contractions: yes — "it's", "you're" are how people talk.
- **Person: you/your.** Drop the pronoun when the label survives without it ("Favorites", "Settings"). "My" only in strings the user notionally speaks: "I agree to the terms", "Remember my password". **Never mix registers** — "Change your preferences in My Account" is the canonical error. Avoid "we" in system strings ("We couldn't save…" → "Couldn't save…") except: a real human will act ("We'll review your appeal within 2 days"), or a privacy promise the company must own.
- **Active voice, present tense, imperative for instructions.** Two sanctioned passive exceptions: (1) errors where active voice would blame the user — "That site can't be found" is deliberately passive; do not "fix" it; (2) headings where passive front-loads the keyword.
- **Never "please" in buttons or routine instructions** — it adds length and implies the action is optional. Never reflexive "sorry" — reserve one "sorry" for a genuine product-caused failure with real consequences.
- **Localization-safe by default:** no idioms, puns, or pop-culture ("hit the ground running" → "start quickly"). Expect short strings to grow 2–3× in translation (W3C/IBM data: ≤10-char strings expand 200–300%) — never write copy that only fits exactly. One full sentence per string with named placeholders ("You have {count} new messages"); never concatenate fragments; never "(s)" plural hacks.
- **Copy owns its line breaks.** No heading, title, or toast strands a single word on its last line (an orphan) — `text-wrap: balance` on headings, rewording as the fallback. Number + unit pairs stay glued on one line ("3 MB", "Jan 24"). Buttons never wrap to two lines — shorten the label, never the font. Full rules: [references/mechanics.md](references/mechanics.md).
- **Accessibility is copy's job too:** links describe their destination out of context (WCAG 2.4.4); instructions never lean on color, shape, or position — "Select **Save**", not "the green button below" (WCAG 1.3.3); error messages carry a hidden "Error:" prefix for screen readers.

## Mechanics defaults

| Thing | Default | Why |
|---|---|---|
| Capitalization | Sentence case for everything: titles, buttons, menus, labels | Friendlier, keeps proper nouns detectable, consistent without a rulebook. Exception: native macOS/iOS UI → Apple's title case for buttons/menus/alert titles |
| ALL CAPS | Never | Kills word shape; screen readers may spell it out |
| Periods | Not on titles, buttons, labels, fragments; yes on 2+ sentences of body | Periods are noise in scanned strings |
| Question mark | Yes in confirmation titles: "Remove downloaded book?" | The question IS the confirmation |
| Ellipsis | Only for in-progress states: "Downloading…" (and macOS/iOS menu convention "Save As…") | Otherwise decoration |
| Ampersand | Write "and" unless it's a brand name | Localization + screen readers |
| Dates | Spell out: "Jan 24, 2026" — never 01/02/2026 | All-numeric dates flip meaning across locales |
| Timestamps | Relative ("2 hours ago") for fresh feed content; absolute for anything referenced later; convert relative → absolute after ~4 weeks | Relative signals recency; absolute is citable |

## Confirm, undo, or nothing — decision tree

```
User triggers an action with consequences
├── Reversible? → NO dialog. Act immediately + toast with "Undo".
│     ("Message archived  [Undo]" — the Gmail model)
├── Risky but recoverable (overwrite, bulk edit, send to many)?
│     → Confirmation dialog: title = the action as a question,
│       body = concrete consequence with named object + count,
│       buttons = verb-echo ("Delete 82 photos" / "Cancel")
├── Catastrophic + irreversible (delete account, repo, workspace)?
│     → Dialog + type-to-confirm (type the name or DELETE)
└── Routine (save, add, navigate)? → Nothing. Every needless
      confirmation trains the reflexive Yes-click that fires
      exactly when the dialog finally matters.
```

If the action itself is "cancel" (a reservation, a subscription), no button may say bare "Cancel" — rename both: "Keep reservation" / "Cancel reservation".

## Banned list

| Never | Because | Instead |
|---|---|---|
| "Oops!", "Uh-oh", emoji in errors | Insincere; mocks a frustrated user | State what happened |
| "invalid", "illegal", "forbidden", "bad", "prohibited" | Blames the user; the design failed, not them | Describe the rule: "Enter a ZIP code like 94103" |
| "failed to" | Accusatory | "unable to", "couldn't" |
| "An error occurred" / "Something went wrong" alone | Zero information, zero next step | Skeleton: what + why + fix |
| Bare error codes | Users can't act on them | Human sentence first; code at the end: "Error code: 1042" |
| "Submit", "OK" on a real action | Generic labels hide the outcome | Name it: "Create account", "Pay $12" |
| "Click here", bare "Learn more" | No scent; useless in screen-reader link lists | Front-loaded destination: "See pricing" |
| "Are you sure?" | Nothing to check against | Name object + consequence: "Delete 'Q3 report'?" |
| "Almost there", "Attention", "Action required" as titles | Anxiety without information | State the thing: "Verify your email" |
| "successfully" | Implied by the confirmation itself | "Product saved" |
| "Your X has been…" | Padding before the news | "X saved" |
| "please" (buttons, instructions) | Length; implies optional | Imperative verb |
| "click/tap/enter the…" | Explaining mechanics means the design failed | Name the control: "Select Save" |
| Jargon/abbreviations: "OTP", "auth", "params" | User's vocabulary, not the system's | "6-digit code", "sign-in" |
| "We miss you 😢", guilt urgency | Manufactured pressure trains uninstalls | Real, expiring value or silence |

## Checks before shipping

1. **Role-play read-aloud** (Erika Hall): read the screen as a dialogue — product speaks titles and body, user speaks buttons and inputs. If the exchange sounds wrong spoken, it's wrong on screen. ("Discard draft?" — "Keep editing." passes. "Are you sure?" — "OK." fails.)
2. **Scan test:** read only each string's first 2 words and the buttons. Does the screen still make sense? (Most users read exactly that much.)
3. **Banned-list sweep** over every string, including `aria-label`s and `alt` text.
4. **Consistency grep:** same action → same word across the whole surface; no "my"/"your" mixing; one capitalization system.
5. **Truncation, wrap & i18n:** does the layout survive strings 2× longer? Are all strings full sentences with named placeholders? Do headings avoid a stranded last word, and do all buttons sit on one line?

## Going deeper

- Per-surface formulas with examples — buttons, forms, errors, empty states, dialogs, toasts, loading, notifications, onboarding: [references/components.md](references/components.md)
- Defining a product voice, tone words, the voice chart, celebration/humor gates, testing copy with users: [references/voice-and-tone.md](references/voice-and-tone.md)
- Full mechanics, i18n expansion numbers, accessibility rules, and the documented disagreements between the major style guides: [references/mechanics.md](references/mechanics.md)
