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

---

# Production closeout

Recorded 2026-08-05. Deployment executed 2026-08-04. This section supersedes the
"Not deployed" status above; the assembly record preceding it is preserved
unchanged as the predeployment evidence.

## Authorization

The founder approved the Maison Wave 2 homepage after visual review, then
separately authorized deployment of the exact approved application source, and
then separately authorized release tagging and closeout. Each gate was a
distinct written authorization. No application, copy, design, layout,
typography, responsive, route, environment, Worker, traffic or deployment change
was made during closeout.

## Deployed state

| Item | Value |
| --- | --- |
| Application source | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` |
| Release branch | `release/maison-wave-2-homepage-continuity` |
| Predeployment documentation HEAD | `b1978902f281bc7f71091e09d322d512f0ef6c15` |
| Production Worker | `3844a3a7-983e-409d-9ea0-d71e1b2e63b2` |
| Worker version created | 2026-08-04T13:29:35.513Z |
| Deployment timestamp | 2026-08-04T13:29:37.200Z |
| Traffic | 100% |
| Previous Worker (immediate rollback) | `c44359b1-cbd7-443c-9439-f2fe84e916bb` |
| Second-level fallback | `c25b8b8a-5a4a-44ea-8812-df0ccf619008` |
| Rollback executed | **no** |

The artifact was built in a fresh detached worktree checked out at `16ab538`
exactly, not from the release branch tip. The only commit above the approved
source is documentation, and the application-source diff between them, across
`src`, `public`, `tests`, `package.json`, `package-lock.json` and
`tailwind.config.js`, is empty. The custom domain trigger `www.nfebeauty.com`
(zone `nfebeauty.com`), the `env.ASSETS` binding, DNS and traffic rules were all
left as they were.

## Build and environment gate

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | lockfile unchanged |
| `npx tsc --noEmit` | 0 | clean |
| `npm run lint` | 0 | zero warning or error lines |
| `npm test` | 0 | 412 tests, 412 pass, 0 fail, 0 skipped, 89 suites |
| `npm run build` | 0 | 63 routes |
| `npx opennextjs-cloudflare build` | 0 | Worker written |

Build-time values came from the canonical `.env.production`, exported into the
build shell only, plus `NEXT_PUBLIC_SITE_URL` set to the production site and
`NEXT_PUBLIC_BUILD_SHA` set to `16ab5384938abb1dcb4ab46d72dbccf1da67efc0`. No
value was printed, echoed, logged, committed or copied into the worktree, and
`.env.local` was not used. `package.json`, `package-lock.json` and the
dependency counts (28 production, 21 development) are unchanged.

The mandatory gate was run against the exact artifact before deployment:
`/focus-group/login` 200 with the real form rendering (email and password, both
required, one form element, "Sign In"), `/focus-group/enclave` 200,
`/focus-group/feedback` 200, zero missing-variable or auth-initialisation
errors, zero 500s on any canonical route, footer build SHA correct.

Two gate checks initially read as empty against raw HTML and were resolved
rather than assumed: `/focus-group/login` is a client component that mounts
after hydration, so the server HTML carries no form markup, and React renders
the footer label separately from the interpolated SHA. Both were confirmed
correct in the browser and in the markup. Neither indicated a source defect.

## Production route validation

All twenty canonical routes returned 200 with zero redirects: `/`, `/science`,
`/science?pathways=barrier-comfort`,
`/science?pathways=hydration,tone-integrity`, `/inci`,
`/inci?from=science&pathways=hydration#humectants`, `/products/face-elixir`,
`/products/body-elixir`, `/ritual`, `/skin-ritual-quiz`, `/journal`, the three
Journal article destinations, the refill article, `/concierge`,
`/founder-access`, `/focus-group/login`, `/focus-group/enclave` and
`/focus-group/feedback`. `/study-circle` and `/dev/token-specimen` remain 404.

No console error, no hydration warning, no unexpected redirect. Both homepage
images load (hero 614px, founder portrait 621px natural width); zero broken
images.

## Cache propagation note

The first post-deployment probe, roughly sixty seconds after the version went
live, returned the **pre-deployment homepage** at the bare `/` cache key, while
every other route already served the new build. A cache-busted request served
Wave 2 immediately, which established that the Worker itself was correct and the
stale response was a caching artifact rather than a deployment fault. The
condition resolved without intervention: six consecutive probes and a no-cache
request all subsequently returned Wave 2 with the correct build SHA. No source
defect and no Worker defect was found, and no cache setting was changed.

## Desktop validation

Validated live at 1440, 1280, 1024 and 768. At every width: twelve sections in
the approved order, seventeen links, all boxed controls 46px and all editorial
links at least 44px, zero fully-rounded controls, no resting rule on any
editorial link, focus revealing the rule with a visible ring, no clipping, no
overlap, no text inside a 16px gutter, no horizontal overflow. Section rhythm
96 / 112 / 128. Grounds: one warm hero, nine paper, two green. Both elixir
controls render as identical gold primaries.

## Mobile validation

Validated live at 430, 390, 375 and 320, as a hard release gate.

