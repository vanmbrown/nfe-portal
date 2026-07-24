/**
 * Phase 1 prototype only. No real invitations, no real participant data,
 * no network call. This exists so the frontend experience (invalid state,
 * valid state, intake, consent, confirmation) can be built and tested
 * before the backend proposal in docs/seed-access/BACKEND_PROPOSAL.md is
 * authorized and its migration applied. Replace with a real call to a
 * server-verified invitation-check endpoint once that backend exists —
 * do not ship this file's token list as-is.
 */

const MOCK_VALID_TOKENS = new Set(['PROTOTYPE-VALID-TEST-TOKEN'])

export type MockInviteState = 'checking' | 'valid' | 'invalid'

export function checkMockInvitation(token: string | null): MockInviteState {
  if (!token) return 'invalid'
  return MOCK_VALID_TOKENS.has(token) ? 'valid' : 'invalid'
}
