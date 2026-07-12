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
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = `api-path-${Date.now()}@example.invalid`
const now = new Date().toISOString()

const supabase = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const signupRecord = {
  email,
  first_name: 'API',
  last_name: 'Path',
  phone: null,
  age_range: null,
  primary_skin_interests: [],
  product_interest: null,
  topic_request: null,
  newsletter_opt_in: false,
  privacy_policy_accepted: true,
  consent_text_version: 'founder-access-v1',
  consented_at: now,
  source_page: '/founder-access',
  high_intent: false,
  updated_at: now,
}

const { data: existingSignup, error: lookupError } = await supabase
  .from('founder_access_signups')
  .select('id')
  .eq('email', email)
  .maybeSingle()

if (lookupError) {
  console.log(JSON.stringify({ pass: false, step: 'lookup', error: lookupError.message }))
  process.exit(1)
}

let writeError = null
if (existingSignup) {
  const { error } = await supabase
    .from('founder_access_signups')
    .update(signupRecord)
    .eq('id', existingSignup.id)
  writeError = error
} else {
  const { error } = await supabase.from('founder_access_signups').insert(signupRecord)
  writeError = error
}

if (writeError) {
  console.log(JSON.stringify({ pass: false, step: 'write', error: writeError.message }))
  process.exit(1)
}

const { error: beehiivUpdateError } = await supabase
  .from('founder_access_signups')
  .update({ beehiiv_status: 'skipped', beehiiv_reason: 'rls-test' })
  .eq('email', email)

await supabase.from('founder_access_signups').delete().eq('email', email)

console.log(
  JSON.stringify({
    pass: !beehiivUpdateError,
    lookupOk: true,
    writeOk: true,
    beehiivUpdateOk: !beehiivUpdateError,
  })
)
