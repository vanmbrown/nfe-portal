# The NFE Study Circle — Approved Founder Policies

Status of this document: these are **approved product requirements**, not
proposals. Implementation follows them; it does not reinterpret them.

Customer-facing name: **The NFE Study Circle**
Internal operational name: **Seed Access**

---

## 1. Cohort and eligibility

- First cohort: 10–15 participants.
- Adults 45 and older.
- Primarily Black women; selective inclusion of other mature women of colour.
- United States only for the first cohort.
- Existing Founder Access members may participate.
- Known sensitivities are reviewed individually, **never** used for
  automated exclusion.

Implementation note: no eligibility rule is enforced in code. Selection
happens before an invitation is issued, by a human. The system has no
automated exclusion logic of any kind, by design.

## 2. Product assignment

- NFE assigns the product **before** invitation acceptance.
- Participants do **not** choose their product.
- Assignment lives on the invitation record.
- Each invitation assigns either Face Elixir or Body Elixir.
- Cohort is not assumed to be single-product.
- No participant-facing product switching.

## 3. Participation model

- Product is gifted. Participation is unpaid.
- Feedback is not required to be positive.
- No public posting is required.
- No reward may be tied to positive feedback.

## 4. Shipping

- Domestic (US) shipping included; no international shipping this cohort.
- One replacement for confirmed loss or damage.
- No product return required.

Fulfilment and replacement administration are **out of scope** for this
phase — no code implements them.

## 5. Use period and check-ins

- Four-week participation period.
- Used as directed; participants may continue essential or prescribed
  skincare; avoid introducing unrelated new products where practical.
- Three required check-ins: first-use impression, day 7–10, week 3–4.
- Maximum two gentle reminders. Missed check-ins get no punitive
  language. Repeated nonresponse may close participation.

Check-in **UI** is out of scope for this phase. Schema and contracts
support all three stages.

## 6. Safety

- Discontinue use if discomfort occurs; contact NFE promptly; seek
  professional medical guidance where appropriate.
- NFE does not diagnose or give medical treatment advice.
- Primary contact: Vanessa or designated NFE Concierge.
- Target response: within one business day.
- Safety escalation: Vanessa.

No diagnostic, triage, or medical-advice system is built.

## 7. Photography and public posting

- Private progress photographs optional; never required.
- Public use requires separate written permission.
- Photo and video permissions remain separate.
- No public posting requirement; future social content is optional and
  requires a separate agreement.

Image **upload** is out of scope this phase. The backend stores
permission choices, not media files.

## 8. Confidentiality

Participants may discuss their experience privately, but may not
publicly share unreleased packaging, pricing, launch timing, or other
unreleased product details without NFE's written approval.

Short acknowledgment, not an NDA. **PENDING LEGAL REVIEW.**

## 9. Testimonials

- Internal feedback use is required for participation.
- Public quotation is optional.
- Quotes may be shortened for length without changing meaning.
- Participants approve **materially edited** quotations before
  publication (an operational process, not an automated gate).
- Negative feedback remains valid and may be used internally.

## 10. Name, image, and media permissions

Every public-use permission is optional; none assumed from
participation. Participants receive notice before first publication.
Separate: photo/video, first-name/full-name, organic/paid, website/email.
Paid media requires separate explicit consent.

Editing rules (policy record; no image-processing system this phase):
no facial reshaping, no age erasure, no skin-texture erasure, no editing
that misrepresents results.

## 11. Withdrawal

- Any time, without penalty, no reason required.
- No product return required.
- Submitted internal feedback may be retained in anonymised form.
- Future public use stops after permission withdrawal.
- Previously published materials handled through reasonable removal
  efforts.
- System supports a `withdrawn` participation status.
- Data is **never** auto-deleted on withdrawal without an authorised
  operator action.

## 12. Data retention

| Record | Retention |
|---|---|
| Expired or unused invitations | 90 days |
| Declined invitations | 90 days |
| Participant intake and check-ins | 24 months after completion |
| Withdrawn participant data | anonymise or delete within 30 days where operationally feasible |
| Permission records | while content remains in use, plus a configurable audit period |

The permission audit period is **deliberately unresolved**. It is
represented as `PERMISSION_AUDIT_PERIOD_DAYS` with no committed
production value.

## 13. Marketing

