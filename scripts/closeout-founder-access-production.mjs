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

const base = process.argv.find((arg) => arg.startsWith('http')) || 'https://www.nfebeauty.com'
const step = process.argv.find((arg) => arg.startsWith('--step='))?.split('=')[1] || 'all'
const ts = process.argv.find((arg) => /^\d{13,}$/.test(arg)) || Date.now()

async function post(label, body) {
  const response = await fetch(`${base}/api/founder-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text.slice(0, 200) }
  }
  return { label, status: response.status, body: json }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(url, service, { auth: { persistSession: false } })

async function verifyEmail(email) {
  const founder = await supabase
    .from('founder_access_signups')
    .select(
      'email,first_name,last_name,phone,newsletter_opt_in,beehiiv_status,beehiiv_reason,high_intent,topic_request,product_interest,updated_at'
    )
    .eq('email', email)
    .maybeSingle()
  const subscriber = await supabase
    .from('subscribers')
    .select('email,created_at')
    .eq('email', email)
    .maybeSingle()
  return { founder: founder.data, subscriber: subscriber.data }
}

const uncheckedEmail = `closeout-unchecked-${ts}@example.invalid`
const checkedEmail = `closeout-checked-${ts}@example.invalid`
const duplicateEmail = `closeout-dup-${ts}@example.invalid`

const requests = [
  {
    label: 'A_newsletter_unchecked',
    body: {
      firstName: 'CloseoutA',
      lastName: 'Unchecked',
      email: uncheckedEmail,
      privacyPolicyAccepted: true,
      newsletterOptIn: false,
      sourcePage: '/founder-access',
    },
  },
  {
    label: 'B_newsletter_checked',
    body: {
      firstName: 'CloseoutB',
      lastName: 'Checked',
      email: checkedEmail,
      phone: '555-0100',
      ageRange: '45–54',
      primarySkinInterests: ['Dryness', 'Radiance'],
      productInterest: 'face_elixir',
      topicRequest: 'Barrier comfort for mature skin',
      privacyPolicyAccepted: true,
      newsletterOptIn: true,
      sourcePage: '/founder-access',
    },
  },
  {
    label: 'C_duplicate_first',
    body: {
      firstName: 'CloseoutC',
      email: duplicateEmail,
      privacyPolicyAccepted: true,
      newsletterOptIn: false,
    },
  },
  {
    label: 'C_duplicate_second',
    body: {
      firstName: 'CloseoutCUpdated',
      lastName: 'Upsert',
      email: duplicateEmail,
      phone: '555-0199',
      topicRequest: 'Updated topic request',
      privacyPolicyAccepted: true,
      newsletterOptIn: true,
      productInterest: 'both',
    },
  },
]

const stepRequests = {
  a: [requests[0]],
  b: [requests[1]],
  c: [requests[2], requests[3]],
  all: requests,
}

const selected = stepRequests[step]
if (!selected) {
  console.error('Unknown step. Use --step=a|b|c|all')
  process.exit(1)
}

const apiResults = []
for (const request of selected) {
  apiResults.push(await post(request.label, request.body))
}

const verification = {
  unchecked: await verifyEmail(uncheckedEmail),
  checked: await verifyEmail(checkedEmail),
  duplicate: await verifyEmail(duplicateEmail),
}

const duplicateRows = await supabase
  .from('founder_access_signups')
  .select('id', { count: 'exact', head: true })
  .eq('email', duplicateEmail)

console.log(
  JSON.stringify(
    {
      base,
      step,
      ts,
      apiResults,
      verification,
      duplicateRowCount: duplicateRows.count,
      pass:
        apiResults.every((result) => result.status === 200) &&
        verification.unchecked.founder &&
        verification.checked.founder &&
        verification.duplicate.founder &&
        duplicateRows.count === 1,
    },
    null,
    2
  )
)
