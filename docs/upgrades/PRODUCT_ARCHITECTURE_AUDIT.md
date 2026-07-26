# NFE Product Architecture Audit

## Starting point

| | |
|---|---|
| Source branch | `release/production-hygiene-assets-fonts` |
| Full source HEAD | `34785caaedc6d2c6e0bf165ff6f063f4d8cb3a21` |
| Feature branch | `feature/nfe-product-architecture-cleanup` |
| Date | 2026-07-26 |
| Baseline `npm ci` | pass |
| Baseline `tsc --noEmit` | pass |
| Baseline `lint` | pass |
| Baseline `test` | pass — 17/17 |
| Baseline `next build` | pass |
| Baseline `opennext build` | pass |
| Baseline route count | 66 (build manifest) |

Baseline route manifest included, among others: `/products/[slug]`,
`/products/face-elixir`, `/products/body-elixir`, `/products`, `/shop`,
`/founder-access`, `/study-circle` (not present — 404 by absence),
`/dev/token-specimen`, `/api/waitlist`.

Scope for this pass, per the governing instructions: the five named candidate
components, the `/products/[slug]` route, and obsolete product-state language
that removing them naturally eliminates. This audit also records dead code
discovered incidentally while tracing those five candidates — that code is
**not removed in this pass** unless explicitly named, per the "may address
only" scope boundary. It is handed to the deferred register instead.

---

## Canonical product architecture

| Surface | Route file | Rendering component |
|---|---|---|
| Face Elixir | `src/app/products/face-elixir/page.tsx` | `ElixirEditorialPage` (`src/components/atelier/ElixirEditorialPage.tsx`) |
| Body Elixir | `src/app/products/body-elixir/page.tsx` | `ElixirEditorialPage` (same component, different editorial + data) |
| Shop | `src/app/shop/page.tsx` | inline JSX, reads `data/products/index.json` directly |
| Founder Access | `src/app/founder-access/page.tsx` | (unaffected by this pass) |

**Key finding: the two canonical product pages do not use `ProductPageClient`,
`ProductHero`, `ProductAccordion`'s sibling stack, or `RitualPairing` at all.**
They import `ElixirEditorialPage`, which independently imports
`ProductAccordion` (shared — see below), `ElixirFAQ`
(`@/components/atelier/ElixirFAQ`, a different FAQ component from the one
`ProductPageClient` uses), and the data-only named export
`faceElixirFaqItems` from `face-elixir/FaceElixirFAQ.tsx`. This is a complete,
independent rendering path from `ProductPageClient`'s.

---

## Reachability matrix

| File or route | Direct references | Runtime reachable | Customer-visible | CMS dependency | Commerce dependency | Test dependency | Classification | Recommendation | Evidence |
|---|---:|---:|---:|---:|---:|---:|---|---|---|
| `src/app/products/[slug]/page.tsx` | 0 (no route links to it; only reached by literal URL match on an unregistered slug) | Yes, but only for slugs outside `{face-elixir, body-elixir}` — both of which are intercepted by static routes first | No (unreachable in practice — see Dynamic route analysis) | None | None | None | UNREACHABLE | Remove | `productData` registry (`src/content/products/registry.ts`) declares exactly two slugs; both have dedicated static page files that take Next.js App Router precedence over `[slug]` |
| `src/app/products/[slug]/ProductPageClient.tsx` | 1 (`page.tsx` only) | No (importer is unreachable) | No | None | `useWaitlistStore` (unreachable subsystem, see below) | None | UNREACHABLE | Remove | Sole importer is the unreachable `page.tsx` |
| `src/components/products/RitualPairing.tsx` | 1 (`ProductPageClient.tsx` only) | No | No | None | None | None | UNREACHABLE | Remove | Sole importer is unreachable |
| `src/components/products/ProductHero.tsx` | 1 direct (`ProductPageClient.tsx`); re-exported by dead barrel `src/components/products/index.ts` (itself unimported) | No | No | None | None | None | UNREACHABLE | Remove (route-only supporting module) | Sole real importer is unreachable |
| `src/app/products/[slug]/layout.tsx` | 0 (Next.js App Router layout — applies automatically to the `[slug]` segment and its children, not imported by name) | No | No | None | None | None | UNREACHABLE | Remove | Contains `generateMetadata`, but it is scoped exclusively to `/products/[slug]` — both canonical static pages have their own independent `metadata` export in their own `page.tsx` files (confirmed above), so this layout's metadata generation has no bearing on canonical SEO. Reads `data/products/index.json` directly via `fs` at request time, duplicating logic already in `registry.ts`, exclusively for the unreachable route |
| `src/app/shop/ShopCard.tsx` | 0 | No | No | None | `useWaitlistStore` (unreachable subsystem) | None | DEAD | Remove | `git grep ShopCard` finds only self-definition + documentation mentions; `src/app/shop/page.tsx` does not import it |
| `src/components/products/ProductCard.tsx` | 0 | No | No | None | `useWaitlistStore` (unreachable subsystem) | None | DEAD | Remove | Zero importers anywhere; the `ProductCard` used by MDX articles is a distinct component in `src/components/articles/MDXComponents.tsx`, and the `ProductCard` in `src/components/ui/Card.tsx` is also distinct — neither imports this file |
| `src/components/products/FaceElixirSections.tsx` | 0 | No | No | None | None | None | DEAD | Remove | Zero importers anywhere |

