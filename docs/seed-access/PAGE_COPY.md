# The NFE Study Circle — Page Copy & Structure

Route: `/study-circle`. Not linked from main navigation. Reached only via
a private invitation link (`?invite=<token>`).

## Invalid / missing invitation state

Shown when no token is present, or the token fails verification (not
found, expired, or already used). No form is rendered in this state.

Eyebrow: `A Private NFE Invitation`

Headline: `This link isn't active.`

Body: `The NFE Study Circle is by private invitation only. If you
believe you received this link in error, or your invitation has expired,
reach out to Vanessa directly and she'll help.`

No email address or contact form is hardcoded here in Phase 1 — this
state intentionally does not expose *why* a token failed (not found vs.
expired vs. used) to avoid confirming to an outside guesser that a token
format is even close to valid.

## Valid invitation — hero

Eyebrow: `A Private NFE Invitation`

Headline: `The NFE Study Circle`

Subheadline: `You've been invited to experience NFE thoughtfully, use
the ritual consistently, and share honest observations over time.`

Primary action: `Begin Your Private Intake` (scrolls to the intake form)

## Why you were invited

`This circle is intentionally small. You were invited for your
perspective and relevance to who NFE is made for — not selected at
random and not open for general sign-up.`

`The purpose is honest feedback. Positive feedback is not required, and
your participation does not depend on it. What you share helps NFE
refine ritual guidance, education, and care for the people who come
after you.`

## What participation includes

- Using the assigned product as directed, over the study period
- Sharing your initial impressions
- A check-in 7–10 days in
- A check-in 3–4 weeks in
- Honest observations at each step
- An optional conversation about a testimonial, only if you're open to it

## What NFE asks

- Consistent use, as directed
- Thoughtful, candid feedback — including what isn't working
- Completing the check-ins above
- Telling NFE promptly if anything feels uncomfortable or irritating
- No obligation to post publicly, ever

## Privacy and permission

`Everything you share as part of this study is private. NFE will never
use your name, your image, or your words without your separate,
explicit permission — granted (or not) below, item by item. Saying no
to any or all of it does not affect your place in the study.`

## Intake form

Section heading: `Your Private Intake`

### Fields — required

- First Name (text)
- Last Name (text)
- Email Address (email)
- Age Range (select — reuse `FOUNDER_ACCESS_AGE_RANGES`)
- Current Skin Type (select: Dry, Normal, Combination, Oily, Sensitive,
  Mature / Changing Skin, Not Sure — reuse the Science skin-type set)
- Primary Skin Concerns (checkbox group — reuse
  `FOUNDER_ACCESS_SKIN_INTERESTS`, framed as self-reported context, not
  diagnosis)
- Product Being Used (radio: Face Elixir / Body Elixir — pre-selected
  from the invitation if the invitation carries an assignment, editable)
- "I'm willing to use this as directed for the full study period."
  (checkbox)
- "I'm willing to complete the check-ins above." (checkbox)

### Fields — optional

- Phone Number (tel)
- City / State (text)
- Current skincare routine (textarea)
- Known sensitivities (textarea) — framed: *"Self-reported, for context
  only. This is not a medical intake and NFE does not review medical
  history."*
- Fragrance sensitivity (checkbox)
- Preferred contact method (select: Email / Phone / Text)
- Anything else NFE should know (textarea)
- How did you hear about this? (select — reuse the source list in §15
  of the architecture doc)

### Consent — Group A, Participation Agreement (all required)

See `ARCHITECTURE.md` §7 for exact field-to-column mapping. Rendered as
five separate checkboxes under one subheading, not one bundled
paragraph.

### Consent — Group B, Sharing My Story (all optional)

Subheading copy: `Everything below is optional. You can say yes to
none of these, some of these, or all of these — nothing here is
required to take part.`

Rendered as its own visually distinct card, after the required group,
so a participant can clearly finish the required section before
encountering the optional one.

## Confirmation state

Shown after successful submission. Replaces the form (matches the
Founder Access `role="status" aria-live="polite"` pattern).

Eyebrow: `The NFE Study Circle`

Headline: `Your place in the circle is noted.`

Body: `Thank you for accepting this invitation. NFE will follow with
product timing, ritual guidance, and the details of your first
check-in.`

No shipment date or timing promise — matches the brief's explicit
instruction not to promise product shipment or timing unless
operationally confirmed.

## Error states

- **Invalid/expired/used invitation** — see above; distinct page state,
  no form rendered.
- **Submission network/server error** — `role="alert"` panel above the
  form's submit button, matching Founder Access's existing pattern:
  `"Something went wrong. Please try again, or reach out directly if it
  keeps happening."`
- **Required field missing** — native HTML5 `required` + browser
  validation UI, consistent with Founder Access; no custom inline
  validation library introduced.
- **Token expired between page load and submit** (edge case: participant
  leaves the tab open past `expires_at`) — the intake endpoint
  re-validates the token server-side at submission time independent of
  the page-load check, and returns a distinct error message: `"This
  invitation link has expired. Reach out to Vanessa for a new one."`
