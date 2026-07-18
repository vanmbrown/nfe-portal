# NFE Maison — Refinement Plan v2 (Reduced-Scope, Pilot-First)

**Status:** Draft for Vanessa's review. Phase 0 deliverable. No code changed, nothing staged, nothing committed, nothing deployed.
**Date:** 2026-07-18
**Branch:** `feature/nfe-digital-maison-upgrade` (measured commit `ed824bb`)
**Reference material only (not implementation instructions):** the design package `design_handoff_nfe_system` (incl. its `ARCHITECTURAL_HANDOFF.md`) and the earlier `nfe-maison-*` drafts. Several of the package's universal rules are **rejected** here per NFE doctrine and the Founder Decision Record.

---

## 1. Executive summary

This is a **controlled refinement of the existing NFE site, not a redesign.** The design package is a **specification and prototype reference** — we adopt its *discipline* (consistent containers, section rhythm, serif/sans role separation, editorial measure, reduced motion, accessible focus, fewer shadows/pills, clear asset routing) while **preserving the established NFE brand world**: deep-green-and-gold identity, dark green header, packaging identity, the Founder Access strategy, and Wave 1 commerce guardrails.

The original handoff framed a **6–10 week full reskin** built on warm-neutrals-with-bronze, green demoted, a light header, radius-0 everywhere, ≤8-word headings, no icons, Figtree, and Founder Access as the first migration. **This plan rejects those as universal mandates.** Instead: hybrid palette (green stays anchor), **token bridge first** aliased to *current live values* (zero visual change), **pilot one low-risk page** (`/our-story`), prove it, then proceed; **Founder Access is never first** and is a **visual reskin only**; **no commerce/payment/Shopify work** of any kind.

**The fresh Phase 0 audit reframes the priorities.** The site's **performance and structure are already strong** (Perf 96–100, SEO 100, negligible CLS, zero overflow, zero console errors, one H1/page, all images have alt). The real, verified issues are:
- **F-Font-01** — the canonical serif is **not delivered** (renders **Georgia**; no `@font-face`, no `public/fonts/`).
- **F-A11y-01** — **systemic contrast failures** from gold eyebrows (`#C6A664`, ~2.2:1) and low-opacity muted text (`/45`, ~3.0:1). Token-level, not per-page.
- **F-Perf-02/03/04** — `/our-story` 3.9 MB raw hero, `/journal` 3.67 MB desktop image payload, ~26.6 MB raw JPGs in the public bundle.
- **F-Size-01** — Body Elixir **200 ml (prod) vs 125/75 ml (package claim)** — unresolved product fact.
- **F-Copy-01** — "Pre-order pathway in preparation" still live on The Atelier.
- **F-Asset-02** — four **0-byte** product media entries (latent, not yet rendered).

Fixing serif loading, contrast tokens, and image weight — none of which require a palette fork or a chrome swap — is a bigger quality win than the reskin itself, and must not be undone by importing the design package's heavy JPGs.

---

## 2. Source-of-truth hierarchy (authoritative)

When sources disagree, resolve in this order:

1. NFE master brand doctrine + approved founder decisions
2. Current approved Founder Access + Wave 1 guardrails
3. Current production functionality
4. Packaging identity + canonical brand assets (`nfe-brand-assets`)
5. Approved current page strategy + editorial architecture
6. Maison design-system recommendations
7. Prototype components and UI-kit examples

**Corollaries:** the design package is a spec, not a component library. Do **not** copy prototype JSX/inline styles into production. Do **not** ship any prototype runtime. Do **not** treat design-kit copy as approved public copy. Do **not** replace working APIs/forms/storage/analytics/auth/commerce with prototypes.

---

## 3. Confirmed Founder Decision Record

