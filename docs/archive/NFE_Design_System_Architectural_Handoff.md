# NFE Maison Design System — Architectural Handoff

> ## ARCHIVED — SUPERSEDED. DO NOT BUILD FROM THIS DOCUMENT.
>
> **Superseded by:** [`docs/nfe-maison-refinement-plan-v2.md`](../nfe-maison-refinement-plan-v2.md), plus the four companion Phase 0 documents (`nfe-maison-baseline-audit.md`, `nfe-maison-page-migration-matrix.md`, `nfe-maison-asset-routing-audit.md`, `nfe-maison-phase-1-file-plan.md`), all committed in `a4b6f83` on 2026-07-18.
>
> **Why superseded:** This document was the *input* to the Phase 0 audit, not its output. Section 5 below requests a Founder Decision Record as a prerequisite to build. That record was subsequently decided and now lives in Section 3 of the refinement plan, "Confirmed Founder Decision Record" (DDR-1 through DDR-6). Where this document and the refinement plan disagree, **the refinement plan governs** — see its Section 2, "Source-of-truth hierarchy."
>
> **Known divergences from the confirmed plan.** This document predates the decision that the initiative is a *controlled refinement of the existing green-and-gold site, not a redesign*. Treat its palette, typography, and geometry recommendations as unratified proposals. In particular: deep NFE green remains the signature anchor and is not replaced by bronze (DDR-1); Inter is retained as the sans and Figtree is deferred (DDR-2); the dark green header is retained in early phases (DDR-4).
>
> **Retained for:** the source-material inventory in Section 2, the gap analysis in Section 4, and the reasoning trail behind the decisions that were ultimately ratified.

**Document type:** Lead architect implementation plan  
**Status:** ARCHIVED 2026-07-19. Originally issued as "Draft for review — no implementation authorized until Founder Decision Record (DDR) is signed."  
**Date:** 2026-07-13  
**Owner:** Vanessa McCaleb / NFE Beauty  
**Prepared by:** Cursor agent (from design GPT package + live `nfe-portal` audit)

---

## 1. Purpose

This document translates the **NFE Maison Design System v1** design package into an engineering implementation plan for the lead architect. It defines what to adopt, what to reconcile with production, what requires founder approval, and how to migrate `nfe-portal` without breaking live systems.

**This is not a design critique.** It is the build plan.

---

## 2. Source materials

| Asset | Location | Role |
|-------|----------|------|
| Design system package (primary) | `C:\Users\vanes\Downloads\NFE Beauty Design System\design_handoff_nfe_system` | Tokens, components, guidelines, UI kits |
| Design doctrine index | `...\design_handoff_nfe_system\readme.md` | Brand rules, caveats, folder index |
| Production codebase | `https://github.com/vanmbrown/nfe-portal` | Next.js App Router site |
| Brand assets (canonical) | `https://github.com/vanmbrown/nfe-brand-assets` | Photography, fonts, logos |
| Wave 1 commerce guardrails | `docs/founders-edition-wave-1-decision-sheet.md` | Approved / banned language |
| Live site | `https://www.nfebeauty.com` | Current deployed behavior |

### 2.1 Design package inventory

```
design_handoff_nfe_system/
├── readme.md                 # Brand + visual doctrine
├── styles.css                # Token entry point
├── SKILL.md                  # Agent skill entry
├── tokens/
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   └── fonts.css
├── guidelines/               # 12 HTML specimen cards
├── components/core/          # 11 JSX primitives + .d.ts + .prompt.md + .card.html
│   └── nfe-runtime.js        # In-browser Babel loader (prototype only)
├── ui_kits/
│   ├── website/              # index, face-elixir, science, journal
│   ├── deck/                 # 16:9 slide template
│   └── doc/                  # Letter/memo template
├── assets/                   # Partial brand asset copy (~28 files)
└── uploads/                  # Audit source text
```

**Important:** The design package is a **specification and prototype kit**, not a drop-in production library. Components use inline React styles. `nfe-runtime.js` is for static HTML previews only. There is no compiled `_ds_bundle.js`.

---

## 3. Executive summary

### 3.1 What the design system defines

