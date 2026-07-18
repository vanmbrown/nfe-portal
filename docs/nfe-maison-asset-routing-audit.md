# NFE Maison — Asset Routing Audit (Phase 0)

**Status:** Draft for Vanessa's review. Documentation only — no assets copied, moved, deleted, or optimized in Phase 0.
**Date:** 2026-07-18
**Branch/commit:** `feature/nfe-digital-maison-upgrade` @ `ed824bb`
**Sources compared (canonical comparison COMPLETED this pass):**
- Production `public/images/` (dimensions read via `sharp`).
- Canonical `nfe-brand-assets` — **cloned read-only** into `.nfe-audit/vendor/nfe-brand-assets` (@ `main`, MANIFEST generated 2026-07-12). Not modified, not committed, not pushed.
- Design package `design_handoff_nfe_system/assets/` (partial reference copy).

**Ground rules honored:** do **not** bulk-copy design-package assets into production; flag baked-in-text science diagrams; licensed fonts not copied/redistributed.

---

## 1. Headline findings

| Tag | Severity | Finding |
|-----|----------|---------|
| **F-Asset-01 (routing)** | PASS | Homepage vessel, Founder's Edition vessel, and founder portrait are correctly isolated to their intended routes (§2). No cross-contamination. |
| **F-Asset-02** | HIGH (latent) | 4 **0-byte** product images are referenced in content `media` arrays but **not currently rendered** (product pages show 0 broken images). Landmines if a component consumes `product.media`. |
| **F-Asset-03** | MEDIUM (brand) | Two science diagrams with baked-in text are rendered as **labeled** figures in `water-vs-oil.mdx`. Verify spelling; keep atmospheric/`aria-hidden` pending corrected art. |
| **F-Asset-04** | MEDIUM (perf/hygiene) | ~**26.6 MB** of raw 2992×2992 product JPGs in `public/images/products/`; two referenced (Our-Story hero 3.9 MB; melanocyte underlay), rest largely orphaned. |
| **F-Asset-05** | LOW (visual) | Journal hero aspect ratios inconsistent (mostly 4:5, but two 16:9 and one 1:1) → uneven card crops. |
| **F-Asset-06** | LOW | Legacy/duplicate packshot naming diverges from canonical (`radiant-body-elixir*.png` vs `body-elixir-packshot*.png`). |
| **F-Font (licensing)** | INFO | No licensed font ships in production (`public/fonts/` does not exist). Binaries exist only in `nfe-brand-assets`. See F-Font-02 in baseline. |

**Correction vs prior draft:** the earlier "4 broken product renders" and "14–17 s LCP from heavy JPGs" claims are **retired** — product pages render 0 broken images and measured routes score Perf 96–100. The heavy raw JPGs remain a hygiene/latent risk, not a live LCP catastrophe.

---

## 2. Routing verification (canonical ↔ production) — PASS

| Canonical intent | Production path | Dimensions | Format | AR | Referenced by | Restriction | Verdict |
|------------------|-----------------|-----------|--------|----|---------------|-------------|---------|
| Home hero vessel (desktop) | `homepage/nfe-home-hero-product-vessel-desktop.webp` | 3600×2547 (684 KB) | webp | 1.41 | `page.tsx:144` (+ article fallback hero) | Home only | PASS |
| Home hero vessel (mobile) | `homepage/nfe-home-hero-product-vessel-mobile.webp` | 2000×2827 (510 KB) | webp | 0.71 | `page.tsx:153` | Home only | PASS |
| **Founder's Edition vessel (desktop)** | `founder-access/nfe-founder-access-founder-edition-vessel-desktop.webp` | 1024×1536 (138 KB) | webp | 0.67 | `founder-access/page.tsx:29` | **`/founder-access` only** | PASS — restricted |
| **Founder's Edition vessel (mobile)** | `founder-access/nfe-founder-access-founder-edition-vessel-mobile.webp` | 768×1152 (83 KB) | webp | 0.67 | `founder-access/page.tsx:31` | **`/founder-access` only** | PASS — restricted |
| Founder portrait | `founder/vanessa-founder-portrait.webp` | 666×841 (106 KB) | webp | 0.79 | home `page.tsx:222`, our-story | Founder editorial; not a packshot | PASS (canonical name differs: `vanessa-mccaleb-founder-portrait.webp`) |

