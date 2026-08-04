# Maison Wave 2 — Homepage Release Assembly and Predeployment Review

Recorded 2026-08-04. Release-engineering and verification only. Nothing deployed.

## Founder approval

The Maison Wave 2 homepage completed founder visual review and is approved. No
design, copy, typography, control, spacing, layout, destination or functionality
change was made during assembly.

| Item | Value |
| --- | --- |
| Approved feature branch | `feature/nfe-maison-wave-2-homepage-continuity` |
| Approved full SHA | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` |
| Release branch | `release/maison-wave-2-homepage-continuity` |
| Release HEAD (application source) | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` |
| Deployment status | **not deployed** |

The remote feature tip resolved to the reviewed commit exactly. It had not
advanced beyond `16ab538`.

## Verified production baseline

Established at the moment of assembly rather than assumed from prior reports.

| Evidence | Value | Source |
| --- | --- | --- |
| Live Worker version | `c44359b1-cbd7-443c-9439-f2fe84e916bb` | `wrangler deployments list`, newest entry |
| Traffic | 100% | same |
| Deployment timestamp | 2026-07-31T03:07:53Z | same |
| Production source branch | `release/science-final-refinement` | repository + closeout record |
| Deployed application source | `1e78ea1f6ad4a084b21d02cffe38a53116c222a6` | closeout record, tag `nfe-science-final-refinement-2026-07-30` |
| Production closeout head | `811f8626786c5080a6d62965d370ce452c017980` | `origin/release/science-final-refinement` |
| Rollback target | `c25b8b8a-5a4a-44ea-8812-df0ccf619008` | `wrangler versions list`, retained |

Live behaviour corroborated the source identity. `www.nfebeauty.com` returned
200 on every canonical route and 404 on `/study-circle` and
`/dev/token-specimen`. The live homepage contained **zero** occurrences of the
approved Wave 2 strings ("One considered philosophy", "Read the refill note",
"Explore your ritual"), and `/science` served the closed refinement (the
"Stratum Corneum" band label). No evidence conflicted.

`811f862` differs from the deployed source only by the Phase 1 closeout
documentation appended to the Science blueprint, +139 lines, no application
source.

## Ancestry

| Relationship | Result |
| --- | --- |
| `merge-base(1e78ea1, 16ab538)` | `1e78ea1` |
| Deployed source is an ancestor of the approved tip | yes |
| Production closeout head is an ancestor of the approved tip | yes |
| Commits present only on production | **0** |
| Commits present only on the approved homepage | 11 |
| Classification | **A — fast-forward only** |

The eleven right-only commits are the complete Maison Wave 2 homepage history,
from `f7021c6` (audit) to `16ab538` (editorial link guards).

## Assembly

A fresh detached worktree was created at the verified production closeout head,
and the release branch was cut there before integration.

| Step | Result |
| --- | --- |
| Release branch existed already? | no, local and remote both absent |
| Starting HEAD | `811f8626786c5080a6d62965d370ce452c017980` |
| Integration | `git merge --ff-only 16ab538` |
| Merge commits created | **0** |
| Conflicts | none |
| Final application-source HEAD | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` |
| `git diff 16ab538..HEAD` | empty |
| `git diff --word-diff 16ab538..HEAD -- src/app/page.tsx` | no output |
| Production closeout preserved in history | yes |
| Deployed production source preserved in history | yes |
| Working tree | clean |

The release application source is byte-identical to the founder-reviewed tip.

## Source diff against production

`git diff 1e78ea1...HEAD` — six files, every one inside approved scope.

| File | Category | Status |
| --- | --- | --- |
| `src/app/page.tsx` | homepage implementation | approved |
| `tests/unit/homepage-narrative.test.ts` | homepage tests | approved |
| `docs/strategy/MAISON_WAVE_2_HOMEPAGE_AUDIT.md` | homepage audit documentation | approved |
| `docs/strategy/MAISON_WAVE_2_CONSISTENCY_PLAN.md` | homepage consistency documentation | approved |
| `docs/strategy/MAISON_WAVE_2_CONSISTENCY_RECORD.md` | homepage consistency documentation | approved |
| `docs/strategy/SCIENCE_AUTHORITY_GUIDED_EDUCATION_BLUEPRINT.md` | inherited production closeout documentation | approved |

No unexplained file. Science, Ingredients, product pages, product data, formula
data, pricing, checkout, Shopify, Sanity, Supabase, focus-group logic, Study
Circle, navigation, footer architecture, dependencies, lockfile, Tailwind,
Next and Cloudflare configuration are all untouched. Dependencies remain 28
production and 21 development.

## Homepage inventory as assembled

Twelve sections, approved order, measured on the rendered page at every tested
width.

| # | Section | Ground | Desktop interval |
| ---: | --- | --- | ---: |
| 1 | Quiet Hero | warm `#EFE4D5` | hero |
| 2 | Brand Thesis | paper `#FAFAF8` | 112 |
| 3 | Founder Proof | paper | 96 |
| 4 | Product Philosophy | paper | 112 |
| 5 | The Atelier | green `#0B291E` | 128 |
| 6 | The NFE Science Map | paper | 128 |
| 7 | The Ritual | paper | 96 |
| 8 | The Vessel | paper | 96 |
| 9 | The Journal | paper | 112 |
| 10 | Concierge | green | 128 |
| 11 | Closing Invitation | paper | 112 |
| 12 | Legal disclaimer | paper | 40 |

