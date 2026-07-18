# NFE Maison — Phase 1 Proposed File Plan (Token Bridge)

**Status:** Draft for Vanessa's review. **NO-CODE GATE — none of these files are created or modified in Phase 0.** This is a plan for the *future* token-foundation phase, to be executed only after Phase 0 + DDR approval.
**Date:** 2026-07-18
**Branch/commit context:** `feature/nfe-digital-maison-upgrade` @ `ed824bb`
**Goal of Phase 1:** establish a token bridge (incl. contrast-safe gold/muted tokens), correct serif loading, and stand up an advisory copy-governance module **without triggering any uncontrolled visual change**. The guiding rule: **first-pass tokens are aliases mapped to current approved live values**, so Phase 1 is visually inert (except the single, gated, corrective serif-loading change).

## Phase 1 hard boundaries (explicit)

- **No page reskin** — no `src/app/**` route page changes.
- **No Founder Access change** — no file under `app/founder-access/*`, `components/founder-access/*`, `api/founder-access/*`, Beehiiv/Resend/Upstash/Supabase.
- **No header replacement / no footer replacement** — chrome is a Phase 6 evaluation.
- **No font migration** — the sans stays Inter; Figtree deferred. (The serif-loading fix in 2.4 is a *correction*, not a sans migration, and is itself gated on license + sign-off.)
- **No commerce work** — no Shopify/pricing/cart/checkout/invoice/offer wiring; the latent `buildProductSchema` stays unwired.
- **Legacy aliases map to current approved live values first** — zero visual change from the token bridge itself.
- **No uncontrolled sitewide visual change.**
- **No deploy without Vanessa's approval.**
- The **`wip/our-story-maison`** branch (`9b81f72`) may be referenced as research showing likely token/pilot implications; it is **not** approved implementation code.

---

## 1. No-code gate

Nothing in this document is implemented during Phase 0. Execution requires: (a) Vanessa's approval of the Phase 0 deliverables + DDR; (b) confirmation of the font-license posture (F-Font-02); (c) a fresh Lighthouse baseline against a current preview build. Each file below is created on its own branch/PR with the rollback noted.

---

## 2. Proposed files

### 2.1 `src/styles/nfe-tokens.css` — **NEW**
- **Purpose:** single source of truth for `--nfe-*` / `--maison-*` design variables (hybrid palette, type scale, spacing, motion), **namespaced** to avoid collisions.
- **Expected change:** new file; **initial values alias the current live tokens** (green `#103B2A`, gold `#C6A664`, paper `#FAFAF8`, ink, muted) plus additive warm-neutral tokens (cream/bone/parchment/ivory/espresso/umber/taupe/bronze per DDR-1) that are **not yet applied** to any component. Also define **contrast-safe variants** for the two systemic F-A11y-01 offenders: a darker "gold-on-light" token (≥ 4.5:1 for small eyebrow text) and a muted token ≥ 4.5:1 — used later, not applied in Phase 1.
- **Visual impact:** **None** if imported but unreferenced by components (tokens defined, not consumed).
- **Functional risk / Founder Access impact:** None (no component consumes them; Founder Access untouched).
- **Sitewide impact:** None until consumed in Phase 2+.
- **Risk:** Low. **Critical constraint:** must **not** redefine the existing `--space-1…12` scale (production is 4px-base; design is 8px-base — F-Spacing-01). Use `--maison-space-*` / `--nfe-space-*` names only.
- **Rollback:** delete the file + its import.
- **Founder sign-off:** Yes (token specimen review, incl. contrast pairs).

### 2.2 `src/styles/tokens.scss` — **MODIFY (aliases only)**
- **Purpose:** keep existing tokens as the live source; add **legacy alias comments/mappings** pointing to new namespaced tokens during transition.
- **Expected change:** additive only; **no existing value changed**; existing `--space-*`, `--nfe-green`, `--nfe-gold`, `--focus-ring` untouched.
- **Visual impact:** **None**.
- **Risk:** Low. Regression only if an existing value is edited — which this plan forbids in Phase 1.
- **Rollback:** revert the additive block.
- **Founder sign-off:** No (no visual change) — but include in the token specimen PR.

### 2.3 `tailwind.config.js` — **MODIFY (extend, non-breaking)**
- **Purpose:** bridge new tokens into Tailwind (`colors`, `maxWidth.maison`, `spacing.section`) **as new utilities**, referencing CSS vars.
- **Expected change:** `theme.extend` additions only; **do not rename or remove** existing `nfe-green*`, `nfe-gold*`, `nfe-ink`, `nfe-paper`, `nfe-muted`, `font-primary`, `font-ui`.
- **Visual impact:** **None** until new utilities are used in components (Phase 2+).
- **Risk:** Low–Med (config typo could break the build) → verify `next build` + a Tailwind class smoke test.
- **Rollback:** revert the `extend` additions.
- **Founder sign-off:** No.

### 2.4 `src/app/layout.tsx` — **MODIFY (serif loading fix — F-Font-01)**
- **Purpose:** actually load Garamond Premier Pro via `next/font/local` (subset woff2), bind to `--font-serif`; **keep Inter** as the sans (DDR-2, phase-1 retain current sans).
- **Expected change:** add a `localFont` import + variable; apply the serif variable to `<html>`/`<body>`; **do not** change the sans.
- **Visual impact:** **Yes, intentional and corrective** — headings that currently fall back to Georgia for real visitors will render Garamond. This is the one deliberate visual change in Phase 1 and **requires founder sign-off + a before/after check** on machines *without* the font installed.
- **Risk:** Med — font payload affects Lighthouse (F-Perf); mitigate with subsetting + `display: swap` + preload audit. **Gated on F-Font-02 license confirmation.**
- **Rollback:** revert the import + variable binding (returns to Georgia fallback).
- **Founder sign-off:** **Yes.**

