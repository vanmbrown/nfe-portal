import { createAdminSupabase } from '../supabase/server'
import { assertNoPii, type SeedEvent } from './auditEvents'
import type { SeedRedeemResult, SeedSupabaseClient } from './seedDatabase'
import type {
  IntakeRecordInput,
  InvitationRecord,
  RedeemOutcome,
  SeedAccessStore,
} from './store'

/**
 * Supabase-backed store.
 *
 * Uses the server-side admin (service-role) client. That client must never be
 * constructed in code that reaches the browser — these functions are only ever
 * called from Route Handlers and local scripts.
 *
 * Atomicity is delegated to a single Postgres function
 * (`seed_access_redeem_invitation`, defined in
 * `supabase/migration_seed_access.sql`). It is not reproduced in application
 * code, because a sequence of client calls could not provide the same
 * guarantee under concurrency.
 */
export function createSupabaseSeedAccessStore(): SeedAccessStore {
  // Single documented cast, narrowed to the two operations this module uses.
  // The generated Database type cannot describe tables whose migration has not
  // been applied yet. See seedDatabase.ts.
  const supabase = createAdminSupabase() as unknown as SeedSupabaseClient

  return {
    async findInvitationByTokenHash(
      tokenHash: string
    ): Promise<InvitationRecord | null> {
      const { data, error } = await supabase
        .from('seed_invitations')
        .select(
          'id, email, participant_name, product_assignment, source, status, expires_at, redeemed_at'
        )
        .eq('token_hash', tokenHash)
        .maybeSingle()

      if (error) throw new Error('seed_invitations lookup failed')
      if (!data) return null

      const row = data as Record<string, unknown>
      return {
        id: String(row.id),
        email: String(row.email),
        participantName: (row.participant_name as string | null) ?? null,
        productAssignment: String(row.product_assignment),
        source: String(row.source ?? ''),
        status: String(row.status),
        expiresAt: String(row.expires_at),
        redeemedAt: (row.redeemed_at as string | null) ?? null,
      }
    },

    async redeemInvitationAndCreateParticipant(
      tokenHash: string,
      normalizedEmail: string,
      intake: IntakeRecordInput
    ): Promise<RedeemOutcome> {
      const { data, error } = await supabase.rpc('seed_access_redeem_invitation', {
        p_token_hash: tokenHash,
        p_email: normalizedEmail,
        p_intake: intake as unknown as Record<string, unknown>,
      })

      if (error) {
        return { ok: false, reason: 'storage_error' }
      }

      const result = (Array.isArray(data) ? data[0] : data) as
        | SeedRedeemResult
        | null
        | undefined

      if (!result || result.ok !== true) {
        const reason = String(result?.reason ?? 'invitation_unavailable')
        return {
          ok: false,
          reason:
            reason === 'email_mismatch'
              ? 'email_mismatch'
              : reason === 'storage_error'
                ? 'storage_error'
                : 'invitation_unavailable',
        }
      }

      return {
        ok: true,
        participantId: String(result.participant_id),
        invitationId: String(result.invitation_id),
        productAssignment: String(result.product_assignment),
        source: String(result.source ?? ''),
      }
    },

    async recordEvent(event: SeedEvent): Promise<void> {
      assertNoPii(event.metadata)
      const { error } = await supabase.from('seed_events').insert({
        participant_id: event.participantId ?? null,
        invitation_id: event.invitationId ?? null,
        event_type: event.eventType,
        source: event.source ?? null,
        metadata: event.metadata ?? {},
      })
      if (error) throw new Error('seed_events insert failed')
    },
  }
}