Atelier heading renders exactly: **Two elixirs. One considered philosophy.**

Grounds: one warm hero, one paper editorial ground, two green chapters. No
white ground and no imperceptible light alternation. Mobile intervals 64 / 80 /
96 at 430, 390, 375 and 320.

## Action system

Seventeen actions, no duplicate treatment for a repeated label, no
`rounded-full`, every control at least 44px of effective touch height.

| Label | Section | Destination | Role | Treatment | Height |
| --- | --- | --- | --- | --- | ---: |
| Discover the Philosophy | Hero | `#brand-thesis` | principal | green filled | 46 |
| Join Founder Access | Hero | `/founder-access` | secondary | outlined | 46 |
| Read the Philosophy | Founder Proof | `/our-story` | secondary | outlined | 46 |
| Enter The Atelier | Product Philosophy | `/shop` | secondary | outlined | 46 |
| Discover Face Elixir | The Atelier | `/products/face-elixir` | principal, dark | gold filled | 46 |
| Discover Body Elixir | The Atelier | `/products/body-elixir` | principal, dark | gold filled | 46 |
| Explore the NFE Science Map | Science | `/science` | principal | green filled | 46 |
| Enter The Ritual | The Ritual | `/ritual` | principal | green filled | 46 |
| Explore your ritual | The Ritual | `/skin-ritual-quiz` | editorial | text action | 44 |
| Read the refill note | The Vessel | `/articles/refill-culture-quiet-sustainable-luxury` | editorial | text action | 44 |
| Well-Aging Is Not Disappearing | The Journal | `/articles/well-aging-is-not-disappearing` | editorial | heading link | 44–113 |
| Barrier Wealth | The Journal | `/articles/barrier-wealth-aging-melanated-skin` | editorial | heading link | 44–77 |
| Body Care | The Journal | `/articles/body-care-neglected-prestige-beauty` | editorial | heading link | 44 |
| Read The Journal | The Journal | `/journal` | secondary | outlined | 46 |
| Speak with NFE | Concierge | `/concierge` | principal, dark | gold filled | 46 |
| Join Founder Access | Closing | `/founder-access` | secondary | outlined | 46 |
| Enter The Atelier | Closing | `/shop` | secondary | outlined | 46 |

Heading links expand rather than clip when a title wraps; the range shown is
across the eight tested widths.

## Editorial link states

Measured with the pointer and the keyboard, not only synthetically.

| Link | Resting rule | Hover rule | Focus rule | Focus ring | Reflow |
| --- | --- | --- | --- | --- | --- |
| Explore your ritual | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |
| Read the refill note | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |
| Journal titles (×3) | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |

Under real pointer hover, exactly one element carried a rule each time and it
was the hovered one; the previous hover cleared. Under real `Tab` navigation
the run went Enter The Ritual → Explore your ritual → Read the refill note →
Well-Aging Is Not Disappearing → Barrier Wealth, each step matching
`:focus-visible`, each revealing the rule, each carrying the ring
(`rgb(250,250,248) 0 0 0 2px` + `rgb(11,41,30) 0 0 0 4px`), each releasing the
previous. No layout movement: the hovered Journal span measured 41px against
its unhovered peer at 41px.

### Instrumentation limitation

The browser preview pane does not composite frames, so CSS transitions never
advance and every hover and focus reading appears frozen at its start value.
Transitions were disabled **in the live DOM for measurement only** so the
computed end state could be read. No source file was changed and the transition
duration was not altered. On a displayed browser the transition animates
normally.

