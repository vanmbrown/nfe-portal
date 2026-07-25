# Study Circle — Legal Review Handoff

**STATUS: PENDING LEGAL REVIEW**

No part of this has been reviewed or approved by counsel. Nothing here should
be read as a compliance claim. **No live participant invitation may be issued
until this review is complete.**

Below is every participant-facing clause, exactly as it currently appears at
`/study-circle`, grouped by what it asks of the participant. Implementation
notes are included only where they affect what the words actually mean in
practice.

---

## 1. Participation expectations

> I understand what this study asks of me: four weeks of use as directed, my
> honest impressions, and the three check-ins above.

Supporting page copy:

> Four weeks with your assigned NFE ritual, used as directed · A first-use
> impression · A check-in 7–10 days in · A check-in at week 3–4

Required to submit.

## 2. Gifted and unpaid disclosure

> Your product is a gift; participation is unpaid.

Shown in "What participation includes". Not a separate checkbox.

## 3. No positive-feedback requirement

> I understand honest feedback is what's being asked for — positive feedback
> is not required, and my participation does not depend on it.

Required to submit. Also stated twice in page copy. **Point for review:** the
intent is that no benefit is conditioned on sentiment.

## 4. Confidentiality acknowledgment

> I may discuss my experience privately. I understand I should not publicly
> share unreleased packaging, pricing, launch timing, or other unreleased
> product details without NFE's written approval.

Required to submit. Deliberately **not** framed as an NDA. Stored with a
version string so a later wording change is distinguishable.

**Point for review:** is this enforceable and proportionate as written, and is
"written approval" the right standard for a gifted, unpaid participant?

## 5. Privacy acknowledgment

> I have read and agree to the Privacy Policy.

Required. Links to the existing `/privacy` page — **which has not itself been
reviewed against this new processing activity.** The Study Circle collects
more than any existing form on the site.

## 6. Internal-learning use

> NFE may use what I submit internally to inform product and education
> decisions.

Required. Bounded to internal use; public use is separate (§7–§11).

## 7. Contact about the study

> NFE may contact me about this study (logistics, check-in reminders, timing).

Required, and scoped to the study. Marketing is separate (§12).

## 8. Testimonial permission

> NFE may quote my written feedback.

Optional, defaults off.

## 9. Quote-editing permission

> NFE may shorten quotes for length without changing their meaning. Any
> materially edited quote comes back to me for approval first.

Optional, only shown once quoting is granted. **Point for review:** "materially
edited" is currently an operational judgment with no defined threshold.

## 10. Name permissions

> NFE may use my first name.
> NFE may use my full name.

Two independent optional permissions, both default off. Granting full name does
not auto-grant first name; they are stored separately.

## 11. Image and video permissions

> NFE may photograph me or use a photo I provide.
> NFE may use video of me.

Independent, optional, default off. Supporting copy:

> Photographs are always optional and never required to take part.

Recorded editing rules (policy record, not participant-facing, no automated
enforcement): no facial reshaping, no age erasure, no skin-texture erasure, no
editing that misrepresents results. **Point for review:** should these appear
in participant-facing text rather than only in internal policy?

## 12. Placement permissions

> NFE's website · Email to NFE subscribers · Organic social media — NFE's own
> posts · Paid advertising

Four independent optional permissions, all default off. Paid advertising is
deliberately separate from organic. **Point for review:** whether paid media
use of a gifted, unpaid participant's likeness needs a distinct written
release beyond this checkbox.

## 13. Marketing permission

> I'd like to receive general NFE marketing emails. This is separate from the
> study and declining does not affect my participation.

Optional, default off, never implied by participation.

## 14. Withdrawal terms

> You may step away at any time, without penalty and without returning the
> product.

Approved policy, currently expressed only in page copy — there is no
withdrawal checkbox. Withdrawal is an operator-recorded action. On withdrawal:
future public use stops, submitted feedback may be retained in anonymised
form, previously published material is handled by reasonable removal efforts.

**Point for review:** "reasonable removal efforts" is undefined, and the
retention-in-anonymised-form position is not currently stated to the
participant anywhere.

## 15. Retention summary

| Record | Retention |
|---|---|
| Expired or unused invitations | 90 days |
| Declined invitations | 90 days |
| Intake and check-ins | 24 months after completion |
| Withdrawn participant data | anonymise or delete within 30 days where operationally feasible |
| Permission records | while content is in use, plus an audit period |

**Point for review:** the permission audit period has no value. It is
implemented as an unset configuration rather than a guess. Counsel should
supply the duration. None of these periods are currently disclosed to the
participant.

## 16. Sensitivities field wording

> Known sensitivities — Please share only what may help NFE understand your
> cosmetic-use context. Do not include medical records or diagnostic
> information.

Optional free text. **Point for review:** this is the field most likely to
attract health-adjacent disclosure despite the instruction. Confirm the
wording adequately discourages it and that storage/access handling is
appropriate for whatever arrives anyway.

## 17. Discomfort language

> Stopping use and telling NFE promptly if anything feels uncomfortable, and
> seeking professional guidance where appropriate

**Point for review:** confirm this is adequate safety language for a cosmetic
product study, and that it does not imply NFE provides medical assessment.
NFE does not diagnose or give treatment advice, and no triage system exists.

---

## Consolidated questions for counsel

1. Is the confidentiality acknowledgment proportionate and enforceable?
2. Does the existing Privacy Policy cover this new processing, or does it need
   amendment?
3. Does paid-media use require a separate written release?
4. What should the permission audit period be?
5. Should retention periods be disclosed to participants?
6. Should withdrawal terms — especially anonymised retention and "reasonable
   removal efforts" — be stated to the participant before they submit?
7. Is the "materially edited" quote threshold defined well enough?
8. Is the sensitivities-field framing sufficient?
9. Is a gifted, unpaid arrangement with testimonial permissions correctly
   characterised, including any disclosure obligations when content is
   published?
