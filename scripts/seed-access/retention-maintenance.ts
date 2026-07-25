/**
 * Study Circle — retention maintenance (local operator script).
 *
 *   npm run seed:retention              # dry run, the default
 *   npm run seed:retention -- --apply   # destructive, requires the explicit flag
 *
 * Dry run is the default and cannot be disabled by an environment variable —
 * only by passing --apply on the command line. Output is record counts and
 * record IDs only; no participant field is ever printed.
 *
 * The permission-record rule depends on an audit period that has not been
 * decided (see docs/seed-access/APPROVED_POLICIES.md §12). Until
 * PERMISSION_AUDIT_PERIOD_DAYS is set, that rule reports as blocked and takes
 * no action rather than guessing a duration.
 */
import { createClient } from '@supabase/supabase-js'
import { parseArgs } from 'node:util'
import {
  getPermissionAuditPeriodDays,
  selectInvitationsForPurge,
  selectParticipantsForRetentionAction,
  selectPermissionsForReview,
  type RetentionCandidate,
} from '../../src/lib/seed-access/retention'

function fail(message: string): never {
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) fail(`Missing ${name}.`)
  return value
}

function assertNonProductionTarget(supabaseUrl: string): void {
  if (process.env.STUDY_CIRCLE_ALLOW_NONLOCAL === 'true') return
  const isLocal =
    supabaseUrl.includes('localhost') ||
    supabaseUrl.includes('127.0.0.1') ||
    supabaseUrl.includes('kong:')
  if (!isLocal) {
    fail(
      'SUPABASE_URL does not look local. Refusing to run retention maintenance.\n' +
        '    Never run this against production.'
    )
  }
}

function summarize(label: string, candidates: RetentionCandidate[]): void {
  console.log(`    ${label}: ${candidates.length}`)
  for (const candidate of candidates) {
    console.log(`      - ${candidate.action} ${candidate.recordId} (due since ${candidate.dueSince})`)
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { apply: { type: 'boolean', default: false } },
    allowPositionals: false,
  })
  const destructive = values.apply === true

  const supabaseUrl = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  assertNonProductionTarget(supabaseUrl)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const now = new Date()

  console.log(
    `\n  Study Circle retention maintenance — ${destructive ? 'APPLY (destructive)' : 'DRY RUN'}\n`
  )

  const { data: invitationRows, error: invitationError } = await supabase
    .from('seed_invitations')
    .select('id, status, expires_at, redeemed_at, declined_at')
  if (invitationError) fail('Could not read invitations.')

  const invitationCandidates = selectInvitationsForPurge(
    (invitationRows ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      status: String(row.status),
      expiresAt: String(row.expires_at),
      redeemedAt: (row.redeemed_at as string | null) ?? null,
      declinedAt: (row.declined_at as string | null) ?? null,
    })),
    now
  )

  const { data: participantRows, error: participantError } = await supabase
    .from('seed_participants')
    .select('id, participation_status, completed_at, withdrawn_at, anonymized_at')
  if (participantError) fail('Could not read participants.')

  const participantCandidates = selectParticipantsForRetentionAction(
    (participantRows ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      participationStatus: String(row.participation_status),
      completedAt: (row.completed_at as string | null) ?? null,
      withdrawnAt: (row.withdrawn_at as string | null) ?? null,
      anonymizedAt: (row.anonymized_at as string | null) ?? null,
    })),
    now
  )

  summarize('Invitations due for purge', invitationCandidates)
  summarize('Participants due for action', participantCandidates)

  const auditPeriod = getPermissionAuditPeriodDays()
  const permissionOutcome = selectPermissionsForReview([], now, auditPeriod)
  if (!permissionOutcome.resolved) {
    console.log(
      '    Permission records: BLOCKED — PERMISSION_AUDIT_PERIOD_DAYS is unset.\n' +
        '      This duration is an unresolved founder/legal decision. No action taken.'
    )
  } else {
    summarize('Permission records due for review', permissionOutcome.candidates)
  }

  if (!destructive) {
    console.log('\n  Dry run only. Nothing was modified. Re-run with --apply to act.\n')
    return
  }

  console.log('\n  --apply supplied. Destructive execution is intentionally not implemented yet.')
  console.log('  Implement it only after the retention rules have had legal review.\n')
}

main().catch(() => {
  fail('Unexpected failure during retention maintenance.')
})
