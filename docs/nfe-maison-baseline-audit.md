# NFE Maison — Baseline Audit (Phase 0)

**Status:** Draft for Vanessa's review. Documentation only — no production files modified, nothing staged, nothing committed, nothing deployed.
**Date:** 2026-07-18
**Branch:** `feature/nfe-digital-maison-upgrade`
**Commit measured:** `ed824bb` (`ed824bbe5c8fe41fb6533327621caadcaefaa6af`)
**Environment:** **Local production build** (`next build --webpack` → `next start -p 3100`), Node v22.22.0, Lighthouse 13.0.1, Playwright/Chromium 1194.
**Scope:** Measurement and reconciliation only.

> This document is the evidence base. The refinement plan, migration matrix, asset audit, and Phase 1 file plan reference findings here by tag (e.g. **F-Font-01**). This pass **replaces** the earlier draft's stale 2025-11-15 Lighthouse numbers with a fresh local production build and a real 24-shot visual capture.

---

## 0. What changed since the previous draft (corrections)

| Prior claim | Corrected finding this pass |
|-------------|-----------------------------|
| Home/Our-Story/Science LCP **14–17 s**, Perf **47–53** (stale 2025-11-15 dev-ish lab) | Fresh **local production** medians: Perf **97–100**, LCP **2.0–2.6 s mobile / ~0.55 s desktop**. The catastrophic-LCP claim is **retired**. |
| Garamond binaries "exist unused in `public/fonts/`" (licensing risk in prod) | **`public/fonts/` does not exist.** No licensed binaries ship in production. Binaries live only in the `nfe-brand-assets` repo. |
| 0-byte product images "likely broken renders on product pages" | Product pages render **0 broken images** (they use other packshots). The 0-byte files are **referenced in content `media` arrays but not rendered** — latent landmines, not live breakage. |
| `/learn` CLS 0.708 | Not re-measured this pass; the four fresh routes show **negligible CLS (< 0.0006)**. Treat the old CLS defect as **unverified/stale** until re-measured. |
| Visual capture "not performed" | **24 screenshots captured** (8 routes × 3 viewports) under `.nfe-audit/baseline-screenshots/`. |

---

## 1. Method and environment

| Dimension | How measured | Confidence |
|-----------|--------------|------------|
| Tokens / typography / palette | Direct read of `tailwind.config.js`, `src/styles/tokens.scss`, `globals.scss`, `layout.tsx` | High |
| Route / component inventory | File tree of `src/app`, `src/components` | High |
| Copy governance | `grep`/`rg` across `src/` + `content/` with contextual review; design package cross-scan | High |
| Product sizes (DDR-6) | `rg` of every `ml`/`fl oz` token in `src`, `public`, and the design package | High |
| Performance | **Fresh** Lighthouse 13.0.1, local production build on `:3100`; 3 mobile runs (median) + 1 desktop run per route | High (lab, labelled) |
| Accessibility | Lighthouse a11y category (with failing-node extraction) + code inspection | High |
| Assets | `sharp` dimension read of all `public/images`, byte sizes, canonical `nfe-brand-assets` clone diff | High |
| Visual capture | Playwright, 8 routes × {1440, 768, 390}, full-page PNG + per-route DOM audit | High |

**Baseline-source honesty:** all Lighthouse and screenshot data are **synthetic lab measurements from a local production build**, not real-user (field) data. They are directionally reliable for regression-gating but must not be presented as field performance.

Screenshots: `.nfe-audit/baseline-screenshots/` (ignored via `.git/info/exclude`; **not committed**). Raw Lighthouse JSON: `.nfe-audit/lighthouse/`. A11y extracts: `.nfe-audit/accessibility/`.

---

## 2. Route baseline

Routes confirmed present in `src/app` (all 61 build entries; audited set below). Home listed as `/` (Static). All 8 audited routes are statically prerendered (`○`).

