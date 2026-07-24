# NFE Seed Access — Backend Proposal (not applied)

Everything in this document is a proposal for founder/backend review. No
migration has been applied to any environment, no API route in this
document has been wired into the app, and no production system has been
touched. See `docs/seed-access/ARCHITECTURE.md` for the reasoning behind
the invitation model and consent design this proposal implements.

## 1. Data model

Full schema: `supabase/migration_seed_access.sql`. Rollback:
`supabase/migration_seed_access_rollback.sql`. Five tables, following the
exact conventions already used by `migration_founder_access_signups.sql`
(`gen_random_uuid()` primary keys, `TIMESTAMPTZ`, RLS enabled with a
service-role-only policy).

- **`seed_invitations`** — one row per issued invitation. Stores
  `token_hash` (never the raw token), `email`, `expires_at`, `status`,
  `redeemed_at`. Unique index on `token_hash`.
- **`seed_participants`** — one row per completed intake, linked
  1:1 to the invitation that redeemed it (unique index on
  `invitation_id`, so a token can never produce two participant rows).
  Carries the required intake fields, the two willingness checkboxes,
  and three consent timestamps (`privacy_consent_at`,
  `participation_consent_at`, `marketing_consent_at`).
- **`seed_permissions`** — one row per participant (`participant_id` is
  itself the primary key), the twelve independent optional permission
  booleans from Architecture §7 Group B, plus `permission_version`.
- **`seed_checkins`** — one row per check-in per participant
  (`first_use` / `7_10_day` / `3_4_week`), using only the approved
  cosmetic vocabulary for its feedback columns. No UI reads or writes
  this table in Phase 1; it exists so check-ins are additive later
  rather than a schema change.
- **`seed_events`** — lightweight event log (`event_type`, `source`,
  `metadata jsonb`), mirroring the shape of the client-side analytics
  events already implemented (§6), for a server-side record independent
  of the browser.

**Token handling.** The raw token is generated server-side (32 random
bytes, base64url-encoded — `crypto.randomBytes(32)` in a Node/Workers
runtime), included once in the invitation link, and never written
anywhere. Only `sha256(token)` (hex) is stored, as `token_hash`.
Verification hashes the incoming token and does an equality lookup —
Postgres `TEXT =` comparison here is acceptable (not a timing-sensitive
HMAC context; the hash itself is the secret-derived value, and hash
collision/guessing resistance comes from the token's 256 bits of
entropy, not from constant-time comparison of the hash).

**Consent handling.** Group A (Architecture §7) is granted as one action
and stored as a single `participation_consent_at` timestamp plus
`consent_version` — matching how the five checkboxes are presented (one
screen, one moment, not five independently-timestamped events).
`privacy_consent_at` is kept as its own column because the Privacy
Policy is a distinct legal document from the study-specific
participation terms, even though both are agreed to in the same UI
moment. `marketing_consent_at` is nullable and only set if that specific
optional box is checked. Group B permissions are booleans on
`seed_permissions`, each defaulting to `false`, each independently
settable — never inferred from one another, matching Architecture §7
exactly.

**Future dashboard compatibility.** `seed_events` gives the dashboard an
audit trail without joining across every table. `participation_status`
on `seed_participants` gives the dashboard a single column to build a
pipeline/kanban view from. `seed_checkins` is already shaped for a
future check-in form to write into without a schema change. No dashboard
code is proposed or built in this phase.

## 2. API contract (proposed, not implemented as route files)

Two endpoints, both Next.js Route Handlers, following the existing
`/api/founder-access` file shape (`src/app/api/*/route.ts`).

### `POST /api/seed-access/verify-invite`

Request: `{ "token": string, "email": string }`

The email is required at verification time, not just at final submission
— this lets the invalid-link page fail fast without exposing anything
about *why* a token is invalid (§4).

Response (200): `{ "valid": true, "productAssignment": string | null }`

Response (200, invalid): `{ "valid": false }` — deliberately the same
shape and status code whether the token is missing, malformed, expired,
already redeemed, or simply never existed. No detail is returned to the
client about which case occurred (§4).

Server logic:
1. Rate-limit by IP (§3).
2. Reject if `token` or `email` missing/malformed — same generic
   `{valid:false}` response, not a 400, so a scanning script can't
   distinguish "malformed" from "well-formed but wrong."
3. Hash the token, look up `seed_invitations` by `token_hash`.
4. Check `status = 'issued'`, `expires_at > now()`, and
   `LOWER(email) = LOWER(invitation.email)`.
5. Return `valid: true` only if all checks pass. Do not set
   `redeemed_at` here — verification is not redemption (Architecture
   §4).

### `POST /api/seed-access/intake`

Request body: the full intake payload — required fields, optional
fields, Group A consent booleans, Group B permission booleans, plus
`token` and `email` again (re-verified, never trusted from step 1).

Server logic:
1. Rate-limit by IP (§3), independently from the verify endpoint.
2. Re-run the exact same token/email/expiry/status checks as
   `verify-invite`. A client should never be able to skip verification
   by calling `intake` directly with a stale "valid" state from earlier
   in the session.
3. Server-side validation via a `src/lib/seed-access/validation.ts`
   module, built the same way as
   `src/lib/founder-access/validation.ts` — allowlist `cleanX()`
   helpers checked against the option sets in
   `src/content/seed-access/options.ts`, not free-form pass-through.
4. Reject if any of the five Group A consent booleans is `false`, or if
   `willingToUseAsDirected` / `willingToCompleteCheckins` is `false`.
