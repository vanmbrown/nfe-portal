# NFE Maison — Accessibility Baseline & Acceptance Checklist

**Status:** Phase 1 file 2.7. Reference document, no code impact.
**Date:** 2026-07-19
**Source:** `nfe-maison-baseline-audit.md` §8, carried forward for per-route regression testing.
**Purpose:** the standard every migrated route must meet or beat. **Accessibility must not regress during migration.**

---

## 1. Recorded baseline scores

Lighthouse, fresh local production build.

| Route | A11y (mobile) | A11y (desktop) | Failing audits (nodes) |
|---|---:|---:|---|
| `/` | 96 | 96 | `color-contrast` (4) |
| `/founder-access` | **100** | **100** | none |
| `/science` | **92** | **92** | `color-contrast` (14), `aria-valid-attr-value` (1) |
| `/journal` | 96 | 96 | `color-contrast` (63) |

**Every failure except one is color contrast**, and contrast is token-level rather than per-page. Fixing the tokens should move all four routes toward 100 without touching route markup.

`/founder-access` is at 100 and is protected. **Any change that drops it below 100 is a stop condition.**

---

## 2. Strengths to protect

These are verified present and must survive migration:

- **Skip link** — `SkipLinkHandler`, target `#main-content`
- **`:focus-visible` outline** — global in `globals.scss`
- **`prefers-reduced-motion`** — honored globally, `globals.scss:59`
- **Dialog semantics** — `Modal` uses `role="dialog"`, `aria-modal`, Escape to close. Reusable for accessible overlays.
- **Image alt text** — 0 missing across 24 captures
- **One `<h1>` per page**, semantic landmarks present
- **No horizontal overflow** at 1440 / 768 / 390 on all 8 audited routes

**Icon posture:** keep functional glyphs (menu, close, disclosure, validation, password visibility). The design package's "no icons under any circumstances" is **rejected as universal**. Flag decorative proliferation only.

---

## 3. Known issues carried into Phase 1+

### F-A11y-01 — color contrast (HIGH, systemic, token-level)

| Offender | Effective | Ground | Ratio |
|---|---|---|---|
| `text-nfe-gold` eyebrow | `#C6A664` | paper `#FAFAF8` | 2.22:1 |
| `text-nfe-gold` eyebrow | `#C6A664` | white | 2.32:1 |
| `text-nfe-gold` eyebrow | `#C6A664` | parchment `#EDE3D1` | 1.85:1 |
| `text-nfe-ink/45` caption | `#919190` | paper | 3.02:1 |
| `text-nfe-muted` | `#6B6B6B` | parchment | 4.25:1 |
| `text-nfe-paper/50` | `#859A91` | green `#103B2A` | 4.18:1 |

Ratified remedy: `--maison-accent-on-light: #77633C` for light grounds, `--maison-accent-on-dark: #C6A664` retained for dark. Values approved; **application is a separate gated step**.

The 63 Journal nodes are a single repeated pattern on article cards, so one token change resolves them all.

### F-A11y-02 — invalid `aria-controls` (MEDIUM)

`ScienceTab.tsx:83` — a `<button role="tab" aria-controls="science-panel">` references a panel absent from the a11y tree at initial paint; `#science-panel` mounts only after tab interaction. This is the single non-contrast failure and the reason `/science` sits at 92. Fix during foundation-components work.

---

## 4. Per-route acceptance checklist

Run before any route migration is accepted.

**Automated**

- [ ] Lighthouse a11y **>= the recorded baseline** for that route. Never lower.
- [ ] `/founder-access` remains **100**.
- [ ] axe: zero new violations versus baseline.
- [ ] No new `color-contrast` nodes introduced.

**Contrast**

- [ ] Every text/ground pair >= 4.5:1 normal, 3:1 large.
- [ ] **Test against parchment `#EDE3D1` specifically.** It is the binding constraint on every light-ground token; two candidate values passed on other grounds and failed only here.
- [ ] Zero new opacity-based colors for meaningful text. Use explicit semantic tokens.
- [ ] Accent mapped by surface role, never one accent universally.

**Keyboard and focus**

- [ ] Skip link present and functional.
- [ ] Visible `:focus-visible` on every interactive element.
- [ ] Logical tab order; no traps.
- [ ] Modals: Escape closes, focus returns to trigger.

**Structure**

- [ ] Exactly one `<h1>`.
- [ ] No skipped heading levels.
- [ ] Landmarks present.
- [ ] Every image has meaningful `alt`; decorative images `alt=""`.

**Responsive and motion**

- [ ] No horizontal overflow at 1440 / 768 / 390.
- [ ] Usable at 200% zoom.
- [ ] Touch targets >= 44px; form controls keep accessible shapes (DDR-5).
- [ ] `prefers-reduced-motion` honored by any new animation.

---

## 5. Verification method

Contrast ratios computed with the WCAG 2.x formula from token source: channels linearized (`c/12.92` below 0.04045, else `((c+0.055)/1.055)^2.4`), relative luminance `0.2126R + 0.7152G + 0.0722B`, contrast `(L_light + 0.05) / (L_dark + 0.05)`. Opacity utilities are flattened by compositing over their ground before measurement, since their effective contrast depends on stacking context rather than any chosen value.

Full measurements: `nfe-contrast-token-candidates.md` and `nfe-maison-token-map.md` §3.
