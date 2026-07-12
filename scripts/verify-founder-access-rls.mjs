import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/)
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
    }
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anon || !service) {
  console.log(
    JSON.stringify({
      ok: false,
      reason: 'missing_env',
      hasUrl: Boolean(url),
      hasAnon: Boolean(anon),
      hasService: Boolean(service),
    })
  )
  process.exit(1)
}

const testEmail = `rls-verify-${Date.now()}@example.invalid`

const anonClient = createClient(url, anon, { auth: { persistSession: false } })
const adminClient = createClient(url, service, { auth: { persistSession: false } })

const adminInsert = await adminClient.from('founder_access_signups').insert({
  email: testEmail,
  first_name: 'RLS',
  privacy_policy_accepted: true,
})

let adminSelectOk = false
let anonCannotReadInsertedRow = false
let anonUpdateDenied = false
let anonDeleteDenied = false

if (!adminInsert.error) {
  const adminSelect = await adminClient
    .from('founder_access_signups')
    .select('id')
    .eq('email', testEmail)
    .maybeSingle()
  adminSelectOk = !adminSelect.error && Boolean(adminSelect.data)

  const anonSelect = await anonClient
    .from('founder_access_signups')
    .select('id,email')
    .eq('email', testEmail)
    .maybeSingle()
  anonCannotReadInsertedRow =
    !anonSelect.error && anonSelect.data === null

  const anonUpdate = await anonClient
    .from('founder_access_signups')
    .update({ first_name: 'Blocked' })
    .eq('email', testEmail)
  const afterAnonUpdate = await adminClient
    .from('founder_access_signups')
    .select('first_name')
    .eq('email', testEmail)
    .maybeSingle()
  anonUpdateDenied =
    afterAnonUpdate.data?.first_name === 'RLS'

  const anonDelete = await anonClient
    .from('founder_access_signups')
    .delete()
    .eq('email', testEmail)
  const afterAnonDelete = await adminClient
    .from('founder_access_signups')
    .select('id')
    .eq('email', testEmail)
    .maybeSingle()
  anonDeleteDenied = Boolean(afterAnonDelete.data)

  await adminClient.from('founder_access_signups').delete().eq('email', testEmail)
}

const anonInsert = await anonClient.from('founder_access_signups').insert({
  email: `rls-insert-${Date.now()}@example.invalid`,
  first_name: 'RLS',
  privacy_policy_accepted: true,
})

const results = {
  anonCannotReadInsertedRow,
  anonInsertDenied: Boolean(anonInsert.error),
  anonInsertCode: anonInsert.error?.code ?? null,
  anonUpdateDenied,
  anonDeleteDenied,
  adminInsertOk: !adminInsert.error,
  adminInsertCode: adminInsert.error?.code ?? null,
  adminSelectOk,
  pass:
    anonCannotReadInsertedRow &&
    Boolean(anonInsert.error) &&
    anonUpdateDenied &&
    anonDeleteDenied &&
    !adminInsert.error &&
    adminSelectOk,
}

console.log(JSON.stringify(results, null, 2))
process.exit(results.pass ? 0 : 1)