5. **Atomic redemption.** In a single database round trip (a Postgres
   function via `supabase.rpc(...)`, not sequential JS calls — sequential
   calls would leave a window for a race), do all of:
   - `UPDATE seed_invitations SET status='redeemed', redeemed_at=now() WHERE id=$1 AND status='issued' AND expires_at > now()` — if this updates zero rows, the token was already redeemed or expired since verification; abort with a distinct "already used" error and do **not** insert a participant row.
   - `INSERT INTO seed_participants (...)`.
   - `INSERT INTO seed_permissions (...)`.
   This is the concrete mechanism behind Architecture §4's single-use
   guarantee: the conditional `WHERE status='issued'` makes double
   submission impossible even under concurrent requests, without needing
   application-level locking.
6. On success, fire the confirmation email (§5) and log a `seed_events`
   row (`event_type: 'intake_completed'`).
7. Return `{ "success": true }` — matching the existing Founder Access
   response shape.

### Failure states (both endpoints)

| Condition | Response |
|---|---|
| Rate limited | `429`, generic message |
| Malformed request body | `400`, generic message |
| Token invalid/expired/used (verify) | `200`, `{valid:false}` (§4) |
| Token invalid/expired/used (intake) | `409`, `"This invitation link has expired or has already been used."` |
| Required consent missing | `400`, `"Please complete the required participation agreement."` |
| Database error | `500`, generic message, full detail logged server-side only |

## 3. Rate limiting

Reuses the existing Upstash-backed `Ratelimit` pattern
(`src/lib/ratelimit.ts`), with one deliberate change from the existing
`checkSubscribeRateLimit`/`checkWaitlistRateLimit` behavior:

- `checkSeedIntakeRateLimit` (proposed): same fail-open-if-Upstash-down
  behavior as existing limiters — an intake submission is a low-frequency,
  low-value target for abuse, and failing open matches the rest of the
  codebase's availability-over-strictness default.
- `checkSeedInviteVerifyRateLimit` (proposed): **should fail closed**
  (deny) if Upstash is unreachable, unlike every existing limiter in this
  codebase. `verify-invite` is exactly the kind of endpoint a brute-force
  script targets — it takes a guessable-shaped input (a token) and
  returns a boolean. If Redis is down, silently allowing unlimited
  guesses is the wrong default here specifically. Suggested limit: 5
  attempts / 10 minutes per IP, tighter than the existing 3/hour
  `subscribeRatelimit` in absolute terms but scoped to a narrower window
  since a legitimate participant only needs this endpoint once or twice.

## 4. Token verification — no enumeration

`verify-invite` intentionally returns the same `{valid:false}` shape and
the same `200` status for every failure case (not found, expired, wrong
email, already used). The invalid-state page copy (Page Copy doc) does
not say *why* a link failed for the same reason: distinguishing "this
token doesn't exist" from "this token exists but expired" from "this
token exists but that's not the right email" would let an attacker learn
information about the invitation list by trying variations. This is the
concrete mechanism behind Architecture §4's "no enumeration of valid
participant emails" requirement.

## 5. Email flow

Resend, same pattern as `/api/founder-access` (`from: 'NFE Beauty
<notifications@nfebeauty.com>'`), with one proposed difference: Wave 1's
production verification confirmed that Founder Access's swallowed
email-send errors mean a `{success:true}` response doesn't guarantee
delivery. For Seed Access, where a participant is relying on a
confirmation that logistics are actually in motion, the proposal is to
still return `success:true` on a DB-write success even if the email
fails (an email hiccup shouldn't block someone's place in the study) but
to additionally log a distinguishable `seed_events` row
(`event_type: 'confirmation_email_failed'`) so a failed send is
discoverable server-side without needing to grep logs — a small,
narrowly-scoped improvement on the existing pattern, not a rebuild of it.

Two emails, matching Founder Access's two-email shape:
- To the participant: confirmation, reusing the "Your place in the
  circle is noted" language from the confirmation page.
- To `ADMIN_NOTIFICATION_EMAIL` (same env var Founder Access already
  uses): full intake details, in the same `renderRow()`-table format
  `founder-access/route.ts` already uses.

## 6. Analytics events

Already implemented in this change (Commit 2, additive to
`src/lib/analytics/events.ts`) — no new vendor, same `trackNfeEvent`
mechanism:

`nfe.seed_access.viewed`, `.invite_valid`, `.invite_invalid`,
`.intake_started`, `.consent_completed`, `.confirmation_viewed`,
`.joined`.

None of these carry freeform feedback, skin-condition text, email,
phone, invitation token, or testimonial text — the payload shape
(`NfeEventPayload.metadata: Record<string, string | number | boolean |
null>`) already structurally prevents attaching arbitrary blobs; the
handful of metadata values actually sent (`product`,
`skinConcernCount`, `quotePermission`, `photoPermission`) are booleans/
counts/enums only.

## 7. Phase 1 invitation issuance (sketch, not implemented)

No admin UI exists or is proposed for Phase 1. Issuing an invitation is
a short internal script, run by hand against the admin Supabase client
— sketched here for review, not implemented or run:

```
1. token = base64url(random 32 bytes)
2. token_hash = sha256(token)
3. insert into seed_invitations (token_hash, email, source, expires_at, created_by)
4. send the participant their personal link by hand:
   https://www.nfebeauty.com/study-circle?invite={token}
```

## 8. Production actions not taken

- No migration applied to any Supabase project (development, staging,
  or production).
- No API route file created under `src/app/api/seed-access/`.
- No `src/lib/seed-access/validation.ts` or rate-limit functions
  implemented — described above as a proposal only.
- No real invitation issued, no real token generated outside this
  document's illustrative sketch.
- No RLS policy applied.
- No `ADMIN_NOTIFICATION_EMAIL` or other secret referenced beyond the
  existing variable name.
