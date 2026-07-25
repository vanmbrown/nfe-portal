/**
 * Study Circle — invitation creation (local operator CLI).
 *
 *   npm run seed:create-invitation -- \
 *     --email participant@example.invalid \
 *     --product face_elixir \
 *     --source founder_invitation \
 *     --days 14 \
 *     --first-name Ada \
 *     --note "met at the Atlanta event"
 *
 * The raw token is printed exactly once, here, and never persisted anywhere:
 * not to the database (only its SHA-256 hash is stored), not to a file, not to
 * an audit event, not to analytics. If the operator loses it before delivering
 * it, the correct move is to revoke the invitation and issue a new one.
 *
 * This script refuses to run against a URL that looks like production.
 */
import { createClient } from '@supabase/supabase-js'
import { parseArgs } from 'node:util'
import {
  STUDY_CIRCLE_DEFAULT_SOURCE,
  STUDY_CIRCLE_PRODUCT_VALUES,
  STUDY_CIRCLE_SOURCES,
} from '../../src/content/seed-access/options'
import {
  generateInvitationToken,
  hashInvitationToken,
  normalizeEmail,
} from '../../src/lib/seed-access/tokens'

const DEFAULT_EXPIRY_DAYS = 14

function fail(message: string): never {
  // Message text is authored here; database internals are never echoed.
  console.error(`\n  ✗ ${message}\n`)
  process.exit(1)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    fail(
      `Missing ${name}. Set it in your local environment for a non-production Supabase project. ` +
        `Never point this script at production.`
    )
  }
  return value
}

/**
 * Guardrail, not a security boundary: an operator who has deliberately set a
 * production URL can still defeat it. It exists to stop an accident.
 */
function assertNonProductionTarget(supabaseUrl: string): void {
  if (process.env.STUDY_CIRCLE_ALLOW_NONLOCAL === 'true') return
  const isLocal =
    supabaseUrl.includes('localhost') ||
    supabaseUrl.includes('127.0.0.1') ||
    supabaseUrl.includes('kong:')
  if (!isLocal) {
    fail(
      'SUPABASE_URL does not look like a local instance. Refusing to create an invitation.\n' +
        '    If you are intentionally targeting an approved non-production project, re-run with\n' +
        '    STUDY_CIRCLE_ALLOW_NONLOCAL=true. Never do this for production.'
    )
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      email: { type: 'string' },
      product: { type: 'string' },
      source: { type: 'string', default: STUDY_CIRCLE_DEFAULT_SOURCE },
      days: { type: 'string', default: String(DEFAULT_EXPIRY_DAYS) },
      'first-name': { type: 'string' },
      note: { type: 'string' },
    },
    allowPositionals: false,
  })

  const email = values.email ? normalizeEmail(values.email) : ''
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail('--email is required and must be a valid address.')
  }

  const product = values.product ?? ''
  if (!(STUDY_CIRCLE_PRODUCT_VALUES as readonly string[]).includes(product)) {
    fail(`--product must be one of: ${STUDY_CIRCLE_PRODUCT_VALUES.join(', ')}`)
  }

  const source = values.source ?? STUDY_CIRCLE_DEFAULT_SOURCE
  if (!(STUDY_CIRCLE_SOURCES as readonly string[]).includes(source)) {
    fail(`--source must be one of: ${STUDY_CIRCLE_SOURCES.join(', ')}`)
  }

  const days = Number.parseInt(values.days ?? '', 10)
  if (!Number.isFinite(days) || days <= 0 || days > 365) {
    fail('--days must be a positive integer no greater than 365.')
  }

  const supabaseUrl = requireEnv('SUPABASE_URL')
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  assertNonProductionTarget(supabaseUrl)

  const baseUrl = process.env.STUDY_CIRCLE_BASE_URL ?? 'http://localhost:3000'

  const rawToken = generateInvitationToken()
  const tokenHash = hashInvitationToken(rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + days * 86_400_000)

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('seed_invitations')
    .insert({
      token_hash: tokenHash,
      email,
      participant_name: values['first-name'] ?? null,
      product_assignment: product,
      source,
      status: 'issued',
      issued_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      created_by: 'cli',
      notes: values.note ?? null,
    })
    .select('id')
    .single()

  if (error || !data) {
    fail('Could not create the invitation. Check that the migration has been applied.')
  }

  const invitationId = String((data as Record<string, unknown>).id)

  await supabase.from('seed_events').insert({
    invitation_id: invitationId,
    event_type: 'invitation_created',
    source,
    metadata: { product, expiresInDays: days },
  })

  const url = `${baseUrl.replace(/\/+$/, '')}/study-circle?invite=${rawToken}`

  console.log('\n  ✓ Study Circle invitation created.\n')
  console.log(`    Invitation record : ${invitationId}`)
  console.log(`    Product           : ${product}`)
  console.log(`    Source            : ${source}`)
  console.log(`    Expires           : ${expiresAt.toISOString()}\n`)
  console.log('    Send this link to the participant. It is shown once and is not recoverable:\n')
  console.log(`    ${url}\n`)
  console.log('    Do not paste this link into Git, a ticket, analytics, or a shared log.\n')
}

main().catch(() => {
  // Never surface a raw driver error: it can contain connection details.
  fail('Unexpected failure while creating the invitation.')
})
