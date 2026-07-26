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
| Metadata behavior | `page.tsx` exports no `metadata` and no `generateMetadata` — nothing depends on it for SEO |
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
route and its route-only support module (`ProductHero.tsx`), per the decision
rules in the governing instructions. All UNKNOWN/DEFERRED items above are
left untouched.