**Explicit verifications:**
- Founder's Edition vessel imagery **remains restricted to `/founder-access`** — no other route references it. PASS.
- Homepage vessel is **separate** from the Founder's Edition vessel. PASS.
- Founder portrait is **not** presented as a product packshot; it renders in founder-editorial context. PASS.
- No **outdoor portrait** is presented as a product packshot in production.
- **Licensed fonts are not copied or redistributed** in production (none present).

---

## 3. Product packshots & heroes (optimize later; report only)

| Production path | Dimensions | Format | Referenced by | Note |
|-----------------|-----------|--------|---------------|------|
| `products/1080_PNG_03.png` | 1080×1080 (53 KB) | png | `ProductHero.tsx`, `FaceElixirHero.tsx` | Face Elixir hero (in use) |
| `products/NFE_face_elixir_30_50_proportions_fixed.png` | 1024×1024 (936 KB) | png | (verify) | Heavy; likely legacy dup |
| `products/radiant-body-elixir-white.png` | 1024×1024 (407 KB) | png | `body-elixir/page.tsx:20`, `shop/page.tsx:82` | Body packshot (in use) |
| `products/radiant-body-elixir.png` | 1024×1024 (479 KB) | png | (unreferenced) | Duplicate |
| `products/20251003_175927.jpg` | 2992×2992 (3.9 MB) | jpeg | `our-story/page.tsx:75`, `StoryHero.tsx:12` | **Our-Story hero — F-Perf-02**; WIP branch replaces with 163 KB webp |
| `products/20251003_175948-EDIT.jpg` | 2992×2992 (349 KB) | jpeg | `NFEMelanocyteMap.tsx:113,316` | Histology underlay (atmospheric) |
| `products/20251003_1747{24,04,22,37,52}.jpg`, `..._175927/175948.jpg` | 2992×2992, 3.5–4.1 MB ea | jpeg | mostly unreferenced | **Orphaned raw originals — ~20 MB deploy bloat** |

**Canonical equivalents** (in `nfe-brand-assets`, NOT in production): `products/face-elixir/face-elixir-packshot-proportions-fixed.png` (959 KB), `face-elixir-packshot-1080.png` (54 KB), `body-elixir/body-elixir-packshot-white.png` (417 KB), `body-elixir-packshot.png` (490 KB), plus 5 face-elixir lifestyle JPGs (3.8–4.2 MB ea) and 2 science references. Production uses **its own copies with legacy names** — reconcile naming and confirm production copies are current vs canonical during migration.

---

## 4. 0-byte product media (F-Asset-02 — latent)

| File | Size | Referenced by | Rendered? |
|------|-----:|---------------|-----------|
| `products/face-elixir-hero.jpg` | **0 bytes** | `content/products/face-elixir.ts:74` (media array) | **No** — page renders `1080_PNG_03.png` |
| `products/face-elixir-detail.jpg` | **0 bytes** | `content/products/face-elixir.ts:80` | No |
| `products/body-elixir-hero.jpg` | **0 bytes** | `content/products/body-elixir.ts:18` | No |
| `products/body-elixir-detail.jpg` | **0 bytes** | `content/products/body-elixir.ts:24` | No |

**Correction:** these do **not** currently break the product pages (measured 0 broken images). But any future component that iterates `product.media` will render four broken images. **Action (separate from this initiative):** source correct art or remove the media entries. Report only in Phase 0.

---

## 5. Journal hero imagery

