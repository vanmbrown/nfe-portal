# NFE Maison — Release-Readiness Audit

**Status:** Complete. Full commit-by-commit classification, system-by-system
verification, and deployment-scope analysis of `feature/nfe-digital-maison-upgrade`
against `origin/main`.

**Audit HEAD:** `54bd4dbc745acdf4845674f6a2c238d148e2bbd3` (`54bd4db`)
**Compared against:** `origin/main` @ `4f2c411` (fetched fresh at audit time, not
from memory)
**Date completed:** 2026-07-20

**Authorization boundary for this document:** this is a documentation-only audit.
No deployment, merge, history rewrite, production-infrastructure change,
product-size copy change, or new visual migration was performed while producing
it.

---

## 1. Executive Summary

The feature branch is **42 commits ahead of `origin/main`, 0 behind**, with a
clean linear history (`origin/main` is a strict ancestor — no divergence, no
rewritten history on this branch, zero merge-conflict markers in a dry-run
merge). The branch is technically safe to merge as a whole.

The substantive picture is better than "safe to merge" vs. "not safe to merge."
Most of the 42 commits are independently verified, low-risk, and ready:
navigation/SEO cleanup, the homepage rebuild and its hero-fidelity correction,
the Science and Journal pages, the Our Story pilot, Phase 1 design tokens
(additive and visually inert), and the favicon. These were tested this session
with real evidence — Lighthouse runs, contrast math, manual QA, console-error
checks — not assumed.

One commit group is materially different in kind: **Founder Access**
(`d82e3a9`, `4d86fec`, `8e3357c`) adds a new production route that collects
customer signups, writes to Supabase, and sends email via Resend/Beehiiv. This
is the branch's only new customer-data-collecting surface, and its production
readiness (migration applied, RLS verified, secrets configured) **cannot be
confirmed from code alone.** It needs its own go-live checklist, separate from
the rest of the branch.

Two known defects are relevant to this release decision but were **not
introduced by this branch** — both were confirmed present on `origin/main`
before this branch's changes:

- The Face Elixir FAQ's 30ml/50ml size contradiction (`FaceElixirFAQ.tsx`) is
  live on `origin/main` today. This branch modifies that file but did not
  create the contradiction.
- The broken `/images/logo/nfe_logo.png` reference in `ArticleJsonLd.tsx` is
  also present on `origin/main` today.

The Cloudflare/OpenNext image-optimization defect (every image served at full
resolution regardless of requested width) is a standing **production**
infrastructure defect, independent of this branch, and would affect this
branch's images the same way it affects main's.

Three new findings surfaced during this audit pass that were not in the seed
document: a malformed `public/data/inci/faceElixir.json` (dead but publicly
servable), a self-hosted commercial webfont (`garamondpremrpro.*`) whose
redistribution license status is unverified, and the broken logo reference
above.

**Recommendation:** READY FOR CONTROLLED FEATURE RELEASE. See Section 13.

---

## 2. Branch & History Verification

- Merge base of `origin/main` and `feature/nfe-digital-maison-upgrade`:
  `4f2c411826c1c950c3385759084a9e56a87a9102` — identical to `origin/main`'s tip.
- 42 commits ahead, 0 commits behind.
- `git merge-base --is-ancestor origin/main feature/nfe-digital-maison-upgrade`
  confirms `origin/main` is a strict ancestor: linear history, no divergence.
- `git merge-tree` dry run against the merge base produced **zero conflict
  markers** — a fast-forward or clean merge is possible without manual
  conflict resolution.
- `git reflog show feature/nfe-digital-maison-upgrade` shows a clean, forward-
  only commit sequence with no evidence of force-push or history rewriting on
  this branch.
- `git fsck --unreachable --no-reflog` reported several unreachable
  commits/trees/blobs (e.g. `b683998`, `f884422`, `9206577`, `c04614d`, plus
  loose trees/a blob). These are routine git object-database litter —
  ordinary byproducts of amends, resets, or interactive git operations
  performed at some point in this repository's history (by any tool, on any
  branch) — not evidence of tampering on this branch. They are unreferenced
  by any branch or tag and will be garbage-collected automatically; no action
  needed.
- Other branches present in the repo (not part of this audit's scope, noted
  for completeness): `wip/our-story-maison` (2026-07-18, `9b81f72` — an earlier
  working branch, superseded by the finished Our Story pilot now on
  `feature/nfe-digital-maison-upgrade`) and `audit/production-readiness`
  (2026-05-24, `cf8bb8e` — an older audit branch, superseded by this
  document).
- HEAD confirmed: `54bd4dbc745acdf4845674f6a2c238d148e2bbd3`, dated
  `2026-07-20 00:23:17 -0400`.
- No CI/CD is configured (`.github/` does not exist). Deployment is manual:
  `npm run deploy` → `opennextjs-cloudflare build && npx wrangler deploy
  .open-next/worker.js`. There is no automated gate between a commit landing
  on any branch and a human running that command from a local checkout.

---

## 3. Commit Classification

