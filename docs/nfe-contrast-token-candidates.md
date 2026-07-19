# Contrast-Safe Token Candidates — proposal only

**Status:** **RATIFIED 2026-07-19. Not consumed by any code.** No palette change has been applied.
**Date:** 2026-07-19
**Related:** DDR-1, F-A11y-01, DDR-7 (accent pair)
**Action required:** None. Values are approved. Application is gated to the approved token phase.

---

## RATIFIED ACCENT PAIR

```
--nfe-color-accent-on-light: #77633C   /* Bone, Ivory, Parchment, Paper, White */
--nfe-color-accent-on-dark:  #C6A664   /* dark green, green-900, cacao */
```

**Founder reason for ratification:** `#77633C` preserves the intended bronze-gold hue and clears WCAG AA across the approved light surfaces, including the actual parchment token `#EDE3D1`, where `#78643C` narrowly fails.

### Binding rules

1. **Do not use one accent token universally across all backgrounds.** Map accent color by surface role.
2. **Do not adopt `#8E5F2B` as the default bronze without contrast testing.** It fails on the design package's own parchment token.
3. **Preserve the smaller, restrained eyebrow treatment.** Do not solve contrast through larger or louder type.
4. **Replace opacity-based meaningful text colors with explicit semantic tokens.**
5. **Do not apply these tokens in production until the approved token phase.**

### Tested ratios — ratified pair

`--nfe-color-accent-on-light: #77633C` (AA normal text = 4.5:1)

| Ground | Hex | Ratio | AA |
|---|---|---|---|
| Bone (design pkg) | `#F5EFE6` | 5.05:1 | PASS |
| Ivory (design pkg) | `#FCF9F3` | 5.50:1 | PASS |
| **Parchment (design pkg)** | **`#EDE3D1`** | **4.54:1** | **PASS** (binding constraint) |
| Parchment (Phase 0 audit transcription) | `#EFE4D5` | 4.60:1 | PASS |
| Paper (production) | `#FAFAF8` | 5.53:1 | PASS |
| White | `#FFFFFF` | 5.78:1 | PASS |

`--nfe-color-accent-on-dark: #C6A664` (unchanged production gold)

| Ground | Hex | Ratio | AA |
|---|---|---|---|
| Green (production) | `#103B2A` | 5.38:1 | PASS |
| Green-900 (production) | `#0b291e` | 6.70:1 | PASS |
| Cacao (design pkg) | `#1C1510` | 7.77:1 | PASS |

### Rejected alternatives, for the record

| Value | Source | Why rejected |
|---|---|---|
| `#78643C` | earlier proposal | 4.48:1 on parchment `#EDE3D1` — misses AA by 0.02 |
| `#8E5F2B` | design pkg `--nfe-bronze` | 4.32:1 on `#EDE3D1`, 4.38:1 on `#EFE4D5` — fails on both parchment values |
| `#C79A56` | design pkg `--nfe-gold` | Passes on dark, but weaker than production's `#C6A664` on green (4.87:1 vs 5.38:1). No reason to adopt. |

Supporting analysis and method follow below.

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

**Founder ruling 2026-07-19: `#78643C` provisionally approved, conditional on verification against Bone, Ivory, Paper, and Parchment separately, with an explicit instruction not to assume it passes on every light neutral.**

**That verification was run, and the condition caught a real failure.**

| Ground | Hex | `#78643C` | Verdict |
|---|---|---|---|
| Bone (design pkg) | `#F5EFE6` | 4.98:1 | PASS |
| Ivory (design pkg) | `#FCF9F3` | 5.42:1 | PASS |
| **Parchment (design pkg)** | **`#EDE3D1`** | **4.48:1** | **FAIL** |
| Parchment (as measured in Phase 0 audit) | `#EFE4D5` | 4.54:1 | PASS |
| Paper (production) | `#FAFAF8` | 5.45:1 | PASS |
| White | `#FFFFFF` | 5.70:1 | PASS |

`#78643C` misses AA on the design package's real parchment by **0.02**. The earlier draft of this document tested parchment as `#EFE4D5`, the value transcribed in the Phase 0 audit, where it passes. The design package's actual token is `#EDE3D1` in `tokens/colors.css`, slightly deeper and warmer, and there it fails.

### Corrected recommendation

| Token | Value | Bone | Ivory | Parchment (pkg) | Parchment (audit) | Paper | White |
|---|---|---|---|---|---|---|---|
| `--nfe-color-accent-on-light` | **`#77633C`** | 5.05:1 | 5.50:1 | **4.54:1** | 4.60:1 | 5.53:1 | 5.78:1 |