| Route | File | Type | H1 (rendered) | Functional deps |
|-------|------|------|---------------|-----------------|
| `/` | `app/page.tsx` | Editorial, multi-movement | "For skin that has lived." | analytics; pathway modules; homepage vessel |
| `/our-story` | `app/our-story/page.tsx` | Founder editorial | "Vanessa's Story" | **3.9 MB raw hero JPG** (F-Perf-02); founder portrait |
| `/shop` (The Atelier) | `app/shop/page.tsx` | Product index | "A private product room for two complete elixirs." | status-label copy (F-Copy-01) |
| `/products/face-elixir` | `app/products/face-elixir/page.tsx` | Product dossier | "Face Elixir" | `ElixirEditorialPage`; 0-byte media refs (F-Asset-02) |
| `/products/body-elixir` | `app/products/body-elixir/page.tsx` | Product dossier | "Body Elixir" | 0-byte media refs; **200 ml** (F-Size-01) |
| `/science` | `app/(education)/science/page.tsx` | Interactive education | "Science that interprets skin, not just ingredients." | `ScienceIntelligence`, `NFEMelanocyteMap`; tab ARIA bug (F-A11y-02) |
| `/journal` | `app/journal/page.tsx` | Editorial index | "The editorial house for mature melanated skin." | 16 hero images |
| `/founder-access` | `app/founder-access/page.tsx` | **Protected** capture | "The first chapter of NFE, released with intention." | Supabase/Beehiiv/Resend/Upstash — **do not touch** |

**Redirects to preserve:** `/subscribe → /founder-access` (intentional per Wave 1 sheet), `/founders-access → /founder-access`.

**Layout integrity (all 8 routes × 3 viewports):** horizontal overflow **0 px everywhere**; exactly **one `<h1>` per page**; **0 broken images**; **0 console errors**; **0 page errors**; **0 empty/`#` links**; **every `<img>` has an `alt` attribute**. This is a strong structural baseline to protect.

---

## 3. Typography baseline

**Roles today**
- Serif token: `--font-primary: "Garamond Premier Pro", Georgia, serif` (`tokens.scss:14`).
- Sans: **Inter** via `next/font/google`, applied to `<body>` (`layout.tsx:2,10`). `--font-ui` is a system-UI stack (`tokens.scss:15`).

