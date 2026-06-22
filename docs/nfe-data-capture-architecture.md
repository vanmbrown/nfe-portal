# NFE Data Capture Architecture

## Purpose

Phase 3 establishes the foundation for acquisition-ready customer intelligence without changing the public site into a mechanical funnel. The architecture is designed to support Founder Access, Discovery Ritual, Skin Ritual Quiz, Concierge, reviews, replenishment, wholesale, and press pathways as later phases come online.

This phase does not add full commerce, full quiz logic, full Concierge, Beehiiv automations, pixels, or unsupported public forms.

## Principles

- Capture only what the current experience supports.
- Keep visible forms consent-aware and accessible.
- Do not add people to marketing flows without explicit opt-in.
- Preserve attribution context for future analysis without storing sensitive data in the browser.
- Keep public copy claim-safe and separate founder proof, customer feedback, testing status, and future evidence.
- Treat CRM and Beehiiv fields as mappings until integration work is explicitly approved.

## Event Taxonomy

The canonical event names live in `src/lib/analytics/events.ts`.

Core events:

- `nfe.page.viewed`
- `nfe.cta.clicked`
- `nfe.form.viewed`
- `nfe.form.submitted`
- `nfe.form.succeeded`
- `nfe.form.failed`

Maison pathway events:

- `nfe.founder_access.viewed`
- `nfe.founder_access.joined`
- `nfe.discovery.viewed`
- `nfe.discovery.interest_captured`
- `nfe.skin_ritual_quiz.viewed`
- `nfe.skin_ritual_quiz.interest_captured`
- `nfe.concierge.viewed`
- `nfe.concierge.interest_captured`
- `nfe.review.invitation_viewed`
- `nfe.review.submitted`
- `nfe.replenishment.interest_captured`
- `nfe.wholesale.interest_captured`
- `nfe.press.interest_captured`

## Tracking Helper

`src/lib/analytics/track.ts` is intentionally lightweight. It builds typed event payloads and dispatches a browser `CustomEvent`.

It does not:

- load analytics pixels
- send network requests
- set cookies
- create a third-party tracking dependency

Future analytics, CDP, or warehouse integrations should subscribe to the helper output only after consent, privacy, and vendor decisions are approved.

## UTM and Referrer Strategy

`src/lib/analytics/utm.ts` reads standard UTM parameters, landing page, referrer, and capture time. It preserves attribution in `sessionStorage` only, and fails silently when storage is unavailable.

Supported fields:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `referrer`
- `landing_page`
- `captured_at`

The existing `/subscribe` flow now passes source, consent context, and attribution in the request body when available. The API sanitizes those fields and does not change the subscriber database insert shape.

## Consent-Aware Payloads

Customer intelligence types live in `src/lib/customer-intelligence/types.ts`.

Defined intent types:

- `founder_access`
- `discovery`
- `skin_ritual_quiz`
- `concierge`
- `review`
- `replenishment`
- `wholesale`
- `press`

Each payload shape includes:

- intent
- consent state
- source context
- optional attribution
- CRM tags

Email is optional at the type level because some future events may be anonymous or aggregate-only until consent and storage support are present.

## Beehiiv and CRM Mapping

Tag and field mappings live in `src/lib/customer-intelligence/tags.ts`.

These mappings are definitions only. They do not create Beehiiv subscribers, segments, automations, or API calls.

Default tag families:

- `nfe-beauty`
- `private-list`
- `founder-access`
- `discovery-ritual`
- `skin-ritual-quiz`
- `concierge-interest`
- `customer-proof-panel`
- `replenishment-interest`
- `wholesale-interest`
- `press-interest`

## Current Subscribe Behavior

The current `/subscribe` form remains email-only on the public page.

On submit, the client sends:

- email
- source: `subscribe_page`
- context: intent, page path, consent source, opt-in state, privacy acknowledgement
- attribution: stored and current UTM/referrer context when available

The API:

- rate-limits the request
- validates email
- inserts only email into the existing subscribers table
- sends the existing confirmation email
- includes sanitized context in owner notification and optional forwarding payloads

## Later Phase Boundaries

Do not add the following until separately approved:

- full Skin Ritual Quiz logic
- Discovery Ritual checkout or Shopify implementation
- Concierge intake and response system
- Beehiiv automations or segmentation API writes
- review collection flows
- replenishment reminders
- wholesale or press forms
- pixels, ad tags, or third-party analytics scripts

## Acceptance Checks

Before shipping changes in this area:

- TypeScript must pass.
- Full build must pass.
- No unsupported customer-facing forms should be added.
- No blocked claims should be introduced.
- No public formula percentages should be reintroduced.
- No confidential handoff material, secrets, `.env` files, screenshots, or generated build artifacts should be committed.
