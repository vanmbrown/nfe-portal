/**
 * Development-only invitation stub.
 *
 * This exists so `/study-circle` can be exercised locally without a database.
 * It is hard-gated: `isMockModeEnabled()` returns false whenever
 * NODE_ENV === 'production', so a production build cannot validate a demo
 * token no matter what is passed in the URL.
 *
 * Real verification goes through POST /api/seed-access/verify-invite.
 */

export interface MockInvitationView {
  firstName: string | null
  maskedEmail: string
  productAssignment: 'face_elixir' | 'body_elixir'
}

const MOCK_INVITATIONS: Record<string, MockInvitationView> = {
  'nfe-study-circle-demo': {
    firstName: 'Demo',
    maskedEmail: 'd***@example.invalid',
    productAssignment: 'face_elixir',
  },
  'nfe-study-circle-demo-body': {
    firstName: 'Demo',
    maskedEmail: 'd***@example.invalid',
    productAssignment: 'body_elixir',
  },
}

export function isMockModeEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export function lookupMockInvitation(token: string): MockInvitationView | null {
  if (!isMockModeEnabled()) return null
  return MOCK_INVITATIONS[token] ?? null
}
