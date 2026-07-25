/**
 * Study Circle row shapes and a minimal client port.
 *
 * `src/types/supabase.ts` is generated from the live database and cannot know
 * about these tables until the migration has actually been applied somewhere.
 * Rather than hand-editing that generated file (where the edit would be lost
 * on the next regeneration) or casting the client to `any`, this module
 * declares exactly the two operations `supabaseStore.ts` performs and the row
 * shapes it reads.
 *
 * Once the migration has been applied to a local or staging project and types
 * are regenerated, this file can be deleted and the generated types used.
 */

export interface SeedInvitationRow {
  id: string
  token_hash: string
  email: string
  participant_name: string | null
  product_assignment: string
  source: string
  status: string
  issued_at: string
  expires_at: string
  redeemed_at: string | null
  declined_at: string | null
  created_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SeedRedeemResult {
  ok: boolean
  reason?: string
  participant_id?: string
  invitation_id?: string
  product_assignment?: string
  source?: string
}

interface QueryError {
  message: string
}

interface SelectBuilder {
  eq(column: string, value: string): SelectBuilder
  maybeSingle(): Promise<{ data: unknown; error: QueryError | null }>
}

interface TableBuilder {
  select(columns: string): SelectBuilder
  insert(values: Record<string, unknown>): Promise<{ error: QueryError | null }>
}

/**
 * The narrow surface of the Supabase client that Study Circle actually uses.
 * Narrower than the real client on purpose: it documents the blast radius of
 * this module, and it is trivially satisfiable by a fake in tests.
 */
export interface SeedSupabaseClient {
  from(table: string): TableBuilder
  rpc(
    fn: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown; error: QueryError | null }>
}
