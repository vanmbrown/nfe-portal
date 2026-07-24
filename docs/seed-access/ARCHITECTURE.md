# NFE Seed Access — Architecture & Consent Specification

Phase 1 (frontend prototype + backend proposal, no production changes). See
`docs/seed-access/BACKEND_PROPOSAL.md` for the data model, API contract, and
migration files.

## 1. Founder Access architecture findings

Reviewed before designing Seed Access, so Seed Access reuses what's sound and
does not repeat what isn't.

**Storage.** Supabase, admin/service-role client (`createAdminSupabase()`,
bypasses RLS). Table `founder_access_signups`, upsert-by-email, unique index
on `LOWER(email)`. Also syncs into a `subscribers` table and to Beehiiv.

**API route.** `POST /api/founder-access`, a single Next.js Route Handler.

**Email flow.** Resend, guarded by an `if (process.env.RESEND_API_KEY)`
check, wrapped in `try/catch` that logs failures but does not fail the
request — the client's `{success:true}` does not guarantee delivery. This
was confirmed directly during Wave 1's production verification.

**Analytics.** A lightweight in-house event system (`trackNfeEvent`) that
dispatches a typed `CustomEvent` on `window`. Event names and areas are a
fixed const/union, `metadata` is typed to primitives only — no PII by
construction.

**Validation.** Server-side allowlist validation: dedicated `cleanX()`
helpers cross-check submitted values against known option `Set`s
(`src/lib/founder-access/validation.ts`). Strong, reusable pattern.

**Privacy.** One required "Privacy Policy" checkbox plus one separate,
optional newsletter opt-in checkbox. Consent is versioned
(`FOUNDER_ACCESS_CONSENT_TEXT_VERSION`, stored with `consented_at`). This
already separates required participation-adjacent consent from marketing
consent — good precedent — but has none of the granular
testimonial/name/photo/video/paid-media distinctions Seed Access needs.

**Reusable visual/UX patterns.** Rounded `1.75rem` cards, `bg-nfe-paper`
fields with `border-nfe-green-900/10`, gold focus ring, pill-shaped
uppercase-tracked CTA buttons, serif headline + uppercase eyebrow pairing,
`role="status" aria-live="polite"` success panel, `role="alert"` error
panel. Seed Access reuses these rather than the page itself.

**Patterns Seed Access does not inherit as-is:**

1. Swallowed email failures — acceptable for a public opt-in form; less
   acceptable for an invitation confirmation participants are relying on.
   Flagged in the backend proposal, not fixed here (out of scope for
   Founder Access itself).
2. Rate limiting fails *open* when Upstash is unreachable — fine for a
   public form; a token-verification endpoint is a brute-force target and
   should not silently allow unlimited guesses just because Redis is down.
3. No prior art anywhere in this codebase for single-use/expiring tokens,
   hashed-secret comparison, or atomic redemption. This is new for Seed
   Access.
4. The service-role client bypasses RLS entirely, so today's actual data
   protection is 100% route-code correctness, not database policy. Seed
   Access's backend proposal still defines real RLS policies as
   defense-in-depth, since a future dashboard read path will likely need
   scoped rather than service-role access.

## 2. Positioning

Founder Access is top-of-funnel: brand discovery, early commercial
interest, a mailing list. Seed Access is a closed loop with a small number
of specific people who will actually use product and report back in
structured ways, on a defined timeline, with separately-negotiated
permission to use anything they say or show.

Seed Access must never read as a second Founder Access. It reads as
private correspondence: an invitation that assumes the reader already
knows what NFE is, and is being asked for something more — their time,
their honesty, and (separately, optionally) their name or image.

## 3. Customer-facing name

**Recommendation: "The NFE Study Circle."**

- "Circle" carries intimacy and invitation without implying mass
  enrollment — consistent with "Not For Everyone."
- "Study" is honest about the structure (defined period, check-ins,
  feedback) without borrowing clinical-trial language. It reads as
  "we're studying how this ritual performs," not "you are a research
  subject."
- It is legible on its own, outside any NFE context, if forwarded or
  screenshotted — it doesn't require the reader to already know what
  "Seed Access" means.