One step darker than the provisional value, hue preserved, visually indistinguishable from `#78643C`. Clears AA on **all six** light grounds with parchment as the binding constraint at 4.54:1.

**Recommendation:** ratify `#77633C` in place of `#78643C`. It satisfies every condition attached to the provisional approval without changing the design intent.

If `#78643C` is preferred for any reason, it is usable only where the ground is Bone, Ivory, Paper, or White, and must not be used on Parchment tint bands. That is a per-surface restriction the token system would have to encode and enforce, which is more fragile than moving one step darker.

### Note on the design package's own bronze

For reference, the package's `--nfe-bronze: #8E5F2B` **also fails AA on parchment**, at 4.32:1 against `#EDE3D1` and 4.38:1 against `#EFE4D5`. Its `--nfe-bronze-deep: #6F4A20` passes everywhere with a 6.17:1 worst case, but is considerably darker than the NFE gold family. This is worth knowing before adopting package accent values directly: the package's primary accent token is not AA-compliant on the package's own tint band.

### 2b. Accent on dark grounds — no change

| Token | Value | vs green `#103B2A` | vs green-900 `#0b291e` | vs cacao `#1C1510` |
|---|---|---|---|---|
| `--nfe-color-accent-on-dark` | **`#C6A664`** (unchanged) | 5.38:1 | 6.70:1 | 7.77:1 |

The existing gold, retained exactly, per the ruling to keep the brighter gold family on dark green and cacao. It passes on all three dark grounds including the design package's cacao, so no change is needed even if cacao sections are introduced later.

The package's own `--nfe-gold: #C79A56` also passes on all three (4.87:1 / 6.06:1 / 7.03:1) but is slightly weaker on green. **Production's existing gold is the better value; there is no reason to adopt the package's.**

### 2c. Muted and subtle text

| Token | Value | vs paper | vs white | vs parchment |
|---|---|---|---|---|
| `--maison-text-muted` | **`#666666`** | 5.49:1 | 5.74:1 | 4.51:1 |

**RATIFIED 2026-07-19 as `#666666`.** Note the correction: the value was `#676767` in the original proposal, tested against the audit's transcribed parchment `#EFE4D5`. Against the design package's actual `#EDE3D1` it measures 4.45 and fails — the same failure mode the founder's verification condition caught on the accent. Full four-ground verification of the ratified value: Bone `#F5EFE6` 5.02 · Ivory `#FCF9F3` 5.46 · Paper `#FAFAF8` 5.49 · Parchment `#EDE3D1` **4.51** (binding). Unconsumed until the pilot.

### State colors on light grounds — CANDIDATES, not ratified

```
--maison-color-error-on-light:   #B91C1C
--maison-color-success-on-light: #166534
```

| Color | Bone | Ivory | Paper | Parchment | Verdict |
|---|---|---|---|---|---|
| `text-red-600` `#DC2626` (29 uses) | **4.22** | 4.60 | 4.62 | **3.80** | FAILS |
| `text-green-700` `#15803D` | **4.39** | 4.77 | 4.80 | **3.94** | FAILS |
| `text-green-600` `#16A34A` | **2.88** | **3.14** | **3.15** | **2.59** | FAILS |
| pkg `sage #5A7057` | 4.72 | 5.14 | 5.17 | **4.24** | FAILS |
| pkg `clay #A04B36` | 5.17 | 5.62 | 5.65 | 4.64 | AA all |
| **error candidate `#B91C1C`** | 5.66 | 6.16 | 6.19 | 5.09 | **AA all** |
| **success candidate `#166534`** | 6.24 | 6.79 | 6.82 | 5.61 | **AA all** |

Both current colors pass on Paper and Ivory and fail on Bone and Parchment. Production renders on Paper today, which is why the defect is invisible. The package's own `sage` fails on Parchment for the same reason its `bronze` does — do not adopt package state colors without testing.

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
--nfe-color-accent-on-light        #77633C   RATIFIED 2026-07-19
--nfe-color-accent-on-dark         #C6A664   RATIFIED 2026-07-19 (existing gold, unchanged)
--maison-text-muted                #666666   RATIFIED 2026-07-19 (replaces #6B6B6B)
--maison-color-error-on-light      #B91C1C   candidate (text-red-600 fails warm grounds)
--maison-color-success-on-light    #166534   candidate (text-green-700 fails warm grounds)
--nfe-color-text-subtle-on-dark    #8CA097   proposed (replaces text-nfe-paper/50)
```

The accent pair is ratified. The two text tokens remain **proposals** and are not yet approved.

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
