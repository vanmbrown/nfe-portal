# NFE Maison — Page Migration Matrix (Phase 0)

**Status:** Draft for Vanessa's review. Planning only — no route is migrated in Phase 0.
**Date:** 2026-07-18
**Branch/commit:** `feature/nfe-digital-maison-upgrade` @ `ed824bb`
**Companion to:** `nfe-maison-baseline-audit.md`, `nfe-maison-refinement-plan-v2.md`.
**Primary pilot:** `/our-story`. **Fallback:** one Journal article template instance.

**Legend**
- **Priority:** revised migration order (directional, adjust with reasoning). Founder Access is never first.
- **Risk:** functional blast-radius if the reskin goes wrong.
- **DS coverage:** how much the design package already specifies for this route.
- **Founder approval:** whether visual sign-off is required before deploy (default: yes for all public routes).

---

## Revised migration order (directional)

`Pilot (/our-story)` → `Homepage` → `The Atelier (/shop)` → `Face Elixir` → `Body Elixir` → `Journal` → `Science shell` → `Ritual` → `Discovery` → `Skin Ritual Quiz` → `Concierge` → `Founder Access (visual, separate auth)` → `Global header/footer evaluation`.

Rationale for changes vs the design handoff: the handoff put **Founder Access and Homepage at P0**. This plan **removes Founder Access from early migration** (protected; visual-only later) and **leads with `/our-story`** (contained, founder-voice, no functional dependencies, trivial rollback) to prove the system before touching the high-traffic homepage.

---

## Matrix

