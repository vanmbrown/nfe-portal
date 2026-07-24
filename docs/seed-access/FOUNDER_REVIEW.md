# The NFE Study Circle — Founder Review

This document lets you review the complete Study Circle experience
without reading code. It reflects the page exactly as built at
`/study-circle` (visit with `?invite=nfe-study-circle-demo` locally to
see the full valid-invitation experience — that token is a fake,
prototype-only demo value, not a real invitation).

Nothing described here has touched production. No real invitation has
been issued, no participant data has been collected, no migration has
been applied.

---

## A. Recommended customer-facing name

**Recommendation: "The NFE Study Circle."**

- It fits NFE's existing voice — "Circle" carries intimacy without mass
  enrollment, consistent with "Not For Everyone."
- It's more dignified than "Seed Access," which sounds like a software
  feature flag, not something you'd invite a person into. "Seed Access"
  stays as the internal/operational label only — it never appears to a
  participant.
- It avoids clinical-trial language ("study" here reads as "we're
  studying how this ritual performs," not "you are a research subject")
  while still being honest about structure — check-ins, a defined
  period, real feedback.
- It supports continuity: if there's a second cohort later, "The NFE
  Study Circle" can simply continue rather than needing a new name.

### Alternatives considered

| Name | Tone | Drawback |
|---|---|---|
| A Private NFE Invitation | Quiet, correct | Describes the *delivery mechanism*, not an identity — it's currently the eyebrow text above the real name, not strong enough to stand alone as the name itself. |
| The First NFE Circle | Warm, milestone-feeling | Centers "first" — implies a sequence/launch narrative more than it communicates what participation actually involves. |
| Private Ritual Study | Close to the recommendation | Drops "NFE" from the name itself, losing a small but real brand-reinforcement opportunity every time a participant refers to it by name. |
| The NFE Experience Circle | Soft, hospitality-coded | "Experience" is vaguer than "Study" — could read as a perk rather than a structured feedback commitment. |
| Founder's Circle Study | Personal, founder-centered | Shares the word "Founder" with Founder Access — risks blurring the exact distinction this whole build exists to protect. Not recommended. |

**Final recommendation stands: The NFE Study Circle.** This is a naming
decision for you, not something to change without your sign-off — flagged
in §J.

---

## B. Exact page journey

### 1. Invitation gate (no token, or token fails)

> **A PRIVATE NFE INVITATION**
> # This link isn't active.
> The NFE Study Circle is by private invitation only. If this link isn't
> working for you, reach out to Vanessa directly and she'll help.

No form. No hint about *why* the link failed (missing, wrong format,
expired, or already used all look identical) — see §F.

### 2. Hero (valid token)

> **A PRIVATE NFE INVITATION**
> # The NFE Study Circle
> You've been invited to experience NFE thoughtfully, use the ritual
> consistently, and share honest observations over time.
>
> **[ Begin Your Private Intake ]**

### 3. Why You Were Invited

> ## Why you were invited.
> This circle is intentionally small. You were invited for your
> perspective and relevance to who NFE is made for — not selected at
> random and not open for general sign-up.
>
> The purpose is honest feedback. Positive feedback is not required, and
> your participation does not depend on it. What you share helps NFE
> refine ritual guidance, education, and care for the people who come
> after you.

### 4. What Participation Includes / 5. What NFE Asks (two columns)

> ## What participation includes.
> - Using the assigned product as directed, over the study period
> - Sharing your initial impressions
> - A check-in 7–10 days in
> - A check-in 3–4 weeks in
> - Honest observations at each step
> - An optional conversation about a testimonial, only if you're open to it
>
> ## What NFE asks.
> - Consistent use, as directed
> - Thoughtful, candid feedback — including what isn't working
> - Completing the check-ins above
> - Telling NFE promptly if anything feels uncomfortable or irritating
> - No obligation to post publicly, ever

### 6. Privacy and Permission

> **PRIVACY AND PERMISSION**
> Everything you share as part of this study is private. NFE will never
> use your name, your image, or your words without your separate,
> explicit permission — granted (or not) below, item by item. Saying no
> to any or all of it does not affect your place in the study.

### 7. Participant Intake

> **THE NFE STUDY CIRCLE**
> ## Your Private Intake

Full field list in §D.

### 8. Participation Agreement (required, 5 items)

> **PARTICIPATION AGREEMENT** — *All five are required to take part.*
> - I understand what this study asks of me (product use over the stated
>   period, my honest impressions, and completing the check-ins above).
> - I have read and agree to the Privacy Policy.
> - NFE may contact me about this study (logistics, check-in reminders,
>   timing).
> - I understand honest feedback is what's being asked for — positive
>   feedback is not required, and my participation does not depend on it.
> - NFE may use what I submit internally to inform product and education
>   decisions.

### 9. Sharing My Story (optional, 12 items)

> **SHARING MY STORY**
> Everything below is optional. You can say yes to none of these, some
> of these, or all of these — nothing here is required to take part.

Full breakdown in §E.

### 10. Confirmation

> **THE NFE STUDY CIRCLE**
> # Your place in the circle is confirmed.
> Thank you for accepting this invitation. NFE will follow with product
> timing, ritual guidance, and the details of your first check-in.

*(Refined from "is noted" — see §G.)*

---

## C. Participant obligations

**Required:**
- Use product as directed
- Complete the agreed check-ins (7–10 day, 3–4 week)
- Provide honest feedback
- Notify NFE of discomfort or irritation
- Accept the Privacy Policy and the participation terms above

**Optional (all independent, all default "no"):**
- Testimonial quotation
- Light editing of quotes for length (only relevant if quoting is granted)
- First-name use
- Full-name use
- Photo use
- Video use
- Website use
- Email use
- Organic social use
- Paid-media use
- Future-study contact
- General marketing email

**Confirmed by direct review of the copy and code:**
- No positive review is required — stated explicitly, twice ("Positive
  feedback is not required" in §3, restated in the required consent
  text itself).
- No public posting is required — "No obligation to post publicly,
  ever."
- Nothing promises product receipt, free product, payment, shipping, or
  a guaranteed timeline. The confirmation copy deliberately stops at
  "NFE will follow with product timing" — timing is explicitly *not*
  committed to here, matching the instruction not to promise it unless
  operationally confirmed.

---

## D. Field inventory

| Field | Req/Opt | Purpose | Why NFE needs it | Privacy sensitivity | Recommendation |
|---|---|---|---|---|---|
| First Name | Required | Address the participant, personalize correspondence | Yes | Low | Retain |
| Last Name | Required | Eventual shipping/correspondence formality | Yes, once product is physically sent | Low | Retain |
| Email | Required | Primary contact, check-in delivery | Yes | Medium | Retain |
| Age Range | Required | Confirms relevance to NFE's mature-skin positioning | Yes — core to whether feedback is representative | Low | Retain |
| Skin Type | Required | Needed to interpret feedback meaningfully | Yes | Low | Retain |
| Primary Skin Concerns | Required | Same — feedback is uninterpretable without it | Yes | Low (self-reported, non-diagnostic) | Retain |
| Product Being Used | Required | Determines which check-in questions apply | Yes | Low | Retain — **see open question in §J about whether this should be pre-assigned rather than participant-chosen** |
| "Willing to use as directed" | Required | Sets expectations before commitment | Yes | None | Retain |
| "Willing to complete check-ins" | Required | Same | Yes | None | Retain |
| Phone | Optional | Fallback contact method | Nice-to-have | Medium | Retain, optional |
| City / State | Optional | Light geographic signal; not a shipping address | Useful, not required | Low | Retain, optional — **does not replace a real shipping address if product is physically mailed (see §J)** |
| Preferred Contact Method | Optional | Helps you reach out the right way | Nice-to-have | Low | Retain, optional |
| Current Skincare Routine | Optional | Context for interpreting feedback | Useful | Low-medium | Retain, optional — **could reasonably move to the first check-in instead of intake if the form ever feels long** |
| Known Sensitivities | Optional | Participant safety before using a new product | Yes — genuine safety value | **Higher** — closest field to health-adjacent content, already hedged with a non-medical disclaimer | Retain, optional, but treat with the most retention care of any field (§ Privacy) |
| Fragrance Sensitivity | Optional | Common, specific, actionable — structuring it saves the participant from writing it out | Useful | Low | Retain, optional |
| Additional Context | Optional | Open-ended courtesy field | Low cost, gives participants a voice | Low-medium (freeform) | Retain, optional |
| ~~How did you hear about this?~~ | ~~Optional~~ | ~~Attribution~~ | Already captured on the invitation record itself at the point you issue it | — | **Removed during this review.** Asking the participant to self-report something you already recorded when you invited them was redundant. |

**Recommended MVP field set:** exactly what's now implemented — nine
required, seven optional. Nothing else currently reads as excessive for
a 10–15 person, personally-curated cohort.

---

## E. Consent review

| Consent | Req/Opt | Separate/Bundled | Purpose | Current wording | Retain/Revise |
|---|---|---|---|---|---|
| Understand study expectations | Required | Separate | Sets the bar before commitment | "I understand what this study asks of me (product use over the stated period, my honest impressions, and completing the check-ins above)." | Retain |
| Privacy Policy | Required | Separate | Legal document, distinct from study-specific terms | "I have read and agree to the Privacy Policy." | Retain |
| Contact about study | Required | Separate | Permission for logistics/reminders | "NFE may contact me about this study (logistics, check-in reminders, timing)." | Retain |
| Honest-feedback acknowledgment | Required | Separate | States plainly that praise isn't the goal | "I understand honest feedback is what's being asked for — positive feedback is not required, and my participation does not depend on it." | Retain |
| Internal use of submission | Required | Separate | Bounds use to internal product/education decisions only | "NFE may use what I submit internally to inform product and education decisions." | Retain |
| Quote permission | Optional | Separate | Testimonial use | "NFE may quote my written feedback." | Retain |
| Quote-editing permission | Optional | Separate, conditional on quote permission | Bounds edits to length only | "NFE may lightly edit quotes for length, without changing their meaning." | Retain |
| First-name use | Optional | Separate from full name | Attribution, minimal | "NFE may use my first name." | Retain |
| Full-name use | Optional | Separate from first name | Attribution, fuller | "NFE may use my full name." | Retain |
| Photo use | Optional | Separate from video | Media | "NFE may photograph me or use a photo I provide." | Retain |
| Video use | Optional | Separate from photo | Media | "NFE may use video of me." | Retain |
| Website use | Optional | Separate | Placement | "NFE's website" | Retain |
| Email use | Optional | Separate | Placement | "Email to NFE subscribers" | Retain |
| Organic social use | Optional | Separate from paid | Placement | "Organic social media — NFE's own posts" | Retain |
| Paid-media use | Optional | Separate from organic | Placement — a participant may be fine in NFE's own feed but not in an ad | "Paid advertising" | Retain |
| Future-study contact | Optional | Separate from general marketing | Ongoing relationship | "NFE may contact me about future studies like this one." | Retain |
| General marketing email | Optional | Separate from future-study contact | Standard newsletter-style consent | "I'd like to receive general NFE marketing emails." | Retain |

**Confirmed directly against the implementation:**
- Participation consent ≠ marketing consent — two different fields, two
  different database timestamps.
- Testimonial (quote) consent ≠ image consent — independent booleans.
- Website permission ≠ paid-advertising permission — independent
  booleans, not a single "may use my content" toggle.
- First-name permission ≠ full-name permission — independent, even
  though granting full name logically implies first name; kept
  separate rather than collapsed into one control.
- Photo permission ≠ video permission — independent.
- Organic social ≠ paid media — independent.
- Quote-editing permission explicitly says "without changing their
  meaning" — it does not grant open-ended editorial license.
- Every optional permission defaults to unchecked (verified in code —
  every Group B field initializes to `false`).
- Refusing every optional permission does not block submission — only
  the five Group A boxes and the core intake fields are `required`.

Nothing in this list reads as too broad, legalistic, repetitive, or
premature. This section is ready as-is.

---

## F. Invitation-state review

| State | Copy shown | Protects privacy? |
|---|---|---|
| Missing (no `?invite=`) | Same as "invalid," below | Yes — identical to every other failure |
| Invalid (malformed/unknown token) | "This link isn't active." / "...If this link isn't working for you, reach out to Vanessa directly and she'll help." | Yes |
| Expired | Same copy as invalid | Yes — deliberately identical, see below |
| Already used | Same copy as invalid | Yes — deliberately identical |
| Valid | Full experience renders | N/A |
| Server error (submission) | "Something went wrong. Please try again, or reach out directly if it keeps happening." | Yes |
| Success | Confirmation state, §B.10 | N/A |

The invalid-state copy was tightened during this review: the earlier
draft said *"If you believe you received this link in error, **or your
invitation has expired**..."* — which hints that expiry is a real,
checkable state. Removed. Every failure reason (missing, malformed,
expired, already-used) now produces the exact same words, so nothing
about a specific link's history is ever revealed to whoever is looking
at it. This also matches how the backend proposal is written: the
verification endpoint is designed to return the same generic response
regardless of which check actually failed.

---

## G. Confirmation-state review

Current: **"Your place in the circle is confirmed."** (revised from "is
noted" during this review, plus body copy unchanged.)

`"Noted"` reads slightly administrative — the word a clerk uses to log
something, not the word a host uses to welcome someone in. Three
alternatives were weighed:

1. **"...is confirmed."** *(adopted)* — precise, and it echoes the
   invitation-verification language elsewhere ("could not be
   confirmed" in the failure state), so the whole flow uses one
   consistent verb.
2. "You're part of the circle." — warmer and more casual, but loses the
   "place" spatial metaphor and reads slightly more promotional.
3. "Welcome to the circle." — most hospitality-coded of the three, but
   shifts the meaning from "you have secured a specific place" to "you
   have joined a group," which is a small but real difference in what's
   being promised.

The body copy underneath was already correct and untouched: it commits
to *following up* on timing rather than *promising* it, stays warm
without transactional language, and doesn't manufacture exclusivity
beyond what's already true (this genuinely is a small, invitation-only
circle).

---

## H. Brand review

Reviewed against NFE's doctrine directly, line by line.

**Reads as intended:** private correspondence (the invitation-gate
framing), founder-led care (personal references to Vanessa in the
invalid state and throughout), structured but human (defined check-ins
stated plainly, not hidden in fine print), specific to mature melanated
skin (age range and skin-concern framing throughout), calm and
selective (small-circle language repeated without over-explaining).

**Deliberately avoided vocabulary — confirmed absent by direct text
search of the implemented copy:** "clinical trial," "experiment,"
"subject," "test group," "influencer," "ambassador," "giveaway," "free
product club," "beta," "focus group," "limited spots," any countdown or
urgency language.

**One density observation, not a defect:** the Sharing My Story section
is necessarily long — twelve independent checkboxes is a lot of
controls on one screen. This is the direct, unavoidable cost of the
"never bundle distinct permissions" requirement (§E) — every one of
those twelve represents a real, separately revocable-in-spirit
permission that would be dishonest to combine for the sake of brevity.
It's organized into four visually distinct sub-groups (Attribution,
Media, Where it may appear, Ongoing relationship) to keep it navigable
rather than a flat wall of checkboxes. Worth watching in practice with
real participants, not worth restructuring pre-emptively.

**Mobile:** no horizontal overflow at 375px width, verified directly.

---

## I. Founder Access relationship

**Shared, intentionally:** card and button styling, form field styling,
the gold focus ring, the serif-headline-plus-uppercase-eyebrow pairing,
the `role="status"` success-panel pattern, the Privacy Policy link
treatment, and NFE's voice throughout.

**Different, intentionally:** Founder Access is open and public;
`/study-circle` requires a verified invitation before anything but the
"this link isn't active" state renders. Founder Access captures
commercial interest with a handful of fields; Study Circle runs a full
structured intake. Founder Access has one newsletter checkbox; Study
Circle has five required participation consents plus twelve independent
optional permissions. Founder Access has no follow-up mechanism; Study
Circle is built around a defined check-in schedule from day one.

**Confirmed directly:**
- `/study-circle` does not appear in main navigation (checked the nav
  component — it isn't there).
- `robots: { index: false, follow: false }` is set in the route's
  metadata.
- `src/app/sitemap.ts` is a manually curated, hardcoded list of routes
  — not auto-generated from the filesystem — and `/study-circle` is
  absent from it. No fix was needed because there was nothing to
  exclude.

---

## J. Founder decisions still required

None of the items below are guessed at or encoded into the product.
They're listed here so nothing is quietly decided by default.

1. **Is product gifted, purchased, or offered at cost?**
2. **Is shipping included, and does NFE need a real shipping address?**
   (The form currently collects City/State only, not a street address —
   intentional until this is answered.)
3. **Which product is assigned to whom?** The form currently lets the
   participant choose Face or Body Elixir freely. If you want to control
   allocation (e.g., a specific split across the cohort), the invitation
   itself should carry a pre-set assignment that the participant
   confirms rather than freely picks — this is a real design fork, not
   yet resolved either way.
4. **What exact use period is expected** (the copy says "the study
   period" without a specific number of weeks)?
5. **How many check-ins are mandatory** — both 7–10 day and 3–4 week, or
   is one sufficient for this first cohort?
6. **Is a photo requested as part of participation, or purely
   optional** the way it's built now?
7. **Is public posting ever requested**, even informally — or is "no
   obligation to post publicly, ever" the permanent policy?
8. **Are participants permitted to share before NFE's public launch?**
9. **What happens when a participant withdraws mid-study?** (The
   database design already has a `withdrawn` status ready to record
   this — the *process* around it isn't decided.)
10. **Is product return required** if a participant withdraws or the
    study ends?
11. **Is participation limited geographically** (shipping constraints,
    time zone for check-ins, etc.)?
12. **Are existing NFE customers eligible**, or is this strictly for
    people new to the brand?
13. **What age range should be prioritized** within the cohort?
14. **Are people with known sensitivities included or excluded**, or
    included with extra care?
15. **Who personally handles participant questions and check-ins** —
    you directly, or someone else on your behalf?

---

## Where this leaves things

The frontend experience is complete, tested, and — pending your read of
this document — ready to be treated as final for a first cohort. The
backend (the two API routes, token issuance, database writes, and real
email) is not built and will not be built until you've made the
decisions in §J and separately authorized backend implementation. See
`docs/seed-access/BACKEND_PROPOSAL.md` for what that would involve.