| ID | Decision | Approved position |
|----|----------|-------------------|
| **DDR-1 — Palette** | **Hybrid.** Warm cream/bone/parchment/ivory field + espresso/warm shadow; **deep NFE green stays the signature anchor**; restrained gold + oxidized bronze accents; selective dark moments. Green **not** replaced by bronze. **No** mechanical 90% neutral. Not every page ends dark. No gradients/textures without approval. **Palette work must include contrast-safe gold/muted tokens (F-A11y-01).** |
| **DDR-2 — Typography** | Serif = **Garamond Premier Pro** (canonical; **no Cormorant**). Sans = **retain current (Inter)**. **Figtree deferred** pending a controlled specimen. Load serif via `next/font/local` (license-confirmed); never expose/redistribute licensed files. Serif = editorial/headings/product/quotes/founder voice; sans = body/nav/labels/buttons/forms. |
| **DDR-3 — Copy authority** | NFE doctrine + Wave 1 language authoritative. **Approved:** Founder Access, Founder's Edition, private allocation, release wave, invitation, reserved invitation, small batch, early release. **Avoid:** preorder/pre-order, sale, discount, donation, sample, drop, clearance, shop now, limited-time offer, countdown. **No naive blocker** — use review scan + contextual allowlist. Don't hardcode "Opening 2026". |
| **DDR-4 — Header** | **Retain the dark green header** in early phases. Do not swap to a light header to match the prototype. Do not auto-add a prominent filled Founder Access button. A light/hybrid header may be explored later in a controlled preview only. |
| **DDR-5 — Geometry** | Selective sharpness: editorial/marketing surfaces **0–2px**; major buttons sharp/minimally rounded; forms & touch controls **2–4px** where useful; preserve accessible control shapes; **no oversized pills**; no mandated literal-zero on every control. |
| **DDR-6 — Body Elixir size** | **Report-only until verified.** Do not change any public size copy. Confirm 200 ml vs 125/75 ml against physical packaging. |

---

## 4. ADOPT / ADAPT / REJECT / DEFER matrix

**ADOPT** (directly strengthens NFE — low risk):

| Item | Why |
|------|-----|
| Serif/sans **role separation** | Fixes loose `font-primary`/`font-serif` mixing (F-Font-03) |
| **Load the canonical serif** via `next/font/local` | Corrects F-Font-01 (visitors currently see Georgia) |
| **Contrast-safe gold + muted tokens** | Corrects systemic F-A11y-01 |
| **Consistent container** + **section rhythm** primitives | Replaces ad-hoc `py-*`; low risk |
| Editorial **prose measure (~65ch)** | Readability; additive |
| **Reduced-motion** + **visible focus** (formalize existing) | Already partly present |
| **Fewer shadows / fewer oversized pills** | Aligns geometry with DDR-5 |
| **Legacy token aliases** mapped to current live values | Zero-visual-change first step |
| **TypeScript variants**, no copied inline prototype styles | Maintainability |
| **Clear asset routing** + optimized image ratios/weights | Attacks F-Perf-02/03/04, F-Asset-* |
| Reusable **section header / founder note / accessible accordion** | Consistency without brand change |
| One clear **primary action per section** (+ at most one secondary link) | Editorial restraint |

**ADAPT** (principles, NFE interpretation — never mechanical universals):

| Item | NFE interpretation |
|------|--------------------|
| Warm-neutral palette | Field, not replacement; green stays anchor (DDR-1) |
| Sharp geometry | Selective, not literal-zero everywhere (DDR-5) |
| One CTA per view | Guideline, not enforced on interactive/multi-path pages |
| Dark closing sections | Allowed where purposeful; **not** mandatory-last |
| Short headings | Prefer concise; not a hard ≤8-word rule; terminal punctuation allowed |
| Minimal iconography | Keep functional glyphs; avoid decorative proliferation |
| Uniform product-card imagery / 4:5 | Coherent ratios; fix journal ratio inconsistency; final ratio per review |
| Limited motion | Tune to current 120–240 ms feel |
| Bronze / cacao accents | Disciplined accents, not the primary identity |

**REJECT as universal** (contradict doctrine):

- Bronze as the *only* accent / green demoted to secondary
- "One dark section, always last" on every page
- Every heading ≤ 8 words; no punctuation in titles
- "No icons under any circumstances"; "no texture under any circumstances"
- Zero radius on *every* control
- Figtree auto-replacing the current sans
- Light header auto-replacing dark green
- "skin that has lived" as the *core* positioning (ration it; keep "mature, melanated skin" primary)
- "Opening 2026" as a permanent badge
- Design-system repo creation *before* the system is proven
- Full-site reskin *before* a pilot
- Founder Access as the first migration target
- 8 px spacing base (would double every space value — F-Spacing-01)

**DEFER** (useful later, unnecessary now):

- Publishing `nfe-maison-design-system` as its own GitHub repo
- Deck/doc UI kits (non-web brand output)
- Figtree migration (pending specimen approval)
- Light/hybrid header controlled preview
- CI copy-governance blocker (start advisory, flag-not-block)

---

## 5. Current production strengths (protect these)