## Typography

Nine roles, zero unmapped elements, no `font-serif`, no Times New Roman, no New
York.

| Role | Family | Desktop | Mobile | Weight | Tracking |
| --- | --- | --- | --- | ---: | --- |
| Display | brand serif | 72 / 72 | 48 / 45.6 | 400 | normal |
| Chapter | brand serif | 48 / 48 | 36 / 45 | 400 | normal |
| Sub | brand serif | 30 / 36 | 24 / 33 | 400 | normal |
| Hero kicker | Inter | 12 / 16 | 12 / 16 | 400 | 0.32em |
| Section eyebrow | Inter | 12 / 16 | 12 / 16 | 400 | 0.30em |
| Control label | Inter | 14 / 20 | 14 / 20 | 500 | 0.18em |
| Metadata | Inter | 12 / 16 | 12 / 16 | 400 | 0.18em |
| Lead | Inter | 18 / 32 | 18 / 32 | 400 | normal |
| Body | Inter | 16 / 28 | 16 / 28 | 400 | normal |
| Note / legal | Inter | 14 / 24 | 14 / 24 | 400 | normal |

The brand serif resolves to `"Garamond Premier Pro", Georgia, serif`; Garamond
is not loaded under the licence hold recorded in `tailwind.config.js`, so it
renders as Georgia. The hero lead steps to 20px at `md` and above, which is the
Lead role at hero scale rather than a tenth voice.

## Desktop and mobile validation

Eight widths. At every one: 12 sections, 17 links, no resting rule on any
editorial link, focus revealing the rule with a visible ring on all five, no
height change on reveal, nothing clipped, no overlapping hit area, no text
inside a 16px gutter, no horizontal overflow, and no control below 44px.

| Viewport | Intervals | Document height | Journal title heights |
| ---: | --- | ---: | --- |
| 1440 | 96 / 112 / 128 | 7873 | 77 / 44 / 44 |
| 1280 | 96 / 112 / 128 | 7843 | 77 / 44 / 44 |
| 1024 | 96 / 112 / 128 | 8123 | 77 / 44 / 44 |
| 768 | 96 / 112 / 128 | 8753 | 113 / 77 / 44 |
| 430 | 64 / 80 / 96 | 9631 | 44 / 44 / 44 |
| 390 | 64 / 80 / 96 | 10048 | 44 / 44 / 44 |
| 375 | 64 / 80 / 96 | 10299 | 71 / 44 / 44 |
| 320 | 64 / 80 / 96 | 11306 | 71 / 44 / 44 |

Mobile parity is exact rather than approximate. The rendered text content of
`main` measured **4594 characters at 1440 and 4594 at 320**, with identical
occurrence counts for every action label and every section name, the same three
Journal entries, no element hidden at any width, no horizontal scroll
container, and no mobile-only copy or control style. No price, cart, badge or
urgency language appears at any width.

## Copy and claims

- Approved Atelier heading present, exact, once.
- Unauthorized copy changes between the approved tip and the release: **none**
  (`git diff --word-diff` on `src/app/page.tsx` produced no output).
- Rendered em dashes: **0**. Rendered en dashes: **0**.
- Prohibited-language scan over the rendered homepage text, case-insensitive,
  across all 24 listed terms: **0 hits**, no false positives to disclose.
- No anti-aging framing, no urgency, no discount or trend language, no
  unsupported claim; the cosmetic-claims disclaimer remains in section 12.

## Accessibility and performance

Production-equivalent Worker builds on both sides, same toolchain, same
environment, measured back to back.

| Target | A11y | Perf | LCP | CLS |
| --- | ---: | ---: | ---: | ---: |
| Homepage desktop — release | **100** | 100 | 0.7s | 0.0036 |
| Homepage desktop — production baseline | 100 | 100 | 0.6s | 0.0036 |
| Homepage mobile — release | **100** | 98 | 2.3s | 0.0001 |
| Homepage mobile — production baseline | 100 | 98 | 2.3s | 0.0001 |
| `/science` — release | **100** | 100 | 0.6s | 0 |
| Selected `/science` — release | **100** | 100 | 0.6s | 0 |
| `/inci` — release | **100** | 100 | 0.5s | 0 |
| Contextual `/inci` — release | **100** | 100 | 0.6s | 0 |

Zero failing accessibility audits on every URL. No contrast failure, no
duplicate ID, no broken ARIA, no target-size finding, visible focus throughout,
no mobile overflow.

