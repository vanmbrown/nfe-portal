# Product Photography Needs

**Status:** Internal record. No assets commissioned or sourced.
**Date:** 2026-07-19
**Related:** F-Asset-02
**Action required:** Vanessa approves real photography before any asset is restored.

Four zero-byte placeholder files were removed from the repository in the pre-Phase-1 stabilization pass. This document records what they were meant to be, so the need is not lost now that the references are gone.

---

## What was removed

| File | Intended subject | Declared dimensions |
|---|---|---|
| `public/images/products/face-elixir-hero.jpg` | NFE Face Elixir bottle with dropper | 800 × 1000 |
| `public/images/products/face-elixir-detail.jpg` | Close-up of Face Elixir serum texture | 600 × 600 |
| `public/images/products/body-elixir-hero.jpg` | NFE Body Elixir bottle with pump dispenser | 800 × 1000 |
| `public/images/products/body-elixir-detail.jpg` | Close-up of Body Elixir serum texture | 600 × 600 |

All four were **0 bytes**. The subjects and dimensions above come from the `alt` text and `width`/`height` values in the removed entries, which are preserved here as the specification for future shoots.

The `images: []` arrays in `src/content/products/face-elixir.ts` and `body-elixir.ts` remain in place with an explanatory comment. The field is required by the `ProductData` interface, so it was emptied rather than deleted.

---

## Restoration rules

Per the architect's stabilization direction:

- **No placeholders.** Do not reintroduce empty or dummy files.
- **No stock imagery.** NFE product photography is brand-critical.
- **Real assets only**, approved by Vanessa before commit.
- **Optimized WebP**, not raw JPEG. For reference, the Our Story pilot on `wip/our-story-maison` took a hero from 3.9 MB to 163 KB with no visible quality loss.
- Serve through `next/image` so sizing and format negotiation are handled.

---

## Existing product imagery that may already cover this

Before commissioning new work, check what is already available:

| Asset | Location |
|---|---|
| `body-elixir-packshot.png`, `body-elixir-packshot-white.png` | `nfe-brand-assets` under `assets/images/products/body-elixir/` |
| `radiant-body-elixir-white.png` | current hero in `data/products/body-elixir.json` |
| `NFE_face_elixir_30_50_proportions_fixed.png` | current hero in `data/products/face-elixir.json` |

The packshots in `nfe-brand-assets` may satisfy the hero requirement without a new shoot. The detail/texture shots have no existing equivalent and would need to be produced.

---

## Note on `public/images/products/` hygiene

Separate from this need, F-Perf-04 records roughly **26.6 MB of raw product JPEGs** in that directory, including eight 2992 × 2992 files, several of which appear unreferenced. That cleanup is out of scope for stabilization but should be addressed before launch to reduce deploy weight.