### Discovered but out of scope (not named candidates — not removed)

| File | Reachable | Evidence | Why not removed this pass |
|---|---|---|---|
| `src/components/products/index.ts` (barrel) | No | Zero imports of `@/components/products` found anywhere | Not a named candidate; its exports (`ProductHero`, `IngredientList`, `BenefitsTable`, `UsageGuide`, `ProductFAQ`) are addressed individually below |
| `src/components/products/IngredientList.tsx` | No | Zero importers, not even from `ProductPageClient` | Fully orphaned independent of the `[slug]` decision; not a named candidate |
| `src/components/products/BenefitsTable.tsx` | No | Zero importers | Same |
| `src/components/products/UsageGuide.tsx` | No | Zero importers | Same |
| `src/components/products/ProductFAQ.tsx` | No | Zero importers | Same |
| `src/components/products/FaceElixirHero.tsx` | No | Zero importers; independently uses `useWaitlistStore` and contains "Join Waitlist" text | Not a named candidate |
| `src/components/products/ProductTabs.tsx` | No | Zero importers | Not a named candidate |
| `src/components/products/ProductExperience.tsx` | No | Zero importers | Not a named candidate |
| `src/components/shared/WaitlistModal.tsx` | No | Zero importers; the only component that calls `fetch('/api/waitlist')` | Not a named candidate. Removing it raises a bigger question below |
| `src/store/useWaitlistStore.ts` | Reachable only from unreachable/dead consumers | Consumers: `WaitlistModal` (dead), `ProductCard` (dead), `FaceElixirHero` (dead), `ShopCard` (dead), `ProductPageClient` (unreachable) | Not a named candidate; every consumer is itself dead, but the store is shared infrastructure, not one of the five files |
| `src/app/api/waitlist/route.ts` | Registered as a live Next.js route; receives no traffic because its only caller (`WaitlistModal`) is never rendered | Live Supabase write (`waitlist` table) + live Resend email to `vanessa@nfebeauty.com` | **Not a component — a backend integration.** Removing a wired database + email integration is a materially bigger decision than dead-component cleanup and deserves explicit founder sign-off, not a cleanup-pass assumption |

None of these are touched in this pass. All are added to the deferred register with the evidence above so a future pass does not have to re-derive it.

---

## Dynamic route analysis

