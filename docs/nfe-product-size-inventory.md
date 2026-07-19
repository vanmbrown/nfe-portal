# Product Size Inventory — for founder verification

**Status:** Inventory only. **No size copy was changed.**
**Date:** 2026-07-19
**Related:** DDR-6, F-Size-01, F-Size-02
**Action required:** Vanessa verifies against physical fill labels and the final product specification.

This document lists every volume reference currently in the codebase. Per DDR-6 and the source-of-truth hierarchy, product facts are **not** reconciled by inference. Nothing here has been corrected.

---

## 1. The headline conflict (Body Elixir)

| Source | Claim |
|---|---|
| Production (`src/content/products/body-elixir.ts:116`) | **200ml / 6.8 fl oz** |
| Production FAQ (`src/content/products/body-elixir.ts:112`) | "One bottle (**200ml**) lasts approximately 2-3 months with daily use." |
| Maison design package | **125ml / 75ml**, stated as "per packaging" |
| Design package's own audit section | **200ml** |

The design package contradicts itself. Production is internally consistent at 200ml.

**To verify:** the net contents printed on the physical Body Elixir label.

---

## 2. The live Face Elixir contradiction

This is a second issue, and unlike the Body Elixir conflict it is a contradiction **inside production**, visible to customers today.

| Source | Claim | Live? |
|---|---|---|
| `src/content/products/face-elixir.ts:172` | `volume: '30ml / 1 fl oz'` — **single SKU** | Yes |
| `src/content/products/face-elixir.ts:164` | "One bottle (**30ml**) lasts approximately 2-3 months" | Yes |
| `src/components/products/face-elixir/FaceElixirFAQ.tsx:38` | "How long will a **30 ml or 50 ml** bottle last?" — **two SKUs** | **Yes** |
| `src/components/products/FaceElixirSections.tsx:44-57` | Detailed **30ml and 50ml** breakdown with day counts | **No — dead code** |
| `data/products/face-elixir.json` | hero image `NFE_face_elixir_30_50_proportions_fixed.png` | Yes |

**The product data says one 30ml bottle. The live FAQ offers a choice between 30ml and 50ml.** A customer reading the product page sees a single 30ml SKU and then an FAQ that assumes they might own a 50ml.

### The two FAQ components also disagree with each other

| Component | 30ml lasts | 50ml lasts | Live? |
|---|---|---|---|
| `FaceElixirFAQ.tsx:39` | ~1–3 months | **~3–5 months** | Yes |
| `FaceElixirSections.tsx:54,57` | 1–3 months (31–94 days, avg ~75) | **2–4 months** (52–156 days, avg ~125) | No |

The 50ml longevity claim differs between the two files. `FaceElixirSections.tsx` has **zero import sites** and is dead code, so only the first set is public. Both derive from the same "each pump dispenses ~0.20 ml" premise.

**To verify:** whether 50ml is a real planned SKU or outdated planning material, and the correct net contents for the Face Elixir.

---

## 3. Supporting evidence to review

`public/images/products/NFE_face_elixir_30_50_proportions_fixed.png` (958 KB) is a proportions comparison rendering both a 30 and a 50, and it is the current hero image in `data/products/face-elixir.json`. "fixed" in the filename suggests a prior correction. Worth opening before checking labels, since it may indicate the 30/50 lineup was a deliberate decision rather than drift.

---

## 4. Complete reference list

Every volume string in source, excluding Tailwind `ml-*` margin utilities:

| File | Line | Text |
|---|---|---|
| `src/content/products/body-elixir.ts` | 112 | `'One bottle (200ml) lasts approximately 2-3 months with daily use.'` |
| `src/content/products/body-elixir.ts` | 116 | `volume: '200ml / 6.8 fl oz'` |
| `src/content/products/face-elixir.ts` | 164 | `'One bottle (30ml) lasts approximately 2-3 months with daily use.'` |
| `src/content/products/face-elixir.ts` | 172 | `volume: '30ml / 1 fl oz'` |
| `src/components/products/face-elixir/FaceElixirFAQ.tsx` | 38 | `'How long will a 30 ml or 50 ml bottle last?'` |
| `src/components/products/face-elixir/FaceElixirFAQ.tsx` | 39 | `'Each pump dispenses ~0.20 ml. 1–2 pumps per use typically lasts ~1–3 months for 30 ml and ~3–5 months for 50 ml...'` |
| `src/components/products/FaceElixirSections.tsx` | 44 | `"How long will a 30 ml or 50 ml bottle of the Face Elixir last?"` (dead code) |
| `src/components/products/FaceElixirSections.tsx` | 45, 50 | `"Each pump dispenses about 0.20 ml of product."` (dead code) |
| `src/components/products/FaceElixirSections.tsx` | 54 | `"30 ml bottle: approximately 1–3 months (31–94 days, average ~75 days)"` (dead code) |
| `src/components/products/FaceElixirSections.tsx` | 57 | `"50 ml bottle: approximately 2–4 months (52–156 days, average ~125 days)"` (dead code) |

Note that both elixirs claim "approximately 2-3 months" despite a 170ml difference in volume. That may be correct given face versus full-body application rates, but it is worth a sanity check alongside the label verification.

---

## 5. Questions for Vanessa

1. Body Elixir net contents: 200ml, or 125ml/75ml?
2. Is the Face Elixir a single 30ml SKU, or a 30ml and 50ml pair?
3. If 50ml is real, which longevity figure is correct: ~3–5 months or ~2–4 months?
4. Is `FaceElixirSections.tsx` intended to be revived, or should it be deleted as dead code in a later pass?

Until these are answered, **no size copy changes.**