8 WebP heroes under `public/images/journal/the-new-language-of-well-aging/` (70–143 KB each). **Aspect-ratio inconsistency (F-Asset-05):** `body-care-prestige-gap`, `calm-is-part-of-science`, `glow-barrier-story`, `mature-skin-makeup-needs`, `sensuality-gap-skincare` = **4:5** (0.80); `dark-spots-inflammation-story`, `well-aging-not-disappearing` = **16:9** (1.78); `mature-skin-underbuilt` = **1:1**; `shaving-barrier-event` = 2:3 (0.67). Normalize to a consistent card ratio during the Journal migration. Desktop `/journal` fetches **3.67 MB** of images (F-Perf-03) — tune `sizes`/priority.

Canonical stores the same set (9, incl. an extra) under `journal/site-webp/…`. Production path is source of truth; do not re-path.

---

## 6. Science diagrams — baked-in-text flag (F-Asset-03)

| File | Dimensions | Referenced by | Current use | Required treatment |
|------|-----------|---------------|-------------|--------------------|
| `science/hydration-moisture.png` | 1536×1024 (1.77 MB) | `content/articles/water-vs-oil.mdx:38` | `![Hydration vs Moisture Diagram]` — **labeled figure** | Verify baked-in text; keep atmospheric/`aria-hidden` until spelling QA'd. Do not treat as authoritative instructional diagram. |
| `science/emulsion-synergy.png` | 1536×1024 (1.81 MB) | `content/articles/water-vs-oil.mdx:103` | `![Emulsion Synergy Diagram]` — **labeled figure** | Same |

The `/science` route renders **0 images** (interactive components), so the spelling risk is contained to this one MDX article. Canonical `nfe-brand-assets` includes `science/emulsion-synergy-diagram.png` and `hydration-moisture-diagram.png` (the flagged set). Editorial fix during Journal/Science migration, not Phase 0.

---

## 7. Fonts

- **No `public/fonts/` directory exists in production.** No licensed binary is served or fetchable from production today.
- Canonical `nfe-brand-assets/assets/fonts/`: `garamond-premier-pro.otf` (428 KB), `.woff` (273 KB), `.woff2` (207 KB), marked "licensed, NFE use only; verify before redistribution."
- Production declares `--font-primary: "Garamond Premier Pro", Georgia, serif` but loads **no** `@font-face`/`next/font/local` → renders **Georgia** for real visitors (F-Font-01).
- **Phase 1 (license-gated):** subset the `.woff2` and load via `next/font/local`; confirm the web-embedding license first (F-Font-02); never expose raw binaries at a predictable public path.

---

## 8. Logos & wordmark

- Canonical `logo/nfe-publication-logo{,-128,-512,-32}.png` (gold-drop mark on deep green) — favicon/avatar scale only, not page headers.
- Production has **no logo image** in the header; the header wordmark is **typographic "NFE"** — consistent with "no SVG logo; typographic wordmark." PASS. Confirm favicon source separately.
- Canonical README notes JSON-LD references `/images/logo/nfe_logo.png`, which is **not present** in the deployed set — verify the org-schema logo path resolves (minor SEO check).

---

## 9. Confidential / internal-only content check

- No customer data, API keys, handoff documents, or formula percentages are present in `public/images` or the cloned canonical repo's asset set (per its README exclusions).
- Founder portrait and vessel imagery are brand-appropriate for public use. No internal-only imagery is routed to public pages.

---

## 10. Duplicate / outdated / optimization summary

- **Duplicates:** `radiant-body-elixir.png` (unref) vs `-white.png` (in use); `NFE_face_elixir_30_50_proportions_fixed.png` (heavy, likely legacy) vs `1080_PNG_03.png` (in use).
- **Orphaned/unoptimized:** ~6 of the eight `20251003_*.jpg` raw originals appear unreferenced (~20 MB); the 2 referenced ones (Our-Story hero, melanocyte underlay) need optimized derivatives.
- **Missing optimized versions:** product PNGs (407–936 KB) lack WebP/AVIF.
- **Latent broken:** four 0-byte media entries (F-Asset-02).

**Phase-0 posture:** report only. Remediation (optimize, dedupe, remove orphans/0-byte, single naming convention, canonical sync) happens per-route during migration — **never** by bulk-copying the design package's heavy JPGs. The canonical clone remains under `.nfe-audit/vendor/` (ignored, not committed) for reference during Phase 1.