Parity is exact rather than approximate: the rendered text of the main region
measures **4594 characters at 1440 and 4594 at 320**, with identical occurrence
counts for all thirteen action labels, the same seventeen destinations and the
same three Journal entries. Zero elements hidden at any width, zero horizontal
scroll containers, no mobile-only copy or control treatment. Section rhythm
64 / 80 / 96. The Atelier heading remains complete, both elixirs remain equally
visible, the Science invitation, Ritual hierarchy, Vessel editorial link,
Concierge and closing invitation are all complete, and wrapped Journal titles
expand to 71px rather than clipping.

## Editorial-link interaction, measured live

| Link type | Resting | Hover | Focus | Ring | Reflow |
| --- | --- | --- | --- | --- | --- |
| Ritual support link | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |
| Vessel reading link | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |
| Journal titles | absent | `rgb(20,84,60)` | `rgb(11,41,30)` | present | none |

Real pointer hover, three separate targets: exactly one element carried a rule
each time and it was the hovered one, with the previous hover cleared. The
hovered Journal span measured 41px against its unhovered peer at 41px. Real
keyboard tabbing ran Enter The Ritual, Explore your ritual, Read the refill
note, Well-Aging Is Not Disappearing, each matching `:focus-visible`, each
revealing the rule, each carrying the ring `rgb(250,250,248) 0 0 0 2px` plus
`rgb(11,41,30) 0 0 0 4px`, each releasing the previous. Transitions were frozen
in the live DOM for measurement only, because the preview pane does not
composite frames; no source file and no transition duration was changed.

## Copy and claims, measured live

The Atelier heading renders exactly **Two elixirs. One considered philosophy.**
Rendered em dashes: 0. En dashes: 0. Prohibited-language scan across all
twenty-four listed terms on the live rendered page: **0 hits**. No urgency, no
price, no cart, no badge, no unsupported refill claim. The cosmetic-claims
disclaimer remains in section twelve.

## Accessibility

| URL | Mode | Accessibility | CLS |
| --- | --- | ---: | ---: |
| `/` | desktop | **100** | 0.0036 |
| `/` | mobile | **100** | 0.0001 |
| `/science` | desktop | **100** | 0.0000 |
| Selected `/science` | desktop | **100** | 0.0000 |
| `/inci` | desktop | **100** | 0.0000 |
| Contextual `/inci` | desktop | **100** | 0.0000 |

Zero failing accessibility audits on every URL. No contrast failure, no
target-size failure, no duplicate ID, no broken ARIA. Visible focus throughout.
No horizontal overflow at any of the eight widths.

## Performance observations

| Metric | Reviewed baseline | Live | Difference |
| --- | ---: | ---: | ---: |
| Homepage desktop Performance | 100 | **99** | -1 |
| Homepage mobile Performance | 98 | **97** | -1 |
| Desktop LCP | 0.7 s | **0.9 s** | +0.2 s |
| Mobile LCP | 2.3 s | **2.5 s** | +0.2 s |
| Desktop CLS | 0.0036 | **0.0036** | 0 |
| Mobile CLS | 0.0001 | **0.0001** | 0 |
| Accessibility, all six URLs | 100 | **100** | 0 |

CLS matches the founder-reviewed reference exactly on both desktop and mobile.
The Performance and LCP deltas are the expected cost of measuring across the
real network rather than a localhost Worker.

Ingredients returned **90** on its first live run. It was then re-measured three
times and returned **100, 99, 99**, each with CLS 0 and total blocking time 0ms,
and its contextual variant scored 100 in the same first pass. **No Ingredients
source changed in this release** — the release diff touches zero files on that
surface — so the single 90 was run-to-run network variance, not a regression.
**No hotfix was made**, and none is warranted. This matches the behaviour
recorded at the previous release, where Ingredients production performance was
observed at 92 and later at 100 without any change to that route.

## Source integrity

The release diff against the previously deployed production source is six files:
the homepage implementation, the homepage test suite, three Maison Wave 2
strategy documents, and the inherited Science closeout documentation. No change
to Science, Ingredients, products, product data, formulas, pricing, checkout,
Shopify, Sanity, Supabase, focus-group logic, navigation, footer application
code, dependencies, lockfile, environment configuration, Cloudflare
configuration, DNS, Worker bindings or Worker traffic.

## Rollback readiness

The immediate rollback target `c44359b1-cbd7-443c-9439-f2fe84e916bb` and the
second-level fallback `c25b8b8a-5a4a-44ea-8812-df0ccf619008` were both verified
present after deployment. The procedure is a Wrangler rollback to the chosen
version against `nfe-portal`, followed by reverification of the route matrix.
**No rollback occurred.** No rollback condition was met at any point.

## Release tag

`nfe-maison-wave-2-homepage-continuity-2026-08-04`, annotated, following the
established `nfe-<release>-<date>` convention used by every existing tag in this
repository. It points at the production closeout documentation head, which
carries the deployed application source `16ab538` as an ancestor. The annotation
records the deployed application SHA, the production Worker, the release branch,
accessibility, traffic and the rollback Worker.

## Final production status

NFE Maison Wave 2 homepage narrative continuity is live at 100% traffic on
Worker version `3844a3a7-983e-409d-9ea0-d71e1b2e63b2`, serving application
source `16ab5384938abb1dcb4ab46d72dbccf1da67efc0`. Accessibility is 100 on all
six required URLs. Desktop and mobile were validated as equal experiences. The
previous Worker is retained as an immediate rollback anchor.
