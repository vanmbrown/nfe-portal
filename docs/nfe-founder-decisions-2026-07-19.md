# Founder Decisions — 2026-07-19

Ratified rulings closing out the pre-Phase-1 stabilization pass. Supplements the Confirmed Founder Decision Record in `nfe-maison-refinement-plan-v2.md` §3.

---

## 1. Product sizes — OPEN, verification in progress

**Ruling:** Vanessa verifies physical labels and final fill specifications. **No public size changes until confirmed.**

**Explicit caution:** the filename `NFE_face_elixir_30_50_proportions_fixed.png` is **not** proof that both 30ml and 50ml are approved launch SKUs. It is a rendering, not a specification.

### Tracking slots

| Slot | Status | Current production claim |
|---|---|---|
| **Face Elixir — confirmed launch size** | UNCONFIRMED | `30ml / 1 fl oz` (`src/content/products/face-elixir.ts:172`) |
| **Face Elixir — future/planned size, if any** | UNCONFIRMED | 50ml implied by live FAQ (`FaceElixirFAQ.tsx:38`) |
| **Body Elixir — confirmed launch size** | UNCONFIRMED | `200ml / 6.8 fl oz` (`src/content/products/body-elixir.ts:116`) |

Confirmed launch size and future/planned size are tracked **separately**. A 50ml appearing in planning material does not make it a launch SKU, and the live FAQ currently blurs the two by offering customers a choice between them.

Full reference list and the internal Face Elixir contradiction: `nfe-product-size-inventory.md`.

---

## 2. Garamond Premier Pro — NOT APPROVED for web embedding

**Ruling:** web embedding remains **unapproved** until the actual license or purchase terms **explicitly permit self-hosted webfont use**. Presence in `nfe-brand-assets` is not permission.

### Prohibited until explicitly licensed

- Loading Garamond through `next/font/local`
- Placing font files in `public/`
- Copying or redistributing the font binaries to any repository
- Changing production font loading in any way

### Current state, unchanged

`--font-primary: "Garamond Premier Pro", Georgia, serif` is declared with **no** `@font-face` and no `next/font/local` anywhere in `src`. `public/fonts/` does not exist. Real visitors render **Georgia**. Garamond appears only on machines with the font installed locally.

This is a known, accepted state. It is **not** to be "fixed" until the license question is closed. Binaries remain only in `nfe-brand-assets` under `assets/fonts/`, marked "licensed, NFE use only; verify before redistribution."

Gates: F-Font-01 (the serif correction) and the Phase 1 font-loading work.

---

## 3. Bronze-gold accent — RATIFIED

**Final ruling:** the accent pair is approved.

```
--nfe-color-accent-on-light: #77633C   /* Bone, Ivory, Parchment, Paper, White */
--nfe-color-accent-on-dark:  #C6A664   /* dark green, cacao */
```

**Founder reason:** `#77633C` preserves the intended bronze-gold hue and clears WCAG AA across the approved light surfaces, including the actual parchment token `#EDE3D1`, where `#78643C` narrowly fails.

**Binding rules:** do not use one accent token universally across all backgrounds; map accent color by surface role; do not adopt `#8E5F2B` as the default bronze without contrast testing, as it fails on the design package's parchment token; preserve the smaller restrained eyebrow treatment rather than solving contrast through larger or louder type; replace opacity-based meaningful text colors with explicit semantic tokens; **do not apply these tokens in production until the approved token phase.**

Tested ratios for both tokens are documented in `nfe-contrast-token-candidates.md`.

### How the value was corrected

**Ruling:** `#78643C` provisionally approved as `--nfe-color-accent-on-light`, conditional on separate verification against Bone, Ivory, Paper, and Parchment, with an explicit instruction not to assume it passes on every light neutral.

**The verification was run and the condition caught a failure.**

`#78643C` measures **4.48:1 on the design package's Parchment `#EDE3D1`**, missing AA by 0.02. It passes on Bone (4.98), Ivory (5.42), Paper (5.45), and White (5.70). The earlier proposal tested parchment as `#EFE4D5`, the value transcribed in the Phase 0 audit; the package's actual token is `#EDE3D1`.

### Corrected value proposed for ratification

```
--nfe-color-accent-on-light: #77633C
```

One step darker, hue preserved, visually indistinguishable. Clears AA on all six light grounds; binding constraint is parchment at 4.54:1.

### Conditions carried forward, all satisfied by `#77633C`

| Condition | Status |
|---|---|
| Use only where tested contrast is at least 4.5:1 | Satisfied on all six grounds |
| Verify separately on Bone, Ivory, Paper, Parchment | Done; parchment failure found and corrected |
| Do not assume it passes on every light neutral | Confirmed — it did not |
| Retain brighter gold for dark green or cacao | `#C6A664` unchanged; 5.38 / 6.70 / 7.77:1 |
| Do not enlarge or embolden eyebrows as primary fix | No type changes made or proposed |
| Replace opacity-based meaningful text with semantic tokens | Proposed in candidates doc; not yet implemented |

**Ratified 2026-07-19.** Nothing is consumed by code; application is gated to the approved token phase.

Measurements and method: `nfe-contrast-token-candidates.md`.

---

## 4. Muted text token — RATIFIED

```
--maison-text-muted: #666666
```