| Question | Answer |
|---|---|
| Actual route path | `src/app/products/[slug]/page.tsx` → `/products/:slug` |
| Registered slugs | Exactly two: `face-elixir`, `body-elixir` (`src/content/products/registry.ts`, `productData` map) |
| Static-route precedence | Confirmed: `src/app/products/face-elixir/page.tsx` and `src/app/products/body-elixir/page.tsx` exist as literal static segments. Next.js App Router resolves a literal segment before a dynamic `[slug]` segment for the same path, and this was independently confirmed against the build output in the prior accessibility-pass task (search for "Ritual Pairing" — the string unique to the `[slug]` render tree — across `.next/server/app` found it only inside the compiled `[slug]` bundle, never in any prerendered HTML) |
| Metadata behavior | `page.tsx` exports no `metadata`. The segment's `layout.tsx` does export `generateMetadata`, but it is scoped only to `/products/[slug]` — the canonical static pages carry their own independent `metadata` exports, so removing this layout has no effect on canonical SEO |
| Unknown-slug behavior | `getProduct()` returns `null` for any slug not in the registry → `notFound()` → Next.js 404 |
| CMS dependency | None. No CMS integration exists in this repository (no Sanity, no headless CMS client) |
| Commerce dependency | None. No Shopify or commerce SDK in `package.json` |
| Navigation dependency | `src/app/shop/page.tsx` renders `href={\`/products/${product.slug}\`}`. Verified against the actual data: `products` is `indexData.products` from `data/products/index.json`, which the shop page immediately narrows to `products.find(slug === 'face-elixir')` and `products.find(slug === 'body-elixir')` — the only two entries the file contains (confirmed by reading `index.json` directly, and by its full git history across all branches, which never contained a third slug). Every generated link therefore resolves to a static route, never to the dynamic segment, **as the data is currently shaped** |
| Sitemap dependency | None. `src/app/sitemap.ts` hardcodes `/products/face-elixir` and `/products/body-elixir` as literal strings — no dynamic slug enumeration |
| Test dependency | None. `tests/products.spec.ts` and `tests/navigation.spec.ts` navigate only to `/products/face-elixir`, `/products/body-elixir`, and `/products` (the shop redirect) — never a third or arbitrary slug |
| Historical URL evidence | None found. Full git history (`git log -p --all -- data/products/index.json`) shows only `face-elixir` and `body-elixir` were ever registered |
| Build-manifest evidence | `/products/[slug]` appears in the baseline manifest as its own entry, separate from the two static entries; removing it is expected to remove exactly that one manifest entry |
| **Final decision** | **Remove**, along with `ProductPageClient.tsx`, `RitualPairing.tsx`, and `ProductHero.tsx` (route-only support) |
| **Reason** | All 18 verification conditions in the governing instructions are satisfied by direct evidence, not assumption |

### Risk flagged for the record (not a blocker)

The `/shop` → `/products/${slug}` link's safety depends on `data/products/index.json` continuing to contain only slugs with a matching static page. This is a data/process coupling, not a code dependency — noted in Deletion risks below and in the deferred register, since it isn't something this cleanup pass can close off by itself without adding a new abstraction (which is explicitly out of scope).

---

## Deletion risks

- **Broken historical URLs**: none — no historical slug beyond the current two was ever registered.
- **Lost structured data**: none — the `[slug]` page has no metadata or JSON-LD.
- **Lost metadata**: none — no `generateMetadata` present.
- **Sitemap regression**: none — sitemap is already fully static-path based.
- **Navigation regression**: none in the current data shape — see the flagged risk above for the one coupling worth knowing about.
- **CMS preview regression**: not applicable — no CMS in this repository.
- **Hidden ecommerce dependency**: the only "commerce-shaped" code touching the removed files is the unreachable waitlist subsystem (`useWaitlistStore`, `WaitlistModal`, `/api/waitlist`). That subsystem is **not removed** in this pass — it is independently reachable from dead code this pass does not touch (`FaceElixirHero.tsx`), so it must survive regardless of what happens to `ProductPageClient`/`ShopCard`/`ProductCard`.

---

## Preliminary recommendation

Proceed with removal of the five named candidates and the `/products/[slug]`
route together with its route-only support modules (`ProductHero.tsx` and
`layout.tsx`), per the decision rules in the governing instructions. All
UNKNOWN/DEFERRED items above are left untouched.

---

## Final architecture

Product surfaces are now exactly two files deep for rendering:

