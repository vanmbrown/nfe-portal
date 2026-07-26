# NFE Deferred Work Register

Work that has been identified, understood, and deliberately postponed.

Nothing in this register is implemented. Each entry records what was found and
what the open decision is, so a later pass can act without rediscovering it.

Opened: 2026-07-26, at the closeout of the Accessibility & Quality release
(`docs/releases/ACCESSIBILITY_QUALITY_RELEASE_CLOSEOUT.md`).

---

## Editorial and product decisions

**Face Elixir size copy contradiction.** `/products/face-elixir` asks "How long
will a 30 ml or 50 ml bottle last?" while the page carries a single `30 ml` and
a single `50 ml` reference. Left untouched through the accessibility release by
explicit instruction. Founder decision: which size is correct, and whether the
question should name one size or both.

**Future use of "The first release will be shared privately."** Approved as
editorial supporting wording during the Founder Access copy ruling, but not
added anywhere — no existing sentence required it, and the ruling did not call
for new copy. Available if a narrative surface later needs it.

**Final treatment of unreachable "Join Waitlist" language.** ~~See the
architecture entry below; the wording and the route's fate are the same
decision.~~ **RESOLVED in part — `bc3c028` / `c8b7ccc` (2026-07-26).** The
reachable copies inside `ProductPageClient.tsx` and `ShopCard.tsx` /
`ProductCard.tsx` were removed along with those files. Two unreachable copies
remain, in `FaceElixirHero.tsx` and `WaitlistModal.tsx` — see the new backend
entry below; these are tied to the live `/api/waitlist` integration, not a
simple wording fix.

---

## Architecture and cleanup

**Remove dead `src/app/shop/ShopCard.tsx`.** ~~Zero references anywhere in
`src`. Still contains the old "Coming Soon" string. Left unedited by founder
ruling: remove in a cleanup pass rather than editing copy that reaches no
one.~~ **RESOLVED — `c8b7ccc` (2026-07-26).** Removed. See
`docs/upgrades/PRODUCT_ARCHITECTURE_AUDIT.md`.

**Remove dead `src/components/products/ProductCard.tsx`.** ~~Zero references —
the `ProductCard` imports elsewhere resolve to different components in
`ui/Card.tsx` and `articles/MDXComponents.tsx`. Same "Coming Soon" string, same
ruling.~~ **RESOLVED — `c8b7ccc` (2026-07-26).** Removed.

**Remove dead `src/components/products/FaceElixirSections.tsx`.** ~~Zero
references. Contains CMS fallback strings ("Product details coming soon.").~~
**RESOLVED — `c8b7ccc` (2026-07-26).** Removed.

**Decide whether to remove or revive `/products/[slug]`.** ~~The route is
unreachable: `/products/face-elixir` and `/products/body-elixir` have dedicated
static page files that outrank the dynamic `[slug]` segment, and the product
registry declares only those two slugs, so every other slug hits `notFound()`.
Confirmed against the build — "Ritual Pairing" appears only in the compiled
`[slug]` bundle and in no prerendered HTML.~~ **RESOLVED — removed, `bc3c028`
(2026-07-26).** Along with its `layout.tsx` (route-scoped `generateMetadata`,
discovered during implementation — see `PRODUCT_ARCHITECTURE_AUDIT.md`).

**Decide whether `ProductPageClient` remains necessary.** ~~It is reached only
through the unreachable `[slug]` route. It also holds the off-brand "Join
Waitlist" CTA, which renders when `product.status === 'coming_soon'` and
therefore reaches no customer today. Either delete it with the route, or
restate the CTA (for example "Founder Access opens first") if the route is
revived. This is a purchasing-flow decision, not a wording fix.~~ **RESOLVED —
removed, `bc3c028` (2026-07-26).**

**Remove unreachable `RitualPairing` flow if architecture confirms it is
obsolete.** ~~It carries the approved "Founder Access opens first" wording in
source but renders on no URL. Its fate follows the `[slug]` decision above.~~
**RESOLVED — removed, `bc3c028` (2026-07-26).**

**New, from the 2026-07-26 architecture audit — orphaned components not named
in that pass's scope, left in place:** `src/components/products/ProductHero.tsx`
was also route-only support for the removed `[slug]` route and **was** removed
in `bc3c028` (along with its dangling re-export in
`src/components/products/index.ts`). Still orphaned and **not removed**,
because they were not named candidates:
`src/components/products/IngredientList.tsx`, `BenefitsTable.tsx`,
`UsageGuide.tsx`, `ProductFAQ.tsx` (the rest of that same barrel — zero
importers, not even from the removed route), `FaceElixirHero.tsx`, and
`ProductTabs.tsx` / `ProductExperience.tsx`.

**`/api/waitlist` is a live backend integration with no reachable caller.**
Discovered during the 2026-07-26 architecture audit.
`src/app/api/waitlist/route.ts` writes to a Supabase `waitlist` table and
sends a real notification email to `vanessa@nfebeauty.com` via Resend on every
POST. Its only caller, `src/components/shared/WaitlistModal.tsx`, is never
imported by any live page — the modal that would trigger the endpoint is
never mounted. `useWaitlistStore` (the zustand store gating the modal) is in
the same position: every remaining consumer (`FaceElixirHero.tsx`,
`WaitlistModal.tsx`) is itself unreachable.

