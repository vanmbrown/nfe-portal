import type { SeedEvent } from '../../src/lib/seed-access/auditEvents'
import { assertNoPii } from '../../src/lib/seed-access/auditEvents'
import type {
  IntakeRecordInput,
  InvitationRecord,
  RedeemOutcome,
  SeedAccessStore,
} from '../../src/lib/seed-access/store'

/**
 * In-memory SeedAccessStore for tests.
 *
 * `redeemInvitationAndCreateParticipant` models the same contract the Postgres
 * function provides: the invitation is claimed with a check-and-set, and a
 * claim that loses returns 'invitation_unavailable'. Because JavaScript runs
 * this synchronously between awaits, two concurrent callers exercise the same
 * race the database guard is there to prevent.
 *
 * This validates the *contract*. It does not and cannot validate that Postgres
 * enforces it — that requires the migration applied to a real instance.
 */
export class FakeSeedAccessStore implements SeedAccessStore {
  invitations = new Map<string, InvitationRecord & { tokenHash: string }>()
  participants: Array<{ id: string; invitationId: string; intake: IntakeRecordInput }> = []
  events: SeedEvent[] = []
  failLookup = false
  failRedeem = false

  private nextId = 1

  addInvitation(
    tokenHash: string,
    overrides: Partial<InvitationRecord> = {}
  ): InvitationRecord {
    const record: InvitationRecord & { tokenHash: string } = {
      tokenHash,
      id: `inv-${this.nextId++}`,
      email: 'participant@example.invalid',
      participantName: 'Ada',
      productAssignment: 'face_elixir',
      source: 'founder_invitation',
      status: 'issued',
      expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      redeemedAt: null,
      ...overrides,
    }
    this.invitations.set(tokenHash, record)
    return record
  }

  async findInvitationByTokenHash(tokenHash: string): Promise<InvitationRecord | null> {
    if (this.failLookup) throw new Error('storage down')
    return this.invitations.get(tokenHash) ?? null
  }

  async redeemInvitationAndCreateParticipant(
    tokenHash: string,
    normalizedEmail: string,
    intake: IntakeRecordInput
  ): Promise<RedeemOutcome> {
    if (this.failRedeem) return { ok: false, reason: 'storage_error' }

    const invitation = this.invitations.get(tokenHash)
    if (!invitation) return { ok: false, reason: 'invitation_unavailable' }

    // Email binding checked before the claim, so a mismatch does not consume
    // the invitation — same ordering as the SQL function.
    if (invitation.email.toLowerCase() !== normalizedEmail.toLowerCase()) {
      return { ok: false, reason: 'email_mismatch' }
    }

    const expired = new Date(invitation.expiresAt).getTime() <= Date.now()
    if (invitation.status !== 'issued' || invitation.redeemedAt || expired) {
      return { ok: false, reason: 'invitation_unavailable' }
    }

    // The claim. Everything after this point is committed together.
    invitation.status = 'redeemed'
    invitation.redeemedAt = new Date().toISOString()

    const participantId = `par-${this.nextId++}`
    this.participants.push({
      id: participantId,
      invitationId: invitation.id,
      // product_assignment is taken from the invitation, never from intake.
      intake: { ...intake, invitationId: invitation.id },
    })

    return {
      ok: true,
      participantId,
      invitationId: invitation.id,
      productAssignment: invitation.productAssignment,
      source: invitation.source,
    }
  }

  async recordEvent(event: SeedEvent): Promise<void> {
    assertNoPii(event.metadata)
    this.events.push(event)
  }

  eventTypes(): string[] {
    return this.events.map((e) => e.eventType)
  }
}
