# Mechanics — the letter-level rules, in full

Load this for capitalization/punctuation disputes, i18n-safe string writing, accessibility copy rules, or when two style guides disagree and you need the documented positions.

## Capitalization

- **Sentence case for everything** — titles, headings, buttons, menus, labels, nav — on web, Android, Windows, cross-platform. Why (four documented reasons): reads friendlier; keeps proper nouns detectable ("Calendar" the product vs. a calendar); consistent without a which-words-capitalize rulebook; "when in doubt, don't capitalize" (Microsoft). Mandated by Material, Microsoft, Polaris, Atlassian, Mailchimp, GOV.UK.
- **Native macOS/iOS exception**: Apple HIG mandates title case for buttons, menu items, and alert titles (capitalize all words except articles, conjunctions, and prepositions ≤4 letters); sentence case for body/descriptions. Follow the platform.
- Never mix systems within one element type. Never ALL CAPS (destroys word shape; screen readers may spell it letter-by-letter). Email addresses and URLs lowercase; "website", "internet", "email" lowercase.

## Punctuation

| Mark | Rule | Why |
|---|---|---|
| Period | Not on titles, headings, buttons, labels, list fragments, or a single-sentence tooltip/dialog line; yes once text is 2+ sentences | Noise in scanned strings |
| Exclamation | Budget ≈ zero; hard ceiling one per page (Atlassian); never in failures (unanimous across guides) | Reads as shouting; inflation devalues it |
| Question mark | Preferred in confirmation titles: "Remove downloaded book?" | The question is the confirmation |
| Ellipsis | In-progress states only ("Downloading…"), single … character; plus the macOS/iOS menu convention for actions needing further input ("Save As…") | Otherwise decoration |
| Ampersand | Write "and"; & only in brand names ("Ben & Jerry's") | Localization; screen-reader pronunciation varies |
| Colon | Not after field labels | Label placement already shows the relationship |
| Oxford comma | Always in lists of 3+ ("Android, iOS, and Windows") | Kills last-two-items ambiguity |
| Em dash | No surrounding spaces | MS/MC convention. Disagreement: Material bans em dashes (en dash only); Atlassian uniquely mandates *spaced* em dashes — follow the product's existing convention |
| Quotes | Curly, periods inside (US style) | Polish |
| Contractions | Yes ("it's", "you're") — but spell out load-bearing negations: "cannot be undone", "do not share this key" | GOV.UK research: users misread "can't" as "can" |

## Numbers, dates, time

- **Numerals always in UI, even 1–9**: "You have 3 messages". (Long-form documentation prose may spell 0–9 — different genre.) Commas over 3 digits ("1,000"); "150k" only where space forces it.
- **Dates spelled out**: "Jan 24, 2026" (+ weekday when it aids planning: "Saturday, Jan 24"). Never all-numeric "01/02/2026" — flips meaning across locales.
- **Times**: numerals + lowercase am/pm with space ("7 am"), en-dash ranges ("7 am–10:30 pm"), time zone whenever scheduling across people.
- **Relative vs absolute timestamps**: relative ("2 hours ago") for fresh, high-churn content — spares date math and signals recency; absolute for anything referenced later (documents, orders, contracts). Auto-convert relative → absolute after ~4 weeks; hybrid best practice: relative text, absolute in tooltip.

## Person & pronouns — the full decision

```
Does the label survive with no pronoun?      → Use none. "Settings", "Favorites"
Is the user notionally speaking (consent,
ownership controls)?                          → "I / my / me": "I agree to the terms",
                                                "Remember my password"
Is the product speaking to the user?          → "you / your": "Your order shipped"
Product assembled it for the user?            → "your" ("Your daily mix")
User built/owns it and ownership is the point?→ "my" ("My playlists") — only if "my"
                                                is the product-wide register
```

- **Never mix registers.** "Change your preferences in My Account" is the canonical error (Material).
- **"We"**: avoid in system strings — "We couldn't save your file" → "Couldn't save your file". Sanctioned: a real human/team will act ("We'll review your appeal within 2 days"); privacy/security promises the company must own ("We never sell your data"); "we recommend" over the stilted "it is recommended". A product refers to itself by name before ever saying "we" (Shopify). The product never says "I" (assistant personas excepted).
- **Errors never blame "you"**: prefer problem-focused or deliberately passive phrasing — "That password doesn't match" not "You entered the wrong password".
- **Gender**: singular they; a person's stated pronouns; rewrite with roles/plurals to avoid he/she.

## Grammar defaults

- **Active voice, present tense, imperative for instructions.** "The app saves your changes" (not "will save"); "Enter a file name, then save the file."
- **Passive is *correct*** in exactly two places — don't "fix" it there: (1) errors where active blames the user ("That site can't be found"); (2) when the object matters more than the actor and front-loading it aids scanning.
- Kill "there is/there are", stray "you can", "in order to", nominalizations ("make a payment" → "pay", "perform an installation" → "install").
- AI-feature copy: past tense + attribution for behind-the-scenes actions ("Suggested for you"), uncertainty words where the system may be wrong.
- Front-load the objective in instructions: "To remove a photo, drag it to the trash."

## Accessibility (copy's share of it)

