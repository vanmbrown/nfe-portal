# NFE Homepage — Consistency Refinement Record (Phase C)

Recorded 2026-08-02. Branch `feature/nfe-maison-wave-2-homepage-continuity`.
Phase C start `d59b886`, end `c6d5754`.

## Commit-scope correction

Phase C was planned as four narrow commits. Three of them touch the same file,
`src/app/page.tsx`, and cannot be separated without interactive staging, so the
source work landed as a single commit:

- `80da480` — message describes the control system only, but the commit also
  contains the typography-role unification, the ground reduction, the section
  rhythm, and the layout-stability fix described below.
- `c6d5754` — the test guards.

The message under-describes its commit. It was already pushed when this was
noticed, and history on this branch is not rewritten, so the full scope is
recorded here instead.

## What changed

### Controls: 6 styles to 3 tiers

| Tier | Ground | Fill | Border | Text | Rendered height | Radius |
| --- | --- | --- | --- | --- | ---: | --- |
| Primary | light | `#0b291e` | transparent 1px | `#FAFAF8` | 46px | `rounded-sm` |
| Primary | dark | `#C6A664` | transparent 1px | `#0b291e` | 46px | `rounded-sm` |
| Secondary | light | none | 1px `#0b291e` | `#0b291e` | 46px | `rounded-sm` |
| Secondary | dark | none | 1px `#C6A664`/60 | `#C6A664` | 46px | `rounded-sm` |
| Text action | either | none | rule under type | ground-appropriate | 44px min | none |

Every tier shares one base: `min-h-[44px]`, `border`, `rounded-sm`, `px-6`,
`py-3`, `text-sm`, `font-medium`, `tracking-[0.18em]`, and a visible focus ring.

The border is present on all four button tiers — transparent on the filled ones
— so a border can no longer change rendered height. Previously filled controls
rendered 44px and outlined 46px and the two sat beside each other in the hero.

`min-h` rather than a fixed `h-11`: measured at 320px, "Discover the
Philosophy" and "Explore the NFE Science Map" wrap to two lines and render
66px. A fixed 44px height would have clipped them.

The `secondary-dark` tier is defined but not currently used; it exists so a
future dark-ground secondary does not invent a sixth style.

### Assignment of all 17 links

| Tier | Links |
| --- | --- |
| Primary light | Discover the Philosophy; Explore the NFE Science Map |
| Primary dark | Discover Face Elixir; Discover Body Elixir; Speak with NFE |
| Secondary light | Join Founder Access (x2); Read the Philosophy; Enter The Atelier (x2); Enter The Ritual; Read The Journal |
| Text action | Explore your ritual; Read the refill note |
| Sub-tier heading | 3 Journal titles (headings that link, not controls) |

### Repeated labels

| Label | Before | After |
| --- | --- | --- |
| Join Founder Access | outline pill (hero), filled pill (closing) | secondary in both |
| Enter The Atelier | outline pill (s4), bare text link (s11) | secondary in both |

Measured on the rendered page, repeated-label style conflicts: **0**.

Founder Access resolving to secondary is the one place this rule cost
something. The closing loses its filled control and carries emphasis in the
heading and surrounding space instead. Reversing it would require either a
second treatment for the same label or promoting the hero occurrence.

### Typography: 28 voices to 9 roles

| # | Role | Family | Size | Tracking |
| ---: | --- | --- | --- | --- |
| 1 | Display | Garamond | 48 / 72 | normal |
| 2 | Chapter | Garamond | 36 / 48 | normal |
| 3 | Sub | Garamond | 24 / 30 | normal |
| 4 | Hero kicker | Inter | 12 | 0.32em |
| 5 | Eyebrow | Inter | 12 | 0.3em |
| 6 | Control label | Inter | 14 w500 | 0.18em |
| 7 | Lead | Inter | 18 | normal |
| 8 | Body | Inter | 16 | normal |
| 9 | Note / legal | Inter | 14 | normal |

Every rendered element maps to one of the nine; unmapped: **0**. The raw
computed-voice count is 24 rather than 9 because a role renders in more than
one colour depending on its ground, which is permitted variation, not drift.