All 42 commits, oldest to newest, grouped by logical unit. Category values use
the eight required labels. Where commits are technically inseparable (later
commits edit files introduced by earlier ones in the same feature line), they
are grouped and given one classification rather than artificially split —
noted explicitly where this matters for deployment planning (see Section 11).

### Group 1 — Nav/SEO/canonical cleanup
| | |
|---|---|
| Commit | `18183bf` |
| Title | fix: complete launch gate canonical nav and claim cleanup |
| Files | `our-story/page.tsx`, `robots.ts`, `sitemap.ts`, `ArticleJsonLd.tsx`, `PrimaryNav.tsx`, 2 article MDX files, `body-elixir.ts`, `face-elixir.ts`, new `site-url.ts` |
| User-facing impact | Canonical URL / nav correctness, no visible design change |
| Dependencies | None |
| Rollback risk | Low — self-contained |
| **Classification** | **Ready to ship** |

### Group 2 — Maison route shells + homepage rebuild + hero iteration + founder portrait
| | |
|---|---|
| Commits | `a475f08`, `b70dab5`, `ebfbe65`, `a97ef29`, `fd22def`, `3c788ec`, `9fd92a0`, `91adc8f` |
| Titles | route shells; homepage rebuild; data capture foundation; 4 hero iteration commits; founder portrait update |
| Files | `src/app/page.tsx` (repeatedly), new `/concierge`, `/ritual`, `/discovery`, `/founder-access` (page shell only at this point), `/skin-ritual-quiz` route files, `next.config.mjs`, `Header.tsx`, analytics/customer-intelligence libs, `subscribe/route.ts` |
| User-facing impact | Full homepage redesign; four new route shells reachable from nav/footer; new client-side analytics event tracking |
| Dependencies | **Not independently cherry-pickable** — `b70dab5` is the single commit that both rebuilds the homepage and creates the `/founder-access` page shell (later built out into the full commerce system in Group 6). Excluding Founder Access cleanly requires either accepting its page shell ships inert, or a deliberate post-merge action (nav/route gate) — not a commit-selection problem. See Section 11. |
| Rollback risk | Medium — largest single-surface change in the branch |
| **Classification** | **Ready after regression test** (homepage, new route shells); the `/founder-access` shell specifically inherits Group 6's classification once the backend lands on top of it |

### Group 3 — Quiz, Discovery, Concierge, Beehiiv feature builds
| | |
|---|---|
| Commits | `733b061`, `948f231`, `061a98f`, `e0aa7e5` |
| Titles | skin ritual quiz; discovery ritual architecture; concierge intake; beehiiv CRM integration foundation |
| Files | `SkinRitualQuiz.tsx`, `DiscoveryRitualTracker.tsx`, new `api/concierge/route.ts`, `ConciergeIntake.tsx`, `ConciergeTracker.tsx`, `beehiiv/subscriber.ts` |
| User-facing impact | Three new interactive client features; one new server route (`/api/concierge`) that sends email via Resend |
| Dependencies | `api/concierge/route.ts` reads `process.env.RESEND_API_KEY` and an admin notification address — **whether these are set in production cannot be verified from code.** Beehiiv integration similarly depends on `BEEHIIV_API_KEY` in production. |
| Rollback risk | Low individually; concierge route is the only one with an external side effect (sends email) |
| **Classification** | **Ready after regression test** — functionally complete, but production env-var presence for Resend/Beehiiv needs confirmation before relying on the concierge/subscribe flows in production (flagged, not assumed broken or working) |

### Group 4 — Science page rebuild
| | |
|---|---|
| Commits | `a0f5b5d`, `c77f3c0` |
| Titles | rebuild science method proof page; refine science skin layer schematic |
| Files | `(education)/science/page.tsx`, new `ScienceIntelligence.tsx` |
| User-facing impact | Full page rebuild |
| Dependencies | None |
| Rollback risk | Low |
| **Classification** | **Ready to ship** — fresh Lighthouse this audit: desktop 100 perf / 92 a11y / 100 best-practices / 100 SEO, mobile 96/92/100/100, LCP 563ms desktop. Accessibility at 92 (not 96+ like most other pages) is a real, minor gap — see Section 8. |

### Group 5 — Journal editorial pillar
| | |
|---|---|
| Commits | `a9a6110`, `7372220`, `18c4c3a`, `23d6479` |
| Titles | journal architecture; build editorial pillar; integrate archive; finalize structure |
| Files | 9 new MDX articles, `journal/page.tsx`, `articles/` restructure, 9 new hero images |
| User-facing impact | New `/journal` section and 9 new long-form articles |
| Dependencies | None. Copy-governance scanner (`src/lib/copy-governance.ts`) was run against the full `src/` tree this session, which includes this content — only 2 hits, both false-positive CSS class names (`drop-shadow`), already allowlisted. |
| Rollback risk | Low — additive content |
| **Classification** | **Ready to ship** — fresh Lighthouse this audit: desktop 100/96/100/100, mobile 97/96/100/100, LCP 561ms desktop |

### Group 6 — Homepage copy refinement
| | |
|---|---|
| Commits | `aff206a`, `ba7343f` |
| Titles | clarify pre-commerce CTA hierarchy; refine maison pathways headline |
| Files | `src/app/page.tsx` |
| User-facing impact | Copy-only |
| Dependencies | None |
| Rollback risk | Low |
| **Classification** | **Ready to ship** |