### 2.5 `src/lib/copy-governance.ts` — **NEW (advisory only)**
- **Purpose:** encode the DDR-3 review list + **contextual allowlist** for editorial review support — **not** a CI blocker (DDR-3).
- **Expected change:** export `REVIEW_PHRASES` (preorder/pre-order, sale, discount, donation, sample, drop, clearance, shop now, limited-time offer, countdown, anti-aging), `APPROVED_LANGUAGE` (Founder Access, Founder's Edition, private allocation, release wave, invitation, reserved invitation, small batch, early release), and `CONTEXTUAL_ALLOWLIST` (e.g. "well-aging, not anti-aging"; "not a discount shelf"; "without discounting"; "drag and drop") so approved usages are **not** false-flagged. Optionally a scan helper for editorial review.
- **Visual impact:** **None** (no UI).
- **Risk:** Low. **Do not** wire into CI as a failing gate in Phase 1 (advisory report only).
- **Rollback:** delete the file.
- **Founder sign-off:** Review the phrase lists; no visual sign-off.

### 2.6 `docs/nfe-maison-token-map.md` — **NEW (doc)**
- **Purpose:** explicit mapping table: legacy token → new token → live value → adoption status, plus documented contrast pairs.
- **Visual impact:** None (doc). **Risk:** None. **Rollback:** delete. **Sign-off:** informational.

### 2.7 `docs/nfe-maison-accessibility-baseline.md` — **NEW (doc)**
- **Purpose:** formal a11y baseline + acceptance checklist carried from `nfe-maison-baseline-audit.md` §8 (skip link, focus, reduced-motion, contrast pairs, keyboard, mobile nav) for per-route regression testing.
- **Visual impact:** None. **Risk:** None. **Rollback:** delete. **Sign-off:** informational.

### 2.8 `docs/nfe-maison-page-migration-matrix.md` — **ALREADY DRAFTED (Phase 0)**
- Present in this deliverable set. Phase 1 keeps it current; no code impact.

---

## 3. Specimen / verification artifacts (Phase 1 exit)

- **Token specimen page** (Storybook/Ladle **or** a throwaway static HTML under an ignored dir) showing every color + type step + contrast pair — **not** a production route.
- **Inter-vs-Figtree specimen plan** (see §5) — plan only unless Vanessa separately authorizes building it.

**Phase 1 exit criteria:** token specimen approved; documented contrast pairs (Espresso/Umber on Bone/Ivory; text on green; gold/bronze on light); **zero new raw hex introduced into components**; `next build` green; **no visual diff on any route** except the intentional serif-loading correction (2.4).

---

## 4. Files explicitly excluded from Phase 1

- **Any** `src/app/**` route page or route component (no page reskins in Phase 1).
- **Any** Founder Access file (`app/founder-access/*`, `components/founder-access/*`, `api/founder-access/*`, `lib/beehiiv/*`, `lib/ratelimit.ts`, `lib/founder-access/*`, Supabase migrations).
- **Any** commerce/Shopify/payment/checkout/invitation code (none exists; none created).
- `src/components/layout/{Header,Footer,PrimaryNav}.tsx` (chrome — Phase 6 evaluation).
- `src/components/maison/*` components (Phase 2).
- The existing `--space-*` scale, existing color values, existing analytics, existing forms/APIs.
- Design-package assets (no bulk copy); the four 0-byte product media entries (latent, F-Asset-02) and baked-in-text science diagrams (separate editorial fixes).

---

## 5. Inter-vs-Figtree specimen plan (DDR-2 — plan only)

Deliver, **only if separately authorized**, a side-by-side specimen (throwaway HTML, ignored dir) comparing `Garamond Premier Pro + Inter` vs `Garamond Premier Pro + Figtree` across: navigation, body paragraph, lede, form labels, button, eyebrow, product card, Journal paragraph, mobile navigation, a long heading wrap, and accessibility at 200% zoom. Files that *would* be needed: a specimen HTML/route, both fonts loaded via `next/font`, and a short written comparison. **Do not implement the comparison yet without Vanessa's visual-approval go-ahead.**

---

## 6. Phase 1 test plan

1. `next build` + typecheck green.
2. **Visual diff** on `/`, `/our-story`, `/shop`, `/science`, `/journal`, `/founder-access`: expect **no change** except intentional serif rendering (2.4). Confirm on a machine **without** Garamond installed.
3. Tailwind smoke test: new utilities resolve; no existing utility altered.
4. Fresh **Lighthouse** on `/`, `/founder-access`, `/science`, `/journal` (preview build) — record and compare to the fresh baseline (Perf 96–100, SEO 100); watch font payload / LCP after the serif load.
5. **axe / Lighthouse a11y** on the same routes — a11y ≥ current (96–100); the contrast-safe tokens should move Science (92) and the gold/muted offenders toward 100.
6. **Founder Access functional smoke:** untouched, but confirm it still submits + rate-limits (regression guard, not a change).
7. Copy-governance module: run advisory scan; confirm allowlist suppresses F-Copy-02/03/04 false positives.

**Rollback method (whole phase):** each file is additive or aliased; revert the Phase 1 PR(s) to return to exact current behavior. The only user-visible revert is headings returning to the Georgia fallback (2.4).