Three uppercase trackings remain, each with one job: 0.32em kicker (once on the
page), 0.3em eyebrow, 0.18em control and metadata.

### Correction to the audit

The audit called `#7a4f22` an orphan belonging to no token. That was true of the
homepage and wrong about the site: it appears in eight files including Science,
shop, Concierge, Discovery, Founder Access and the elixir editorial page, where
it is the eyebrow colour for warm grounds. It is kept for the hero kicker.

### Grounds: 3 to 2

`bg-white` removed. `nfe-paper` (`#FAFAF8`) and white (`#FFFFFF`) measure
**1.045:1** against each other, below the threshold at which a change reads as
deliberate. Order is now warm hero, then paper throughout, with green at
sections 5 and 10.

### Rhythm: 1 interval to 3

| Interval | Utility | Sections |
| ---: | --- | --- |
| 96px | `py-16 md:py-24` | Founder, The Ritual, The Vessel |
| 112px | `py-20 md:py-28` | Brand Thesis, Product Philosophy, The Journal, Closing |
| 128px | `py-24 md:py-32` | The Atelier, Science, Concierge |

### Layout stability

Folding the hero metadata row into the eyebrow treatment widened it to 0.3em,
which placed its three items exactly on their flex-wrap threshold: the row
wrapped under fallback font metrics and unwrapped when Inter loaded. Measured
across three Lighthouse runs, that single reflow took desktop CLS from 0.0036
to **0.0692** — stable, not variance, and confirmed by rebuilding the Phase B
page on the same toolchain and reproducing 0.0036.

The row is metadata rather than a section eyebrow, so it now takes the control
tracking at 0.18em. That is narrower than the 0.22em it started at, so it clears
the threshold at every width, and it removes a tracking variant rather than
restoring one. CLS returned to 0.0036 and desktop performance to 100.

## Measured results

| System | Before | After | Target |
| --- | ---: | ---: | ---: |
| Type roles (unmapped elements) | n/a | 0 | 0 |
| Computed type voices | 28 | 24 | fewer |
| Control styles | 6 | 4 (3 tiers + text action) | 3 tiers |
| Control height spread | 44 and 46 | uniform 46 | uniform |
| Repeated-label conflicts | 2 | 0 | 0 |
| Eyebrow variants | 5 | 2 (kicker + eyebrow) | 2 |
| Uppercase trackings | 5 | 3 | 3 |
| Light grounds | 2 (1.045:1 apart) | 1 | 1 |
| Section intervals | 1 | 3 | 3 |
| `rounded-full` controls | 11 | 0 | 0 |

| Route | a11y | perf | LCP | CLS |
| --- | ---: | ---: | ---: | ---: |
| Home desktop | 100 | 100 | 0.5 s | 0.004 |
| Home mobile | 100 | 95 | 2.9 s | 0 |
| `/science` | 100 | 100 | 0.6 s | 0 |
| Selected `/science` | 100 | 100 | 0.6 s | 0 |
| `/inci` | 100 | 100 | 0.6 s | 0 |

Control contrast: all 17 pass. Gold on green measures 6.70:1, green fill 14.88:1,
every secondary border at or above 12.39:1.

Eight viewports (1440, 1280, 1024, 768, 430, 390, 375, 320): no horizontal
overflow, no clipped headings, no text within 16px of an edge, no control below
44px, no repeated-label conflict, 12 sections present at every width.

397 tests pass. TypeScript, ESLint, Next build and OpenNext build all exit 0.
63 routes. No dependency or lockfile change.

## Guard verification

Each new guard was proven to fail when its behaviour was reverted, then the
source was restored: pill returns, filled tier loses its fixed height, repeated
label splits treatment, white ground returns, rhythm flattens to one interval,
maison naming drifts, vessel CTA misnames its destination. All seven caught.

## Not changed

Section order, section count, all copy except the vessel CTA label, all
destinations, Science, Ingredients, product pages, destination pages,
navigation, footer, routes, commerce, dependencies, Tailwind config, shared
tokens, Worker configuration. Nothing deployed.
