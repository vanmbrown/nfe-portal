import type { NfeEventPayload } from './events'

export interface TrackOptions {
  consentGranted?: boolean
  debug?: boolean
}

export interface TrackedNfeEvent extends NfeEventPayload {
  occurredAt: string
}

const EVENT_NAME = 'nfe:analytics-event'

export function buildTrackedEvent(payload: NfeEventPayload): TrackedNfeEvent {
  return {
    ...payload,
    occurredAt: new Date().toISOString(),
  }
}

export function trackNfeEvent(
  payload: NfeEventPayload,
  options: TrackOptions = {}
): TrackedNfeEvent {
  const event = buildTrackedEvent({
    ...payload,
    consentGranted: options.consentGranted ?? payload.consentGranted ?? false,
  })

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: event }))
  }

  if (options.debug && typeof console !== 'undefined') {
    console.info('[NFE analytics]', event)
  }

  return event
}

export function getNfeAnalyticsEventName() {
  return EVENT_NAME
}
