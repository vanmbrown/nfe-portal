# NFE Maison — Token Map

**Status:** Phase 1 file 2.6. Tokens **defined, not consumed**.
**Date:** 2026-07-19
**Implements:** `nfe-maison-phase-1-file-plan.md` §2.1, §2.6
**File:** `src/styles/nfe-tokens.css`, imported by `src/styles/globals.scss` after `tokens.scss`

---

## 1. The namespace rule, and why it exists

Every new token is prefixed `--maison-`. This is not cosmetic.

**Verified collision:** the design package and production both define `--nfe-gold` with different values.

| Variable | Production | Design package |
|---|---|---|
| `--nfe-gold` | `#C6A664` | `#C79A56` |

Importing the package's `tokens/colors.css` would silently redefine `--nfe-gold` and shift gold across every surface that uses it. This is the color-space analogue of **F-Spacing-01**, where production's `--space-*` scale is 4px-base and the package's is 8px-base under identical names.

**Rules, enforced by convention in `nfe-tokens.css`:**

1. Never redefine `--nfe-*`, `--space-*`, `--font-*`, or `--focus-ring`.
2. Never import the design package's CSS directly into the app.
3. All new tokens use `--maison-*`.

---

## 2. Adoption status

| New token | Value | Replaces / relates to | Status | Consumed? |
|---|---|---|---|---|
| `--maison-accent-on-light` | `#77633C` | `text-nfe-gold` on light grounds | **RATIFIED** | No |
| `--maison-accent-on-dark` | `#C6A664` | `--nfe-gold` on dark, unchanged | **RATIFIED** | No |
| `--maison-text-muted` | `#666666` | `--nfe-muted` `#6B6B6B` | Proposed | No |
| `--maison-text-subtle-on-dark` | `#8CA097` | `text-nfe-paper/50` | Proposed | No |
| `--maison-bone` | `#F5EFE6` | new warm ground (DDR-1) | Additive | No |
| `--maison-ivory` | `#FCF9F3` | new raised surface | Additive | No |
| `--maison-parchment` | `#EDE3D1` | new tint band | Additive | No |
| `--maison-cacao` | `#1C1510` | new dark ground | Additive | No |
| `--maison-espresso` | `#2B2018` | text on warm grounds | Additive | No |
| `--maison-umber` | `#6B5945` | secondary text, ledes | Additive | No |
| `--maison-hairline` | `#E3D7C3` | borders, rules | Additive | No |
| `--maison-green` | alias → `--nfe-green` | signature anchor | Alias | No |
| `--maison-green-900` | alias → `--nfe-green-900` | | Alias | No |
| `--maison-green-700` | alias → `--nfe-green-700` | | Alias | No |
| `--maison-ink` | alias → `--nfe-ink` | | Alias | No |
| `--maison-paper` | alias → `--nfe-paper` | | Alias | No |
| `--maison-space-1…12` | 8px base | parallel to `--space-*` 4px base | Additive | No |
| `--maison-radius-*` | 0 / 2 / 4px | DDR-5 selective sharpness | Additive | No |

Anchor tokens are `var()` aliases rather than duplicated hex, so production remains the single source of truth for brand colors.

---

## 3. Documented contrast pairs (Phase 1 exit criterion)

AA for normal text is 4.5:1. Measured from token source with the WCAG 2.x formula.

### On light grounds

| Foreground | Bone `#F5EFE6` | Ivory `#FCF9F3` | Parchment `#EDE3D1` | Paper `#FAFAF8` |
|---|---|---|---|---|
| Espresso `#2B2018` | 13.89 | 15.11 | 12.48 | 15.19 |
| Umber `#6B5945` | 5.85 | 6.36 | 5.26 | 6.40 |
| **accent-on-light `#77633C`** | **5.05** | **5.50** | **4.54** | **5.53** |
| text-muted `#666666` | 5.02 | 5.46 | 4.51 | 5.49 |
| Ink `#111111` (prod) | 16.52 | 17.97 | 14.84 | 18.07 |
| ~~Taupe `#9A8770`~~ | **3.02 FAIL** | **3.29 FAIL** | **2.72 FAIL** | **3.31 FAIL** |

### On dark grounds

| Foreground | Green `#103B2A` | Green-900 `#0b291e` | Cacao `#1C1510` |
|---|---|---|---|
| **accent-on-dark `#C6A664`** | **5.38** | **6.70** | **7.77** |
| Bone `#F5EFE6` | 10.93 | 13.61 | 15.78 |
| text-subtle-on-dark `#8CA097` | 4.52 | 5.62 | 6.52 |

Parchment `#EDE3D1` is the binding constraint on every light-ground token. Any candidate must be tested against it specifically.

---

## 4. Tokens deliberately excluded

| Token | Value | Why excluded |
|---|---|---|
| `--maison-taupe` | `#9A8770` | Fails AA on **every** light ground (2.72–3.31:1). The package designates it "captions, metadata only — never text below 16px", but at these ratios it fails normal-text AA outright and only marginally clears large-text AA. Omitted so it cannot be reached for accidentally. |
| `--maison-gold` | `#C79A56` | Package gold is weaker on green than production's (4.87 vs 5.38). No reason to adopt, and the name collides. |
| `--maison-bronze` | `#8E5F2B` | Package's primary accent fails AA on the package's own parchment (4.32:1). |
| serif font loading | — | Garamond web embedding **not approved**. See `nfe-founder-decisions-2026-07-19.md` §2. |
| `--maison-sage` / `--maison-clay` | `#5A7057` / `#A04B36` | Form success/error states. Not needed until form work; production has its own. |

---

## 5. Verification performed

- `npx tsc --noEmit` clean.
- `next build` green. The one Sass deprecation warning is **pre-existing**, confirmed by building with the change stashed: 1 warning both with and without.
- Built CSS contains `--maison-accent-on-light:#77633c` and the rest of the set, proving the import resolves.
- Built CSS still contains `--nfe-gold:#C6A664` and `--nfe-green:#103B2A` unchanged.
- Zero `--maison-*` references in any `.tsx`, `.ts`, or `.scss` component file.
- `/shop` rendered in browser: no console errors, no visual change.

---

## 6. Next step

Consuming these tokens is a **separate, founder-gated step**. The ratified accent pair is approved as *values*; applying them to components is not yet authorized.

Per the founder ruling: *"Do not apply these tokens in production until the approved token phase."*