- `/products/face-elixir` → `src/app/products/face-elixir/page.tsx` → `ElixirEditorialPage`
- `/products/body-elixir` → `src/app/products/body-elixir/page.tsx` → `ElixirEditorialPage`

No dynamic product route exists. No component in `src/components/products/`
is reachable except through `ElixirEditorialPage`'s own import graph
(`ProductAccordion`, and the data-only `faceElixirFaqItems` export from
`face-elixir/FaceElixirFAQ.tsx`). The `src/components/products/index.ts`
barrel no longer re-exports anything unreachable from the removed route.

## Files removed

| File | Classification | Evidence | Commit |
|---|---|---|---|
| `src/app/products/[slug]/page.tsx` | UNREACHABLE | Sole route entry point; both registered slugs intercepted by static pages | `bc3c028` |
| `src/app/products/[slug]/layout.tsx` | UNREACHABLE | Route-scoped `generateMetadata`, no bearing on canonical pages' own metadata | `bc3c028` |
| `src/app/products/[slug]/ProductPageClient.tsx` | UNREACHABLE | Sole importer was the removed `page.tsx` | `bc3c028` |
| `src/components/products/RitualPairing.tsx` | UNREACHABLE | Sole importer was `ProductPageClient` | `bc3c028` |
| `src/components/products/ProductHero.tsx` | UNREACHABLE | Sole real importer was `ProductPageClient`; dangling barrel re-export removed in the same commit | `bc3c028` |
| `src/app/shop/ShopCard.tsx` | DEAD | Zero importers anywhere | `c8b7ccc` |
| `src/components/products/ProductCard.tsx` | DEAD | Zero importers; distinct from same-named components in `MDXComponents.tsx` and `ui/Card.tsx` | `c8b7ccc` |
| `src/components/products/FaceElixirSections.tsx` | DEAD | Zero importers anywhere | `c8b7ccc` |

8 files removed, 864 lines deleted. 1 line edited (`src/components/products/index.ts`, dangling `ProductHero` re-export). Zero files added except the audit and the new protective test.

## Files preserved

| File | Reason | Classification |
|---|---|---|
| `src/components/products/ProductAccordion.tsx` | Imported by `ElixirEditorialPage` — the active canonical page component | ACTIVE / SHARED |
| `src/components/products/face-elixir/FaceElixirFAQ.tsx` | Its `faceElixirFaqItems` data export is imported by `ElixirEditorialPage`; deleting the file would break the canonical page | ACTIVE / SHARED |
| `src/components/products/IngredientList.tsx`, `BenefitsTable.tsx`, `UsageGuide.tsx`, `ProductFAQ.tsx` | Zero importers, but not named candidates — orphaned independent of the `[slug]` decision | DEFERRED |
| `src/components/products/FaceElixirHero.tsx`, `ProductTabs.tsx`, `ProductExperience.tsx` | Zero importers, not named candidates | DEFERRED |
| `src/components/shared/WaitlistModal.tsx` | Zero importers, not named candidate; only caller of `/api/waitlist` | DEFERRED — see below |
| `src/store/useWaitlistStore.ts` | Every consumer is dead, but it is not itself a named candidate and remains referenced by `FaceElixirHero.tsx` (untouched) | DEFERRED |
| `src/app/api/waitlist/route.ts` | Live Supabase + Resend integration with no reachable caller. Removing a wired backend integration is a bigger decision than component cleanup | DEFERRED — founder decision |
| `src/types/products.ts` (`ProductMetadata` type) | Its sole consumer (`layout.tsx`) was removed, leaving this one exported type unused. Left in place — editing a shared, actively-used types file for a single orphaned export was judged out of this pass's scope | DEFERRED (minor) |

## Route changes

| Route | Baseline | After | Expected | Status |
|---|---|---|---|---|
| `/products/[slug]` | present (66-route manifest) | absent (65-route manifest) | removed | PASS |
| `/products/face-elixir` | 200 | 200 | 200 | PASS |
| `/products/body-elixir` | 200 | 200 | 200 | PASS |
| `/products/test` | 404 (via `notFound()`) | 404 (no matching segment) | 404 | PASS |
| `/products/unknown` | 404 | 404 | 404 | PASS |
| `/products/face` | 404 | 404 | 404 | PASS |
| `/products/body` | 404 | 404 | 404 | PASS |
| `/study-circle` | 404 | 404 | 404 | PASS (unaffected) |
| `/dev/token-specimen` | 404 | 404 | 404 | PASS (unaffected) |