A **warm, editorial, restraint-first luxury maison** for pre-commerce NFE:

- Warm neutral palette (Bone, Ivory, Espresso, Bronze)
- Serif for meaning (Garamond Premier Pro), sans for mechanics (Figtree proposed)
- Sharp corners, no shadows, no gradients
- Strict copy discipline (short headings, hedged claims, one CTA per view)
- Eleven core UI primitives and four website page templates
- Deck and document kits for non-web brand output

### 3.2 What production currently implements

A **green-and-gold luxury site** with broader feature scope:

- Palette: `#103B2A` green, `#C6A664` gold, `#FAFAF8` paper (`tailwind.config.js`, `src/styles/tokens.scss`)
- Dark green header with gold typographic "NFE" wordmark (`src/components/layout/Header.tsx`)
- Rounded buttons on key surfaces (e.g. Founder Access `rounded-full`)
- Garamond as primary font; system UI sans inconsistently
- Full product surface: Founder Access API, Science interactives, Concierge, Ritual, Focus Group portal, Journal, legal pages

### 3.3 Architect's mandate

Integrate the design system's **discipline and component model** into `nfe-portal` through a phased migration. Do **not** replace production infrastructure (APIs, forms, auth, data capture) with design prototypes.

### 3.4 Non-negotiable guardrails

From `docs/founders-edition-wave-1-decision-sheet.md` and current production policy:

| Authorized | Prohibited in public copy/UI |
|------------|------------------------------|
| Founder's Edition | preorder / pre-order |
| private allocation | sale / discount |
| invitation | drop / clearance |
| release wave | shop now |
| small batch | countdown / limited-time offer |
| Founder Access | public checkout / public pricing |

**Founder Access** (`/founder-access`) is live and must not be functionally regressed. Phase 2A payment remains paused until the decision sheet is approved.

---

## 4. Gap analysis: design vs production

### 4.1 Visual system

| Dimension | Design system v1 | Live `nfe-portal` | Resolution |
|-----------|------------------|-------------------|------------|
| Page background | Bone `#F5EFE6` | Paper `#FAFAF8` | DDR-1: Palette |
| Brand accent | Bronze `#8E5F2B` | Green `#103B2A` + Gold `#C6A664` | DDR-1 |
| Header | Light Bone, hairline, header CTA | Dark green, gold wordmark, no header CTA | DDR-4 |
| Dark sections | Cacao `#1C1510`, one per page, last | Green-900 / ink variants | DDR-1 |
| Corners | `radius: 0` everywhere | `rounded-md`, `rounded-full` on CTAs | DDR-5 |
| Shadows | None | Some elevation patterns | Adopt design rule |
| Motion | 400ms fade-up; 200ms color hover | Mixed durations | Adopt design rule |

### 4.2 Typography

| Role | Design system | Live site | Resolution |
|------|---------------|-----------|------------|
| Serif | Garamond Premier Pro (headings, product names, quotes) | Garamond Premier Pro (primary everywhere) | Adopt role split |
| Sans | Figtree (body, nav, buttons) | System UI / Inter-adjacent | DDR-2 |
| Scale | Display 64 → Caption 13 (defined steps) | Ad hoc Tailwind classes | Adopt token scale |
| Founder voice | Serif italic only | Partially implemented | Enforce via `FounderNote` |

### 4.3 Copy and commerce language

| Context | Design kit examples | Production requirement |
|---------|---------------------|------------------------|
| Product status | "Pre-order opening" | Use Wave 1 language: "Founder's Edition", "release wave", etc. |
| Primary CTA | "Join the list" | "Join Founder Access" where linking to `/founder-access` |
| Badge | "Opening 2026 · Founder Access is open" | Acceptable if aligned with launch messaging |

**Action:** Create a copy governance map before any page migration. Design kit copy is directional, not authoritative for commerce language.

### 4.4 Information architecture

| Design kit nav | Live `PrimaryNav` | Notes |
|----------------|-------------------|-------|
| The Atelier | The Atelier → `/shop` | Match |
| Science | Science → `/science` | Match |
| Journal | Journal → `/journal` | Match |
| Philosophy | Philosophy → `/our-story` | Match |
| — | Ritual → `/ritual` | Missing from kit; retain |
| — | Concierge → `/concierge` | Missing from kit; retain |
| Header CTA: Founder Access | No header CTA | DDR-4 |