**Findings**
- **F-Font-01 (HIGH) — the canonical serif is not actually delivered.** There is **no `@font-face` and no `next/font/local`** anywhere in `src`. `public/fonts/` **does not exist**. Therefore every `font-primary`/serif heading resolves to the **Georgia** fallback for essentially all visitors (Garamond renders only on a machine with the font OS-installed, e.g. the developer's). The "current serif" baseline for real visitors is **Georgia, not Garamond**. Phase 1 font loading is a **correction**, not a cosmetic migration.
- **F-Font-02 (MEDIUM, licensing — future) — no licensed binary ships in production today.** The Garamond Premier Pro files (`.otf` 428 KB, `.woff` 273 KB, `.woff2` 207 KB) exist **only** in `nfe-brand-assets` (`assets/fonts/`), marked "licensed, NFE use only; verify before redistribution." Self-hosting them via `next/font/local` in Phase 1 **requires Vanessa to confirm the web-embedding license scope first.** Nothing to remediate in production now; this gates the Phase 1 serif fix.
- **F-Font-03 (LOW) — font measured payload.** Fonts delivered per route ≈ **48.7 KB** (Inter subset, self-hosted by Next). Consistent across all four routes — reasonable; no bloat.
- **DDR-2 posture:** Garamond canonical; **retain Inter** for now; Figtree deferred pending a controlled specimen; **no Cormorant Garamond** in production.

---

## 4. Palette baseline

**Production tokens** (`tokens.scss`, `tailwind.config.js`):

| Token | Value | Role |
|-------|-------|------|
| `--nfe-green` | `#103B2A` | Brand anchor — header, primary |
| `--nfe-green-900` | `#0b291e` | Footer / dark ground |
| `--nfe-gold` | `#C6A664` | Accent, focus ring, eyebrows |
| `--nfe-ink` | `#111111` | Body text |
| `--nfe-paper` | `#FAFAF8` | Page background |
| `--nfe-muted` | `#6B6B6B` | Secondary text |

**Reconciliation → DDR-1 (Hybrid).** Deep NFE green **stays** the signature anchor; warm cream/bone/parchment/ivory become the editorial field; restrained gold + oxidized bronze are disciplined accents. The design package's "bronze is the single accent / green demoted / 90% neutral / always end dark" rules are **rejected as universal**.

**Palette-driven accessibility risk (see §8):** the current **gold `#C6A664`** and **low-opacity muted text** already fail WCAG AA contrast at small sizes. The hybrid palette work in Phase 1+ **must fix contrast tokens**, not just add warm neutrals — otherwise the warm-on-warm field will make contrast worse.

---

## 5. Spacing / layout baseline — token-collision risk

- **F-Spacing-01 (HIGH, migration-blocking).** Both systems define `--space-1 … --space-N` with **different base units**: production `tokens.scss` = **4 px base**; design package `spacing.css` = **8 px base**. Naive adoption of the design tokens would **double every spacing value sitewide**. **Phase 1 must namespace design tokens (`--maison-*`) and never overwrite the existing `--space-*` scale.**
- Container: production `.container` maxes ~**1280 px**; design proposes fixed **1140 px**. Adopt the *discipline*, final width per review (ADAPT).
- Motion: production `--motion-fast/base/slow` = 120/180/240 ms; `prefers-reduced-motion` already honored globally (`globals.scss:59`). Existing strength.

---

## 6. Component inconsistency inventory

| Area | Observation | Evidence |
|------|-------------|----------|
| Buttons / geometry | Founder Access CTA is `rounded-full` (pill); cards very rounded | `founder-access/page.tsx` |
| Color literals | Hard-coded hexes (`text-[#0F2C1C]`, `#efe4d5`, taupe/paper opacities) instead of tokens | `FaceElixirSections.tsx`, `ScienceTab.tsx` |
| Eyebrow labels | `text-xs uppercase tracking-[0.25em] text-nfe-gold` pattern recurs and **fails contrast** | home, science (F-A11y-01) |
| Muted labels | `text-nfe-ink/45`, `text-nfe-paper/50` low-opacity captions **fail contrast** | journal, science (F-A11y-01) |
| Section rhythm | Per-page ad-hoc `py-*`; no shared section primitive | multiple pages |
| Product cards | No single card component; modules diverge | §2 |

This is the strongest **ADOPT** cluster: consistency primitives (`MaisonContainer`, `MaisonSection`, section header, product card, founder note, accordion) plus **tokenized, contrast-safe** eyebrow/muted styles.

---

## 7. Performance baseline (FRESH — local production, mobile median of 3 + desktop single)

Lighthouse 13.0.1, local production build @ `ed824bb`, `http://localhost:3100`. Mobile = 3-run median (Moto-G4 emulation, 4× CPU, Slow-4G-class). Desktop = single run.

### Mobile (median of 3 runs)

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT | Speed Index |
|-------|-----:|-----:|---:|----:|----:|----:|----:|------------:|
| `/` | 97 | 96 | 100 | 100 | 2559 ms | 0.0015 | 66 ms | 1210 ms |
| `/founder-access` | 99 | 100 | 100 | 100 | 1961 ms | 0.0001 | 112 ms | 1211 ms |
| `/science` | 98 | 92 | 100 | 100 | 2016 ms | 0.0001 | 149 ms | 1212 ms |
| `/journal` | 98 | 96 | 100 | 100 | 2011 ms | 0.0005 | 132 ms | 1211 ms |

### Desktop (single run)

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|-------|-----:|-----:|---:|----:|----:|----:|----:|
| `/` | 100 | 96 | 100 | 100 | 562 ms | 0.0036 | 10 ms |
| `/founder-access` | 100 | 100 | 100 | 100 | 564 ms | 0.0001 | 0 ms |
| `/science` | 100 | 92 | 100 | 100 | 551 ms | 0.0004 | 0 ms |
| `/journal` | 100 | 96 | 100 | 100 | 596 ms | 0.0001 | 7 ms |

### Payloads (per route)

| Route | Total | Script | Font | Image (mobile / desktop) | Unused JS |
|-------|------:|-------:|-----:|--------------------------|----------:|
| `/` | ~485 KB | 209 KB | 48.7 KB | 156 KB / 29 KB | ~0 |
| `/founder-access` | ~316 KB | 203 KB | 48.7 KB | 0 / 57 KB | ~0.15 KB |
| `/science` | ~312 KB | 199 KB | 48.7 KB | 0 / 0 | 0 |
| `/journal` | ~323 KB (mobile) | 199 KB | 48.7 KB | **0 mobile / 3.67 MB desktop** | ~0.05 KB |

**Findings**
- **F-Perf-01 (STRENGTH) — performance is strong on measured routes.** All four routes: Perf 96–100, SEO 100, CLS negligible, no render-blocking flagged, ~0 unused JS. This is an excellent baseline to protect; the migration must not regress it.
- **F-Perf-02 (MEDIUM) — `/our-story` still ships a 3.9 MB raw hero.** `/images/products/20251003_175927.jpg` (2992×2992, 3.87 MB raw) is the current feature-branch Our-Story/StoryHero hero (`our-story/page.tsx:75`, `StoryHero.tsx:12`). `/our-story` was **not** in the Lighthouse-4 set, so its LCP is not directly measured this pass, but the raw hero is a real latent LCP risk. The WIP branch already replaces it with `founder-hero.webp` (163 KB) — evidence the pilot fixes a genuine defect.
- **F-Perf-03 (MEDIUM) — Journal desktop image payload 3.67 MB.** Desktop `/journal` pulls **3.67 MB of images** (16 editorial heroes; some 4:5 at 130–146 KB, but the desktop grid fetches all). Mobile fetched 0 (lazy/offscreen). Candidate for `sizes`/priority tuning and consistent hero ratios.
- **F-Perf-04 (MEDIUM, hygiene) — ~26.6 MB of raw product JPEGs in `public/images/products/`.** Eight 2992×2992 files; several appear unreferenced (deploy bloat). Do not import more heavy JPGs from the design package.

---

## 8. Accessibility baseline (FRESH)

**Automated (Lighthouse a11y, failing nodes extracted):**

| Route | A11y | Failing audits (nodes) |
|-------|-----:|------------------------|
| `/` | 96 | `color-contrast` (4) |
| `/founder-access` | 100 | none |
| `/science` | 92 | `color-contrast` (14), `aria-valid-attr-value` (1) |
| `/journal` | 96 | `color-contrast` (63) |

- **F-A11y-01 (HIGH, systemic) — color contrast is the dominant failure and it is token-level, not per-page.** Concrete offenders:
  - **Gold eyebrow** `text-nfe-gold` `#C6A664` on light grounds (`#FAFAF8`/`#FFFFFF`) → **2.2–2.3:1** (needs 4.5). Pattern: `text-xs uppercase tracking-[0.25em] text-nfe-gold`. Home, Science.
  - **Muted body** `text-nfe-muted` `#6B6B6B` on parchment `#EFE4D5` → **4.24:1** (just under AA). Home.
  - **Low-opacity captions** `text-nfe-ink/45` `#939393` on near-white → **3.04:1**. Journal (63 nodes — repeated across article cards).
  - **`text-nfe-paper/50`** `#899791` on dark green `#173329` → **4.47:1**. Science dark sections.
  - Implication for DDR-1: the hybrid palette **must define contrast-safe gold/muted tokens** (darker gold or larger/bolder eyebrow, min 4.5:1 muted) as part of the token bridge.
- **F-A11y-02 (MEDIUM) — invalid `aria-controls` on Science tabs.** A `<button role="tab" aria-controls="science-panel">` references a panel that is not in the a11y tree at initial paint (the `#science-panel` `<section>` in `ScienceTab.tsx:83` mounts after tab interaction). Fix during foundation-components work; not a Phase 0 blocker.

**Manual / structural (code-verified strengths to protect):**
- Skip link present (`SkipLinkHandler`, `globals.scss`, target `#main-content`).
- `:focus-visible` outline global; `prefers-reduced-motion` honored global (`globals.scss:59`).
- `Modal` uses dialog semantics (`role="dialog"`, `aria-modal`, Escape) — reusable for accessible overlays.
- Every audited image carries `alt` (0 missing across 24 captures); one `<h1>` per page; semantic landmarks present.
- **Icon posture:** keep functional glyphs (menu/close/disclosure/validation/password-visibility); flag only decorative proliferation. "No icons under any circumstances" is **rejected as universal**.

---

## 9. Visual findings (from 24 captures)

- **No horizontal overflow** at 1440/768/390 on any of the 8 routes — the responsive baseline is sound.
- **Heading punctuation pattern:** most hero H1s end with a period ("For skin that has lived.", "Science that interprets skin…", "The editorial house…", "A private product room…", "…released with intention."). Editorial voice, not a defect; the design package's "no terminal punctuation" is **guidance, not a rule** (DDR).
- **Science is very long and dense:** 25 `<h3>` + 12 `<h4>`; mobile document height ~17,500 px. Reskin the shell only; protect interactives.
- **Journal hero ratios inconsistent** (mostly 4:5, but two 16:9 and one 1:1) → uneven card crops (see asset audit).
- **Our-Story** currently uses a raw 3.9 MB hero; visually fine but heavy.
- **CTA hierarchy:** product pages carry the most interactive controls (11–14 buttons) — watch for competing CTAs during migration; home keeps a restrained 2.

---

## 10. Product-fact / size findings (DDR-6) — report only, do not change

| Product | Where | Value in production | Conflict |
|---------|-------|---------------------|----------|
| **Body Elixir** | `content/products/body-elixir.ts:125` (`volume`) | **`200ml / 6.8 fl oz`** (public) | **CONFLICT** vs design package "125 ml / 75 ml per packaging" |
| Body Elixir | `content/products/body-elixir.ts:121` (FAQ) | "One bottle (200ml) lasts ~2–3 months" (public) | same |
| Face Elixir | `content/products/face-elixir.ts:181` | `30ml / 1 fl oz` | canonical field lists only 30 ml |
| Face Elixir | `FaceElixirFAQ.tsx:38`, `FaceElixirSections.tsx:44–57` | "30 ml **or 50 ml** bottle" | two SKUs implied; longevity numbers differ |

- **F-Size-01 (HIGH, unresolved founder decision):** production shows **Body Elixir 200 ml**; the design package claims **125 ml / 75 ml "per packaging"** while its own audit says 200 ml. This is a **material product-fact conflict**. Per source-of-truth order, **packaging identity outranks page copy**, but the true size must be **confirmed against physical packaging / the fill label by Vanessa** — **not** silently reconciled. Report only.
- **F-Size-02 (MEDIUM):** Face Elixir internal inconsistency (30 ml field vs 30/50 FAQ).
- No Body Elixir size appears in image text, metadata, or public pricing. Recommended canonical source: physical packaging + regulatory label.

---

## 11. Copy-governance findings (report only)

| Tag | Phrase | Location | Classification |
|-----|--------|----------|----------------|
| **F-Copy-01 (HIGH)** | "**Pre-order** pathway in preparation" | `content/atelier/elixir-editorial.ts:19`, `shop/page.tsx:94` | **Banned term** (DDR-3). Replace with Founder Access / release-wave language. Still live. |
| F-Copy-01b (allowed) | "**Pre-Commerce**", "pre-commerce by design" | `shop/page.tsx:11,184`, `page.tsx:340`, `ElixirEditorialPage.tsx:243` | Framing, not a transactional term — **allowed** (allowlist), but review tone. |
| F-Copy-02 (allowed) | "well-aging, not **anti-aging**" | founder-access / pillars | **Allowlisted contrastive** — must **not** be flagged by a naive scanner. |
| F-Copy-03 (allowed) | "not a **discount** shelf" / "without discounting" | home, `ElixirEditorialPage` | Contextual/anti-discount — **allowed**. |
| F-Copy-04 (allowed) | "drag and **drop**", drop zone | `FileUpload.tsx` | Functional UI — **allowed** false positive. |
| F-Copy-05 (allowed) | "price-led urgency or mass-market promotional offers" | `discovery/page.tsx:65` | Negative "who this is NOT for" framing — **allowed**. |
| **F-Copy-06 (MEDIUM)** | Medical-safe "treat/cure/prevent" | disclaimers across articles/journal/science/concierge | **Correctly used** — this is exactly why a naive CI blocker is wrong; allowlist the disclaimer sentence. |
| **F-Copy-07 (LOW)** | "**© 2025** NFE Beauty" | `Footer.tsx:32` | Stale year (2026). Minor editorial fix. |
| F-Copy-08 (clean) | "Opening 2026" | 0 occurrences in production | Good — discouraged hardcoded badge absent. Keep it out. |
| F-Copy-09 (strength) | "melanated" / mature-melanated framing | pervasive | Core positioning explicit — a strength. |

**Latent commerce exposure (report only):** `price` fields exist in product content (Body 79, Face 89) and `buildProductSchema` (`src/lib/seo/schema.ts`) can emit `offers{price, availability:'InStock'}` — **but** `generatePageSchemas`/`renderSchemasAsJSONLD` are **not wired into any page**, so **no public price or availability is exposed** today (visual or JSON-LD). Do **not** wire product offers/`InStock` before commerce is authorized.

---

## 12. Functional-risk notes

- **Founder Access** is protected and consistent with the closeout report (form, tracker, vessel images, anchor `#request-founder-access`, `/api/founder-access`). **Not touched; never the first pilot.** 6 legitimate unpushed Founder Access commits remain intact on the branch.
- **Analytics** GA4, consent-gated, custom `nfe.*` events + per-route trackers — preserve mounts and event names on any reskin.
- **Interactive/education** surfaces (`ScienceIntelligence`, `NFEMelanocyteMap`, quiz, discovery, concierge) are real logic — reskin, never replace.
- **MDX pipeline** for `/articles/*` is sensitive — treat the shared template as higher blast-radius; pilot a single article, not the template.

---

## 13. Highest-risk migration areas

1. **Homepage** — multi-movement, heavy hero, most brand-visible.
2. **Science** — interactive; long/dense; has the a11y contrast + ARIA issues; reskin shell only.
3. **Founder Access** — protected; visual-only, separate authorization.
4. **Article template** (`articles/[slug]`) — MDX sensitivity; pilot one article, not the template.
5. **Concierge / Discovery / Quiz** — real forms/logic + analytics; reskin, never replace.

---

## 14. Unresolved questions (for Vanessa)

1. **DDR-6 / F-Size-01:** confirm Body Elixir true size (200 ml vs 125 ml/75 ml) against physical packaging; confirm Face Elixir 30 vs 30/50 SKU story.
2. **F-Font-01/02:** should headings render Garamond (requires Phase 1 self-hosting via `next/font/local`) — and does the license permit web embedding? Until then, real visitors see Georgia.
3. **DDR-2:** approve an Inter-vs-Figtree specimen before any sans change.
4. **F-A11y-01:** approve contrast-safe gold/muted token values as part of the Phase 1 token bridge.
5. **F-Copy-01:** approve replacing "Pre-order pathway in preparation" with release-wave language (editorial, Phase 1+).
6. **F-Asset-02:** approve sourcing/removing the four 0-byte product media entries (separate from this initiative).
