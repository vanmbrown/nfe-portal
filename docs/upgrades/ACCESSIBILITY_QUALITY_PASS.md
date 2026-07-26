# NFE Website Upgrade — Accessibility, Quality, and Longevity Pass

## Starting point

| | |
|---|---|
| Production source branch | `release/production-hygiene-assets-fonts` |
| Production source HEAD | `80353aae9824f9de9451855eb81f0a91b03dbec3` |
| Deployed application source | `f5a54fa7f5b9d4a4846387c25bb9a80066c46bc6` |
| This branch | `feature/nfe-accessibility-quality-pass` |
| Deployed during this pass | **No** |

Scope: known production-quality debt only. No visual redesign, no editorial
strategy change, no product/formula/pricing change, no Study Circle work.

---

## Lighthouse — before and after

| Route | Perf | A11y | BP | SEO | A11y findings |
|---|---|---|---|---|---|
| `/` before | 100 | **96** | 100 | 100 | color-contrast |
| `/` after | 100 | **100** | 100 | 100 | none |
| `/our-story` before | 96 | 100 | 100 | 100 | none |
| `/our-story` after | 95 | 100 | 100 | 100 | none |
| `/science` before | 97 | 100 | 100 | 100 | none |
| `/science` after | 96 | 100 | 100 | 100 | none |
| `/skin-strategy` before | 72 | **92** | 100 | 100 | aria-command-name, color-contrast, heading-order, label-content-name-mismatch |
| `/skin-strategy` after | 71 | **100** | 100 | 100 | none |

Performance deltas of ±1 are run-to-run noise on a local Worker preview; no
performance work was undertaken and none of these changes affect payload.

`/skin-strategy` Performance remains ~71. That is pre-existing and untouched:
the route ships two heavy interactive map components. Deferred (below).

---

## 1. `/skin-strategy` accessibility

Four audit failures, all resolved. The two largest were single root causes
rather than many separate defects.

### Root cause A — the map backgrounds escaped their components

`NFESkinLayersMap.tsx` and `interactive/NFEMelanocyteMap.tsx` each painted
their dark "scene" background with `fixed inset-0 -z-10`. `fixed` takes an
element out of its container and `-z-10` put it *behind the page's own
background*, so the dark theme never rendered. Both components' light text
(`text-slate-100`, cyan accents, gold) was therefore drawn on near-white
paper — measured as low as **1.04:1**.

Fix: contain the background. The wrapper gained `relative isolate
overflow-hidden` plus a base fill, and the background moved to `absolute
inset-0 -z-10` with `aria-hidden="true"`. This restores the treatment the
components were always written for, and resolved the majority of the contrast
failures at once. No colour value was redesigned.

### Root cause B — outline buttons ignored the surface

`Button`'s `outline` variant is `text-nfe-green` (`#103B2A`) — correct on
light, **1.2:1** on the dark map panels. Nine buttons were affected
("Clear search", every "Locate", both "Export").

Fix: added an `outlineOnDark` variant using `nfe-gold` (the ratified accent
for dark surfaces, ~6.3:1 here), and derived the variant from the map's
existing `themeDark` state — the same way every other colour in that
component is already derived. The original `outline` variant is unchanged, so
nothing elsewhere on the site is affected.

### Remaining fixes

| Finding | Cause | Fix |
|---|---|---|
| `aria-command-name` | `Tooltip` rendered `role="button" tabIndex={0}` with no accessible name, because callers never passed one | Icon-only triggers now pass an explicit label (e.g. `About the Epidermis layer`); text-bearing triggers take their name from their own visible content |
| `heading-order` | Both maps rendered a second `<h1>` *inside* the page's `<h2>` sections, corrupting the outline | Both demoted to `<h3>`; card titles in the layers map demoted to `<h4>`. Visual treatment and the `melanocyte-map-title` id are unchanged |
| `label-content-name-mismatch` | Ingredient cards were `role="button"` + `tabIndex` wrapping a "Locate" button — a control inside a control, a duplicate tab stop, and a name that did not contain the visible text. Export buttons said "Export **as** PNG" over visible "Export PNG" | Card is now presentational; the properly-named "Locate" button is the single control and already performed the identical action. Redundant Export labels removed so the visible text names the button |
| Broken `aria-describedby` | `Tooltip` referenced a hard-coded `"tooltip"` id that was never rendered | Real unique id via `useId()` |

Preserved throughout: educational intent, visual hierarchy, mature-melanated-skin
specificity, cosmetic non-medical language, the `ScienceProvider` restoration,
and the static-data architecture. No ingredient or formula information was
touched, no percentages added, no medical claims introduced.

---

## 2. Homepage contrast

Two failing elements, both fixed within the existing palette.

| Element | Before | After |
|---|---|---|
| Status eyebrow on light card (`src/app/page.tsx`) | `text-nfe-gold` `#C6A664` on `#FAFAF8` — **2.22:1** | `#77633C` — **~5.6:1** |
| Founder Access paragraph on warm panel | `text-nfe-muted` `#6B6B6B` on `#efe4d5` — **4.24:1** | `#5c5c5c` — **~5.2:1** |

Notes:

- The first is a misapplication of the already-ratified accent-by-surface rule
  (`#C6A664` on dark, `#77633C` on light), not a new colour decision. The two
  *other* gold eyebrows on the homepage sit on dark green and were correctly
  left alone.
- The second uses the same local correction already applied to the equivalent
  panel on `/science`. The shared `nfe-muted` token was **not** darkened
  globally — it passes everywhere else it is used.
- No palette flattening. Pantone 3435 C discipline, warm cream/bone, muted
  gold, espresso and oxidized bronze are all intact.

Regression check: `/`, `/our-story`, `/science` and `/skin-strategy` all report
zero contrast findings after the change.