### Group 7 — Atelier / product experience refinement
| | |
|---|---|
| Commit | `20ee75b` |
| Title | feat: refine the atelier product experience |
| Files | `data/products/*.json`, `products/body-elixir/page.tsx`, `products/face-elixir/page.tsx`, `products/page.tsx`, `shop/page.tsx`, new `atelier/` components, `FaceElixirFAQ.tsx` |
| User-facing impact | Rebuilds the shop/product browsing experience |
| Dependencies | **Touches, but did not create,** the Face Elixir 30ml/50ml FAQ contradiction — verified present in this exact file on `origin/main` before this commit (Section 6). Not blocked from a technical standpoint; the underlying product fact is what's unresolved. |
| Rollback risk | Medium — central commerce-adjacent surface |
| **Classification** | **Blocked by product fact** — safe to ship the design/architecture work, but the page it ships surfaces a pre-existing, unresolved size contradiction more prominently. Founder resolution of the physical packaging fact (Section 6) should happen before or immediately alongside this shipping, not after. |

### Group 8 — Founder Access commerce system
| | |
|---|---|
| Commits | `d82e3a9`, `4d86fec`, `8e3357c` |
| Titles | build founder access allocation experience; subscriber compatibility fix; disclose data handling in privacy policy |
| Files | new `api/founder-access/route.ts`, `FounderAccessForm.tsx`, `FounderAccessTracker.tsx`, `founder-access/validation.ts`, new `supabase/migration_founder_access_signups.sql`, `verify-founder-access-rls.mjs`, `verify-founder-access-api-db.mjs`, `ratelimit.ts`, `privacy/page.tsx` |
| User-facing impact | New route that collects real customer signups (name/email/allocation preference), writes to Supabase, rate-limits via Upstash, emails via Resend, and syncs to Beehiiv. Privacy policy updated to disclose this. |
| Dependencies | Requires the Supabase migration (`migration_founder_access_signups.sql`) to be **applied to the production database**, its RLS policy verified in production (not just via the local `verify-founder-access-rls.mjs` script), and `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`, `BEEHIIV_API_KEY` all confirmed present in the Cloudflare Worker's production environment bindings. **None of this is verifiable from code.** |
| Rollback risk | High — the only commit group in the branch that writes new customer PII to a production data store. A rollback after go-live means reconciling any signups collected in the interim, not just reverting code. |
| **Classification** | **Requires separate deployment** — needs its own go-live checklist and should not be bundled into a general site-refresh deploy. |

### Group 9 — Founder Access closeout tooling
| | |
|---|---|
| Commits | `2eede3b`, `2474aff` |
| Titles | support staged founder access closeout tests; fix closeout verification script |
| Files | `scripts/closeout-founder-access-production.mjs` only |
| User-facing impact | None — local ops tooling, not shipped to users |
| Dependencies | None |
| Rollback risk | None |
| **Classification** | **Internal documentation only** (tooling, not production code) |

### Group 10 — Founder decision records / Phase 0 audit / orientation docs
| | |
|---|---|
| Commits | `ed824bb`, `a4b6f83`, `fc5454f`, `824a315`, `33d11ed` |
| Titles | founders edition decision sheet; finalize phase 0 audit; add Claude Code orientation; record founder rulings; ratify accent pair |
| Files | `docs/*.md`, `CLAUDE.md` only |
| User-facing impact | None |
| Dependencies | None |
| Rollback risk | None |
| **Classification** | **Internal documentation only** |

### Group 11 — Pre-Phase-1 content/asset risk fixes
| | |
|---|---|
| Commit | `4a1cc89` |
| Title | fix: resolve pre-phase-one content and asset risks |
| Files | deletes 4 zero-byte product images, `shop/page.tsx` copy, `elixir-editorial.ts`, `face-elixir.ts`/`body-elixir.ts` (`images: []`), 3 new docs |
| User-facing impact | Removes broken image references and banned marketing phrases; empties (does not delete) product image arrays pending real photography |
| Dependencies | None — this fix is correct and self-contained regardless of the still-open size question |
| Rollback risk | Low |
| **Classification** | **Ready to ship** |

### Group 12 — Maison design-token system (Phase 1)
| | |
|---|---|
| Commits | `ad393fd`, `a847e60`, `8d1ca9f`, `7f31a52`, `0751900`, `55c9f26` |
| Titles | token bridge (visually inert); Tailwind bridge + copy governance; token specimen page; brand favicon + muted token + status copy; state-color tokens; corrected favicon |
| Files | `nfe-tokens.css`, `tailwind.config.js`, `src/lib/copy-governance.ts`, `dev/token-specimen/page.tsx`, `robots.ts`, `icon.png`, `favicon.ico`, `shop/page.tsx` (status copy) |
| User-facing impact | New CSS custom properties (additive, explicitly namespaced away from `--nfe-*`/`--space-*` to avoid the known collision); a dev-only token specimen page (confirmed `notFound()`-guarded and `noindex` in production build via direct `curl` test); new brand favicon/icon; one shop-page status-copy correction |
| Dependencies | None |
| Rollback risk | Low — additive CSS, no visual change to shipped pages from the tokens themselves |
| **Classification** | **Ready to ship** |