Desktop CLS is identical to the production baseline on the same toolchain and
matches the approved reference. Mobile CLS measured 0.0001 on the release **and
on the production baseline**, so the difference against the approved reference
of 0 is a property of this measurement run, not a release regression: the delta
between release and production is zero.

Homepage client JavaScript is unchanged: 12 files, 544 KB on both sides.
Document HTML is 60 KB against 59 KB, the new narrative copy. Route count 63 on
both, identical route sets.

## Route matrix

Validated locally against the release preview and the production baseline
simultaneously. Every canonical route returned the same status on both.

200: `/`, `/science`, `/science?pathways=barrier-comfort`,
`/science?pathways=hydration,tone-integrity`, `/inci`,
`/inci?from=science&pathways=hydration`, `/products/face-elixir`,
`/products/body-elixir`, `/ritual`, `/skin-ritual-quiz`, `/journal`,
`/articles/well-aging-is-not-disappearing`,
`/articles/barrier-wealth-aging-melanated-skin`,
`/articles/body-care-neglected-prestige-beauty`,
`/articles/refill-culture-quiet-sustainable-luxury`, `/concierge`,
`/founder-access`, `/our-story`, `/shop`, `/focus-group/login`,
`/focus-group/enclave`, `/focus-group/feedback`.

404, as required: `/study-circle`, `/dev/token-specimen`.

No console error, no hydration warning, no unexpected redirect and no
destination mismatch on any route inspected in the browser.

## Build and tests

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | 1792 packages, lockfile unchanged |
| `npx tsc --noEmit` | 0 | clean |
| `npm run lint` | 0 | no warnings |
| `npm test` | 0 | **412 tests, 412 pass, 0 fail, 0 skipped**, 89 suites |
| `npm run build` | 0 | 64 static pages, **63 routes** |
| `npx opennextjs-cloudflare build` | 0 | Worker written |

No test deleted or weakened. `package.json` and `package-lock.json` unchanged.
`tsconfig.tsbuildinfo` was restored after the type-check; the working tree is
clean.

## Environment gate

The build used the canonical `.env.production` values exported into the build
shell only, plus `NEXT_PUBLIC_SITE_URL=https://www.nfebeauty.com` and
`NEXT_PUBLIC_BUILD_SHA` set to the release HEAD. No value was printed, echoed,
logged, committed or copied into the release worktree, and `.env.local` was not
used as a production source.

`/focus-group/login` renders the real sign-in form, `/focus-group/enclave` and
`/focus-group/feedback` both return substantial non-error documents, and none of
the three contains a missing-Supabase-variable or auth-initialisation error. The
preview footer renders `Build: 16ab5384938abb1dcb4ab46d72dbccf1da67efc0`,
confirming the served build is the approved source.

## Preview

Production-style Worker preview left running for founder predeployment review:

- Release: `http://localhost:8808/`
- Production baseline, for comparison: `http://localhost:8809/`

Widths exercised: 1440, 1280, 1024, 768, 430, 390, 375, 320. No screenshot was
added to the repository.

## Rollback orientation

| Item | Value |
| --- | --- |
| Current live Worker | `c44359b1-cbd7-443c-9439-f2fe84e916bb` |
| Current traffic | 100% |
| Deployed source | `1e78ea1f6ad4a084b21d02cffe38a53116c222a6` |
| Rollback Worker, retained | `c25b8b8a-5a4a-44ea-8812-df0ccf619008` |
| Procedure | `wrangler rollback <version-id>` against `nfe-portal`, then reverify the route matrix |
| Executed | **no** |

## Pre-existing repository debt, unchanged

`lighthouse-reports/`, `lighthouserc.js`, `.lighthouserc.js` and
`tsconfig.tsbuildinfo` are tracked in the repository and were inherited from the
production source. They are not part of this release diff and were deliberately
left alone under the assembly freeze.

## Explicit non-actions

No design, copy, architecture, section-order, CTA-treatment, editorial-link,
mobile, Science, Ingredients, product, formula, pricing, dependency, lockfile or
environment change. No tag created. No Worker version created. No traffic
change. No DNS change. No deployment. No force-push, no history rewrite, no
amend, no squash. The feature branch, `release/science-final-refinement`,
`release/science-authority-phase-1`,
`feature/nfe-science-typography-hero-diagram-refinement` and all six existing
tags are unmoved.

## Status

Release assembly complete and validated. **Not deployed.** Awaiting founder
deployment authorization.
