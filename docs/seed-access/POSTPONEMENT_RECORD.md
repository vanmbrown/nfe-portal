# NFE Study Circle — Staging and Activation Postponement

## Decision date

2026-07-25

## Decision

The NFE Study Circle implementation is complete, but staging-database
validation and participant activation are postponed until the final stage of
the current website upgrade.

This is a deliberate sequencing decision, not a technical failure. Nothing is
blocked, broken, or awaiting a fix. The work is paused in a ready state.

## Reason

- Seeding will not begin for at least one month.
- The backend is complete and unit-tested.
- No live participant depends on the system.
- Legal review remains pending.
- A staging project would be largely unused during the postponement period.
- The Supabase Free-plan project limit is currently occupied.
- NFE does not want to assume additional recurring expense before the
  environment is operationally necessary.
- Database validation should occur close to the real Seeding timeline so
  findings are current and can move directly into launch preparation.

## Current implementation status

```
IMPLEMENTATION COMPLETE
DATABASE VALIDATION DEFERRED
LEGAL REVIEW PENDING
NO LIVE PARTICIPANTS
NO PRODUCTION MIGRATION
```

## Frozen branch

`feature/nfe-seed-access`

## Frozen implementation commit

`5894c5f`

The branch must not be deleted, rewritten, or merged while frozen. It is the
sole record of the implementation and is intended to be resumed as-is.

## What exists at the frozen commit

- Participant-facing `/study-circle` experience, complete.
- Approved founder policies recorded (`APPROVED_POLICIES.md`).
- Invitation creation CLI, verification API, and intake API.
- Atomic redemption migration with a Postgres function
  (`supabase/migration_seed_access.sql`) and its rollback.
- Six separate required-consent timestamps, twelve independent optional
  permissions, confidentiality acknowledgment.
- Retention and withdrawal architecture, with the permission audit period
  deliberately unresolved.
- 85 automated tests, passing, requiring no database or network.
- Operations guide (`NON_PRODUCTION_OPERATIONS.md`) and legal handoff
  (`LEGAL_REVIEW_HANDOFF.md`).

## What was never done, and remains not done

The migration has been applied to **no environment**. Because no database was
ever available, these five properties are implemented and contract-tested but
**unproven**, and are the first things to verify on resumption:

1. The redemption function compiles and executes.
2. Its conditional `UPDATE` genuinely serialises concurrent submissions in
   Postgres.
3. RLS actually denies `anon` and `authenticated` on all five tables.
4. Every `CHECK` constraint and unique index behaves as written.
5. The rollback script drops everything cleanly.

## Conditions for resumption

Resume Study Circle work only when Vanessa confirms that Seeding preparation
is beginning.

At that time:

1. Determine whether VM_CC may be paused or retired.
2. Create or free a separate Supabase staging project.
3. Apply the Study Circle migration in staging only.
4. Validate RPC compilation and execution.
5. Validate atomic redemption.
6. Validate constraints and indexes.
7. Validate RLS.
8. Validate rollback.
9. Run fake-data end-to-end tests.
10. Complete legal review.
11. Revise participant-facing language if counsel requires changes.
12. Obtain explicit production-migration authorization.
13. Create real invitations only after production approval.

## Explicit non-actions

- no staging project;
- no production schema;
- no migration;
- no live token;
- no real participant;
- no email;
- no deployment;
- no production merge;
- no legal-approval claim.

## Note on the local environment

No `.env.local` exists in the worktree holding this branch, so no credential
is present alongside the frozen code. On resumption, staging credentials must
go into an ignored local environment file in the worktree that holds this
branch — never the repository root directory, which carries production values
for unrelated work.