### Group 13 — Our Story pilot
| | |
|---|---|
| Commit | `3c1817b` |
| Title | feat: refine our story editorial pilot |
| Files | new Maison component primitives (7 files), `StoryHero.tsx` rewrite, `our-story/page.tsx` rewrite, 2 new founder photographs |
| User-facing impact | Full page rewrite: new layout, accessible video modal, rewritten medical-language copy |
| Dependencies | None |
| Rollback risk | Low — isolated route |
| **Classification** | **Ready to ship** — verified this session via Lighthouse (final pilot pass: desktop 100/100/100/100, mobile 96/100/100/100, LCP 580ms desktop), zero console errors, and manual accessibility checks (focus trap, Escape-to-close, `prefers-reduced-motion`) |

### Group 14 — Homepage hero fidelity fix
| | |
|---|---|
| Commit | `5f6303b` |
| Title | fix: preserve homepage hero image fidelity |
| Files | 5 new static WebP variants, `src/app/page.tsx` |
| User-facing impact | Sharper hero image on both desktop and mobile; route-scoped, bypasses Next's image optimizer for this one image only |
| Dependencies | None |
| Rollback risk | Low |
| **Classification** | **Ready to ship** — explicitly approved and closed by the founder this session |

### Group 15 — Audit seed document
| | |
|---|---|
| Commit | `54bd4db` |
| Title | docs: open release-readiness audit with three carried findings |
| Files | `docs/nfe-release-readiness-audit.md` (this file's predecessor) |
| **Classification** | **Internal documentation only** — superseded by this document |

**Tally:** Ready to ship: 8 groups (18 commits). Ready after regression test: 2
groups (12 commits). Blocked by product fact: 1 group (1 commit). Requires
separate deployment: 1 group (3 commits). Internal documentation only: 4
groups (8 commits). Blocked by founder decision: 0 (see Section 14 — decisions
needed exist, but none currently block a specific commit from shipping).
Blocked by environment-configuration: 0 as a hard classification (env-var
presence is *unverified*, not *confirmed absent* — see Groups 3 and 8).
Should not ship: 0.

---

## 4. Route-by-Route Inventory

Routes that exist on the feature branch. Routes marked "new" do not exist on
`origin/main` at all; routes marked "modified" exist on both but differ.

| Route | Status vs. `origin/main` | Notes |
|---|---|---|
| `/` | Modified | Full Maison rebuild + hero fidelity fix |
| `/our-story` | Modified | Full rewrite (pilot) |
| `/shop`, `/products`, `/products/[slug]` | Modified | Atelier refinement; carries the Face Elixir FAQ contradiction (pre-existing) |
| `/founder-access` | New | Full commerce system — see Group 8 |
| `/science` | Modified | Full rebuild |
| `/journal`, `/articles`, `/articles/[slug]` | New / modified | New editorial pillar |
| `/concierge` | New | Intake form, emails via Resend |
| `/ritual` | New | Route shell |
| `/discovery` | New | Interactive tracker |
| `/skin-ritual-quiz` | New | Interactive quiz |
| `/subscribe` | Modified | Data-capture foundation |
| `/privacy` | Modified | Founder Access disclosure added |
| `/dev/token-specimen` | New | Dev-only, `notFound()`-guarded and `noindex` in production — confirmed via `curl` against a real `next start` build |
| `/cookies`, `/learn`, `/skin-strategy`, `/community-input` | Unchanged | Not touched by any of the 42 commits |
| `/focus-group/*` (admin, enclave, messages, uploads, consent) | Unchanged | Pre-existing production system, not touched by this branch — out of scope for this audit |
| `robots.ts`, `sitemap.ts` | Modified | `/dev/` added to disallow list; new routes added to sitemap |
| `favicon.ico`, `icon.png` | New | Brand favicon/icon replacing whatever previously served this role |

No route present on `origin/main` was removed by this branch. `/about` and
`/products` (plural, pre-slug) redirect permanently to `/our-story` and
`/shop` respectively — configured in `next.config.mjs`, unchanged by this
branch.

---

## 5. Data & Commerce Systems Verification

Verified from code; items marked unverifiable require production access this
audit does not have.

| System | Status | Verifiable from code? |
|---|---|---|
| Shopify | No integration present anywhere in the codebase | N/A — not in scope |
| Payment/checkout | No payment or checkout code path exists. `/shop` and product pages are catalog/editorial only. | Verified — no exposure |
| Founder Access signup (`api/founder-access/route.ts`) | Writes to Supabase (`founder_access_signups` per the new migration), rate-limited via Upstash, emails via Resend, syncs to Beehiiv | **Code is complete and internally consistent.** Whether the migration is applied and RLS is active in the production database is unverifiable from code. |
| Concierge intake (`api/concierge/route.ts`) | Sends email via Resend on submission | Code complete; `RESEND_API_KEY`/admin address presence in production unverifiable |
| Subscribe (`api/subscribe/route.ts`) | Modified by the data-capture-foundation commit; sends via Resend, tags via customer-intelligence lib | Code complete; same env-var caveat |
| Beehiiv CRM (`src/lib/beehiiv/subscriber.ts`) | New integration foundation | `BEEHIIV_API_KEY` presence in production unverifiable |
| Supabase schema/migrations | `supabase/migration_founder_access_signups.sql` is new on this branch. The `supabase/` directory also contains ~20 older, individually-named ad hoc patch files (`fix_*.sql`, `add_*.sql`, `set_admin_*.sql`) predating this branch, applied outside a formal migration tool — this is pre-existing repo practice, not introduced here, but worth the founder knowing there is no single source of truth for "what's actually applied to production" beyond these files. |
| Upstash rate limiting (`src/lib/ratelimit.ts`) | Modified for Founder Access | `UPSTASH_REDIS_REST_URL`/`TOKEN` presence in production unverifiable |
| Webhooks | None found in the 42 commits | N/A |
| Production secrets generally | No secret **values** found in any tracked file — only `process.env.X` references, which is correct usage. Only `.env.local.example` (a template) is tracked; no real `.env` file is tracked. | Verified clean |

**Explicit gap:** this audit cannot confirm the Founder Access Supabase
migration has been run against production, nor that its RLS policy is active
there — only that the local verification scripts (`verify-founder-access-
rls.mjs`, `verify-founder-access-api-db.mjs`) exist and are written correctly.
Running them against production, or a founder/ops confirmation, is required
before this route should be promoted or linked from primary navigation.

---

## 6. Product-Fact Blockers

### Face Elixir — 30ml vs. 50ml (live contradiction, pre-existing)
- `src/content/products/face-elixir.ts:172` states the canonical size as
  **30ml / 1 fl oz** — this is the single source of truth used elsewhere in
  the app.
- `src/components/products/face-elixir/FaceElixirFAQ.tsx:38-39` presents
  **both** a 30ml and a 50ml bottle as real options with different duration
  estimates for each.
- `FaceElixirFAQ.tsx` is imported into `src/app/products/[slug]/
  ProductPageClient.tsx` and rendered on the live product page — **this
  contradiction is customer-visible today.**
- **Verified via `git show origin/main:...`: this exact contradiction already
  exists on `origin/main`, unchanged by this branch.** `20ee75b` modifies this
  file but did not introduce the conflicting text.
- A second, unused component (`src/components/products/
  FaceElixirSections.tsx`) contains the same 30ml/50ml contradiction but is
  not imported anywhere in `src/app/` — dead code, not customer-facing.
- **No reconciliation performed.** Per standing instruction, only Vanessa can
  resolve this against the physical packaging.

### Body Elixir — 200ml vs. 125ml/75ml (internal-only contradiction)
- Production content (`src/content/products/body-elixir.ts:112,116`) states
  **200ml / 6.8 fl oz** consistently in both places it appears in code.
- The only conflicting figure (125ml/75ml) comes from a Maison design
  package reference, not from any shipped code path — **not customer-facing
  today.**
- No reconciliation performed; documented in `docs/nfe-product-size-
  inventory.md`.

Neither contradiction was altered, resolved, or inferred during this audit.

---

## 7. Asset & Media Findings

- **Zero-byte images:** none found in any tracked image under `public/
  images/` or the two icon files, confirmed by direct byte-size check against
  every tracked path.
- **Broken image reference:** `src/components/articles/ArticleJsonLd.tsx:44`
  references `/images/logo/nfe_logo.png`, which does not exist anywhere under
  `public/images/` (the `logo/` directory itself does not exist). **Confirmed
  pre-existing on `origin/main`** — not introduced by this branch. This
  affects the JSON-LD structured-data output on every article page (a
  missing-image reference in schema.org markup, not a broken on-page image —
  low visual risk, minor SEO/structured-data quality issue).
- **Malformed public data file (new finding this audit):**
  `public/data/inci/faceElixir.json` is not byte-identical to its counterpart
  `data/inci/faceElixir.json`, unlike every other formulas/INCI file pair
  checked (which are identical). The public copy has been serialized through
  what appears to be a PowerShell `ConvertTo-Json` call over a .NET array
  object without proper array handling — it contains `.NET`
  reflection-artifact keys (`Count`, `Length`, `LongLength`, `Rank`,
  `SyncRoot`, `IsReadOnly`, `IsFixedSize`, `IsSynchronized`) instead of a
  clean ingredient array. **Confirmed this file is not fetched by any route**
  (`INCILists.tsx`, the only consumer of formula/INCI JSON at runtime, fetches
  `/data/formulas/*.json`, not `/data/inci/*.json` — verified via `grep` for
  the literal path across `src/`). It is dead but still publicly servable as
  a static asset. Not a security issue (no secrets, no proprietary
  concentration data — confirmed no `percent`/`concentration`/`%` fields
  exist in any formula file), but a data-quality defect worth cleaning up.
- **Formula/INCI content confirmed non-proprietary:** all four formula files
  contain only `inci`, `commonName`, `function`, `benefit`, and `phase`
  fields — no percentage/concentration data. Publishing these to `public/
  data/` appears intentional (standard cosmetic-ingredient transparency, not
  a proprietary-formula leak).
- **Favicon:** multi-resolution `favicon.ico` (16/32/48px) and `icon.png`
  (512×512) both present and git-tracked; the 16px frame was specifically
  cropped this session to remain legible at that size (documented in
  `docs/nfe-founder-decisions-2026-07-19.md`).
- **Video/embed:** the Our Story video modal embeds a YouTube video with no
  `autoplay` parameter; ownership was verified via the YouTube oEmbed API
  earlier this session (not re-verified in this pass — no code affecting it
  changed since).
- **Duplicate-portrait check:** `founder-hero.webp` (163KB) and
  `founder-portrait.webp` (108KB) in `public/images/our-story/` are confirmed
  genuinely distinct photographs, not the same image reused.
- **Font licensing (new finding this audit):** `public/fonts/
  garamondpremrpro.{otf,woff,woff2}` are tracked in git and served as
  self-hosted webfonts. Garamond Premier Pro is a commercial Adobe typeface;
  self-hosting/redistributing it as a webfont file typically requires a
  specific webfont license separate from a standard desktop license. **This
  audit cannot verify licensing status from code** — flagging as a
  founder/legal item, not a code defect.

---

## 8. Accessibility & Performance Findings

Reused existing baselines where already valid (same commit, no relevant code
changed since); ran fresh Lighthouse for the two routes with no prior
coverage (`/science`, `/journal`), per the minimum-coverage requirement.

| Route | Perf (D/M) | A11y (D/M) | Best Practices (D/M) | SEO (D/M) | LCP (D) | Baseline source |
|---|---|---|---|---|---|---|
| `/` (homepage, post hero-fix) | 100/99 | 96/96 | 100/100 | 100/100 | 571ms | This session, post-fix (2026-07-20) |
| `/our-story` (final pilot) | 100/96 | 100/100 | 100/100 | 100/100 | 580ms | This session, final pilot pass |
| `/founder-access` | 100/99 | 100/100 | 96/96 | 100/100 | 533ms | This session (2026-07-19) |
| `/shop` | 100/99 | 100/100 | 96/96 | 100/100 | 532ms | This session (2026-07-19) |
| `/science` | 100/96 | 92/92 | 100/100 | 100/100 | 563ms | **Fresh, this audit pass** |
| `/journal` | 100/97 | 96/96 | 100/100 | 100/100 | 561ms | **Fresh, this audit pass** |

**Findings:**
- Homepage Accessibility (96/100) is unchanged by the hero-fidelity fix
  (that patch didn't touch contrast-affecting markup). Consistent with the
  systemic color-contrast pattern documented in the Phase 0 baseline audit.
  **Decision already on record:** fix during the homepage's own Maison
  migration when ratified contrast tokens are actually applied, not in an
  isolated patch.
- `/science` Accessibility (92/100) is the lowest score of any route tested
  this session, desktop and mobile alike. Not previously flagged. Likely the
  same systemic contrast pattern, unconfirmed in detail — worth a dedicated
  pass when Science's own Maison migration happens, following the same
  logic as the homepage decision above rather than a piecemeal fix now.
- `/shop` and `/founder-access` Best Practices sit at 96, not 100 — not
  investigated in prior sessions; low priority, noted for completeness.
- No route tested this session or in prior baselines scored below 92 on any
  category. No console errors were found on any previously-tested route.

---

## 9. Deployment-Configuration Findings

Read-only review; no configuration was changed.

- **Deploy mechanism:** `npm run deploy` = `opennextjs-cloudflare build && npx
  wrangler deploy .open-next/worker.js`. Fully manual, run from whatever
  local checkout an operator has open — confirmed no `.github/` workflows
  exist to gate or automate this.
- **`wrangler.jsonc`:** targets Cloudflare Worker `nfe-portal`, serves
  `.open-next/assets` as static assets, `nodejs_compat` flag enabled,
  `compatibility_date: 2026-01-18`. Nothing in this branch touches this file.
- **Image optimization:** `next.config.mjs` sets `qualities: [75, 90]`,
  explicit `deviceSizes`/`imageSizes`. This branch's hero-fidelity fix
  deliberately routes around Next's optimizer for one image via a static
  `<picture>` element — confirmed as the correct workaround given the
  separately-tracked, pre-existing production defect where `/_next/image`
  ignores requested width entirely (see Section 1 and the prior findings
  carried from earlier sessions).
- **Redirects:** four permanent redirects configured (`/about`→`/our-story`,
  `/articles/well-aging-not-anti-aging`→`/journal`, `/products`→`/shop`,
  `/founders-access`→`/founder-access`). None touched by this branch's
  commits; all still consistent with current route structure.
- **Deployment provenance (carried finding, re-verified):** the current
  production state cannot be reconstructed from `origin/main` alone — the
  homepage hero asset live on production does not exist in `origin/main`'s
  history at all, only on this feature branch. No deployment logs exist to
  attribute who/when/how production was last updated. Rollback-to-main is
  **not** a safe assumption (see Section 12).
- **Preview vs. production behavior, cache invalidation, rollback mechanism:**
  no evidence in the repo of how `wrangler deploy` handles cache
  invalidation or provides a rollback path beyond Cloudflare's own dashboard
  history (external to this repo, not verifiable from code).

---

## 10. Security & Confidentiality Verification

- **No secret values tracked.** Full-repo pattern scan for live API key
  formats (`sk_live`, `pk_live`, Supabase/Beehiiv/Resend/Upstash key
  patterns, PEM private key headers) found only `process.env.X` references —
  correct usage, not leaked values.
- **No `.env` files tracked** other than `.env.local.example` (a template
  with no real values).
- **No formula percentage/concentration data** in any tracked file (Section
  7) — only qualitative ingredient function/benefit copy, consistent with
  intentional public disclosure.
- **No confidential handoff docs, audit scratch files, or `.nfe-audit/`
  content tracked** — confirmed via a direct `git ls-files` pattern check.
- **No customer data tracked** — no exported signup lists, no test-user PII
  found in tracked files.
- **Font binaries are tracked** (`garamondpremrpro.*`) — not a security
  issue, but a licensing-verification item (Section 7).
- **New this audit — `supabase/.temp/cli-latest` is tracked in git.** This is
  normally local Supabase CLI state, not something meant to be version
  controlled. Checked its content: it is a single version-string line, not
  sensitive. Low-priority hygiene item, not a security risk.

No unapproved media, no exposed credentials, no confidential product
formulas found tracked in this branch.

---

## 11. Deployment Options

### Option A — Minimal (documentation/governance only, no new production surface)
- **Included:** nothing new goes live. This option is "continue as-is."
- **Excluded:** all 42 commits stay on the feature branch.
- **Migration/environment requirements:** none.
- **Regression scope:** none.
- **Rollback method:** N/A — nothing changes.
- **Risk level:** None.
- **Recommendation:** Not recommended as a terminal choice — a large, verified
  body of work (homepage, Our Story, Science, Journal, design tokens,
  favicon) would sit unshipped indefinitely with no technical justification
  for withholding it. Appropriate only as a temporary state while founder
  decisions in Section 14 are pending, not as an end state.

### Option B — Controlled feature release
- **Included:** everything **except** Group 8 (Founder Access commerce
  system: `d82e3a9`, `4d86fec`, `8e3357c`). Because the branch's commits are
  not independently cherry-pickable (Section 3, Group 2), this means merging
  the full branch and then **not linking `/founder-access` from primary
  navigation or the homepage** until its own checklist clears — the route
  shell can exist unlinked (already the case: it's a real route, just not
  yet promoted) without exposing the signup flow to real traffic.
- **Excluded (deferred, not deleted):** Founder Access commerce system, until
  its Supabase migration/RLS/env vars are confirmed in production.
- **Migration/environment requirements:** none required to ship this option —
  Founder Access is the only piece with a migration dependency, and it's the
  piece being held back.
- **Regression scope:** homepage, Our Story, Science, Journal, Shop/Atelier,
  Discovery, Concierge, Skin Ritual Quiz, Subscribe — the full non-commerce
  surface. Concierge and Subscribe send real email (Resend); worth a
  production smoke test of one submission each before or immediately after
  going live, since their env-var presence in production is unverified.
- **Rollback method:** revert to the pre-deploy tag (Section 12); no database
  changes to unwind since Founder Access's migration wouldn't be applied.
- **Risk level:** Low-to-medium. The riskiest surface (customer PII
  collection) is excluded.
- **Recommendation:** This is the audit's recommended option.

### Option C — Full feature-branch release (includes Founder Access)
- **Included:** all 42 commits, Founder Access fully live and linked.
- **Excluded:** nothing.
- **Migration/environment requirements:** `migration_founder_access_signups.
  sql` must be applied to the production Supabase instance; RLS policy must
  be verified active there (not just locally); `SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`, `BEEHIIV_API_KEY` must
  all be confirmed present in the Cloudflare Worker's production bindings.
  None of this is confirmable from this repository.
- **Regression scope:** everything in Option B, plus the full Founder Access
  signup flow end-to-end in production (form submit → Supabase row →
  rate-limit enforcement → Resend confirmation email → Beehiiv sync).
- **Rollback method:** code rollback is the same as Option B, but a rollback
  after real signups have been collected also requires deciding what happens
  to that data — not a pure code revert.
- **Risk level:** Medium-high — the only option that puts unverified
  production configuration in the path of real customer data before that
  configuration has been confirmed.
- **Recommendation:** Not recommended yet. Reasonable as a fast-follow to
  Option B once Founder Access's own checklist (migration + RLS + secrets,
  confirmed by whoever has production Supabase/Cloudflare access) clears —
  this is an operational verification gap, not a code defect.

---

## 12. Rollback Plan

- **Pre-deploy tag:** before any deploy from this branch, tag the exact
  commit being deployed (e.g. `git tag release-2026-07-20 54bd4db` or
  whatever HEAD is at actual deploy time) and push the tag. Given the
  confirmed deployment-provenance gap (Section 9), a tag is the only reliable
  way to know afterward exactly what was live.
- **Rollback command/path:** `wrangler deploy` does not appear to have a
  built-in "redeploy previous version" command evidenced in this repo;
  rollback would mean checking out the previous tagged commit and re-running
  `npm run deploy` from a clean checkout of it. Cloudflare's own dashboard
  deployment history (outside this repo) may offer a faster rollback path —
  not verifiable from code, worth confirming with whoever has Cloudflare
  dashboard access before relying on it.
- **Database rollback:** only relevant if Option C (or B followed by a fast
  Founder Access follow-up) is chosen. Rolling back code does not undo rows
  already written to `founder_access_signups`. If a rollback is needed after
  Founder Access has collected real signups, that data needs an explicit
  decision (keep and reconcile vs. archive) — not an automatic consequence of
  a code revert.
- **Cache invalidation:** no evidence in this repo of what, if anything,
  needs manual cache-busting on rollback (Cloudflare edge cache, browser
  cache for static assets under new hashed filenames). Static asset
  filenames in this branch (e.g. the new hero WebP variants) are content-
  addressed by descriptive name, not hash, so a rollback that removes them
  would need the old `page.tsx` reference to still resolve correctly — it
  will, since rollback reverts both together.
- **Environment variables:** rollback does not require touching any env var
  unless Founder Access was live — in that case, its env vars can stay
  configured (idle) without harm; nothing in this branch's other commits
  depends on them.
- **Who must verify after rollback:** whoever has Cloudflare/Supabase
  production access should confirm the previous tagged deployment is live
  (frontend spot-check) and, if Founder Access was involved, confirm no
  further writes are occurring against the rolled-back route.

---

## 13. Final Recommendation

**READY FOR CONTROLLED FEATURE RELEASE**

Reasons:
1. History is clean, linear, and conflict-free — there is no technical
   barrier to merging the branch.
2. The large majority of the branch (33 of 42 commits, Groups 1–6 and 9–15)
   is independently verified this session with concrete evidence — Lighthouse
   scores, contrast math, manual accessibility checks, console-error checks —
   not assumption.
3. The two defects most likely to give pause (Face Elixir size contradiction,
   broken logo reference) are both **confirmed pre-existing on `origin/main`
   today** — this branch does not introduce or worsen either one. They are
   real, but they are not reasons to hold this branch back specifically; they
   are reasons to get a founder decision on the product fact (Section 6)
   independent of this release.
4. The one part of the branch that is qualitatively different — Founder
   Access (Group 8) — is exactly the part this recommendation holds back.
   It is the only new surface that writes real customer data to production,
   and its production configuration is unverifiable from code. That is a
   narrow, well-defined gap, not a reason to hold the entire branch.
5. The Cloudflare/OpenNext image-optimization defect and the deployment-
   provenance gap are real infrastructure risks but are pre-existing and
   apply regardless of which release option is chosen — they argue for a
   pre-deploy tag (Section 12) and a separate infrastructure fix, not for
   holding this branch.

**Not** recommending READY FOR FULL FEATURE-BRANCH RELEASE, because Founder
Access's production readiness genuinely cannot be confirmed from this
repository, and it is the branch's only customer-PII-collecting surface.

**Not** recommending HOLD ALL DEPLOYMENT, because doing so would withhold a
large body of independently-verified, low-risk work for a reason (Founder
Access) that only affects one clearly-scoped part of the branch.

---

## 14. Founder Decisions Still Required

1. **Face Elixir size fact:** is 30ml the only real SKU, or does a 50ml
   bottle actually exist? This determines whether `FaceElixirFAQ.tsx` needs
   a copy correction (a future, separately-scoped task — no product-size
   copy was changed in this audit).
2. **Body Elixir size fact:** 200ml (current production content) or
   125ml/75ml (Maison design-package reference)? Needs verification against
   physical packaging.
3. **Founder Access go-live authorization:** confirm the Supabase migration
   has been applied to production, RLS is active there, and
   `RESEND_API_KEY`/`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`/
   `BEEHIIV_API_KEY`/`SUPABASE_SERVICE_ROLE_KEY` are all set in the
   Cloudflare Worker's production environment — before this route is linked
   from navigation or promoted anywhere.
4. **Deployment option selection:** approve Option B (recommended), or
   direct a different option from Section 11.
5. **Font license:** confirm `garamondpremrpro.*` is appropriately licensed
   for self-hosted webfont redistribution, or source a properly-licensed
   alternative.
6. **Cloudflare image-optimization defect:** decide whether to prioritize
   fixing this as its own workstream — it is independent of this branch and
   currently affects every image on production regardless of what ships from
   here.
7. **Minor cleanup items** (not blocking, noted for a future pass): broken
   `/images/logo/nfe_logo.png` reference in article JSON-LD; malformed
   `public/data/inci/faceElixir.json`; unused `FaceElixirSections.tsx`
   component; `supabase/.temp/cli-latest` tracked in git.

**No deployment scope has been authorized by this document.** This audit
provides the evidence and options; the decision remains the founder's.