The internal/operational label remains **Seed Access** — used in code,
database tables, and internal documentation only. It never appears in
participant-facing copy.

## 4. Route and access model

**Route: `/study-circle`**, not `/seed-access`.

The public URL should match the public name. Shipping `/seed-access` would
leak the internal operational codename into a URL a participant might
screenshot, forward, or read aloud — small, but avoidable. `/study-circle`
costs nothing and keeps the internal/external naming boundary clean.

**Access model: a random, high-entropy, single-use, expiring,
email-bound invitation token, delivered as a URL query parameter, verified
against a stored hash.**

`https://www.nfebeauty.com/study-circle?invite=<opaque-token>`

Evaluated against the five options in the brief:

| Option | Verdict |
|---|---|
| Simple code entry (short/memorable) | Rejected — a human-typeable code trades entropy for convenience; the brief explicitly requires an unguessable value and no reusable public code. |
| Signed token (JWT/HMAC) | Rejected in favor of the simpler opaque-token approach below — a signed token needs key management and, because its own expiry claim is self-certifying, still requires a database check to be truly revocable, so it buys nothing a hashed opaque token doesn't already give more simply. |
| Unique invitation code (no expiry) | Rejected alone — no expiry, no defined single-use semantics. |
| Expiring token | Adopted, as part of the combined model below. |
| Email-bound token | Adopted, as part of the combined model below. |

**The adopted model, concretely:**

- The token is generated server-side (only ever in a Phase 1 internal
  script — see §9) as high-entropy random bytes, never anything
  sequential or derived from participant data.
- Only a **hash** of the token is stored (`seed_invitations.token_hash`).
  The raw token exists only in the one-time link sent to the participant
  and is never written to the database or logs.
- Verification hashes the incoming token and looks it up — the server
  never holds or exposes a list of valid tokens to the client.
- The token is **email-bound**: redemption requires the submitted email
  to match the invitation's `email`. Not airtight (email isn't itself
  authenticated), but it's a real, low-friction check against a
  forwarded link being used by someone other than the invited person.
- **Expiring**, via `expires_at`, checked server-side on every
  verification.
- **Single-use**, but the token is only consumed (`redeemed_at` set) at
  successful *intake submission*, not at page view. A participant
  reopening their own invitation link before submitting (a link-preview
  bot, an accidental double-open, a message client pre-fetching the URL)
  must not burn their one use.
- Redemption is an atomic, conditional update (`WHERE redeemed_at IS
  NULL`) so two near-simultaneous submissions against the same token
  cannot both succeed — see the backend proposal for the exact query
  shape.

This fits the current stack (Next.js Route Handlers + Supabase) with no
new infrastructure, and requires no admin UI: for Phase 1, an invitation
is a single row inserted by hand or by an internal script (see
`docs/seed-access/BACKEND_PROPOSAL.md` §6), not a feature that needs a
dashboard to operate.

## 5. Why this is not a Founder Access duplicate

- Different name, different route, different visual entry point (no
  public nav link; reached only via a private link).
- Different gate: Founder Access has none; Seed Access requires a valid,
  server-verified, single-use invitation before the intake form is even
  shown.
- Different questions: Founder Access asks who you are and whether
  you're interested; Seed Access asks whether you were invited, what
  you're using, whether you'll commit to the check-in cadence, and — as
  a series of separate, optional, revocable-in-spirit permissions —
  exactly how (if at all) NFE may use what you say or show.
- Different consent shape: one bundled "privacy + optional newsletter"
  pair vs. five required participation consents and twelve independently
  optional permission grants (§7).
- Different backend shape: Founder Access has no token, no expiry, no
  single-use semantics, no check-in schedule. Seed Access has all four.
- Shared: typography, spacing, field styling, button styling, the
  success-panel pattern, the privacy-policy link, and NFE's voice.

## 6. Participant journey (Phase 1 scope)

Full journey per the brief, with Phase 1 scope marked:

