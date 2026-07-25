# Study Circle — Non-Production Operations

Everything here runs against a **local Supabase instance or an explicitly
identified non-production project**. Nothing in this document may be run
against production.

> **Status of this build:** the migration in
> `supabase/migration_seed_access.sql` has **not been applied to any
> environment**. No local Supabase was available while this was implemented
> (no Docker, no Supabase CLI, no initialised project), so the backend was
> validated with injected mock adapters. See "What is still unverified" at the
> bottom — it matters.

---

## 1. Environment setup

Required variables. Use a **non-production** project's values, or a local
instance's. Never production values.

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Local or non-production project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key. Never `NEXT_PUBLIC_`-prefixed, never in client code |
| `STUDY_CIRCLE_BASE_URL` | Base for the generated invitation link, e.g. `http://localhost:3000` |
| `ADMIN_NOTIFICATION_EMAIL` | Internal notification recipient (optional) |
| `STUDY_CIRCLE_ENABLE_EMAIL` | Must be exactly `true` to attempt a real send. Absent or anything else ⇒ the mock adapter is used |
| `STUDY_CIRCLE_ALLOW_NONLOCAL` | Must be `true` to let the scripts target a non-localhost URL. Required for an approved staging project |
| `PERMISSION_AUDIT_PERIOD_DAYS` | **Deliberately unset.** See §8 |

Put these in `.env.local` (already git-ignored). This repository's example-file
convention is `.env.local.example` — placeholders only, never real values.

## 2. Start local Supabase

```
npx supabase init          # once, creates supabase/config.toml
npx supabase start         # requires Docker
```

`npx supabase status` prints the local API URL and service-role key.

## 3. Apply the migration (non-production only)

```
psql "$LOCAL_DB_URL" -f supabase/migration_seed_access.sql
```

Or paste it into the local Studio SQL editor. Verify afterwards:

- five tables: `seed_invitations`, `seed_participants`, `seed_permissions`,
  `seed_checkins`, `seed_events`
- one function: `seed_access_redeem_invitation`
- RLS enabled on all five, with a service-role policy and **no** anon or
  authenticated policy
- `EXECUTE` on the function granted to `service_role` only

Rollback: `psql "$LOCAL_DB_URL" -f supabase/migration_seed_access_rollback.sql`

## 4. Create a test invitation

```
npm run seed:create-invitation -- \
  --email participant@example.invalid \
  --product face_elixir \
  --source founder_invitation \
  --days 14 \
  --first-name Ada
```

Use `example.invalid` addresses only — it is reserved and cannot route mail.

The script prints the invitation URL **once**. The raw token is never written
to the database, a file, a log, or an audit event. If it is lost, revoke the
invitation and issue a new one:

```sql
UPDATE seed_invitations SET status = 'revoked' WHERE id = '<uuid>';
```

The script refuses to run against a non-local `SUPABASE_URL` unless
`STUDY_CIRCLE_ALLOW_NONLOCAL=true` is set explicitly.

## 5. Test the participant flow

Start the app (`npm run dev`) and open the printed URL. Expect:

- the assigned product shown read-only under "Your NFE Ritual"
- the masked invitation email shown
- the `?invite=` parameter removed from the address bar after verification
- no way to change the product

Then check the invalid path by opening `/study-circle` with no token, a
malformed token, and a revoked/expired/redeemed one. All four must produce the
identical "This private invitation could not be confirmed." page.

## 6. Inspect what was stored

```sql
SELECT id, status, redeemed_at FROM seed_invitations ORDER BY created_at DESC;
SELECT id, product_assignment, participation_status,
       participation_consent_at, privacy_consent_at, study_contact_consent_at,
       honest_feedback_consent_at, internal_learning_consent_at,
       confidentiality_acknowledged_at
  FROM seed_participants ORDER BY created_at DESC;
SELECT * FROM seed_permissions;
SELECT event_type, metadata, created_at FROM seed_events ORDER BY created_at;
```

Confirm: the product matches the **invitation**, not anything the browser
sent; all six consent timestamps are populated and server-generated; every
permission the participant did not tick is `false`; no `seed_events` row
contains an email, a name, or a token.

## 7. Email

By default the mock adapter is used and **nothing is sent**. Messages are
captured in memory and asserted in the automated tests.

To exercise a real provider, both conditions must hold:
`RESEND_API_KEY` present **and** `STUDY_CIRCLE_ENABLE_EMAIL=true`. Only send to
a developer-owned inbox. Never use production Resend credentials.

## 8. Retention dry run

```
npm run seed:retention            # dry run — the default
npm run seed:retention -- --apply # destructive path; intentionally not implemented yet
```

Dry run is the default and cannot be switched off by an environment variable.
Output is record IDs and counts only — never a participant field.

Permission cleanup reports as **blocked** until `PERMISSION_AUDIT_PERIOD_DAYS`
is set. That duration is an unresolved founder/legal decision and is
deliberately not guessed.

## 9. Withdrawal

```
npm run seed:withdraw -- --participant <uuid>
npm run seed:withdraw -- --participant <uuid> --reason "volunteered reason"
```

No reason is required or solicited. This marks participation withdrawn, stops
all future public use, writes audit events, and schedules an anonymisation
review 30 days out. **It deletes nothing.** No product return is required.

## 10. Clean up local test data

```sql
DELETE FROM seed_events;
DELETE FROM seed_permissions;
DELETE FROM seed_participants;
DELETE FROM seed_invitations;
```

Local disposable fixtures only.

## 11. Automated tests

```
npm run test:seed-access
```

85 tests, no database and no network required. They use an in-memory store and
a mock email adapter, so they cannot reach any real system.

(`npm test` still fails — it references Jest, which is not installed. That is a
pre-existing, unrelated gap and was deliberately not repaired here.)

---

## Explicitly prohibited

- Applying the migration to production Supabase.
- Pointing any script at production (`STUDY_CIRCLE_ALLOW_NONLOCAL` exists for
  an *approved staging* project, never for production).
- Using production Resend credentials or the production sender.
- Creating a real participant invitation.
- Emailing a real customer address.
- Deploying. Nothing in this phase is deployable.

## What is still unverified

Because no database was available, the following are **implemented and
contract-tested but not proven against a real Postgres**, and must be
confirmed the first time the migration is applied:

1. That `seed_access_redeem_invitation` executes without error and its
   plpgsql is valid.
2. That its conditional `UPDATE` actually serialises two concurrent
   submissions. The test suite proves the *contract* using an in-memory store;
   only a real instance proves Postgres enforces it.
3. That RLS genuinely denies `anon` and `authenticated` on all five tables.
4. That every `CHECK` constraint and unique index behaves as written.
5. That the rollback script drops everything cleanly.

Until those five are confirmed on a real instance, this work is ready for
staging review — not for production.
