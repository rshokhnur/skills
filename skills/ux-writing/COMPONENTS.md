# Component playbook — formulas per surface

Load this when writing copy for a specific surface. Every formula follows the message skeleton (what → why-if-non-obvious → verb-labeled next action) and the SKILL.md voice. Sources: NN/g, Baymard, Apple HIG, Material, Microsoft, Polaris, GOV.UK, Mailchimp, Intuit, Podmajersky, Yifrah, Smashing.

## Buttons, CTAs & links

**Formula: `verb + noun`, 1–3 words, no articles, front-loaded, names exactly what happens next.**

- The label must predict the immediate outcome, not the eventual benefit. Users decide from the button alone — they skip surrounding text. "Show rooms" (opens room list), not "Book now" (lies — booking is 3 screens away). "Open an account", not "Become an investor".
- Single verbs only when the object is unambiguous in context: "Rename", "Duplicate". When ambiguous, add the noun: "Delete folder", not "Delete".
- Write "Send a code", not "Get a code" — the product can promise sending, not receipt.
- GOV.UK's canonical flow set (use these exact conventions): "Start now", "Sign in", "Continue" (nothing saved), "Save and continue" (progress saved), "Pay", "Sign out". Never label "Continue" when the step actually saves — that's a broken promise in reverse.
- Checkout/transaction rule (the $300M button, Spool): never gate a purchase behind account creation, and say so in copy — "You don't need an account to check out." Replacing forced "Register" with "Continue" + that sentence = +45% completed purchases.
- Conversion CTAs may use first person — "Start my free trial" beat "Start your free trial" by +90% CTR in Aagaard's original 2012 test (single test, primary source now offline; replications land at +10–40%) — but only on high-intent conversion moments, and never mixed with second-person labels elsewhere on the screen.
- Reduce click anxiety beside the button, not in it (Yifrah's "click trigger"): "Sign up" + "Free — no card required" under it. The trigger names the specific fear: price, spam, commitment, reversibility.
- Links: describe the destination; make sense read alone (screen readers list links out of context); front-load ("people mostly look at the first 2 words of a link" — NN/g); identical labels must lead to identical destinations. Bare "Learn more" is banned; qualified "Learn more about exporting" is the floor, "How exporting works" is better.

## Forms: labels, placeholders, help text

**Formula: visible label above the field + persistent hint outside the field + outcome-named submit button.**

- Every field gets a persistent visible label. **Placeholder-as-label is banned** — NN/g documents 8 harms; the load-bearing ones: the hint vanishes exactly when the user needs to verify (they can't check work before submitting; autofill errors go undetected); eyes are drawn to *empty* fields, so filled-looking fields get skipped; screen readers don't reliably announce placeholders. Placeholders may only show a format example ("name@company.com") duplicated nowhere else — and even that is safer as help text.
- Format requirements and rules live in permanently visible help text, never revealed one failed submit at a time. Password rules: show the full checklist upfront and check items off live as the user types.
- Ask only for what you need; explain non-obvious asks inline with *To [benefit], [ask]*: "To personalize training plans, add your birth date." Explained asks complete more (Strava pattern); one deleted confusing optional field ("Company") was worth +$12M/year to Expedia.
- Mark required fields with * and optional fields with "(optional)" — users don't read top-of-form instructions and forget them mid-form. Minimize optional fields (1–2 per form max). Two-field login forms need no marking.
- Submit button names the outcome: "Create account", "Place order", "Save changes". Never "Submit" ("Submit" → "Send campaign" was +18% for Mailchimp).
- Never add a Reset/Clear button — accidental total loss outweighs the rare restart.
- Anxiety copy goes next to the anxious field (Yifrah): security reassurance beside the card number ("Encrypted — we never store your card"), not in a footer. Hesitation is local; reassurance elsewhere doesn't transfer.

## Errors & validation

**Formula: what happened (named object, specific cause) → why, if known → how to fix (or a control that fixes it) → status of anything sensitive ("Your card was not charged").**

- Never: "invalid/illegal/bad/forbidden" (blame), "failed to" (→ "couldn't"), bare codes, "An error occurred", "This field is required" (→ "Enter your first name"). Passive voice is *correct* here when active would blame: "That site can't be found."
- Mirror the field's label in the message. Label "Email address" → "Enter your email address", not "This field is required". Empty field → instruction ("Enter your first name"); rule violation → the rule ("Name must be 35 characters or less").
- **Be cause-specific, not field-generic.** 98% of sites show one generic message per field; the 2% that adapt to the actual sub-cause (Baymard) dramatically reduced abandonment — generic messages sent users into 5-minute spirals fixing the wrong thing. Write 4–7 variants for complex fields: "This email is missing the @" / "…missing the domain (like .com)" beat "Email is invalid". "Card number is incomplete" beats "Card is invalid". "The state doesn't match the ZIP code" beats "Invalid ZIP".
- Timing: validate on blur, not on submit-only, and never while the user is still typing (it "feels hostile"). Exceptions: known-length fields (card, ZIP) may validate the instant the length is reached; password-creation and username fields validate live with a requirements checklist. The error must disappear on the keystroke that fixes it — a stale error over a corrected field reads as still-broken.
- Placement: directly at the field, red + icon + border (never color alone — ~350M people have color-vision deficiency), plus a page-top summary on long forms with *identical wording*, each item linking to its field. Hidden "Error:" prefix for screen readers.
- Preserve every character of input. Clearing fields on error is the fastest way to abandonment. Sole exception: password/PIN fields clear on a failed attempt (Microsoft).
- Login errors: "Your password is incorrect" recovers users far better than "email and/or password not found" — but only ship the specific version with rate-limiting in place (it confirms account existence). Otherwise: generic message + constructive path ("Check your email address, or reset your password").
- Same error 3+ times → escalate: offer a different path or support contact. A frequent error is a design bug wearing a copy costume.
- 404/total failure: plain language (no "404 Not Found" alone), no blame, what's missing, real next steps (search, likely links). Humor is permitted *only* here — total failure, no user data at risk — and even then plain beats clever in products handling money, health, or work.

## Empty states

**Formula: what this space is → why it's empty → what to do next (a real button when a genuine next action exists).**

- Diagnose the type first; the copy differs:
  - **First use** — teach and invite: "Star repositories to see them here" + "Explore repositories". This is onboarding real estate, the moment confidence is won.
  - **User cleared** — quiet or lightly congratulatory: "All caught up". Don't re-explain the feature they just used.
  - **No results** — state it plainly, then repair: "No results for 'blutooth speaker'. Did you mean **bluetooth speaker**? Or browse **Audio**." Never suggest a search that also returns zero — worse than no suggestion. A brief "sorry" is acceptable here; blaming the query is not.
  - **Error/permission** — explain why it can't work + the fix: "Calendar needs access to show your events. Turn it on in Settings > Privacy." Users forget they denied a permission; without this line the app just looks broken.
- Never a bare "Nothing here yet" — it misleads in three of the four cases. Never show the empty state while data is still loading (a false zero is a status lie users act on).
- One headline sentence, at most one support line, one primary action. CTA when a genuine next action exists (Yifrah); never a fabricated button just to have one (Podmajersky). Multi-paragraph explainers get skipped and bury the action.

## Confirmation dialogs & destructive actions

**Formula: title = the action as a short question with the named object ("Delete 'Q3 report'?") → body = concrete consequence only ("This cannot be undone. 82 photos will be removed from all devices.") → buttons = verb-echo pair ("Delete 82 photos" / "Cancel").**

- The decision tree lives in SKILL.md (reversible → undo; risky → confirm; catastrophic → type-to-confirm; routine → nothing). This file is the wording.
- Name numbers and objects — "the list and its 2,340 subscribers" — so the user has something to check their intent against. A generic "Are you sure?" triggers nothing.
- Never Yes/No (forces re-reading the question), never OK/Cancel for a real decision, never explain the buttons in body text (if buttons need explaining, relabel them — Apple).
- Destructive button: red/destructive style, echoes the verb, and is never the default/focused action — NN/g and current Apple HIG both prefer **no preselected default at all**, so the user must read before acting. Nuance (HIG): style a button destructive only when the user might not intend the loss — a deliberately chosen "Empty Trash" isn't styled as a warning.
- When the action is itself "cancel": no button says bare "Cancel" — "Keep reservation" / "Cancel reservation".
- Spell out load-bearing negations: "cannot be undone", not "can't".

## Toasts, snackbars & success

**Formula: `object + past-tense verb`, one line: "Message sent". Optional single action: Undo, View, Retry, Edit, Change.**

- Ban "successfully" (the toast IS the success), "Your X has been…" (padding before the news), exclamation marks on routine completions.
- Toasts are only for confirmations needing no action and low-stakes info. Anything the user must read or act on → banner or dialog; blocking errors never go in a toast (it vanishes).
- Undo-in-toast is the mechanism that replaces confirmation dialogs: act immediately, confirm with "Archived [Undo]". With an action attached, keep the toast ≥10 s (Polaris accessibility rule; ~5 s default otherwise).
- Toast actions are verbs of change, never dismissals: no OK, Got it, Dismiss.
- Celebration gate (Intuit): celebrate what the *user* accomplished ("You paid off your balance"), never what the product did ("Signed in successfully!" is the product high-fiving itself); never frequent events (wears out, and celebrating routine success implies it's usually failure); scale words to the achievement — saving a draft is not a confetti moment. Celebrate realized value, not administrative milestones: first task completed, not account created.
- Every user-initiated state change gets visible acknowledgment within 1 s — silence produces double submissions.

## Loading, progress & waiting

**Formula: present-progressive verb + named object (+ count when known): "Uploading 3 of 12 photos…"**

- Indicator-choice thresholds (NN/g): **< 1 s** — no indicator (a spinner flash reads as jank). **~2–9 s** — spinner/skeleton + one line naming the work. **≥ 10 s** — determinate progress (percent or count) mandatory; a spinner past 10 s reads as hung. (Distinct from Nielsen's 0.1/1/10 s response-time perception limits — different research, don't merge them.)
- The copy's job is killing uncertainty, not entertaining. Users with a labeled moving indicator waited ~3× longer. Never "Please do not refresh this page" — disable the control and show state instead.
- Estimates: round up, give ranges ("About 3 minutes remaining", "This might take a few minutes") — finishing early delights, finishing late breaks trust. For long jobs, warn *before* starting: "This may take a while — we'll email you when it's done."
- Step counts beat fake percentages when duration is unknowable.
- Skeletons: full-page loads only; spinner for a single module; progress bar for a process (upload, export).

## Notifications & push

**Formula: the payload itself, front-loaded — never an ad for the payload.** "Dana: 'Running 10 min late — start without me.'", not "You have a new message! Open the app to read it."

- Send only if timely + personally relevant + actionable. All three or don't send. Guilt and manufactured urgency ("We miss you 😢") train uninstalls; urgency must come from real expiring value.
- Never the app name in the text (the OS shows it), never "open the app to…" (deliver the information instead of advertising it).
- Safe visible lengths (vendor-measured, OS-truncated): **title 35–50 chars, body 80–120**. Write for the shortest case; let the OS truncate — don't pre-truncate.
- More than ~5 simultaneous events → one summary ("12 tasks due today"), never a burst.
- Action buttons: result verbs ("Reply", "Snooze"), ≤ ~15 chars, no destructive actions in notification buttons.
- Never resend for the same event. Badges supplement text; critical info never lives only in a badge.

## Onboarding, tooltips & permissions

**Default: no onboarding.** NN/g's 70-user study: upfront tutorials made tasks *feel* harder and skippers rated the app easier. Add flow copy only when setup info is genuinely required, the experience is tailored, or the mechanic is truly novel.

- Deliver instruction at the moment of need, beside the step — short-term memory holds ~20 s, so anything explained upfront is gone by the time it's needed.
- Coach marks: one per overlay, one-tap dismiss, recallable in help, never for conventions (annotating a gear icon tells users your app is complicated). Instructional copy must never bandage bad design.
- Lead with what the user can *do now*, not what the product is — feature-promotion carousels read as marketing and get skipped.
- Permissions: ask when the user taps the feature that needs it, never batched at first launch. Formula: **[resource] + so that you can [user's task]** — "Allow location so you can pick nearby departure airports." Showing any reason lifted grants by ~12%, and the most vs. least compelling rationale differed by 81% (Tan et al., cited by NN/g) — the reason's quality matters as much as its presence; "to improve your experience" is banned (says nothing). High-stakes or Android: show your own explainer screen *before* the OS dialog (the OS text is uneditable, and a declined OS prompt is expensive to reverse). If denied: the feature's empty state explains why it can't work + links to settings.

## Settings, labels & navigation

- Label controls by what they do, practically: describe the ON state of a toggle ("Send me weekly summaries") — people infer the OFF state; never describe both.
- Navigation and section labels: bare nouns, front-loaded, no pronouns where possible ("Account", "Billing", "Favorites"). If a pronoun is needed, "your" when the product assembled it ("Your daily mix"), "my" only when the user built it — and only one register per product.
- Settings descriptions state consequences, not implementation: "Videos play without sound until you tap them", not "Disables autoplay audio streams".
- One term per entity everywhere — "account" or "profile", never both for the same thing; align with the term legal/billing uses in regulated products.