1. Invitation received (external — email/DM sent by hand in Phase 1). *Not built.*
2. Private landing page. **Built.**
3. Invitation validated. **Built.**
4. Participant reads expectations. **Built.**
5. Participant completes intake. **Built.**
6. Participant grants required participation consent. **Built.**
7. Participant separately chooses optional permissions. **Built.**
8. Confirmation page. **Built.**
9. Product and timing follow-up. *Not built — internal, manual in Phase 1.*
10. First-use check-in. *Not built — schema prepared (`seed_checkins`), no UI.*
11. 7–10 day check-in. *Not built — same as above.*
12. 3–4 week check-in. *Not built — same as above.*
13. Feedback review. *Not built — this is the future dashboard.*
14. Optional testimonial/referral invitation. *Not built — depends on 13.*

Building only 2–8 keeps the task narrow while the data model (§ in the
backend proposal) is shaped so 10–12 are additive later: `seed_checkins`
already exists as a table with no participant-facing form yet.

## 7. Consent architecture

Two groups, presented as two visually distinct moments in the form — not
seventeen checkboxes in a single list.

### Group A — Participation Agreement (all required to submit)

1. I understand what this study asks of me (product use over the stated
   period, my honest impressions, and completing the check-ins above).
2. I have read and agree to the
   [Privacy Policy](/privacy).
3. NFE may contact me about this study (logistics, check-in reminders,
   timing).
4. I understand honest feedback is what's being asked for —
   **positive feedback is not required**, and my participation does not
   depend on it.
5. NFE may use what I submit internally to inform product and education
   decisions.

These five map to `participation_consent_at`, `privacy_consent_at`, and a
`consent_version` string on `seed_participants` (see backend proposal —
they are recorded as a single versioned consent event, not five separate
timestamps, since they are granted together as one action).

### Group B — Sharing My Story (all optional; framed explicitly as
optional, answerable "no" to every item without affecting participation)

Presented as: *"Everything below is optional. You can say yes to none of
these, some of these, or all of these — none of it is required to take
part."*

Quoting:
- May NFE quote my written feedback? (`quote_permission`)
- May NFE lightly edit quotes for length, without changing their
  meaning? (`quote_edit_permission` — only shown/relevant if quoting is
  granted)

Attribution (independent checkboxes, per the brief's explicit data
model — not a radio, even though granting full name implies first name):
- May NFE use my first name? (`first_name_permission`)
- May NFE use my full name? (`full_name_permission`)

Media:
- May NFE photograph me / use a photo I provide? (`photo_permission`)
- May NFE use video of me? (`video_permission`)

Where it may appear (each independent, each only meaningful if quote
and/or media permission above is granted):
- NFE's website (`website_permission`)
- Email to NFE subscribers (`email_permission`)
- Organic social media — NFE's own posts (`organic_social_permission`)
- Paid advertising (`paid_media_permission`) — kept visually and
  semantically distinct from organic use; a participant who is fine
  appearing in NFE's own feed may not want to appear in a paid ad.

Ongoing relationship:
- May NFE contact me about future studies like this one?
  (`future_contact_permission`)
- I'd like to receive general NFE marketing emails (separate from
  study-specific contact above) (`marketing_consent_at` — reuses the
  same marketing-consent shape Founder Access already has).

Marketing consent is never inferred from participation consent.
Testimonial (quote) consent is never inferred from participation.
Photo/video consent is never inferred from quote consent. Paid-media
consent is never inferred from organic-use consent. Each is its own
column, its own checkbox, its own explicit "no" by default.

## 8. Cosmetic and compliance language

Seed Access's check-in vocabulary (for the schema and, later, the
check-in forms) draws only from the approved cosmetic pattern: how the
skin feels, appearance of dryness, visible radiance, appearance of uneven
tone, skin comfort, texture, suppleness, absorption, finish, routine fit,
perceived softness, visible smoothness, willingness to repurchase.

None of the intake or consent copy in this phase asks participants to
confirm a medical or clinical outcome. The self-reported skin-concern
field carries the same cosmetic-use framing already established on
`/science` ("This is guidance, not diagnosis" / "does not diagnose,
treat, cure, or prevent").

## 9. Phase 1 invitation issuance (operational note, not built)

Until a dashboard exists, issuing an invitation is: generate a random
token, hash it, insert one row into `seed_invitations` (email, hashed
token, `expires_at`, `source`), and send the participant their personal
link by hand. No UI is required for this in Phase 1 — it's a five-line
internal script the backend proposal sketches but does not implement or
run.
