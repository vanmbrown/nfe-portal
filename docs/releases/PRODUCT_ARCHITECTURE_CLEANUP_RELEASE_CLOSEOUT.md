# NFE Product Architecture Cleanup — Production Release Closeout

## Release summary

The NFE Product Architecture & Dead-Code Cleanup was deployed successfully to
production and verified live.

The release removed one unreachable product route and eight unreachable or
unused source files without changing customer-visible product content, product
availability, pricing, formula, ingredients, Founder Access behavior, or
waitlist activation.

## Production deployment

Production hostname:

www.nfebeauty.com

Worker:

nfe-portal

Live Worker version:

1ba7471d-53f8-42f8-aa71-299657b7bf42

Traffic:

100%

Primary rollback Worker:

692bc54f-c280-4174-b488-1707c8e36d07

Older rollback Worker retained:

c22fca1d-5b51-456c-9412-9dcee433ff76

Deployment date:

2026-07-26

## Exact deployed source

Release branch:

release/product-architecture-cleanup

Release commit:

c81b7c25bff7f4c774721d9bcd2f4f2eacd14627

Feature branch:

feature/nfe-product-architecture-cleanup

Feature commit:

c81b7c25bff7f4c774721d9bcd2f4f2eacd14627

## Canonical source before alignment

Branch:

release/production-hygiene-assets-fonts

Previous HEAD:

34785caaedc6d2c6e0bf165ff6f063f4d8cb3a21

The canonical production source was advanced to the deployed commit by
fast-forward only — no merge commit, no cherry-pick, no rebase, no reset. The
seven release commits are preserved exactly.

## Runtime changes

Removed route:

/products/[slug]

Removed files:

- src/app/products/[slug]/page.tsx
- src/app/products/[slug]/layout.tsx
- src/app/products/[slug]/ProductPageClient.tsx
- src/components/products/RitualPairing.tsx
- src/components/products/ProductHero.tsx
- src/app/shop/ShopCard.tsx
- src/components/products/ProductCard.tsx
- src/components/products/FaceElixirSections.tsx

The obsolete `ProductHero` re-export was removed from
`src/components/products/index.ts`; that barrel's four active exports were
retained.

Route-manifest result:

- baseline routes: 66
- deployed routes: 65
- removed: /products/[slug]
- added: none

## Preserved customer-facing architecture

- /products/face-elixir
- /products/body-elixir
- /shop
- /founder-access
- all canonical editorial and science routes

## Waitlist decision

Founder decision:

Keep the waitlist infrastructure wired for later.

Preserved:

- /api/waitlist
- WaitlistModal.tsx
- useWaitlistStore.ts
- FaceElixirHero.tsx

All four are byte-unchanged from the canonical baseline. `/api/waitlist`
remains present in the deployed route manifest. No live page imports the modal
or the store, and no rendered route exposes a waitlist CTA.

Required state:

WAITLIST INFRASTRUCTURE PRESERVED
CUSTOMER-FACING ACTIVATION ABSENT
NO DATA WRITE
NO EMAIL SENT

The endpoint was not invoked during release validation, deployment, or
closeout — with any HTTP method.

## Live verification

Verified:

- all canonical routes returned 200;
- six unknown product paths returned 404;
- /study-circle returned 404;
- /dev/token-specimen returned 404;
- no generic product fallback rendered;
- no visible waitlist CTA rendered;
- no visible "Coming Soon" rendered;
- no waitlist request occurred;
- no Supabase write occurred;
- no Resend email occurred;
- product pages remained unchanged;
- shop product links remained valid;
- all five audited routes scored 100 accessibility.

Live production output was compared field-by-field against the validated
release build across eight customer-facing pages — title, meta description,
canonical URL, primary heading, all headings, section count, image count,
JSON-LD, full visible text, and navigation links were identical on every page.

Transient edge-cache behavior was observed immediately after deployment: some
requests briefly returned the previous build while others returned the new one.
Cache-busted requests confirmed the origin served the new build, and repeated
plain requests then returned the new build consistently. No manual cache purge
was performed and no cache configuration was changed.

## Lighthouse results

- homepage accessibility: 100
- shop accessibility: 100
- Face Elixir accessibility: 100
- Body Elixir accessibility: 100
- skin strategy accessibility: 100

Zero weighted accessibility findings on all five routes.

## Rollback state

Rollback was not required.

Primary rollback Worker remains available:

692bc54f-c280-4174-b488-1707c8e36d07

Older Worker remains in version history:

c22fca1d-5b51-456c-9412-9dcee433ff76

## Known deferred work

- future waitlist activation decision;
- remaining orphaned product components;
- ProductMetadata type;
- /shop slug-to-static-route coupling;
- product accordion aria-controls maintenance;
- Face Elixir size wording;
- /skin-strategy performance;
- Cloudflare-managed robots.txt;
- /dev/token-specimen metadata;
- Study Circle staging;
- Study Circle legal review;
- Study Circle production migration;
- founder dashboard;
- formula and ingredient work.

See `docs/upgrades/DEFERRED_WORK_REGISTER.md`.

## Explicit non-actions

- no product-copy change;
- no size change;
- no formula change;
- no ingredient change;
- no pricing change;
- no availability change;
- no Founder Access behavior change;
- no waitlist activation;
- no waitlist record;
- no email;
- no Supabase change;
- no Shopify or Sanity change;
- no DNS change;
- no Worker route change;
- no Study Circle activation.
