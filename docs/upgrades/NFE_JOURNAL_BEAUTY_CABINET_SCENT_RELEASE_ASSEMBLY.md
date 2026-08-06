# NFE Journal Expansion — Release Assembly and Predeployment Review

Recorded 2026-08-06. Release-engineering and verification only. **Nothing
deployed.** No application source was changed during assembly.

## Founder approval

The founder visually approved the complete Journal expansion: both articles,
editorial placement, bylines, publication metadata, AI-generated imagery,
dedicated mobile crops, structured data, the shared Journal accessibility
corrections, and responsive behaviour.

| Item | Value |
| --- | --- |
| Approved feature branch | `feature/nfe-journal-beauty-cabinet-scent` |
| Approved feature SHA | `88ec99c630f4b19677dc019d4d8a4b0ff4983ecb` |
| Release branch | `release/nfe-journal-beauty-cabinet-scent` |
| Release application-source HEAD | `88ec99c630f4b19677dc019d4d8a4b0ff4983ecb` |
| Deployment status | **not deployed** |

The remote feature tip resolved to the approved commit exactly and had not
advanced. The feature branch was not modified during assembly.

## Verified production baseline

Established at assembly time rather than assumed.

| Evidence | Value | Source |
| --- | --- | --- |
| Production release branch | `release/maison-wave-2-homepage-continuity` | `origin` ref |
| Production closeout HEAD | `272d43038933b0ca643866f4a6db4865163082cd` | same, tagged `nfe-maison-wave-2-homepage-continuity-2026-08-04` |
| Deployed application source | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` | live footer build SHA |
| Production Worker | `3844a3a7-983e-409d-9ea0-d71e1b2e63b2` | `wrangler deployments list` |
| Traffic | 100% | same |
| Immediate rollback Worker | `c44359b1-cbd7-443c-9439-f2fe84e916bb` | `wrangler versions list`, retained |
| Second-level fallback | `c25b8b8a-5a4a-44ea-8812-df0ccf619008` | same, retained |

Live behaviour corroborated the source identity: the homepage returned 200 with
build SHA `16ab538…`, and **both new articles returned 404 with zero sitemap
entries**, confirming nothing from this expansion has reached production. No
evidence conflicted.

## Ancestry

| Check | Result |
| --- | --- |
| `merge-base(272d430, 88ec99c)` | `272d430` |
| Production closeout is an ancestor of the approved tip | **yes** |
| Approved tip is an ancestor of the closeout | no |
| Production-only commits | **0** |
| Feature-only commits | **15** |
| Classification | **A — fast-forward only** |

The fifteen feature commits are the complete Journal expansion, from
`f2061f5` (first article) through `88ec99c` (publication record). The feature
branch was created directly from the production closeout, so no divergence
exists.

## Assembly

| Step | Result |
| --- | --- |
| Release branch existed already | no, local and remote both absent |
| Worktree | fresh, isolated, created detached at the closeout; no worktree pruned or reused |
| Starting HEAD | `272d43038933b0ca643866f4a6db4865163082cd` |
| Integration | `git merge --ff-only 88ec99c` |
| Merge commits created | **0** |
| Conflicts | none |
| Final application-source HEAD | `88ec99c630f4b19677dc019d4d8a4b0ff4983ecb` |
| `git diff 88ec99c..HEAD` | empty |
| Production closeout preserved | yes |
| Deployed application source preserved | yes |
| Working tree | clean |

The release application source is identical to the founder-approved feature
tip.

## Article inventory

| Article | Byline | Tier | Section | Role | Date | Route |
| --- | --- | --- | --- | --- | --- | --- |
| What's in My Beauty Cabinet? | Vanessa McCaleb | Supporting Editorial Notes | Founder Notes | Proof Discipline | 2026-08-06 | `/articles/whats-in-my-beauty-cabinet` |
| The Scent of Feeling Beautiful | Vanessa McCaleb | Supporting Editorial Notes | Ritual Notes | Ritual Intelligence | 2026-08-06 | `/articles/the-scent-of-feeling-beautiful` |

Routes were preserved exactly as implemented in the approved source; nothing was
renamed.

## Publication-state consistency

Both articles are published consistently on every surface, measured on the
release preview:

| Surface | Result |
| --- | --- |
| Journal index | both present, 2 links each |
| Sitemap | each exactly **once** |
| Prerendered paths | 18 article paths, up from 16 |
| Canonical route | 200, zero redirects |
| Open Graph metadata | present on both |
| Structured data | present on both |
| Publication date | 2026-08-06 on both |
| Homepage | **absent from both**, 0 occurrences |

There is no hidden-index / public-route inconsistency: the single
`getAllArticles()` gate feeds the index, the sitemap, related reading, metadata
and static route generation together.

## Structured data

| Article | Type | Author type | Author | Publisher | Date |
| --- | --- | --- | --- | --- | --- |
| Beauty Cabinet | BlogPosting | **Person** | Vanessa McCaleb | NFE Beauty | 2026-08-06 |
| Scent | BlogPosting | **Person** | Vanessa McCaleb | NFE Beauty | 2026-08-06 |
| Control, `well-aging-is-not-disappearing` | BlogPosting | **Organization** | NFE Beauty | NFE Beauty | unchanged |

House-written articles keep the Organization author exactly as before.

## Journal index

| Article | Collection | Section | Primary count | Duplicate |
| --- | --- | --- | ---: | --- |
| Beauty Cabinet | Supporting Editorial Notes | Founder Notes | 9, unchanged | none |
| Scent | Supporting Editorial Notes | Ritual Notes | 9, unchanged | none |

Supporting notes count moved 7 → 9, which is the intended effect of adding two
supporting notes. No primary essay was removed, reordered or reclassified. No
badge, "New" label, urgency or homepage-style feature treatment appears
(scanned: 0 matches).

## Responsive images

| Article | Desktop asset | Mobile asset | Mobile dimensions | Ratio | Transfer |
| --- | --- | --- | ---: | ---: | ---: |
| Beauty Cabinet | `whats-in-my-beauty-cabinet.webp` 1448×1086 | `whats-in-my-beauty-cabinet-mobile.webp` | 869×1086 | 0.800 | 144 → **67 KB** |
| Scent | `the-scent-of-feeling-beautiful.webp` 1536×1024 | `the-scent-of-feeling-beautiful-mobile.webp` | 819×1024 | 0.800 | 206 → **55 KB** |

Art direction is a single `<picture>` with a `(max-width: 767px)` source, so the
browser fetches exactly one asset. Verified on **fresh loads at the target
width**, not by resizing: at 390 the mobile crop is selected and fills the 4:5
frame with **100% of width and height visible**; at 1440 the approved desktop
asset is selected at 100% width.

## AI image provenance

Carried forward from the approved publication record and unchanged:

- both hero images are **AI-generated**;
- **no photographer licence** is required;
- **no model release** is required, because no real person is depicted;
- the woman in *The Scent of Feeling Beautiful* is not a real customer, not the
  founder, and not a named individual; the alt text describes the scene, not an
  identity;
- original generation provenance is retained internally;
- third-party packaging in the Beauty Cabinet image appears in editorial
  context only, with no sponsorship, endorsement, partnership or affiliation
  implied, no altered logo, no partner badge and no affiliate link.

No visible AI label and no legal disclaimer was added to the article pages.

## Accessibility

| URL | Mode | Accessibility | CLS | Failing audits |
| --- | --- | ---: | ---: | --- |
| `/journal` | desktop | **100** | 0.0001 | none |
| `/journal` | mobile | **100** | 0.0008 | none |
| Beauty Cabinet | desktop | **100** | 0.0000 | none |
| Beauty Cabinet | mobile | **100** | 0.0034 | none |
| Scent | desktop | **100** | 0.0000 | none |
| Scent | mobile | **100** | 0.0034 | none |
| Homepage | desktop | **100** | 0.0036 | none |
| Homepage | mobile | **100** | 0.0001 | none |
| `/science` | desktop | **100** | 0.0000 | none |
| Selected `/science` | desktop | **100** | 0.0000 | none |
| `/inci` | desktop | **100** | 0.0000 | none |
| Legacy note, `refill-culture…` | desktop | **100** | 0.0000 | none |
| Primary essay, `well-aging…` | desktop | **100** | 0.0000 | none |
| Legacy note, `black-dont-crack` | desktop | 98 | 0.0000 | `heading-order` |

The approved shared corrections are intact: the supporting-note link carries a
resting underline so it is distinguishable by more than colour, and all muted
Journal metadata sits at `text-nfe-ink/65` (**5.76–5.92:1** across the paper,
tinted and white Journal grounds). There is no return to the prior 2.22:1 link
or 3.02–4.17:1 metadata. Heading structure is valid throughout: one `h1` per
article, "Related Reading" and "Continue Inside the Maison" as real `h2`
elements, no filler heading, and articles without body subheadings remain valid.

`black-dont-crack` reproduces the known 98 caused by an `h3` in that legacy
article's own body. It was not modified; correcting unrelated legacy content is
outside this release.

## Performance

| Target | Performance | LCP | CLS |
| --- | ---: | ---: | ---: |
| `/journal` desktop | 100 | 0.5s | 0.0001 |
| `/journal` mobile | 99 | 1.9s | 0.0008 |
| Beauty Cabinet desktop | 100 | 0.8s | 0.0000 |
| Beauty Cabinet mobile | 96 | 2.8s | 0.0034 |
| Scent desktop | 99 | 0.8s | 0.0000 |
| Scent mobile | 99 | 2.0s | 0.0034 |
| Homepage desktop | 100 | 0.7s | 0.0036 |
| Homepage mobile | 98 | 2.3s | 0.0001 |
| `/science` | 100 | 0.6s | 0.0000 |
| `/inci` | 100 | 0.5s | 0.0000 |
| Legacy note | 99 | 0.9s | 0.0000 |

Homepage desktop CLS 0.0036 and mobile 0.0001 match the Maison Wave 2 approved
baseline exactly. Route count **63**, dependencies **28 production / 21
development** — both unchanged. No dependency was added.

## Route matrix

All twenty canonical routes returned **200** with zero redirects: `/`,
`/journal`, both new article routes, a representative legacy supporting note, a
representative primary essay, `/science`, selected `/science`, `/inci`,
contextual `/inci`, both product pages, `/ritual`, `/skin-ritual-quiz`,
`/concierge`, `/founder-access`, the three focus-group routes and
`/sitemap.xml`. `/study-circle` and `/dev/token-specimen` remain **404**.

## Homepage protection

`git diff 272d430...HEAD -- src/app/page.tsx` is **empty**. The homepage still
features exactly its three approved Journal selections
(`well-aging-is-not-disappearing`, `barrier-wealth-aging-melanated-skin`,
`body-care-neglected-prestige-beauty`), and neither new article appears on it.
Homepage Accessibility remains 100 on desktop and mobile.

## Copy and claims

Titles, bylines and publication dates are exactly as approved. "Vanessa Brown"
appears zero times. "Zoe Saldaña" appears zero times. Prohibited-language scan
across both article pages — anti-aging, age-defying, youthful, miracle,
must-have, urgency and sponsorship terms — returned **0 hits**.

Rendered em dashes: **0** on the Beauty Cabinet page, **1** on the Scent page.
That single occurrence is in the excerpt of `well-aging-is-not-disappearing`, a
**primary authority essay** surfaced as a related-reading card. Both approved
article bodies contain zero em dashes, and this release does not modify that
excerpt. Correcting it would alter a primary essay, which this task forbids.

## Source-diff classification

`git diff 272d430...HEAD` — twenty files, every one inside approved scope.

| File | Category |
| --- | --- |
| `src/content/articles/whats-in-my-beauty-cabinet.mdx` | article content |
| `src/content/articles/the-scent-of-feeling-beautiful.mdx` | article content |
| `src/content/articles/articles.json` | article metadata |
| `src/content/articles/registry.ts` | Journal registry |
| `src/content/articles/journal-supporting-notes.ts` | Journal index configuration |
| `public/.../whats-in-my-beauty-cabinet.webp` + `-mobile.webp` | article imagery |
| `public/.../the-scent-of-feeling-beautiful.webp` + `-mobile.webp` | article imagery |
| `src/app/articles/[slug]/page.tsx` | article route, art direction, publication gate |
| `src/app/journal/page.tsx` | Journal index accessibility |
| `src/app/sitemap.ts` | sitemap publication logic |
| `src/lib/articles.ts` | shared article model and publication gate |
| `src/components/articles/ArticleJsonLd.tsx` | structured-data author |
| `src/components/articles/ArticleRelatedLinks.tsx` | shared heading semantics |
| `src/components/articles/JournalArticleCard.tsx` | Journal metadata contrast |
| `src/components/articles/JournalThemeSection.tsx` | Journal metadata contrast |
| `tests/unit/journal-expansion.test.ts` | Journal tests |
| `tests/unit/journal-publication.test.ts` | Journal tests |
| `docs/upgrades/JOURNAL_EXPANSION_PUBLICATION_RECORD.md` | Journal documentation |

**No unexplained file.** Verified untouched: homepage, Science, Ingredients,
products, product data, formulas, pricing, checkout, Shopify, Sanity, Supabase,
focus-group logic, navigation, footer, dependencies, lockfile, Tailwind, Next
and Cloudflare configuration.

## Tests and builds

| Command | Exit | Result |
| --- | ---: | --- |
| `npm ci` | 0 | lockfile unchanged |
| `npx tsc --noEmit` | 0 | clean |
| `npm run lint` | 0 | no warnings |
| `npm test` | 0 | **480 tests, 480 pass, 0 fail, 0 skipped**, 103 suites |
| `npm run build` | 0 | 63 routes, 18 prerendered article paths |
| `npx opennextjs-cloudflare build` | 0 | Worker written |

No test was deleted or weakened. `tsconfig.tsbuildinfo` was restored; the
working tree is clean.

## Environment gate

The build used the canonical `.env.production` values exported into the build
shell only, plus the production site URL and the release build SHA. No value was
printed, echoed, logged, committed or copied into the worktree; `.env.local` was
not used; no variable was renamed and no binding changed.

`/focus-group/login`, `/focus-group/enclave` and `/focus-group/feedback` all
return 200 with substantial documents and **zero** missing-variable or
auth-initialisation errors. The preview footer renders build SHA
`88ec99c630f4b19677dc019d4d8a4b0ff4983ecb`.

## Rollback orientation

| Item | Value |
| --- | --- |
| Current live Worker | `3844a3a7-983e-409d-9ea0-d71e1b2e63b2` |
| Current traffic | 100% |
| Deployed application source | `16ab5384938abb1dcb4ab46d72dbccf1da67efc0` |
| Immediate rollback Worker | `c44359b1-cbd7-443c-9439-f2fe84e916bb`, verified present |
| Second-level fallback | `c25b8b8a-5a4a-44ea-8812-df0ccf619008`, verified present |
| Procedure | Wrangler rollback to the chosen version against `nfe-portal`, then reverify the route matrix |
| Executed | **no** |

## Explicit non-actions

No article copy, title, byline, publication-date, image, mobile-crop,
Journal-placement, homepage, homepage-curation, Science, Ingredients, product,
commerce, navigation, footer, dependency, lockfile or environment change. No
Worker created, no deployment, no traffic change, no DNS change, no tag, no
production-closeout commit. No worktree was pruned or removed. No protected ref
was moved.

## Status

Release assembly complete and validated. **Not deployed.** Awaiting separate
founder deployment authorization.