### 4.5 Feature surface not in design kit

These production routes must be **reskinned, not removed**:

- `/founder-access` — multi-field form, Supabase, Beehiiv, Resend, rate limiting
- `/skin-ritual-quiz`, `/discovery`, `/ritual`, `/concierge`
- `/products/body-elixir` (no dedicated UI kit page)
- Science interactives: `NFEMelanocyteMap`, tabbed intelligence, ingredient tables
- Focus Group portal (`/focus-group/*`)
- Legal: `/privacy`, `/cookies`
- `/subscribe` → redirects to `/founder-access`

### 4.6 Assets

| Source | Files | Notes |
|--------|-------|-------|
| `nfe-brand-assets` repo | 55 files | Canonical |
| Design package `assets/` | ~28 files | Partial; sync before build |
| Design readme imagery rules | Verified | Do not use outdoor portraits as product scenes |

Science diagram artwork contains baked-in typos ("Emulsilved", "Emulisified"). Use as atmospheric crop only (`aria-hidden`) until corrected art is supplied.

---

## 5. Founder Decision Record (DDR) — required before build

The lead architect must not begin token migration until Vanessa signs these decisions.

| ID | Decision | Options | Default recommendation |
|----|----------|---------|------------------------|
| **DDR-1** | Digital palette | A) Warm neutrals + Bronze (audit) · B) Green + Gold (packaging/live) · C) Hybrid (warm pages, green chrome) | **C — Hybrid** preserves packaging recognition while adopting editorial warmth |
| **DDR-2** | Sans font | Figtree (audit) · Inter (closer to current) · System UI | **Figtree** if audit is north star; **Inter** if minimizing change |
| **DDR-3** | Pre-commerce language | Audit phrases · Wave 1 phrases | **Wave 1 only** — non-negotiable |
| **DDR-4** | Header pattern | Light Bone + CTA (design) · Dark green (live) · Hybrid | Tied to DDR-1 |
| **DDR-5** | Corner radius | Zero everywhere · Selective rounding on forms/mobile touch targets | **Zero on marketing**; 0–4px on form controls if a11y requires |
| **DDR-6** | Body Elixir sizes | 125 ml · 75 ml (packaging) · 200 ml (audit) | Owner confirms with packaging |

### DDR sign-off block

```
Founder Decision Record — NFE Design System v1
Date: ___________
Signed: Vanessa McCaleb

DDR-1 Palette:        [ ] A  [ ] B  [ ] C
DDR-2 Sans font:      [ ] Figtree  [ ] Inter  [ ] System UI
DDR-3 Copy authority: [ ] Wave 1 (required)
DDR-4 Header:         [ ] Light  [ ] Dark  [ ] Hybrid
DDR-5 Radius:         [ ] Zero  [ ] Selective
DDR-6 Body sizes:     ___________

APPROVED FOR IMPLEMENTATION: [ ] YES  [ ] NO
```

---

## 6. Target architecture

### 6.1 Layer model