No automatic enrolment. Marketing consent optional and separate.
Declining marketing does not affect participation. Participation consent
is never reused as newsletter consent.

## 14. Communication ownership

Invitations: Vanessa. Participant care: NFE Concierge. Reminders: NFE
Concierge. Safety escalation: Vanessa. Public-use approval: Vanessa.

No role-based dashboard administration is built this phase.

## 15. Completion benefit

Gifted product, private thank-you, optional early purchase access. No
reward tied to positive feedback. No discount codes, credits, or
commerce automation.

## 16. Invitation creation

Secure local CLI only. No public admin route. Only token **hashes** are
stored. The raw token may be displayed once by the CLI for secure
delivery and must never reach disk, logs, Git, analytics, or the
database.

## 17. Definition of success

The cohort informs: ritual clarity, texture/sensory response, skin
comfort, routine fit, education gaps, customer-care needs, purchase and
repurchase intent, and the language participants naturally use.

**The primary purpose is not collecting positive testimonials.**

---

## 18. Discrepancies found against the Phase 1/2 proposal

Reviewed `ARCHITECTURE.md`, `PAGE_COPY.md`, `FOUNDER_REVIEW.md`,
`BACKEND_PROPOSAL.md`, and the migration against the approved policies
above. Eight mismatches found; all are implementation mismatches
resolved in this phase, none reinterpret a founder decision.

1. **Product selection.** The prototype let the participant choose Face
   or Body Elixir via a radio group. Policy §2 assigns it on the
   invitation. → Radio removed; assignment moved to
   `seed_invitations.product_assignment`, displayed read-only, derived
   server-side, and any client-submitted value ignored.

2. **Consent timestamps.** The Phase 1 migration stored a single
   `participation_consent_at` covering all five required commitments.
   Task §14 requires five distinct timestamps, since five distinct
   commitments are presented. → Split into
   `participation_consent_at`, `privacy_consent_at`,
   `study_contact_consent_at`, `honest_feedback_consent_at`,
   `internal_learning_consent_at`.

3. **Confidentiality acknowledgment.** Absent from Phase 1/2 entirely.
   Policy §8 requires it. → Added as a sixth required participation
   item with `confidentiality_acknowledged_at` and
   `confidentiality_version`.

4. **`declined` invitation status.** Phase 1 status set was
   `issued|redeemed|expired|revoked`. Retention policy §12 and task §8
   both reference declined invitations. → `declined` added.

5. **Retention fields.** Phase 1 had none. → `completed_at`,
   `withdrawn_at`, `anonymized_at`, `deletion_requested_at`,
   `deleted_at`, `permissions_withdrawn_at`, `retention_review_at`
   added where they map to an approved retention rule.

6. **Source taxonomy.** Phase 1 used display strings ("Vanessa
   LinkedIn"). Task §7 specifies snake_case identifiers. → Converted to
   `vanessa_linkedin`, `nfe_linkedin`, `instagram`, `friend_referral`,
   `creator_referral`, `email`, `event`, `direct`, `existing_user`,
   `founder_invitation`; default `founder_invitation`. Source is set at
   issuance by the operator, never self-reported by the participant.

7. **Permission field naming.** Phase 1 used `quote_edit_permission`.
   Task §14 names it `quote_length_edit_permission`, which is also more
   precise about the bound. → Renamed. `marketing_permission` added to
   the permissions table per the task's explicit list, alongside the
   existing `marketing_consent_at` timestamp on the participant record
   (boolean = the choice, timestamp = when it was made).

8. **Rollback filename.** Task §22 refers to
   `supabase/rollback_seed_access.sql`; the file created in Phase 1 is
   `supabase/migration_seed_access_rollback.sql`, which matches the
   repository's existing `migration_*` naming. → Existing filename
   kept; noted here so the two references are known to be the same
   file.

## 19. Non-production environment status

No local Supabase is available in this environment (no Docker, no
Supabase CLI, no initialised `supabase/config.toml`), and no
non-production Supabase project has been explicitly identified.

Per the task's own fallback rule, the backend is implemented in full and
validated with **injected mock adapters**, and the migration is applied
to **no environment at all**. See
`docs/seed-access/NON_PRODUCTION_OPERATIONS.md` for exactly what an
operator must run once a local or staging environment exists, and for
the specific claims that cannot be verified until then.
