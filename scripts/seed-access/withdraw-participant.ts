/**
 * Study Circle — participant withdrawal (local operator script).
 *
 *   npm run seed:withdraw -- --participant <uuid> [--reason "optional, only if volunteered"]
 *
 * Withdrawal is an operator action, deliberately. There is no public
 * withdrawal route: a participant asks Vanessa or the Concierge, and a human
 * records it. That keeps the "no penalty, no reason required" policy a human
 * interaction rather than a form.
 *
 * This script does NOT delete anything. It marks the participation withdrawn,
 * stops future public use of their content, and schedules an anonymisation
 * review 30 days out (approved policy §11/§12). Deletion remains a separate,
 * explicitly authorised operator action.
 */
import { createClient } from '@supabase/supabase-js'
import { parseArgs } from 'node:util'
import { RETENTION_DAYS } from '../../src/lib/seed-access/retention'

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
  if (!isLocal) fail('SUPABASE_URL does not look local. Refusing to modify records.')
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      participant: { type: 'string' },
      reason: { type: 'string' },
    },
    allowPositionals: false,
  })

  const participantId = values.participant
  if (!participantId) fail('--participant <uuid> is required.')

  const supabaseUrl = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  assertNonProductionTarget(supabaseUrl)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const now = new Date()
  const reviewAt = new Date(
    now.getTime() + RETENTION_DAYS.withdrawnParticipant * 86_400_000
  )

  const { error: participantError } = await supabase
    .from('seed_participants')
    .update({
      participation_status: 'withdrawn',
      withdrawn_at: now.toISOString(),
      // Recorded only when the participant volunteered one. No reason is
      // required and none is solicited.
      withdrawal_reason: values.reason ?? null,
      retention_review_at: reviewAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', participantId)

  if (participantError) fail('Could not update the participant record.')

  // Future public use stops immediately. Historical permission state is not
  // erased — it is the record of what was authorised at the time, which is
  // exactly what an audit period exists to preserve.
  const { error: permissionError } = await supabase
    .from('seed_permissions')
    .update({
      quote_permission: false,
      quote_length_edit_permission: false,
      first_name_permission: false,
      full_name_permission: false,
      photo_permission: false,
      video_permission: false,
      website_permission: false,
      email_permission: false,
      organic_social_permission: false,
      paid_media_permission: false,
      future_contact_permission: false,
      marketing_permission: false,
      permissions_withdrawn_at: now.toISOString(),
    })
    .eq('participant_id', participantId)

  if (permissionError) fail('Participation was marked withdrawn, but permissions were not updated.')

  await supabase.from('seed_events').insert([
    {
      participant_id: participantId,
      event_type: 'participant_withdrawn',
      metadata: { reasonSupplied: Boolean(values.reason) },
    },
    {
      participant_id: participantId,
      event_type: 'permissions_updated',
      metadata: { publicUseWithdrawn: true },
    },
    {
      participant_id: participantId,
      event_type: 'retention_review_due',
      metadata: { inDays: RETENTION_DAYS.withdrawnParticipant },
    },
  ])

  console.log('\n  ✓ Participation withdrawn.\n')
  console.log(`    Participant       : ${participantId}`)
  console.log(`    Public use        : stopped`)
  console.log(`    Anonymisation due : ${reviewAt.toISOString()}`)
  console.log('\n    No product return is required. Nothing has been deleted.\n')
}

main().catch(() => {
  fail('Unexpected failure during withdrawal.')
})