**DECIDED — 2026-07-26: keep it wired.** Founder ruling: do not retire the
endpoint, store, or modal. They remain in the codebase, unremoved and
unreachable, pending a future revival of waitlist behavior. No architecture
change follows from this — it converts an open question into a standing
decision. Revisit only if a future pass proposes wiring a live trigger to
this endpoint (in which case the existing Supabase table and Resend
notification are already in place) or proposes removing it (in which case
this entry is the record of why it was kept).

**New — orphaned `ProductMetadata` type.** `src/types/products.ts` exports a
`ProductMetadata` type whose only consumer was the removed `layout.tsx`. Left
in place rather than editing a shared, actively-used types file for one
orphaned export.

**New — `/shop` → `/products/${slug}` link depends on product-index data
shape.** `src/app/shop/page.tsx` generates `href={\`/products/${product.slug}\`}`.
This is currently always safe because `data/products/index.json` contains
exactly the two slugs with matching static pages, but nothing in code enforces
that going forward. If a third product is ever added to that JSON file without
a matching `src/app/products/<slug>/page.tsx`, its `/shop` card would link to
a 404 (there is no dynamic route to catch it anymore). Worth a lint/test rule
if the product catalog ever grows past two.

### Deployment confirmation for the resolved architecture entries

All `RESOLVED` entries in this section shipped to production in the exact
deployed source `c81b7c25bff7f4c774721d9bcd2f4f2eacd14627`
(Worker `1ba7471d-53f8-42f8-aa71-299657b7bf42`, 2026-07-26). The
implementing-commit hashes cited above (`bc3c028`, `c8b7ccc`) name where each
change was made; `c81b7c2` is the commit that was actually deployed. Later
documentation commits on the canonical branch are **not** deployed. See
`docs/releases/PRODUCT_ARCHITECTURE_CLEANUP_RELEASE_CLOSEOUT.md`.

Covered by that deployment: `/products/[slug]` removed · `ProductPageClient`
removed · `RitualPairing` removed · `ProductHero` removed · `ShopCard` removed
· `ProductCard` removed · `FaceElixirSections` removed.

---

## Accessibility maintenance

**Product accordion `aria-controls` references.** The product-accordion
controls carry `aria-controls` pointing at panel IDs that do not exist while
the panels are collapsed, because the panel content is not rendered until the
control is expanded.

- Behavior is correct when expanded: the referenced panel ID exists and
  carries content, `aria-expanded` toggles correctly, focus remains on the
  control, and the panel closes cleanly.
- The same behavior existed before the cleanup release — the identical four
  references were confirmed present in the pre-release baseline.
- Lighthouse accessibility remains 100 with zero weighted findings.

This is deferred accessibility maintenance, **not a release regression**. Do
not treat it as a rollback trigger.

---

## Performance

**`/skin-strategy` performance optimization.** Measured ~65–71; pre-existing and
untouched. The route ships two heavy interactive map components.

**Evaluate bundle splitting.** Candidate approach for the two maps.

**Evaluate lazy loading.** Candidate approach for below-the-fold map content.

**Constraint:** any optimization must preserve the accessibility result (100,
zero weighted findings) and the editorial experience. The maps' dark-surface
rendering, contained backgrounds, heading structure, and accessible names are
all load-bearing and were fixed in this release.

---

## Infrastructure and SEO

**Review Cloudflare-managed robots.txt prepend.** The served `/robots.txt` is
Cloudflare Managed Content — an AI content-signals block terminated by
`# END Cloudflare Managed Content` — prepended to the application's own output.
Lighthouse scores the combined file as invalid, costing roughly 8 SEO points on
every route. The application's `src/app/robots.ts` is correct and unchanged,
including its `/dev/` disallow.

**Determine whether AI content-signals configuration should remain.** This is a
Cloudflare zone-level setting, not application code. Keeping it is a deliberate
content-licensing posture; the SEO cost is the trade-off. Founder decision.

**Review `/dev/token-specimen` 404 metadata title.** The route correctly returns
HTTP 404 and renders the 404 page with no specimen content exposed, but Next.js
still applies the route's metadata, so the browser tab reads "Token Specimen
(internal)". Cosmetic information leak only.

**Do not expose the route.** The runtime 404 and the `robots.txt` `/dev/`
disallow are both intentional and must stay.

---

## Study Circle

Frozen at `feature/nfe-seed-access` @ `1f055123c12c332f89ede4e3722d999b72878144`.

Status: implementation complete; database validation deferred; legal review
pending; no live participants; no production migration.

- staging project;
- real database validation;
- legal review;
- production migration;
- first participant invitations.

---

## Future platform work

- founder dashboard;
- formula and ingredient updates;
- future editorial expansion.