### 1. `/our-story` — **PRIMARY PILOT**
- **Priority:** P0 (pilot) · **Risk:** Low
- **DS coverage:** Partial (founder section pattern in `index.html`; `FounderNote` primitive)
- **Production deps:** `StoryHero.tsx` (loads **3.9 MB** raw `20251003_175927.jpg` — F-Perf-02/F-Asset-04); no forms/API
- **Proposed components:** `MaisonContainer`, `MaisonSection`, `MaisonSectionHeader`, `MaisonFounderNote`, `MaisonProse` (65ch)
- **Functional protections:** none beyond analytics page view; preserve metadata + links
- **Acceptance:** founder voice in italic serif only (serif must actually load — F-Font-01); contrast-safe eyebrow/muted tokens (F-A11y-01); **optimize hero to WebP via `next/image`** (the WIP branch already does this: 3.9 MB → 163 KB); no CLS; brand still unmistakably NFE (green anchor visible)
- **Founder approval:** **Yes** (this is the system's first proof)

### 2. one Journal article template — **FALLBACK PILOT**
- **Priority:** P0-alt · **Risk:** Low–Med (**scope to a single article page, not the shared `[slug]` template**, to contain MDX blast-radius)
- **DS coverage:** Good (`journal.html` editorial typography)
- **Production deps:** MDX pipeline (`MDX_RENDERING_ISSUE_RESOLUTION.md`); article metadata
- **Proposed components:** `MaisonProse`, `MaisonSectionHeader`, `MaisonEyebrow`, `MaisonTextLink`
- **Functional protections:** MDX rendering must be unchanged; do not alter the shared template in the pilot
- **Acceptance:** 65ch body measure; editorial typography; no punctuation-in-titles rule imposed; MDX renders identically
- **Founder approval:** Yes

### 3. `/` Homepage
- **Priority:** P1 · **Risk:** High (549 lines, multi-movement, heavy hero, primary entry)
- **DS coverage:** Good (`index.html` six-movement)
- **Production deps:** pathway modules (Quiz/Discovery/Founder Access), analytics, heavy hero imagery
- **Proposed components:** full primitive set + `MaisonProductCard`
- **Functional protections:** keep all pathway links + trackers; **preserve multiple pathways** (do not force literal "one CTA")
- **Acceptance:** one clear *primary* action per section (secondary text links allowed); optimized hero; green anchor present; no mandatory dark-last section
- **Founder approval:** Yes

### 4. `/shop` (The Atelier)
- **Priority:** P1 · **Risk:** Med
- **DS coverage:** Good (`ProductCard`)
- **Production deps:** `ShopCard`, `content/atelier/elixir-editorial.ts` (**"Pre-order" label** — F-Copy-01)
- **Proposed components:** `MaisonProductCard`, `MaisonBadge` (status as caption, not pill)
- **Functional protections:** keep product routing; **do not** make transactional
- **Acceptance:** **replace "Pre-order pathway in preparation"** with Wave 1 language; status as caption; coherent 4:5 imagery; The Atelier stays editorial, not a shop
- **Founder approval:** Yes (copy change requires approval)

### 5. `/products/face-elixir`
- **Priority:** P1 · **Risk:** Med
- **DS coverage:** Good (`face-elixir.html` dossier)
- **Production deps:** `ElixirEditorialPage`, `FaceElixirSections`, `FaceElixirFAQ`; **0-byte** `face-elixir-hero.jpg`/`-detail.jpg` (F-Asset-02); size inconsistency (F-Size-02)
- **Proposed components:** dossier layout, `MaisonAccordion` (FAQ), `MaisonProductCard`
- **Functional protections:** preserve FAQ content/anchors; do not change size copy (DDR-6)
- **Acceptance:** source correct hero/detail images (separate fix); "dossier not a discount shelf" tone retained; **do not** standardize 30/50 sizing until verified
- **Founder approval:** Yes

### 6. `/products/body-elixir`
- **Priority:** P2 · **Risk:** Med
- **DS coverage:** None (no dedicated mock — extend Face Elixir dossier pattern)
- **Production deps:** `content/products/body-elixir.ts` (**200 ml** — F-Size-01); **0-byte** hero/detail images (F-Asset-02)
- **Proposed components:** dossier pattern reused
- **Functional protections:** **do not change 200 ml** until packaging-verified (DDR-6)
- **Acceptance:** size discrepancy resolved by Vanessa *before* migration; images sourced; consistent tokens
- **Founder approval:** Yes (blocked on DDR-6)

### 7. `/journal` + `/articles/*`
- **Priority:** P2 · **Risk:** Med (MDX pipeline)
- **DS coverage:** Good (`journal.html`)
- **Production deps:** MDX; `water-vs-oil.mdx` uses **typo diagrams as labeled figures** (F-Asset-03)
- **Proposed components:** `MaisonProse`, section header, eyebrow, text link
- **Functional protections:** MDX unchanged; article metadata preserved
- **Acceptance:** 65ch measure; fix `text-nfe-ink/45` caption contrast (63 nodes — F-A11y-01); normalize hero aspect ratios (mix of 4:5, 16:9, 1:1); tune desktop image payload (3.67 MB — F-Perf-03); **verify/replace baked-in-text science diagrams** used as labeled figures in `water-vs-oil.mdx` (F-Asset-03)
- **Founder approval:** Yes

### 8. `/science` (shell only)
- **Priority:** P2 · **Risk:** High (interactive; long/dense — 25 h3 + 12 h4)
- **DS coverage:** Shell only (`science.html`); interactives are production-specific
- **Production deps:** `ScienceIntelligence`, `NFEMelanocyteMap` (uses `20251003_175948-EDIT.jpg`), tabbed intelligence, ingredient tables. Baseline: Perf 98 mobile, **A11y 92 (lowest)** — 14 contrast nodes + invalid `aria-controls="science-panel"` (F-A11y-01/02)
- **Proposed components:** shell layout/section header/eyebrow only
- **Functional protections:** **keep** all interactives and data; reskin the shell around them
- **Acceptance:** fix gold-eyebrow + `text-nfe-paper/50` contrast and the tab `aria-controls`; diagrams atmospheric/`aria-hidden` only (never labeled); interactives function identically
- **Founder approval:** Yes

### 9. `/ritual`
- **Priority:** P3 · **Risk:** Low–Med
- **DS coverage:** None
- **Production deps:** editorial; uses "skin that has lived" (F-Copy-05)
- **Proposed components:** container/section/prose/founder note
- **Acceptance:** consistent tokens; ration signature phrases
- **Founder approval:** Yes

### 10. `/discovery`
- **Priority:** P3 · **Risk:** Med (328 lines, interactive)
- **DS coverage:** None
- **Production deps:** `DiscoveryRitualTracker`, analytics
- **Proposed components:** system tokens/components around existing logic
- **Functional protections:** preserve tracker + events; reskin, don't replace
- **Founder approval:** Yes

### 11. `/skin-ritual-quiz`
- **Priority:** P3 · **Risk:** Med (interactive)
- **DS coverage:** None
- **Production deps:** `SkinRitualQuiz`, analytics
- **Functional protections:** preserve quiz logic + events
- **Founder approval:** Yes

### 12. `/concierge`
- **Priority:** P3 · **Risk:** Med–High (289 lines, form + `/api/concierge`)
- **DS coverage:** None
- **Production deps:** `ConciergeIntake`, `ConciergeTracker`, `/api/concierge`, analytics
- **Functional protections:** **reskin only**; preserve field names, payload, API, validation, events
- **Founder approval:** Yes

### 13. `/founder-access` — **VISUAL RESKIN ONLY, SEPARATE AUTHORIZATION**
- **Priority:** Last public route · **Risk:** **Highest** (protected live system)
- **DS coverage:** Style reference only (`EmailCapture` is a **style ref, not a form to port**)
- **Production deps:** `FounderAccessForm` (429 lines), `FounderAccessTracker`, `/api/founder-access`, Supabase/Beehiiv/Resend/Upstash, vessel images, anchor `#request-founder-access`
- **Functional protections:** **all** contracts in refinement-plan §7 preserved byte-for-behavior; `rounded-full`/`rounded-[1.75rem]` geometry revisited per DDR-5 (no oversized pills, but accessible touch targets)
- **Acceptance:** form submits; rate-limit 429 (not 500); Supabase/Beehiiv/Resend unchanged; Wave 1 copy; success state identical
- **Founder approval:** **Yes + explicit separate functional-work authorization** (none granted here)

### 14. Global header / footer — **EVALUATION ONLY**
- **Priority:** After system proven · **Risk:** High (site-wide)
- **DS coverage:** `NavBar` (light) — **not adopted wholesale** (DDR-4)
- **Production deps:** `Header.tsx`, `PrimaryNav.tsx`, `Footer.tsx`, skip link
- **Functional protections:** preserve skip link, landmarks, nav routes, footer links, `NEXT_PUBLIC_BUILD_SHA`
- **Acceptance:** **retain dark green header** in early phases; optional light/hybrid **controlled preview** only; fix stale "© 2025" (F-Copy-07)
- **Founder approval:** Yes (chrome change is high-visibility)

### Out of scope for v1 (no regression; legacy chrome acceptable)
`/focus-group/*` (auth portal, uploads, messages), `/privacy`, `/cookies`, `/inci`, `/learn`, `/skin-strategy`, `/community-input`, `/auth/callback`. **Acceptance:** no functional or visual regression; may retain current chrome.

---

## Cross-cutting acceptance (every migrated route)

- Route behavior, metadata, links, redirects unchanged; analytics trackers/events preserved unless separately approved.
- No banned commerce phrases (DDR-3); no anti-aging fear language; no medical claims; no unnecessary copy rewrite.
- Serif for meaning / sans for mechanics (serif must actually load — F-Font-01); body ≤ 65ch; no weight > 600 unless functionally required.
- Keyboard accessible; focus visible; reduced motion respected; **all text ≥ WCAG AA contrast** (contrast-safe gold/muted tokens — F-A11y-01); no hover scale / shadow lift; no layout shift.
- No Lighthouse regression vs the fresh local-production baseline (Perf 96–100, A11y ≥ 96, SEO 100); no new render-blocking assets; no oversized images; no accidental payment/checkout behavior; latent product-offer schema stays unwired.
