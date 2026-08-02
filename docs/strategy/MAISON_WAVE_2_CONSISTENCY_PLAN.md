# NFE Homepage — Consistency Remediation Plan

Written 2026-08-02, before any source change. Branch
`feature/nfe-maison-wave-2-homepage-continuity`.

Every number below was measured from the rendered page at
http://localhost:8807/ at 1440x900, not read off the source and not
estimated from a screenshot.

---

## 0. Method

Four passes, in this order, because each one's output constrains the next:

1. **Census.** Enumerate every rendered text style, every interactive control,
   every ground and every interval as computed values. Done; results below.
2. **Calibrate.** Establish the target counts from the reference the founder
   named (Aesop) plus comparable houses, so "too many" is a number rather than
   an opinion.
3. **Separate drift from hierarchy.** A difference is only a defect if the same
   *role* renders two ways. Different roles rendering differently is the system
   working. This distinction decides what gets touched.
4. **Reduce to a token set, then re-derive the page from it.** Not a sweep of
   one-off corrections. The page gets a vocabulary, and every element declares
   which word it is using.

The failure mode to avoid is flattening. Removing variation until everything
matches is not the goal; the goal is that every variation means something.

---

## 1. Calibration: what the reference actually does

| Principle | Aesop / peer standard | Source |
| --- | --- | --- |
| Typeface count | 2 on web (Suisse Int'l, Optima) | Fonts In Use |
| Palette | monochromatic, 3-4 colours, muted grounds | NN/g |
| Interface heights | **fixed** — the primary button holds the same height as every other control | NN/g |
| Composition | flat, organised by **two stroke widths**, not cards | NN/g |
| Type variation | minimal, reused identically across pages | NN/g |
| Alignment | everything left-aligned to the same grid line | NN/g |

The two that matter most here are **fixed control heights** and **two stroke
widths instead of cards**. NFE already fixed the card problem in Wave 2. It has
not fixed control heights.

---

## 2. Defect register

Severity: **S1** breaks the system visibly on first read. **S2** is felt as
unevenness. **S3** is invisible individually, corrosive in aggregate.

### S1-01 — The same label renders in two different styles

| Label | Occurrence A | Occurrence B |
| --- | --- | --- |
| Join Founder Access | hero: **outline pill** | closing: **filled green pill** |
| Enter the Atelier | section 4: **outline pill** | section 11: **bare green text link** |

Two labels, same destination, two visual weights each. A visitor cannot learn
what a treatment means, because it does not mean anything. This is the single
most damaging inconsistency on the page and almost certainly what the founder
saw first.

### S1-02 — Six control styles for seventeen links

| # | Style | Members |
| --- | --- | --- |
| 1 | filled green pill, h44 | Discover the Philosophy; Explore the NFE Science Map; Join Founder Access |
| 2 | outline pill, **h46** | Join Founder Access; Read the Philosophy; Enter the Atelier; Enter the Ritual; Read the Journal |
| 3 | bare gold uppercase | Discover Face Elixir; Discover Body Elixir |
| 4 | bare green uppercase | Explore your ritual; Continue the ritual; Enter the Atelier |
| 5 | bare serif 24px sentence case | 3 Journal titles |
| 6 | filled gold pill | Speak with NFE |

Six treatments is roughly triple what a restrained house carries.

### S1-03 — Primary and secondary controls are not the same height

Filled pills render **44px**. Outlined pills render **46px**, because the 1px
border sits outside the content box. Side by side in the hero, the secondary
action is 2px taller than the primary. This is the exact discipline NN/g
identifies as the thing Aesop gets right.

### S2-04 — Three letter-spacing values for one control role

All controls are Inter 14px w500 uppercase. Pills track at **2.52px** (0.18em),
bare links at **2.8px** (0.2em). Same role, two values, no reason.

### S2-05 — Three letter-spacing values and three colours for one eyebrow role

| Where | tracking | colour |
| --- | --- | --- |
| hero | 3.84px (0.32em) | `#7a4f22` brown |
| sections 2,3,4,6,7,8,9,11 | 3.6px (0.3em) | `#14543c` green-700 |
| dark sections 5,10 | 3.6px | `#C6A664` gold |
| elixir card eyebrows | **3.0px** (0.25em) | gold |
| hero trust row | **2.64px** (0.22em) | green-900/70 |

Five variants of one label role. The brown `#7a4f22` appears **once on the
entire page** and belongs to no token.

### S2-06 — The third heading tier is three different elements at two sizes

| Section | Element | Size |
| --- | --- | --- |
| Elixirs | `h3` | 30px |
| Brand thesis | `dt` | 24px |
| Journal | `span` inside a link | 24px |

One visual tier, three DOM elements, two sizes. The `span` version is not a
heading at all, so the document outline says these three things are not peers
when visually they are.

### S2-07 — Two light grounds that are perceptually identical

Ground order across 12 sections: `paper paper WHITE paper GREEN WHITE paper
WHITE paper GREEN paper paper`.

`nfe-paper` is `#FAFAF8`, white is `#FFFFFF`. Measured contrast between them:
**1.045:1**. That is below the threshold at which a viewer reads a change as
deliberate. The result is not rhythm; it is a page that feels faintly uneven
for no legible reason. The white sections land at 3, 6 and 8 on no pattern.

### S2-08 — Same body role, two colours

The founder paragraph renders Inter 18px `#6B6B6B` (nfe-muted). Every other
lead paragraph on the page renders Inter 18px `rgba(17,17,17,0.75)`. Same
role, same size, different colour.

### S3-09 — Four body sizes and three colour systems

14 / 16 / 18 / 20px, across `ink/75`, `ink/70` and `nfe-muted`. Some of this is
legitimate (lead vs body vs legal); some is drift. The hero alone carries 20px
and 16px leads where the rest of the page uses 18px.

### S3-10 — Vertical rhythm is uniform, so the page has no pacing

Every section is 96/96 except the closing at 112/112 and the disclaimer at
40/40. Eleven chapters at an identical interval. Nothing is allowed to land;
nothing is allowed to breathe. Restraint is not the same as uniformity.

### S3-11 — Seven CTA verbs for seventeen links

Discover (3), Enter (3), Explore (2), Join (2), Read (2), Speak (1),
Continue (1). "Continue the ritual" points at a Journal article, so the verb
describes a ritual while the destination is a piece of writing.

### S3-12 — Eyebrow capitalisation is inconsistent

Sentence case: "What NFE believes", "Formulation intention", "The ritual",
"The vessel", "An invitation".
Title Case: "The Atelier", "The NFE Science Map", "The Journal", "Concierge".

Partly defensible — the Title Case ones are proper nouns. But that makes
"The ritual" and "The vessel" the odd ones out, and it is a brand decision
whether the Ritual and the Vessel are named things. Separately, the hero
eyebrow is a **full sentence of 7 words ending in a period**; every other
eyebrow is 1-4 words with no terminal punctuation.

---

## 3. Target system

### 3.1 Type roles: 28 to 9

| Role | Family | Size | Colour on paper | Colour on green |
| --- | --- | --- | --- | --- |
| Display | Garamond | 48 / 72 | green-900 | — |
| Chapter | Garamond | 36 / 48 | green-900 | gold |
| Sub | Garamond | 24 / 30 | green-900 | paper |
| Lead | Inter | 18 | ink/75 | paper/85 |
| Body | Inter | 16 | ink/70 | paper/80 |
| Eyebrow | Inter | 12, **0.3em, one value** | green-700 | gold |
| Control | Inter | 14 w500, **0.18em, one value** | per tier | per tier |
| Note | Inter | 14 | muted | — |
| Legal | Inter | 14 | muted | — |

Nine roles, two families. Every element declares one of these and nothing else.

### 3.2 Control tiers: 6 to 3

| Tier | Treatment | Rule | Expected count |
| --- | --- | --- | --- |
| Primary | filled green, **44px fixed** | at most one per chapter | 3-4 per page |
| Secondary | outline, **44px fixed** (border inside the box) | pairs with a primary | 4-5 |
| Quiet | underlined text, no pill, 44px target | in-flow references | 5-6 |

Plus one inviolable rule: **one label, one treatment, everywhere.** If "Enter
the Atelier" is secondary in section 4, it is secondary in section 11.

Journal titles stop being "controls" and become what they are: sub-tier
headings that happen to be linked.

The gold filled pill (Speak with NFE) either becomes the primary treatment for
dark grounds — in which case the Elixirs section's actions must adopt it too —
or it disappears. It cannot remain a single-use style.

### 3.3 Grounds: 3 to 2

Drop `bg-white` entirely. `nfe-paper` for every narrative chapter, `green-900`
for exactly two chapters (Elixirs, Concierge). The two dark chapters become the
page's only tonal events, evenly spaced at positions 5 and 10.

### 3.4 Spacing: one uniform interval to a three-step scale

| Step | Value | Used for |
| --- | --- | --- |
| Chapter | 96px | standard narrative interval |
| Event | 128px | the two dark chapters, so they land |
| Close | 112px | closing invitation |

---

## 4. Execution sequence

Each phase is independently reviewable and independently revertible. Gate after
every phase.

**Phase 1 — Control system.** S1-01, S1-02, S1-03, S2-04. Collapse to three
tiers, fix both height and tracking, enforce one-label-one-treatment. Highest
visible impact, smallest diff, touches only the two link components and the
call sites.

**Phase 2 — Label and heading roles.** S2-05, S2-06. One eyebrow token, one
third-tier element and size. Includes converting the Journal `span` to a real
heading.

**Phase 3 — Ground and rhythm.** S2-07, S3-10. Remove white, apply the
three-step spacing scale.

**Phase 4 — Body roles.** S2-08, S3-09. Collapse to Lead / Body / Note / Legal.

**Phase 5 — Microcopy.** S3-11, S3-12. Verb set and capitalisation rule.
Copy changes, so this is the phase most likely to need founder wording input.

**Phase 6 — Revalidate.** Full eight-viewport sweep, Lighthouse on homepage
desktop and mobile plus Science, selected Science and Ingredients, 380+ tests,
both builds, route matrix.

---

## 5. Regression risk

| Phase | Risk | Verification |
| --- | --- | --- |
| 1 | Touch targets drop below 44px when pills lose padding | measure every control at 430/390/375/320 |
| 1 | Contrast changes if a filled tier moves to a new ground | recompute AA for every control on its actual ground |
| 2 | Heading-level change breaks document outline | assert one h1 and valid order; Lighthouse a11y 100 |
| 3 | Removing white flattens section separation | visual check at all eight widths before commit |
| 3 | Larger dark-chapter padding lengthens mobile scroll | re-measure doc height at 375 and 320 |
| 4 | Lower-contrast body colour fails AA | composite-measure every body colour on its ground |
| 5 | Copy edit introduces a claim or an em dash | existing language and punctuation tests |
| all | Shared token edit leaks into Science | Science, selected Science and Ingredients must stay at 100 and byte-identical |

**Nothing in this plan requires touching a shared token.** Every change is
homepage-local: `src/app/page.tsx` and its two link components. If any fix
appears to need a `tailwind.config.js` change, that is a signal to stop and
raise it, not to proceed.

---

## 6. Out of scope

Science, Ingredients, product pages, Journal/Concierge/Ritual destination
pages, navigation, footer, product data, formula data, pricing, Shopify logic,
focus-group routes, Study Circle, dependencies, deployment configuration,
release branches, tags, the production Worker.

The approved Wave 2 narrative order, the four approved section removals, the
two-occurrence Founder Access rule and the Vessel scope all stand. This plan
changes how the page is dressed, not what it says or the order it says it in.

---

## 7. Decisions the founder needs to make

1. **Pills or rules.** Aesop uses fixed-height controls and two stroke widths,
   not rounded pills. NFE currently uses `rounded-full`. Keeping pills is
   entirely legitimate, but it is a deliberate divergence from the named
   reference. Keep pills, or move to rectilinear controls?
2. **The gold filled pill.** Promote it to the standard primary on dark
   grounds, or retire it?
3. **Are the Ritual and the Vessel proper nouns?** If yes, "The Ritual" and
   "The Vessel" take Title Case like The Atelier and The Journal.
4. **The hero eyebrow.** It is a 7-word sentence with a period where every
   other eyebrow is a 1-4 word fragment. Shorten it to match, or keep it as a
   deliberate opening line?
5. **"Continue the ritual"** currently points at a Journal article. Change the
   label to match the destination, or change the destination?

Items 1-3 change the visual system. Items 4-5 change approved copy. None are
mine to decide.
