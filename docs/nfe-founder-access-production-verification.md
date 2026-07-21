# Founder Access — Production Operational Verification Checklist

**For:** Vanessa (dashboard execution)
**Prepared:** 2026-07-21
**Why this exists:** live-production fingerprinting (see
`nfe-release-readiness-audit.md` Section 18) proved the Founder Access
frontend and its `/subscribe → /founder-access` redirect are **live on
`https://www.nfebeauty.com` today** — the extended intake form
(`ageRange`, `productInterest`, `privacyPolicyAccepted`) renders in
production HTML. What GET requests **cannot** show is whether the backend
is actually accepting and storing signups, and whether its downstream
integrations (Resend, Beehiiv, Upstash) are configured correctly in the
production environment. This checklist is what to verify in each dashboard.

**Guardrails (do not violate during verification):**
- Do **not** submit the live form to create a test signup without deciding
  first that a test record is acceptable — it writes real data and may
  trigger a real confirmation email and a real Beehiiv subscriber.
- Do **not** resend or replay any email.
- Do **not** delete, edit, or export customer rows as part of *verification*
  (reading counts/status is fine; exporting PII is not part of this).
- Read-only inspection only unless a specific corrective action is
  separately decided.

---

## 1. Supabase (data store)

Project: the production NFE Supabase project (confirm you are in the
**production** project, not a preview/branch database).

- [ ] **Table `founder_access_signups` exists.** (Created by migration
  `supabase/migration_founder_access_signups.sql`.)
- [ ] **Row count / recent rows.** Are there rows? What is the most recent
  `created_at` / `consented_at`? This answers "is the live form actually
  writing." Zero rows despite a live form = either no submissions yet, or a
  silent write failure worth investigating.
- [ ] **RLS is ENABLED on the table.** Row-Level Security must be on.
- [ ] **Insert policy behavior.** The API route writes via the service-role
  key (bypasses RLS by design). Confirm there is **no** public/anon INSERT
  policy that would let anyone write directly.
- [ ] **No public/anon SELECT policy.** Critical: confirm the anon role
  **cannot** read `founder_access_signups`. A public read policy here would
  expose every signer's name, email, phone, and consent record. Test by
  querying the table with the anon key (should return zero rows / permission
  denied), or inspect the policy list directly.
- [ ] **Consent + timestamp columns present and populated:**
  `privacy_policy_accepted`, `consent_text_version`, `consented_at`,
  `newsletter_opt_in`. Spot-check that accepted rows actually carry
  `privacy_policy_accepted = true` and a consent version.
- [ ] **`subscribers` table** — the route also inserts the email into
  `subscribers`. Confirm that table exists and has matching recent emails,
  and that it too has no public read policy.

> A read-only Supabase MCP connector is attached to this working session.
> If you confirm it points at the **production** project, structural checks
> above (table existence, RLS status, policy list, migration list) can be
> run from here on your say-so — **excluding** any query that returns
> customer row data / PII. Not run yet.

---

## 2. Resend (transactional email)

- [ ] **Production `RESEND_API_KEY` is configured** in the Cloudflare Worker
  environment (not just locally). If missing, the route still writes to the
  DB but silently sends no confirmation email — signers get no
  acknowledgement.
- [ ] **`ADMIN_NOTIFICATION_EMAIL` (or `FORWARD_TO_EMAIL`) is set** — without
  it, the owner-notification email is skipped.
- [ ] **Recent delivery events** — do confirmation emails to signers and
  admin-notification emails to you appear in the Resend activity log with
  timestamps matching Supabase rows?
- [ ] **Bounce / failure rate** — any spike in bounces or hard failures?
- [ ] **Sender domain** — emails send `from: NFE Beauty
  <notifications@nfebeauty.com>`. Confirm that domain/sender is verified in
  Resend and not in a warning state.
- [ ] **Content/tone check** — the confirmation email body is defined in the
  route (greeting, "Your Founder Access request has been received," signed
  "Vanessa / NFE Beauty"). Confirm the live copy reads the way you want it
  to, since it is going to real people now.

---

## 3. Beehiiv (CRM / newsletter)

- [ ] **Production publication connected** — `BEEHIIV_API_KEY` and the
  publication ID configured in the Worker environment. If missing, sync
  returns `skipped: beehiiv_not_configured` (no error, no sync).
- [ ] **Consent gating works as intended.** The sync only runs when
  `marketingOptIn` **and** `privacyPolicyAccepted` are both true — confirm
  no subscriber is being synced without marketing consent (no
  non-consented synchronization).
- [ ] **Recent subscribers** appear in Beehiiv matching recent opted-in
  Supabase rows.
- [ ] **Custom-field mapping** — the sync sends founder-access fields
  (first/last name, phone, product interest, primary skin interests, topic
  request, high-intent flag, source page, UTM data). Confirm these land in
  the correct Beehiiv custom fields (age/product-interest especially), not
  mismatched or dropped.
- [ ] **No duplicate/double-subscribe** behavior that would re-email people.

---

## 4. Upstash (rate limiting)

- [ ] **Production `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
  configured** in the Worker environment. If missing, rate limiting **fails
  open** — the code allows every request (no protection), it does not block.
- [ ] **Rate-limit keys present** in the Upstash data browser (the limiter
  writes sliding-window keys per IP).
- [ ] **Recent limiter events / analytics** — is the limiter actually being
  hit?
- [ ] **Expected behavior: 3 requests/hour** per IP for the subscribe/
  founder-access path (`Ratelimit.slidingWindow(3, '1 h')`). Confirm this is
  the intended threshold for a founder-access signup flow (it may be tight
  or loose depending on expected traffic).

---

## 5. Cloudflare / Worker (hosting + bindings)

- [ ] **Required environment bindings present** in the **production** Worker
  (`nfe-portal`): `SUPABASE_URL` (or `NEXT_PUBLIC_SUPABASE_URL`),
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`,
  `ADMIN_NOTIFICATION_EMAIL`/`FORWARD_TO_EMAIL`, `BEEHIIV_API_KEY` (+
  publication id), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- [ ] **Secrets stored as secrets**, not plaintext vars, and not accidentally
  exposed to the client bundle (only `NEXT_PUBLIC_*` reaches the browser —
  confirm the service-role key is **not** prefixed `NEXT_PUBLIC_`).
- [ ] **Route bound to `www.nfebeauty.com`** (and apex `nfebeauty.com` if
  used) — confirm the custom domain routes to this Worker. Note: this repo's
  `wrangler.jsonc` declares **no** `routes`, so the domain binding lives only
  in the Cloudflare dashboard — this is exactly the binding to eyeball.
- [ ] **No preview-only binding leaked into production** — confirm the
  production environment is not accidentally using a preview/staging Supabase
  URL, preview Resend key, or preview Beehiiv publication.
- [ ] **Deployment metadata (also serves the provenance question):** capture
  the current Worker **version ID / deployment ID**, its **timestamp**, and —
  if visible — the **Git SHA or build tag** associated with it. This is the
  single most valuable artifact for the separate provenance investigation:
  it would let the held confidentiality patch series be re-based onto the
  exact deployed source. See `nfe-release-readiness-audit.md` Section 18.

---

## What this verifies, in one line each

- **Supabase:** signups are being stored, and are **not** publicly readable.
- **Resend:** signers and you are actually being emailed, from a verified
  sender.
- **Beehiiv:** only consented contacts sync, with correct field mapping.
- **Upstash:** abuse protection is actually on (not failing open).
- **Cloudflare:** the whole thing is wired to production, not preview, and we
  can finally name the deployed commit.