---

## 3. "Coming Soon" audit

**Finding: the phrase renders nowhere on the live site.** Rendered HTML for
`/shop`, `/products/face-elixir` and `/products/body-elixir` contains zero
occurrences.

| File | Context | Classification | Recommendation | Action |
|---|---|---|---|---|
| `src/app/shop/ShopCard.tsx` | Product status badge | **Dead code** — zero references anywhere in `src` | Remove the component, or fix copy if revived | **Deferred** |
| `src/components/products/ProductCard.tsx` | Product status badge | **Dead code** — zero references (the `ProductCard` imports elsewhere resolve to different components in `ui/Card.tsx` and `articles/MDXComponents.tsx`) | Same | **Deferred** |
| `src/components/products/FaceElixirSections.tsx` | CMS fallback strings ("Product details coming soon.") | **Dead code** — zero references | Same | **Deferred** |
| `src/components/products/RitualPairing.tsx` | Customer-facing status badge | **Live component**, but the "Coming Soon" branch is unreachable in practice — only the Body Elixir "IN DEVELOPMENT" branch renders | Replace with NFE-aligned status wording | **Deferred — founder decision** |

Recommended replacements, for founder selection:

- *Founder Access opens first*
- *Available through Founder Access*
- *The first release will be shared privately*

Nothing was changed. All four occurrences hinge on the same positioning
decision about how Face Elixir's pre-launch state is described, and §12 of the
brief reserves that for founder approval. Because none of it currently
reaches a customer, there is no urgency — this can be decided calmly.

---

## 4. Tooling repair

| Command | Before | After |
|---|---|---|
| `npm run lint` | **Failed.** `next lint` was removed in Next.js 16; the CLI parsed `lint` as a directory | **Passes.** Now `eslint src --ext .ts,.tsx` |
| `npm test` | **Failed.** Referenced Jest, which is not installed | **Passes.** 17 tests, 6 suites, via Node's built-in runner |

Details:

- ESLint 8 and `.eslintrc.json` were already present and working — only the
  npm script was broken. Added `"root": true` to the config, which stops
  ESLint searching parent directories for additional configs (it was finding a
  second `@next/next` plugin instance and refusing to run).
- Linting then surfaced one genuine error: an unescaped apostrophe in
  `src/app/shop/page.tsx`. Fixed.
- `npm test` uses Node's built-in test runner — **no new dependency**. A
  27-line resolver hook (`scripts/ts-resolver.mjs`) bridges Node's ESM
  extension requirement and the `@/` path alias, so tests exercise application
  source without any source file being modified for the test runner's benefit.
- The tests are not a placeholder: they cover `src/lib/founder-access/validation.ts`,
  which guards the live Founder Access form. A test command that passes
  vacuously would have been worse than a broken one.
- No dependency added, removed, or upgraded. `package-lock.json` untouched.

---

## 5. General quality audit

| Check | Result |
|---|---|
| Zero-byte tracked files | None |
| Dead root artifacts | None |
| Public development routes | `/dev/token-specimen` returns **404** |
| Study Circle leakage | `/study-circle` returns **404**; no `seed-access` code on this branch |
| Duplicate IDs | None on audited routes |
| Broken ARIA references | One found and fixed (`Tooltip` `aria-describedby`) |
| Heading order | Fixed on `/skin-strategy`; valid elsewhere |
| Nested interactive controls | One found and fixed (melanocyte ingredient cards) |
| Decorative element exposure | Both map scene backgrounds now `aria-hidden` |
| Console errors / hydration warnings | None observed on audited routes |
| Secrets / secret-shaped values | None introduced |
| Environment files | `.env.local`, `.env.production`, `.dev.vars` all git-ignored |
| Generated artifacts tracked | None. `tsconfig.tsbuildinfo` restored after every build |

---

## 6. Route validation

All against the local Worker preview of this branch:

| Route | Expected | Actual |
|---|---|---|
| `/`, `/shop`, `/our-story`, `/science`, `/skin-strategy`, `/inci`, `/ritual`, `/journal`, `/concierge`, `/products/face-elixir`, `/products/body-elixir`, `/founder-access` | 200 | **200** |
| `/study-circle` | not on this branch | **404** |
| `/dev/token-specimen` | 404 | **404** |

Route count: **63** — identical to the canonical production source. No routes
added or removed.

---

## 7. Build results

| Command | Exit | Notes |
|---|---|---|
| `npx tsc --noEmit` | 0 | |
| `npm run lint` | 0 | repaired |
| `npm test` | 0 | 17/17 |
| `npm run build` | 0 | 63 routes; pre-existing Sass `@import` deprecation only |
| `npx opennextjs-cloudflare build` | 0 | |

---

## 8. Deferred

- **`/skin-strategy` Performance (~71).** Pre-existing; the route ships two
  heavy interactive maps. Untouched here because it is a performance-architecture
  question, not accessibility debt, and the brief scoped this pass to the latter.
- **"Coming Soon" replacement wording** — founder decision (see §3).
- **Three dead components** (`ShopCard.tsx`, `products/ProductCard.tsx`,
  `FaceElixirSections.tsx`) — recommend removal, deferred because deleting
  components is broader than this pass's narrow-diff remit and their fate is
  tied to the same copy decision.
- **Study Circle** — staging, legal review, production migration, first
  invitations. Frozen at `feature/nfe-seed-access` @ `1f05512`.
- Founder dashboard; formula and ingredient updates; Face Elixir size decision.

## 9. Explicit non-actions

No deployment. No production migration. No Supabase staging project. No
production Supabase, Cloudflare Worker, or DNS change. No Shopify or Sanity
change. No Study Circle participant, invitation, or customer email. No
founder-dashboard work. No formula, ingredient, or product-size change. No
history rewrite. No force-push.
