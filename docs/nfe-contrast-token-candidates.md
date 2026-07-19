# Contrast-Safe Token Candidates — proposal only

**Status:** **PROPOSAL. Not consumed by any code.** No palette change has been applied.
**Date:** 2026-07-19
**Related:** DDR-1, F-A11y-01
**Action required:** Vanessa approves values before any token bridge work begins.

Every value below was computed with the WCAG 2.x relative-luminance formula against the **actual** token values in `src/styles/tokens.scss` and `tailwind.config.js`, not estimated by eye. Target is **AA for normal text, 4.5:1**.

**Approved design direction (architect, ratified):** darker bronze-gold on light surfaces; the existing brighter gold stays on dark green and cacao; do **not** fix light-ground contrast by enlarging or emboldening the eyebrow treatment; replace opacity-based text colors with explicit semantic tokens.

---

## 1. Measured current state

| Usage | Effective color | Ground | Ratio | AA |
|---|---|---|---|---|
| `text-nfe-gold` eyebrow | `#C6A664` | `#FAFAF8` paper | **2.22:1** | FAIL |
| `text-nfe-gold` eyebrow | `#C6A664` | `#FFFFFF` | **2.32:1** | FAIL |
| `text-nfe-gold` eyebrow | `#C6A664` | `#EFE4D5` parchment | **1.85:1** | FAIL |
| `text-nfe-ink/45` caption | `#919190` | `#FAFAF8` paper | **3.02:1** | FAIL |
| `text-nfe-muted` | `#6B6B6B` | `#EFE4D5` parchment | **4.25:1** | FAIL |
| `text-nfe-paper/50` | `#859A91` | `#103B2A` green | **4.18:1** | FAIL |
| `text-nfe-muted` | `#6B6B6B` | `#FAFAF8` paper | 5.10:1 | PASS |
| `text-nfe-paper/70` | `#B4C1BA` | `#103B2A` green | 6.71:1 | PASS |
| **`text-nfe-gold` on dark** | `#C6A664` | `#103B2A` green | **5.38:1** | **PASS** |
| **`text-nfe-gold` on dark** | `#C6A664` | `#0b291e` green-900 | **6.70:1** | **PASS** |

**The measurements validate the architect's direction empirically.** The existing gold is not broken; it is broken *on light grounds only*. On dark green it clears AA comfortably at 5.38:1. Splitting the token by background is therefore the correct fix, and replacing the gold globally would discard a value that already works.

Two nuances worth noting. `nfe-muted` passes on paper (5.10:1) and fails only on parchment (4.25:1), so it is a narrower problem than a blanket failure. And the gold on parchment at 1.85:1 is the worst case in the system, well under half the required ratio.

---

## 2. Candidate values

Each candidate preserves the source hue by scaling RGB proportionally, so the bronze-gold family character is retained rather than shifted to a different color.

### 2a. Accent on light grounds — the primary fix

| Token | Value | vs paper | vs white | vs parchment |
|---|---|---|---|---|
| `--nfe-color-accent-on-light` | **`#78643C`** | 5.45:1 | 5.70:1 | 4.54:1 |

One value clears AA on all three light grounds. It is derived from `#C6A664` with hue preserved, reading as a deeper bronze rather than a different color. Parchment is the binding constraint at 4.54:1; if parchment is later dropped as a ground, `#867144` would suffice on paper and white and would read slightly warmer.

### 2b. Accent on dark grounds — no change

| Token | Value | vs green | vs green-900 |
|---|---|---|---|
| `--nfe-color-accent-on-dark` | **`#C6A664`** (unchanged) | 5.38:1 | 6.70:1 |

The existing gold, retained exactly. This is the token that carries the current brand character and it already passes.

### 2c. Muted and subtle text

| Token | Value | vs paper | vs white | vs parchment |
|---|---|---|---|---|
| `--nfe-color-text-muted` | **`#676767`** | 5.41:1 | 5.66:1 | 4.51:1 |

A four-step darkening of `#6B6B6B`, essentially imperceptible, chosen so a single muted value is safe on every light ground including parchment.

### 2d. Subtle text on dark green

| Token | Value | vs green | vs green-900 |
|---|---|---|---|
| `--nfe-color-text-subtle-on-dark` | **`#8CA097`** | 4.52:1 | 5.62:1 |

Replaces `text-nfe-paper/50`, which flattens to `#859A91` and fails at 4.18:1.

---

## 3. Retiring opacity-based text colors

The architect's instruction to stop using utilities like `text-nfe-ink/45` for meaningful text is the more important structural change, and the measurements show why. `text-nfe-ink/45` is not a color anyone chose. It is `#111111` composited onto whatever sits behind it, producing `#919190` on paper at 3.02:1. Its contrast is an accident of stacking context, it cannot be audited without knowing the background, and it silently changes if a section background changes.

Known instances, from the Phase 0 audit:

- `text-nfe-ink/45` on Journal article cards, **63 nodes**
- `text-nfe-paper/50` in Science dark sections
- `text-nfe-ink/72`, `text-nfe-paper/70`, `text-nfe-paper/85` elsewhere (these currently pass but share the fragility)

Opacity remains appropriate for decorative and non-informational elements such as dividers, hover states, and image scrims.

---

## 4. Proposed token names

Following the architect's naming:

```
--nfe-color-accent-on-light        #78643C   (new)
--nfe-color-accent-on-dark         #C6A664   (existing gold, unchanged)
--nfe-color-text-muted             #676767   (replaces #6B6B6B)
--nfe-color-text-subtle-on-dark    #8CA097   (replaces text-nfe-paper/50)
```

**Namespace warning (F-Spacing-01 precedent):** production uses a 4px-base `--space-*` scale while the design package uses an 8px base with identical names. Introduce these color tokens under the `--nfe-color-*` namespace rather than extending existing names, so no in-place redefinition causes a sitewide visual shift.

---

## 5. What has not been done

- No token consumed by any component. `#C6A664` and `#6B6B6B` remain live everywhere.
- No global palette change.
- No eyebrow, caption, or heading restyled.
- No opacity utility replaced.

These are Phase 1 token-bridge work, gated on approval of the values above.

---

## 6. Verification method

Ratios computed from `tokens.scss` and `tailwind.config.js` values using the WCAG 2.x formula: sRGB channels linearized (`c/12.92` below 0.04045, else `((c+0.055)/1.055)^2.4`), relative luminance `0.2126R + 0.7152G + 0.0722B`, contrast `(L_lighter + 0.05) / (L_darker + 0.05)`. Opacity utilities were flattened by compositing foreground over background at the stated alpha before measurement.

Minor discrepancies against the Phase 0 baseline audit (which reported 4.24:1, 3.04:1, and 4.47:1 for three of these) come from the audit sampling rendered screenshots while this pass computes from token source. The `text-nfe-paper/50` gap is the largest: the audit measured against a `#173329` ground, whereas the `nfe-green` token is `#103B2A`. Both agree on the pass/fail verdict in every case.
