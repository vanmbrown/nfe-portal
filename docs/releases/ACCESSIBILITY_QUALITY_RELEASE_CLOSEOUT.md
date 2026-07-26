# NFE Accessibility & Quality Release Closeout

## Release summary

The NFE Accessibility & Quality Pass was deployed successfully to production
and verified live.

## Production deployment

Release branch:

release/accessibility-quality-pass

Release commit:

07ac5fd451e61736f4831f8bd4bdb377a9d0aa05

Worker:

nfe-portal

Live Worker version:

692bc54f-c280-4174-b488-1707c8e36d07

Traffic:

100%

Previous rollback version:

c22fca1d-5b51-456c-9412-9dcee433ff76

Production hostname:

www.nfebeauty.com

Deployment date:

2026-07-26

## Customer-visible changes

- improved homepage text contrast;
- improved `/skin-strategy` accessibility;
- correct dark-surface rendering for the two educational maps;
- improved heading structure;
- corrected accessible names;
- removed nested interactive behavior;
- improved button contrast;
- preserved approved Founder Access wording.

Note on the copy ruling: "Founder Access opens first" was already the live
production wording at the previous canonical source (`src/app/shop/page.tsx`
and `src/content/atelier/elixir-editorial.ts`). The ruling ratified existing
wording and brought one inconsistent component into line. Its net
customer-visible effect was therefore **none** — what customers gained in this
release is the accessibility and contrast work.

## Verified production results

- `/` → 200
- `/shop` → 200
- `/our-story` → 200
- `/science` → 200
- `/skin-strategy` → 200
- `/inci` → 200
- `/ritual` → 200
- `/journal` → 200
- `/concierge` → 200
- `/products/face-elixir` → 200
- `/products/body-elixir` → 200
- `/founder-access` → 200
- `/study-circle` → 404
- `/dev/token-specimen` → 404

## Accessibility results

- homepage: 100
- `/our-story`: 100
- `/science`: 100
- `/skin-strategy`: 100

Zero weighted accessibility findings on all four routes.

Measured directly in the live DOM: homepage status eyebrow 5.53:1 (previously
2.22:1), Founder Access paragraph 5.33:1 (previously 4.24:1).

## Rollback state

The previous production Worker version remains available:

c22fca1d-5b51-456c-9412-9dcee433ff76

Rollback was not required.

## Repository state before alignment

Canonical production source:

release/production-hygiene-assets-fonts

Previous canonical HEAD:

80353aae9824f9de9451855eb81f0a91b03dbec3

Deployed release source:

release/accessibility-quality-pass

Deployed release HEAD:

07ac5fd451e61736f4831f8bd4bdb377a9d0aa05

## Repository state after alignment

The canonical production source was advanced by fast-forward only. No merge
commit, no cherry-pick, no rebase, no reset.

Exact deployed application source:

07ac5fd451e61736f4831f8bd4bdb377a9d0aa05

Canonical production source after closeout:

this documentation-only commit, which is one commit ahead of the deployed
source.

**This documentation commit is not deployed.** Production runs Worker version
`692bc54f-c280-4174-b488-1707c8e36d07`, built from
`07ac5fd451e61736f4831f8bd4bdb377a9d0aa05`. The release branch
`release/accessibility-quality-pass` remains fixed at that commit as the exact
deployed source record.

## Release tag

Authorized by the founder and created:

nfe-accessibility-quality-2026-07-26

Points at:

07ac5fd451e61736f4831f8bd4bdb377a9d0aa05

Annotated, matching the convention set by Maison Wave 1
(`nfe-maison-wave-1-2026-07-24` → `f5a54fa`).

The tag points at the exact deployed source, **not** at the documentation-only
closeout commits.

No retrospective pre-release tag was created — explicitly declined by the
founder. The pre-release rollback point is recorded in this document as
`80353aae9824f9de9451855eb81f0a91b03dbec3` and remains reachable through the
release branch history.

## Deferred work

- dead component removal;
- unreachable `/products/[slug]` architecture;
- unreachable "Join Waitlist" CTA;
- `/skin-strategy` performance;
- Cloudflare-managed robots.txt SEO finding;
- `/dev/token-specimen` 404 metadata title;
- Face Elixir size decision;
- Study Circle staging;
- Study Circle legal review;
- Study Circle production migration;
- founder dashboard;
- formula and ingredient updates.

See `docs/upgrades/DEFERRED_WORK_REGISTER.md`.

## Explicit non-actions

- no product change;
- no formula change;
- no ingredient change;
- no size change;
- no pricing change;
- no availability change;
- no Study Circle activation;
- no Supabase change;
- no Shopify or Sanity change;
- no DNS change;
- no Worker route change.