- **Links** describe their destination and survive out of context (WCAG 2.4.4 Level A — screen-reader users navigate a bare list of the page's links). First 2 words carry the scent. Identical text ⇒ identical destination.
- **No sensory/directional instructions** (WCAG 1.3.3 Level A): not "the green button", "see below", "on the right" — name the control: "Select **Save**". Color, position, and shape all break under screen readers, color-blindness, and reflowed mobile layouts.
- **Alt text**: function/content in context; decorative images get `alt=""`; never "image of…" (the screen reader already announces it).
- **Errors**: visually-hidden "Error:" prefix so state is announced; never color as the only signal (~350M people have color-vision deficiency).
- **Reading level**: US grade 7 (Shopify) / UK reading age ~9 (GOV.UK) — directionally identical, aim low; specialists prefer plain language too and rate plain authors as *more* competent (NN/g). Sentences ≤ 20–25 words.
- **Device-correct verbs**: "tap" on touch, "click" with pointer, "select" when unknown — and "there are no clicks on touch-screen devices" also bans "click here" everywhere it appears.

## Internationalization-safe strings

- **No idioms, slang, puns, pop-culture, wordplay humor** — untranslatable and opaque to non-native readers ("hit the ground running" → "start quickly").
- **Expansion budget** (IBM via W3C): strings ≤10 chars grow **200–300%** in translation; 11–20 chars **180–200%**; 21–30 **160–180%**; 31–50 **140–160%**; 70+ **~130%**. ("views" → German 2.8×.) Assume buttons/labels/tabs need 2–3× room; copy that only fits exactly is a layout bug waiting for German.
- **One full sentence per string** with named placeholders: `You have {count} new messages` + real plural forms (ICU), never `"You have " + n + " new"` concatenation (word order, gender, and pluralization differ per language) and never "(s)" hacks — "1 message(s)" is untranslatable and sloppy in English.
- Keep structural small words ("that", "who", articles): "Select the checkbox of each folder **that** you want to sync" — they disambiguate for humans and MT alike. Ambiguous short labels get their verb back: "Access denied" → "Access is denied". No modifier stacks ("extremely well thought-out migration project plan"); subject-verb-object order.

## Where copy meets layout — line breaks, orphans, truncation

The writer owns how the string breaks, not just what it says. A good sentence that wraps badly ships as bad copy. (Writer-level rules below; the full engineering craft — CSS recipes, truncation implementations, i18n layout, WCAG stress tests — lives in the sibling `text-layout` skill.)

- **No orphans: a single word never sits alone on the last line** of a heading, dialog title, empty-state headline, toast, or card title. Why: the stranded word gets outsized visual weight, the block reads as broken/unfinished, and it defeats first-2-words scanning. Fix in this order:
  1. CSS — `text-wrap: balance` on headings and titles (evens all lines), `text-wrap: pretty` on short body blocks (prevents the lone last word). The robust fix: survives resizing *and* translation.
  2. No CSS control (email, some native views) — non-breaking space between the last two words. Fragile: translations re-break; prefer CSS.
  3. The writer's fix — shorten or reword the line so it breaks cleanly at the target width. If only rewording saves it, the line was too long.
- **Glue pairs that must never split across lines:** number + unit ("3 MB", "10 min"), date parts ("Jan 24"), amount + currency, multi-word product/plan names ("Pro plan"). Non-breaking space in the string, or `white-space: nowrap` on the span. A split pair momentarily reads as two separate facts.
- **Buttons and labels never wrap to a second line.** A wrapped button reads as broken UI. Fix the label (verb + noun, 1–3 words), never the font size — and if a translation wraps it, the label is too long, not the button too small.
- **Never hand-place `<br>` inside UI strings.** It breaks at every other viewport width and gets baked into translations. Breaking is layout's job; wording is yours.
- **Truncation is a last resort — prefer wrapping.** Where fixed space forces it (tables, dense lists): end-ellipsis for prose; middle-ellipsis for filenames and IDs (the distinguishing part is usually the end: "quarterly-…-v2.pdf"); never truncate what distinguishes items from each other; the full value stays reachable on hover/focus and readable to screen readers.

## Where the guides disagree — documented positions

Encode the default; deviate knowingly when the platform demands.

1. **Capitalization**: sentence case (Material, MS, Polaris, Atlassian, MC, GOV.UK) vs title case for controls (Apple). → Platform decides; web = sentence case.
2. **My/your/none**: MS restricts "my" to user-voiced controls; Saito splits by who's speaking; Microsoft's own UI history dropped pronouns ("This PC"). → None > your > my; one register only.
3. **Ellipsis for "needs more input"**: Apple requires, MS discourages, Material only in-progress. → Apple platforms only.
4. **Number spelling**: Material always numerals in UI; MS spells 0–9 in docs prose. → UI numerals; docs 0–9.
5. **Negative contractions**: everyone loves contractions; GOV.UK alone spells out "cannot/do not" — because users misread. → Contract everywhere except load-bearing negation.
6. **"We"**: MS/Material minimal; MC/Atlassian permissive. → Minimal in system strings; human where humans act.
7. **Exclamation**: MC ≤1 at a time; Atlassian ≤1/page; Material greetings only. Unanimous: never in errors. → Default zero.
8. **Passive voice**: all guides demand active; only MS + NN/g document the blame-avoiding passive exception. → Active, except errors/headings as above.
9. **"Sorry"**: GOV.UK never; MS only for serious product-caused failures. → One sorry, real failures only; also acceptable on no-results (NN/g).
10. **OK**: Apple allows for pure acknowledgment; NN/g/Polaris push verbs everywhere. → OK only when the user makes no choice.
11. **Period on a lone full sentence in components**: Material omits; MS/MC keep. → Keep on real sentences; drop on fragments — consistency within the product outranks the choice.
12. **Empty-state CTA**: Yifrah always; Podmajersky optional. → CTA when a genuine next action exists; never a fabricated one.