Full manifest diff: exactly one line removed (`/products/[slug]`), zero added.

## Customer-visible impact

**None, intentional or otherwise.** Verified two ways:

1. **By construction** — `git diff` across both removal commits touches no
   file in the canonical rendering path (`face-elixir/page.tsx`,
   `body-elixir/page.tsx`, `ElixirEditorialPage.tsx`, `shop/page.tsx`).
2. **Empirically** — a true before/after comparison was run: the parent
   commit (`34785ca`, untouched) was built and served on a separate port
   alongside the cleaned-up branch, and title, meta description, `<h1>`, and
   full visible text were byte-identical on `/`, `/shop`, `/our-story`,
   `/science`, `/skin-strategy`, `/products/face-elixir`,
   `/products/body-elixir`, and `/founder-access`.

## Copy cleanup

| Phrase | Before | After | Where it was |
|---|---|---|---|
| "Coming Soon" | 6 occurrences | 0 | `ShopCard.tsx`, `ProductCard.tsx` (status badge, ×2), `FaceElixirSections.tsx` (×4 CMS-fallback strings, counted once here) — all removed files. None ever rendered on a live route |
| "Join Waitlist" (reachable) | 1 occurrence (`ProductPageClient.tsx`, inside the unreachable route) | 0 | Removed with the route |
| "Join Waitlist" (unreachable, out of scope) | 2 occurrences | 2 remain | `FaceElixirHero.tsx` and `WaitlistModal.tsx` — neither a named candidate; both unreachable independent of this pass |
| Urgency/scarcity language | 0 | 0 | None found before or after |
| Replacement copy added | — | none | No new copy was written; dead copy was deleted, not rephrased |

No customer-facing route ever rendered "Coming Soon" or "Join Waitlist" before this pass (confirmed in the prior accessibility-quality-pass audit and reconfirmed here); this cleanup removes the source lines, not a live defect.

## Validation

| Command | Baseline | After cleanup |
|---|---|---|
| `npm ci` | pass | pass |
| `npx tsc --noEmit` | pass | pass |
| `npm run lint` | pass | pass |
| `npm test` | pass — 17/17 | pass — 26/26 (9 new) |
| `npm run build` | pass — 66 routes | pass — 65 routes |
| `npx opennextjs-cloudflare build` | pass | pass |
| Local route matrix (18 routes incl. unknown slugs) | — | 18/18 match expected |
| Canonical-page content diff vs true pre-cleanup build | — | byte-identical on all 8 pages checked |
| Lighthouse (`/`, `/shop`, `/products/face-elixir`, `/products/body-elixir`, `/skin-strategy`) | — | accessibility 100 on all five, zero weighted findings |
| Manual a11y spot check (`/products/face-elixir`) | — | 1 `h1`, valid heading order, 0 missing alt text, 0 unnamed CTAs, keyboard focus reaches named control with visible ring, no mobile overflow, 0 console errors |

## Deferred decisions

Retained for `docs/upgrades/DEFERRED_WORK_REGISTER.md`:

- `/api/waitlist` + `WaitlistModal` + `useWaitlistStore` + `FaceElixirHero` — a live backend integration with no reachable caller; a founder/architecture decision, not a component-cleanup one.
- `IngredientList`, `BenefitsTable`, `UsageGuide`, `ProductFAQ`, `ProductTabs`, `ProductExperience`, and the now-smaller `components/products/index.ts` barrel — orphaned, not named candidates.
- The `/shop` → `/products/${slug}` link's safety depends on `data/products/index.json` never gaining a slug without a matching static page — a data/process convention, not enforceable by this pass without adding a new abstraction.
- `ProductMetadata` type in `src/types/products.ts` is now unused — left in place rather than editing a shared, actively-used types file for one orphaned export.