- **Performance:** Perf 96–100 / SEO 100 across measured routes; LCP 2.0–2.6 s mobile / ~0.55 s desktop; negligible CLS; ~0 unused JS; no render-blocking.
- **Structure:** zero horizontal overflow at 1440/768/390; one `<h1>` per page; zero broken images; zero console/page errors; all images have `alt`.
- **Accessibility scaffolding:** skip link, global `:focus-visible`, global `prefers-reduced-motion`, dialog-semantics `Modal`, semantic landmarks; Founder Access scores **100**.
- **Copy discipline:** correct cosmetic disclaimers everywhere; no live sale/discount/countdown; core "mature, melanated skin" positioning explicit.
- **Brand assets:** homepage vessel and Founder's Edition vessel correctly isolated; founder portrait intentionally routed.

The current site is an **approved source of truth, not disposable legacy code.**

---

## 6. Reduced implementation scope

**In scope:** token bridge (aliased to live values, incl. contrast-safe gold/muted + serif loading), a small set of Maison consistency primitives, one pilot page, then approved route-by-route editorial refinements, image-weight remediation, advisory copy-governance tooling, and — only after visual approval — a Founder Access **visual** reskin and a global-chrome *evaluation*.

**Out of scope:** Shopify, public products/pricing/draft orders/invoices/checkout/cart/Buy Buttons/hidden links, payment or signed-invitation routes, exposing Founder's Edition pricing, making The Atelier transactional, any Founder Access functional change, and any deployment before sign-off gates.

---

## 7. Revised phase sequence & approval gates

| Phase | Content | Gate before starting |
|-------|---------|----------------------|
| **0 — Audit & governance** *(this set)* | Audit, baselines, matrices, plan | — |
| **1 — Token bridge** | `--maison-*`/`--nfe-*` aliases mapped to **current live values**; contrast-safe gold/muted tokens; serif loading via `next/font/local`; advisory copy-governance module | **Vanessa approves Phase 0 + DDR** |
| **2 — Foundation components** | `MaisonContainer/Section/Prose`, section header, founder note, accessible accordion, button/text-link/eyebrow/badge variants (TS, tokens, no inline styles); fix Science tab ARIA | Phase 1 merged; specimen approved |
| **3 — Pilot** | Migrate `/our-story` (fallback: one Journal article); meet acceptance criteria | Components ready |
| **4 — Approved route refinements** | Homepage → Atelier → Face → Body → Journal → Science shell → Ritual → Discovery → Quiz → Concierge | **Pilot visually approved** |
| **5 — Founder Access reskin** | **Visual only**; all protected contracts preserved | Separate explicit authorization |
| **6 — Global chrome evaluation** | Header/footer *evaluation* + optional controlled light-header preview | System proven across routes |
| **7 — Final QA & rollout** | Lighthouse/axe no-regression, functional E2E, rollback, deploy | Founder sign-off |

**Hard gates:** no code before Phase 0 approval; no route work before pilot approval; no chrome replacement before the system is proven; no Founder Access work without separate authorization; no deploy without final sign-off.

---

## 8. Pilot-first strategy

**Primary pilot: `/our-story`.** It is a self-contained founder-editorial page with **no live conversion system**, exercises serif headings + founder voice + a hero image + prose measure + section rhythm, and already has a genuine defect to fix (3.9 MB raw hero → optimized WebP). It will surface token, typography, and hybrid-palette issues with **trivial rollback** (one route, no APIs). The WIP branch (`wip/our-story-maison`) is **research evidence** of likely token/pilot implications — **not** approved implementation code.

**Fallback pilot:** one Journal article template instance (single article, not the shared `articles/[slug]` template) — also low-risk, tests editorial prose + hero + metadata, but touches the sensitive MDX pipeline, hence fallback.

Full pilot criteria in `nfe-maison-page-migration-matrix.md`.

---

## 9. WIP branch preservation record

Before Phase 0 audits, the in-progress Our Story / Maison implementation was **preserved locally and removed from the feature branch**:

- Backup (outside repo): `C:\nfe_dev\nfe_phase0_preservation_backup\` (status, log, diff, binary diff, untracked list, SHA-256 of both founder images).
- WIP branch: **`wip/our-story-maison`**, commit **`9b81f72`** — contains exactly five authorized paths: `tailwind.config.js`, `src/app/our-story/page.tsx`, `src/components/story/StoryHero.tsx`, `public/images/our-story/founder-hero.webp`, `public/images/our-story/founder-portrait.webp`.
- **Not pushed, not merged, not deployed.** Feature branch restored to `ed824bb`; the six legitimate unpushed Founder Access commits remain intact.

The WIP branch may be referenced as research; it is not authorized for Phase 1.

---

## 10. Founder Access protection plan

Founder Access is **live and functionally closed**. It is **not touched in Phase 0 or Phase 1** and is **never the first pilot**. When eventually reskinned (Phase 5, separate authorization), the change is **visual only** and these must remain **behavior-identical**: form field names, requirements, validation schema, consent behavior, API payload shape, anchor IDs (`#request-founder-access`), redirects (`/subscribe`, `/founders-access` → `/founder-access`), Supabase writes (`founder_access_signups`, RLS, service-role), Beehiiv consent-gated sync, Resend subscriber + admin mail, Upstash rate limiting (3/hr), analytics events, duplicate-email upsert, vessel image scope, success-state, consent copy, privacy disclosures.

**Vanessa-owned closeout checks (reminders, not blockers):** Beehiiv custom-field confirmation; Supabase RLS confirmation; real-inbox confirmation-email tone; `/subscribe → /founder-access` documented as intentional; 3/hour rate-limit monitoring after first real traffic.

---

## 11. Commerce / payment exclusions

Payment remains **paused**. This initiative will not activate Shopify, create public products/pricing/draft orders/invoices, add checkout/cart/Buy Buttons/hidden links, build payment or signed-invitation routes, expose Founder's Edition pricing, or make The Atelier transactional. Note the **latent** offer schema (`buildProductSchema`) is currently **not wired to any page** — leave it unwired. The approved future direction (Founder Access → review → private invitation → Shopify draft order/invoice → controlled fulfillment) is **planning-only**.

---

## 12. Global chrome deferral

The dark green header (DDR-4) and footer are **retained** and **not replaced** before the pilot is approved and the system is proven across multiple routes. Header/footer changes are a **Phase 6 evaluation** (with an optional controlled light-header preview), never an automatic swap. The only near-term footer item is the stale "© 2025" (F-Copy-07), an editorial fix.

---

## 13. Separate design-system repository deferral

Publishing `nfe-maison-design-system` as its own GitHub repo, and any Storybook/Ladle harness, are **deferred** until the system is proven in-app through the pilot and at least one approved route batch. Building library infrastructure before the system exists in production is premature.

---

## 14. Effort estimate

See `nfe-maison-phase-1-file-plan.md` for Phase 1 file detail and the Phase 0 report §Effort for the full recalculated phase-by-phase estimate. Directional total: **~5–7 focused engineering weeks** across gated phases — less than the original 6–10 week full-reskin because scope is narrower (no palette fork, no upfront chrome swap, no repo creation, Founder Access deferred to a visual-only pass). Dependencies: DDR sign-off, per-gate visual approvals, packaging-size confirmation (DDR-6), font-license confirmation (F-Font-02).

---

## 15. Rollback philosophy

- **Aliased tokens** make Phase 1 visually inert and trivially revertible.
- **Additive namespacing** (`src/components/maison/*`, `--maison-*`) — never overwrite `--space-*` or existing components until a route is migrated and approved.
- **One route per PR**, behind visual sign-off; each independently revertible.
- **No functional replacement** of APIs/forms/analytics — a visual revert never risks data/behavior.
- **Founder Access + commerce untouched** until separately authorized.
- Every migrated route must pass Lighthouse/axe **no-regression** vs this baseline before deploy.

---

## 16. Stop conditions

Stop and consult Vanessa if any of these arise during later phases: a proposed token change would cause immediate sitewide visual change; spacing-base collision (F-Spacing-01) is not namespaced; font licensing for web self-hosting is unconfirmed; a product-fact conflict (F-Size-01) would be silently reconciled; Founder Access behavior would change; any commerce/payment/pricing surface would activate; a change would require deploying without sign-off; the pilot cannot be rolled back cleanly.

---

## 17. Unresolved founder decisions

1. Body Elixir true size (200 ml vs 125/75 ml) — packaging confirmation (DDR-6 / F-Size-01).
2. Garamond web-embedding license + intent to self-host (F-Font-02 / F-Font-01).
3. Inter-vs-Figtree specimen approval (DDR-2).
4. Contrast-safe gold/muted token values (F-A11y-01).
5. Replacing "Pre-order pathway in preparation" with release-wave language (F-Copy-01).
6. Sourcing/removing the four 0-byte product media entries (F-Asset-02).