```
┌─────────────────────────────────────────────────────────┐
│  Content layer (MDX, JSON, TS content modules)          │
│  Governed by copy-rules.ts                              │
├─────────────────────────────────────────────────────────┤
│  Page layer (src/app/*)                                 │
│  Composed from Maison components + route-specific logic │
├─────────────────────────────────────────────────────────┤
│  Component layer (src/components/maison/*)              │
│  Production implementations of design primitives        │
├─────────────────────────────────────────────────────────┤
│  Token layer (src/styles/nfe-tokens.css + Tailwind)     │
│  Single source of truth for --nfe-* variables          │
├─────────────────────────────────────────────────────────┤
│  Asset layer (public/images + nfe-brand-assets sync)    │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Repository strategy

| Repo | Purpose |
|------|---------|
| `nfe-portal` | Production implementation |
| `nfe-brand-assets` | Canonical static assets |
| `nfe-maison-design-system` (proposed) | Versioned design package + specimens; optional new repo |

**Recommended:** Publish `design_handoff_nfe_system` to `nfe-maison-design-system` on GitHub. Link from `nfe-portal` README. Do not treat Downloads folder as source of truth.

### 6.3 Token bridge pattern

Create `src/styles/nfe-tokens.css` from design `tokens/*.css`, adjusted per DDR-1.

Bridge into `tailwind.config.js`:

```js
// Pattern — values finalized after DDR-1
extend: {
  colors: {
    bone: 'var(--nfe-bone)',
    ivory: 'var(--nfe-ivory)',
    parchment: 'var(--nfe-parchment)',
    cacao: 'var(--nfe-cacao)',
    espresso: 'var(--nfe-espresso)',
    umber: 'var(--nfe-umber)',
    taupe: 'var(--nfe-taupe)',
    bronze: 'var(--nfe-bronze)',
    'bronze-deep': 'var(--nfe-bronze-deep)',
    gold: 'var(--nfe-gold)',
  },
  maxWidth: {
    maison: 'var(--container-max)',
  },
  spacing: {
    'section': 'var(--section-gap)',
  },
}
```

**Migration rule:** Legacy tokens (`--nfe-green`, `--nfe-paper`, etc.) become aliases during transition. Remove only after all references are migrated.

### 6.4 Font loading

```ts
// src/app/layout.tsx pattern
import localFont from 'next/font/local'
import { Figtree } from 'next/font/google' // or Inter per DDR-2

const garamond = localFont({
  src: [
    { path: '../../public/fonts/garamondpremrpro.woff2', weight: '400' },
    // add licensed weights as needed
  ],
  variable: '--font-serif',
  display: 'swap',
})
```

Sans loads via `next/font` per DDR-2. Body uses sans; headings use serif per design role split.

### 6.5 Component namespace

Create **`src/components/maison/`** for design-system components. Do not overwrite generic `src/components/ui/` until migration is complete.

| Design primitive | Production component | Replaces / merges with |
|------------------|---------------------|------------------------|
| `NavBar` | `MaisonHeader` | `Header.tsx` + `PrimaryNav.tsx` |
| `Button` | `MaisonButton` | Marketing surfaces using `ui/Button` |
| `TextLink` | `MaisonTextLink` | Ad hoc `<Link>` patterns |
| `Eyebrow` | `MaisonEyebrow` | Inline eyebrow spans |
| `SectionHeader` | `MaisonSectionHeader` | Repeated section intros |
| `ProductCard` | `MaisonProductCard` | `ProductCard.tsx`, `ShopCard.tsx` |
| `FounderNote` | `MaisonFounderNote` | Founder quote blocks |
| `EmailCapture` | **Do not port as form** | Style reference only for `FounderAccessForm` |
| `Accordion` | `MaisonAccordion` | `ProductAccordion.tsx` |
| `DarkClosing` | `MaisonDarkClosing` | Footer closing sections |
| `Badge` | `MaisonBadge` | `ui/Badge` on marketing pages |

**Standards for all Maison components:**

- TypeScript with explicit variant unions
- Tailwind + CSS variables; no inline styles
- `prefers-reduced-motion` respected
- Keyboard focus: 2px ring using `--focus-ring`
- Storybook or Ladle story per component
- Unit tests for variant rendering where practical

### 6.6 Copy governance module

Create `src/lib/copy-governance.ts` (or `src/content/design-system/copy-rules.ts`):

```ts
export const BANNED_PUBLIC_PHRASES = [
  'pre-order', 'preorder', 'shop now', 'drop', 'clearance',
  'limited-time offer', 'countdown', 'sale', 'discount',
] as const

export const APPROVED_STATUS_LABELS = [
  "Founder's Edition",
  'Founder Access',
  'release wave',
  'private allocation',
] as const
```

Use in CI lint or PR review checklist. Not a substitute for editorial review.

### 6.7 Layout utilities

Add shared layout primitives:

| Utility | Spec |
|---------|------|
| `MaisonContainer` | max 1140px, 40px pad desktop / 24px mobile |
| `MaisonSection` | `padding-block: var(--section-gap)` |
| `MaisonGrid` | 12 columns, 24px gutter |
| `MaisonProse` | max-width 65ch |

### 6.8 Motion system

One entrance animation:

```css
@media (prefers-reduced-motion: no-preference) {
  .maison-enter {
    animation: maison-fade-up 400ms ease-out both;
  }
}
@keyframes maison-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Hovers: color/background only, 200ms. No scale, shadow, or parallax on marketing pages.

---

## 7. Implementation phases

### Phase 0 — Governance (3–5 days)

**Owner:** Vanessa + lead architect

**Deliverables:**

1. Signed DDR (Section 5)
2. Copy governance sheet (audit phrases → Wave 1 phrases)
3. Page migration matrix (Section 8)
4. Asset sync script: `nfe-brand-assets` → `public/` and design repo

**Exit criteria:** DDR signed. No code changes before this gate.

---

### Phase 1 — Token foundation (1 sprint)

**Deliverables:**

1. `src/styles/nfe-tokens.css`
2. Tailwind bridge in `tailwind.config.js`
3. Font loading in `layout.tsx`
4. Legacy token aliases in `tokens.scss`
5. `copy-governance.ts`

**Exit criteria:**

- Storybook/token specimen page showing all colors and type steps
- Contrast pairs documented (Espresso on Bone, Bone on Cacao, Bronze on Bone)
- Zero new raw hex in components

---

### Phase 2 — Maison component library (1–2 sprints)

**Build order (dependency-safe):**

1. `MaisonEyebrow`, `MaisonTextLink`, `MaisonButton`, `MaisonBadge`
2. `MaisonSectionHeader`, `MaisonFounderNote`, `MaisonAccordion`
3. `MaisonProductCard`, `MaisonDarkClosing`
4. `MaisonHeader` (last — depends on Button + nav tokens)

**Exit criteria:**

- Visual parity with `components/core/*.card.html` specimens
- Accessibility: focus order, aria on accordion, skip link preserved in header
- No inline styles

---

### Phase 3 — Global chrome (0.5 sprint)

**Deliverables:**

1. Replace `Header.tsx` / `Footer.tsx` with Maison equivalents
2. Apply `MaisonContainer` + section rhythm globally
3. Remove shadows/gradients from marketing layout shell
4. Apply corner-radius rules per DDR-5

**Exit criteria:**

- All public marketing routes use new header/footer
- Focus Group and admin routes may retain legacy chrome in v1 (documented exception)

---

### Phase 4 — Page migration (2–3 sprints)

Migrate in priority order (Section 8). Per-page workflow:

1. Content audit against copy governance
2. Replace layout with Maison components
3. Swap imagery per asset rules (4:5 products, correct scene types)
4. Verify one primary CTA per view
5. Run Lighthouse + axe on migrated route
6. Deploy to preview; Vanessa visual sign-off

**Exit criteria per page:** See Section 8 acceptance column.

---

### Phase 5 — Design repo formalization (parallel)

**Deliverables:**

1. GitHub repo `nfe-maison-design-system` from design package
2. Full asset sync (55 files, not 28)
3. Token export script: design repo → portal
4. Fix stale `ui_kits/website/README.md` (still claims no photography)
5. `CHANGELOG.md` tied to DDR

---

### Phase 6 — QA and launch (1 sprint)

**Exit criteria:**

- Section 9 QA checklist全部 pass
- Founder Access E2E unchanged functionally
- No banned commerce language in public routes
- Performance: no regression vs baseline Lighthouse
- Production deploy with rollback plan

---

## 8. Page migration matrix

| Priority | Route | Design reference | Production files | Migration notes | Acceptance |
|----------|-------|------------------|------------------|-----------------|------------|
| **P0** | `/founder-access` | `EmailCapture`, `DarkClosing` patterns | `src/app/founder-access/page.tsx`, `FounderAccessForm.tsx` | Reskin only. Keep API, fields, vessel images, anchor IDs. Replace "pre-order" if present. | Form submits; rate limit works; Wave 1 copy |
| **P0** | `/` | `ui_kits/website/index.html` | `src/app/page.tsx` | Merge six-movement structure with live pathway module (Quiz, Discovery, Founder Access) | One primary CTA; dark closing last |
| **P1** | `/shop` | `ProductCard` | `src/app/shop/page.tsx`, `ShopCard.tsx` | 4:5 imagery; status captions not pills | Wave 1 status language |
| **P1** | `/products/face-elixir` | `face-elixir.html` | `src/app/products/face-elixir/page.tsx`, `ElixirEditorialPage.tsx` | Dossier layout; FAQ accordion only | Details open on page per design |
| **P1** | `/our-story` | Founder section in `index.html` | `src/app/our-story/page.tsx` | `MaisonFounderNote`; ration "skin that has lived" | Founder voice in italic serif only |
| **P1** | `/science` | `science.html` | `src/app/(education)/science/page.tsx`, interactives | Reskin shell; **keep** `NFEMelanocyteMap`, tabs | Diagrams atmospheric only |
| **P2** | `/journal`, `/articles/*` | `journal.html` | `src/app/journal/page.tsx`, article templates | Editorial typography | 65ch measure on body |
| **P2** | `/products/body-elixir` | `ProductCard` pattern | `src/app/products/body-elixir/page.tsx` | No dedicated mock; extend Face Elixir dossier pattern | DDR-6 sizes confirmed |
| **P3** | `/ritual`, `/concierge`, `/discovery`, `/skin-ritual-quiz` | None | respective `src/app/*` | Extend system; no design comp | Consistent tokens + components |
| **P4** | `/focus-group/*`, legal, admin | None | various | Out of scope v1; legacy chrome acceptable | No regression |

---

## 9. QA checklist

### 9.1 Visual

- [ ] 90% of each view is Bone/Ivory/Espresso (per DDR palette)
- [ ] Bronze accent under 5% of viewport (design review)
- [ ] One Cacao/dark closing section per page, always last
- [ ] Corner radius 0 on marketing components (per DDR-5)
- [ ] No box shadows on marketing surfaces
- [ ] No gradients or textures on backgrounds
- [ ] Product images 4:5, consistent bottle scale
- [ ] White packshots not mixed with lifestyle scenes on same card

### 9.2 Typography

- [ ] Serif on headings/product names/quotes only
- [ ] Sans on body/nav/buttons/forms
- [ ] No weight above 600
- [ ] Headings ≤ 8 words, no terminal punctuation
- [ ] Body measure ≤ 65ch
- [ ] Taupe not used below 16px

### 9.3 Copy

- [ ] No exclamation marks
- [ ] No banned commerce phrases (Section 3.4)
- [ ] Max one "-looking" hedge per sentence in claims
- [ ] "skin that has lived" only on hero + Philosophy
- [ ] "Maison" max once per page

### 9.4 Accessibility

- [ ] Espresso on Bone ≥ 4.5:1
- [ ] Focus ring visible on all interactive elements
- [ ] Skip link preserved
- [ ] `prefers-reduced-motion` disables entrance animation
- [ ] Accordion keyboard operable

### 9.5 Functional (must not break)

- [ ] `/founder-access` POST → Supabase + optional Beehiiv
- [ ] `/subscribe` → `/founder-access` redirect
- [ ] `/founders-access` → `/founder-access` redirect
- [ ] Science interactives render and function
- [ ] Journal articles render MDX
- [ ] Focus Group auth and uploads
- [ ] Rate limit returns 429, not 500

---

## 10. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Palette fork (green vs warm neutrals) | Full reskin wasted if DDR delayed | Phase 0 gate; hybrid option |
| Design kit "pre-order" copy ships | Violates Wave 1 guardrails | `copy-governance.ts` + PR checklist |
| Inline-style prototypes copied to production | Unmaintainable components | Maison namespace with Tailwind |
| Founder Access form replaced with `EmailCapture` | Data capture regression | Visual reskin only; explicit doc |
| Science diagrams with typos shown as labeled | Brand credibility | `aria-hidden` atmospheric use only |
| Partial assets in design package | Broken image refs | Sync from `nfe-brand-assets` before build |
| Scope creep into Focus Group redesign | Timeline blowout | P4 exclusion for v1 |
| Font swap (Figtree) affects Lighthouse | Performance regression | `next/font`, subset, preload audit |

---

## 11. Effort estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 0 Governance | 3–5 days | Vanessa availability |
| Phase 1 Tokens | 1 sprint (~2 weeks) | DDR signed |
| Phase 2 Components | 1–2 sprints | Phase 1 |
| Phase 3 Chrome | 0.5 sprint | Phase 2 |
| Phase 4 Pages | 2–3 sprints | Phase 3 |
| Phase 5 Design repo | Parallel | Anytime |
| Phase 6 QA | 1 sprint | Phase 4 |

**Total:** 6–10 weeks with one senior front-end architect, assuming DDR is signed in week 1 and Vanessa provides visual sign-off per P0/P1 page.

---

## 12. What the lead architect receives

Hand off this document plus:

1. **Design package folder:** `C:\Users\vanes\Downloads\NFE Beauty Design System\design_handoff_nfe_system`
2. **Brand assets repo:** `https://github.com/vanmbrown/nfe-brand-assets`
3. **Production repo:** `https://github.com/vanmbrown/nfe-portal`
4. **Wave 1 decision sheet:** `docs/founders-edition-wave-1-decision-sheet.md`

**First action:** Schedule DDR review with Vanessa. Do not open a migration PR until DDR is signed.

---

## 13. Appendix A — Design token reference

From `tokens/colors.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--nfe-bone` | `#F5EFE6` | Page background |
| `--nfe-ivory` | `#FCF9F3` | Cards |
| `--nfe-parchment` | `#EDE3D1` | Tint bands |
| `--nfe-cacao` | `#1C1510` | Dark sections |
| `--nfe-espresso` | `#2B2018` | Primary text, primary buttons |
| `--nfe-umber` | `#6B5945` | Secondary text, ledes |
| `--nfe-taupe` | `#9A8770` | Captions only, ≥16px |
| `--nfe-hairline` | `#E3D7C3` | Borders |
| `--nfe-bronze` | `#8E5F2B` | Accent |
| `--nfe-bronze-deep` | `#6F4A20` | Accent hover |
| `--nfe-gold` | `#C79A56` | On Cacao only |
| `--nfe-sage` | `#5A7057` | Form success |
| `--nfe-clay` | `#A04B36` | Form error |

From `tokens/typography.css`:

| Step | Size (desktop) | Role |
|------|----------------|------|
| Display | 64px (40 mobile) | One per page, hero |
| H1 | 44px (32 mobile) | Page titles |
| H2 | 31px (26 mobile) | Section headings |
| H3 | 22px | Card titles, product names |
| Lede | 19px | Intro under headings |
| Body | 16px | Prose |
| Eyebrow | 12px | Wayfinding |
| Caption | 13px | Metadata |
| Button | 13px uppercase | CTAs |

From `tokens/spacing.css`:

| Token | Value |
|-------|-------|
| `--container-max` | 1140px |
| `--container-pad` | 40px (24 mobile) |
| `--section-gap` | 112px (64 mobile) |
| `--card-pad` | 32px |
| `--radius` | 0px |
| `--button-height` | 52px |
| `--nav-height` | 72px |

---

## 14. Appendix B — Imagery routing guide

| Use case | Approved asset |
|----------|----------------|
| Homepage hero vessel | `homepage/home-hero-product-vessel-desktop.webp` |
| Founder Access vessel | `founder-access/founders-edition-vessel-desktop.webp` |
| Face Elixir packshot (card) | `products/face-elixir/face-elixir-packshot-proportions-fixed.png` |
| Body Elixir packshot (card) | `products/body-elixir/body-elixir-packshot-white.png` |
| Founder portrait | `founder/vanessa-mccaleb-founder-portrait.webp` |
| Publication mark (favicon/avatar only) | `logo/nfe-publication-logo.png` |
| Science atmosphere (not labeled) | `science/emulsion-synergy-diagram.png` (cropped, aria-hidden) |

**Do not use on product cards:**

- `face-elixir-lifestyle-01/02/03.jpg` (outdoor portraits)
- `our-story/founder-story-product-scene.jpg` (portrait scene, not packshot)

---

## 15. Document control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-13 | Cursor agent | Initial architectural handoff |

**Next review:** After DDR sign-off or before Phase 4 page migration begins.
