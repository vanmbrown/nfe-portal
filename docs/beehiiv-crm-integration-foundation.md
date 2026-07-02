# Beehiiv / CRM Integration Foundation

## Purpose

This phase connects NFE's supported private-list opt-in path to a server-side Beehiiv/CRM foundation without adding loud capture surfaces, automations, Shopify checkout, reviews, before/after flows, or Science rebuild work.

Beehiiv is treated as the editorial relationship layer for The NFE Letter, founder notes, early-access interest, and future skin-intelligence follow-up. It is not the commerce source of truth.

## What Is Active

- `/subscribe` remains the supported public opt-in path.
- The existing local subscriber insert remains in Supabase.
- The existing subscriber confirmation and owner notification emails remain in Resend.
- After the local subscriber path succeeds, the server attempts a Beehiiv sync only when:
  - `marketingOptIn` is true
  - `privacyPolicyAccepted` is true
  - `BEEHIIV_API_KEY` is configured server-side
  - `BEEHIIV_PUBLICATION_ID` is configured server-side
- Beehiiv sync failures do not expose vendor errors to users and do not break the local subscriber success state.

## What Is Not Active

- No Beehiiv automations are enrolled by this code.
- No Shopify purchase or post-purchase sync exists yet.
- No Concierge submissions are added to Beehiiv yet.
- No Science profile capture is added.
- No new popup, discount capture, or interruption pattern is introduced.
- No Beehiiv secrets are exposed client-side.

## Server-Side Sync Behavior

The Beehiiv adapter lives in `src/lib/beehiiv/subscriber.ts`.

It uses Beehiiv API v2:

- create subscription: `POST /v2/publications/{publicationId}/subscriptions`
- update by email fallback: `PUT /v2/publications/{publicationId}/subscriptions/by_email/{email}`

The payload includes:

- email
- `send_welcome_email: false`
- `reactivate_existing: false`
- attribution fields when available
- CRM tags from the NFE customer-intelligence taxonomy
- existing Beehiiv custom fields when configured in the publication

## CRM Tags

Core tags are defined in `src/lib/customer-intelligence/tags.ts`.

Examples:

- `nfe-beauty`
- `private-list`
- `founder-access`
- `discovery-ritual`
- `skin-ritual-quiz`
- `concierge-interest`
- `source-subscribe`
- `source-founder-access`
- `source-discovery`
- `source-skin-ritual-quiz`
- `source-concierge`

## Custom Fields

The foundation defines the recommended Beehiiv custom-field display names:

- First Name
- Skin Stage
- Primary Interest
- Skin Priority
- Source
- Launch Status
- Concierge Interest
- Product Subscription Interest
- Last Purchase Date
- Product Purchased
- Consent Source
- Marketing Opt-In
- Privacy Accepted

Beehiiv only applies custom fields that already exist in the publication. Missing custom fields should be created in Beehiiv before relying on them.

## Environment Variables

Required for active Beehiiv sync:

- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`

Reserved for later segment-specific work:

- `BEEHIIV_DEFAULT_SEGMENT_ID`
- `BEEHIIV_CONCIERGE_SEGMENT_ID`
- `BEEHIIV_EARLY_ACCESS_SEGMENT_ID`
- `BEEHIIV_SCIENCE_PROFILE_SEGMENT_ID`

Do not commit secret values. Do not expose Beehiiv keys to the browser.

## Error Handling

User-facing subscription success remains based on the supported local subscriber path. Beehiiv sync is intentionally non-blocking in this foundation phase.

When Beehiiv is not configured, the adapter returns:

- `status: skipped`
- `reason: beehiiv_not_configured`

When consent is missing, the adapter returns:

- `status: skipped`
- `reason: consent_missing`

When Beehiiv returns an error, the route logs a sanitized status/reason without logging tokens or full customer payloads.

## Future Boundaries

Do not add the following until separately approved:

- Beehiiv automation enrollment
- Concierge-to-Beehiiv opt-in
- Shopify-to-Beehiiv post-purchase sync
- Science page capture
- refill reminders
- segment-specific routing beyond tags/custom fields
- customer data warehouse or CDP exports
