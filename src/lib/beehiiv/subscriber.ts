import type { NfeAttributionContext } from '@/lib/analytics/utm'
import {
  BEEHIIV_CUSTOM_FIELDS,
  getCrmTagsForIntent,
  getSourceCrmTag,
} from '@/lib/customer-intelligence/tags'
import type { ConsentSource, CustomerIntentType } from '@/lib/customer-intelligence/types'

type BeehiivSyncStatus = 'synced' | 'skipped' | 'failed'

interface BeehiivSyncInput {
  email: string
  intent: CustomerIntentType
  source: ConsentSource
  attribution?: NfeAttributionContext
  pagePath?: string
  consentSource?: string
  marketingOptIn?: boolean
  privacyPolicyAccepted?: boolean
}

interface BeehiivSyncResult {
  status: BeehiivSyncStatus
  reason?: string
}

type BeehiivCustomField = {
  name: string
  value: string | boolean
}

interface BeehiivSubscriptionRequest {
  email?: string
  reactivate_existing?: boolean
  send_welcome_email?: boolean
  tags?: string[]
  custom_fields?: BeehiivCustomField[]
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referring_site?: string
}

const BEEHIIV_API_BASE_URL = 'https://api.beehiiv.com/v2'

function cleanValue(value?: string | boolean): string | boolean | undefined {
  if (typeof value === 'boolean') return value
  if (!value) return undefined

  const cleaned = value.trim().slice(0, 180)
  return cleaned || undefined
}

function cleanStringValue(value?: string): string | undefined {
  if (!value) return undefined

  const cleaned = value.trim().slice(0, 180)
  return cleaned || undefined
}

function compact<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== '')
  ) as T
}

function buildBeehiivTags(intent: CustomerIntentType, source: ConsentSource) {
  return Array.from(
    new Set([...getCrmTagsForIntent(intent), getSourceCrmTag(source)])
  ).filter(Boolean)
}

function buildCustomFields(input: BeehiivSyncInput): BeehiivCustomField[] {
  const fields: BeehiivCustomField[] = [
    {
      name: BEEHIIV_CUSTOM_FIELDS.primaryInterest,
      value: input.intent,
    },
    {
      name: BEEHIIV_CUSTOM_FIELDS.source,
      value: input.source,
    },
    {
      name: BEEHIIV_CUSTOM_FIELDS.launchStatus,
      value: 'private_list',
    },
    {
      name: BEEHIIV_CUSTOM_FIELDS.consentSource,
      value: input.consentSource ?? input.source,
    },
    {
      name: BEEHIIV_CUSTOM_FIELDS.marketingOptIn,
      value: Boolean(input.marketingOptIn),
    },
    {
      name: BEEHIIV_CUSTOM_FIELDS.privacyAccepted,
      value: Boolean(input.privacyPolicyAccepted),
    },
  ]

  return fields
    .map((field) => ({ ...field, value: cleanValue(field.value) }))
    .filter((field): field is BeehiivCustomField => field.value !== undefined)
}

function buildSubscriptionPayload(input: BeehiivSyncInput): BeehiivSubscriptionRequest {
  const attribution = input.attribution ?? {}

  return compact({
    email: input.email.toLowerCase().trim(),
    reactivate_existing: false,
    send_welcome_email: false,
    tags: buildBeehiivTags(input.intent, input.source),
    custom_fields: buildCustomFields(input),
    utm_source: cleanStringValue(attribution.utmSource),
    utm_medium: cleanStringValue(attribution.utmMedium),
    utm_campaign: cleanStringValue(attribution.utmCampaign),
    utm_term: cleanStringValue(attribution.utmTerm),
    utm_content: cleanStringValue(attribution.utmContent),
    referring_site: cleanStringValue(attribution.referrer),
  })
}

function getBeehiivConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY?.trim()
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID?.trim()

  if (!apiKey || !publicationId) {
    return null
  }

  return { apiKey, publicationId }
}

async function sendBeehiivRequest({
  path,
  method,
  apiKey,
  payload,
}: {
  path: string
  method: 'POST' | 'PUT'
  apiKey: string
  payload: BeehiivSubscriptionRequest
}) {
  return fetch(`${BEEHIIV_API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

function shouldTryUpdate(responseBody: string, status: number) {
  return (
    status === 400 ||
    status === 409 ||
    responseBody.toLowerCase().includes('already') ||
    responseBody.toLowerCase().includes('exists')
  )
}

export async function syncBeehiivSubscriber(
  input: BeehiivSyncInput
): Promise<BeehiivSyncResult> {
  if (!input.marketingOptIn || !input.privacyPolicyAccepted) {
    return { status: 'skipped', reason: 'consent_missing' }
  }

  const config = getBeehiivConfig()
  if (!config) {
    return { status: 'skipped', reason: 'beehiiv_not_configured' }
  }

  const createPayload = buildSubscriptionPayload(input)
  const basePath = `/publications/${encodeURIComponent(
    config.publicationId
  )}/subscriptions`

  try {
    const createResponse = await sendBeehiivRequest({
      path: basePath,
      method: 'POST',
      apiKey: config.apiKey,
      payload: createPayload,
    })

    if (createResponse.ok) {
      return { status: 'synced' }
    }

    const createResponseBody = await createResponse.text()

    if (shouldTryUpdate(createResponseBody, createResponse.status)) {
      const { email: _email, reactivate_existing: _reactivate, ...updatePayload } = createPayload
      const updateResponse = await sendBeehiivRequest({
        path: `${basePath}/by_email/${encodeURIComponent(input.email.toLowerCase().trim())}`,
        method: 'PUT',
        apiKey: config.apiKey,
        payload: updatePayload,
      })

      if (updateResponse.ok) {
        return { status: 'synced' }
      }

      console.error('[beehiiv] update failed', { status: updateResponse.status })
      return { status: 'failed', reason: 'beehiiv_update_failed' }
    }

    console.error('[beehiiv] create failed', { status: createResponse.status })
    return { status: 'failed', reason: 'beehiiv_create_failed' }
  } catch (error) {
    console.error('[beehiiv] sync failed', {
      message: error instanceof Error ? error.message : 'unknown_error',
    })
    return { status: 'failed', reason: 'beehiiv_request_failed' }
  }
}