**Founder reason:** passes WCAG AA across Bone, Ivory, Paper, and the actual Parchment token `#EDE3D1`.

| Ground | Hex | Ratio |
|---|---|---|
| Bone | `#F5EFE6` | 5.02 |
| Ivory | `#FCF9F3` | 5.46 |
| Paper | `#FAFAF8` | 5.49 |
| Parchment | `#EDE3D1` | **4.51** (binding) |

Replaces `--nfe-muted #6B6B6B`, which fails on Parchment at 4.19. **Unconsumed until the pilot.**

---

## 5. Token specimen — APPROVED

`/dev/token-specimen` accepted as the Phase 1 exit artifact. Retained as development-only, 404 in production, noindex, excluded from sitemap and navigation, not deployed publicly.

---

## 6. Favicon — SEPARATE MAINTENANCE FIX

Approved NFE brand mark installed as `src/app/icon.png`, sourced from the canonical `nfe-brand-assets` repo (`assets/logo/nfe-publication-logo-512.png`). Gold droplet in a circle on deep green — a mark, not the wordmark.

Scope held narrow as instructed: no header redesign, no wordmark change, no broad metadata rewrite, not bundled into the Our Story pilot.

Result: Best Practices **96 → 100** on all six Lighthouse runs; console errors **1 → 0**.

### Legibility verification — 16×16 FAILS

Rendered from the live `/icon.png` via canvas at true pixel density:

| Size | Verdict |
|---|---|
| 48×48 | **Legible.** Ring and droplet both clear. |
| 32×32 | **Legible.** Ring reads as a ring, droplet distinct. |
| **16×16** | **ILLEGIBLE.** The ring is thinner than one pixel at this scale and breaks into disconnected dots; the droplet collapses to an indistinct blob. Does not read as a mark. |

Per the founder condition ("no additional favicon redesign is required unless it becomes illegible at those sizes"), a remedy **is** required for 16×16.

**Proposed remedy, awaiting approval:** supply a dedicated small-size variant cropped to the droplet, dropping the outer ring margin. Tested at 16×16 and legible. This is a brand-visual change and has **not** been applied.

---

## 7. State colors — RATIFIED

```
--maison-color-error-on-light:   #B91C1C
--maison-color-success-on-light: #166534
```

Both pass WCAG AA on Bone, Ivory, Paper, and Parchment.

**Usage rules:**

- **Not for public use yet**, except when introduced during an approved route migration.
- **Never** use `text-red-600`, `text-green-600`, or `text-green-700` on warm Maison surfaces without explicit contrast verification.
- Package `clay #A04B36` is documented as an **acceptable alternative error tone** (AA on all four grounds: 5.17 / 5.62 / 5.65 / 4.64). `#B91C1C` remains the **stronger default** semantic error candidate.

### Supporting measurements

```
--maison-color-error-on-light:   #B91C1C
--maison-color-success-on-light: #166534
```

**Both current production colors fail on two grounds**, not one:

| Color | Bone | Ivory | Paper | Parchment | Verdict |
|---|---|---|---|---|---|
| `text-red-600` `#DC2626` (29 uses) | **4.22** | 4.60 | 4.62 | **3.80** | FAILS |
| `text-green-700` `#15803D` | **4.39** | 4.77 | 4.80 | **3.94** | FAILS |
| **error candidate** `#B91C1C` | 5.66 | 6.16 | 6.19 | 5.09 | AA all |
| **success candidate** `#166534` | 6.24 | 6.79 | 6.82 | 5.61 | AA all |

They pass on Paper and Ivory, which is why the defect is invisible today — production renders on Paper. Adopting a warm ground would break both.

**Do not adopt the design package's state colors either:** its `sage #5A7057` fails on Parchment at 4.24, the same way its `bronze #8E5F2B` does.

Candidates are standard Tailwind darker shades rather than custom hex, so migration is a class swap with no new color to maintain. **Not consumed publicly.**

---

## 8. Public status copy — REPLACED

`In development` → **`A future NFE ritual`** at `src/app/shop/page.tsx:95` (Body Elixir card).

Verified in browser: renders on one line, no overflow, card structure unchanged. No urgency, release timing, pricing, checkout language, or new CTA added.

---

## 9. Inter versus Figtree — DEFERRED

Retain Inter. Specimen deferred until after token architecture. No migration.

---

## Status summary

| Decision | State | Blocks |
|---|---|---|
| Product sizes | Open — founder verification | Size copy corrections; Face Elixir FAQ fix |
| Garamond license | Not approved | F-Font-01 serif correction; Phase 1 font loading |
| Bronze-gold accent | **RATIFIED** — `#77633C` / `#C6A664` | Nothing. Application gated to token phase. |
| Muted text | **RATIFIED** — `#666666` | Nothing. Unconsumed until pilot. |
| Token specimen | **APPROVED** | Nothing. Phase 1 complete. |
| Favicon | **DONE** — `src/app/icon.png` | Nothing. BP restored to 100. |
| State colors | **RATIFIED** — `#B91C1C` / `#166534` | Public use gated to an approved route migration |
| Status copy | **DONE** — "A future NFE ritual" | Nothing |
| Inter vs Figtree | Deferred | Nothing |

---

## Phase boundary

Per the founder ruling, the Our Story pilot begins only after the favicon, state-color candidates, and copy correction are **complete and reported**. All three are now complete. **The pilot has not been started.**
