# NFE Journal Expansion — Publication Readiness Record

Recorded 2026-08-05. Covers two supporting editorial notes:
*What's in My Beauty Cabinet?* and *The Scent of Feeling Beautiful*.

Branch `feature/nfe-journal-beauty-cabinet-scent`. **Nothing deployed.** Both
articles are **published** as Supporting Editorial Notes on release date
**2026-08-06**, pending founder visual review before deployment.

## Founder decisions implemented

| Decision | Implementation |
| --- | --- |
| Journal grouping | Supporting Editorial Notes (`editorialTier: "legacy"`) |
| Beauty Cabinet section | Founder Notes, in the `philosophy-presence` group |
| Beauty Cabinet role | Proof Discipline (`pillar: "proof-discipline"`) |
| Scent section | Ritual Notes, in the `body-sensuality-ritual` group |
| Scent role | Ritual Intelligence (`pillar: "ritual-intelligence"`) |
| Byline, both | **Vanessa McCaleb** |
| Publication date | `date: "2026-08-06"`, `published: true` — the authorization date, not a backdated or provisional value |
| Primary essays | untouched; the count remains nine |
| Homepage | untouched; its three approved Journal entries are unchanged |

## AI image provenance

Both hero images were created with AI for NFE. Recorded here as the internal
provenance note:

- both hero images are **AI-generated**;
- **no external photographer licence is required**;
- **no model release is required**, because no real person is depicted;
- **no stock-image licence applies**;
- the woman shown in *The Scent of Feeling Beautiful* is **not** a real
  customer, not the founder, and not a named individual;
- neither image is captioned in a way that implies the depicted person is real;
  the alt text describes the scene, not an identity;
- NFE should retain the original generation record internally alongside this
  document.

No visible "AI-generated" label was added to the article pages, and no legal
language was added to customer-facing copy, per the founder's direction. No
model biography or testimonial exists.

### Third-party packaging in the Beauty Cabinet image

The image shows third-party products in an editorial, factual context: a
founder's own cabinet. The article reads as a personal account, not a sponsored
roundup. Accordingly:

- no sponsorship, partnership, endorsement or affiliation is implied;
- no logo was altered;
- no partner badge, trademark claim or affiliate link was added;
- the alt text deliberately does **not** enumerate brand names, so the image is
  not keyword-stuffed with third-party trademarks;
- prescription and third-party products carry no purchase link anywhere in the
  article, and a test enforces this.

## Publication mechanism

The repository previously had no draft mechanism. A narrowly scoped one was
added rather than a CMS:

- `ArticleMeta.published?: boolean` — omitted or `true` for every article
  published to date, so no legacy article changes behaviour;
- `ArticleMeta.date` widened to `string | null`, keeping the Journal's existing
  `YYYY-MM-DD` format as the single publication-date field;
- `getAllArticles()` is the one gate. The Journal index, the sitemap, related
  reading, article metadata and `generateStaticParams` all read through it, so
  those surfaces cannot disagree about whether an article is public.

Verified on a production build with the preview flag unset:

| Surface | Result |
| --- | --- |
| Prerendered article paths | 16, unchanged from before this task |
| Prerendered HTML for either new slug | **0** |
| Sitemap entries for either new slug | **0** |
| Route count | 63, unchanged |

`NEXT_PUBLIC_INCLUDE_UNPUBLISHED=true` includes unpublished articles on *every*
surface at once for local founder review. It is never set in a production build,
so there is no state in which an article is hidden from the index yet reachable
by URL or listed in the sitemap.

**To publish:** set `published: true` and supply `date` in `YYYY-MM-DD`. Both
articles then appear in Supporting Editorial Notes, the sitemap and structured
data together.

## Attribution revision

The named celebrity reference was removed rather than sourced, because no
verifiable source exists in the repository.

Before:

> Zoe Saldaña expressed this beautifully when she spoke about working with what
> she has, celebrating it, embracing it, and taking care of it.

After:

> It is the practice of working with what you have, celebrating it, embracing
> it, and taking care of it.

The idea, tone and the three sentences that follow are unchanged. No citation
system was introduced, no substitute celebrity was named, and no quotation marks
were placed around an unverified paraphrase. This is the only body-copy change
made to either article.

## Responsive hero crops

Dedicated 4:5 mobile crops were generated with `sharp` 0.34.5, already present
as a Next.js dependency. No dependency was added.

| Article | Desktop | Mobile crop | Source | Crop | Ratio | Size |
| --- | --- | --- | --- | --- | ---: | ---: |
| Beauty Cabinet | `whats-in-my-beauty-cabinet.webp` | `whats-in-my-beauty-cabinet-mobile.webp` | 1448×1086 | 869×1086 | 0.800 | 144 KB → **67 KB** |
| Scent | `the-scent-of-feeling-beautiful.webp` | `the-scent-of-feeling-beautiful-mobile.webp` | 1536×1024 | 819×1024 | 0.800 | 206 KB → **55 KB** |

Neither crop is upscaled or stretched; each is the largest 4:5 window that fits
inside its source. The crop window was selected by sharp's `attention` strategy,
which targets the region of highest luminance frequency, colour saturation and
skin-tone presence. For the Scent image the skin-tone pixel share **rose from
26.7% to 34.1%**, which is consistent with the crop centring on the woman rather
than the meadow.

Art direction is a single `<picture>`: a `(max-width: 767px)` source for the
mobile crop and the approved desktop asset above it, so the browser fetches
exactly one file. Articles without a `mobileImage` keep the existing
`next/image` path unchanged.

**This requires founder visual confirmation.** The crop geometry, file validity
and skin-tone corroboration are measured, but no one has visually confirmed that
the Beauty Cabinet crop retains the intended products or that the Scent crop
frames the face as intended.

## Shared accessibility corrections

Two defects were corrected at the shared level, not patched per article.

### Link distinguishable by more than colour

The supporting-note banner linked to the primary series in gold on the dark
green ground, surrounded by paper-coloured text. Measured link-vs-surrounding-
text contrast: **2.22:1**, against a 3:1 minimum.

Rather than restyle a dark-ground gold control, the link now carries a resting
underline, so it is distinguishable by more than colour. The gold is preserved,
no button or box was introduced, and no other gold control changed.

| Surface | Before | After |
| --- | ---: | ---: |
| Supporting-note banner link | 2.22:1, colour only, **fail** | underlined at rest, **pass** |

### Heading order

An article whose body carries no subheadings jumped from the `h1` title
straight to the `h3` related-reading cards. "Related Reading" and "Continue
Inside the Maison" are section labels, so they are now real `h2` elements —
semantically correct rather than filler, with styling unchanged. No heading was
added to any article body, and the Scent essay remains heading-free.

### Measured effect

| Surface | Before | After |
| --- | ---: | ---: |
| Beauty Cabinet | 96 | **100** |
| Scent | 95 | **100** |
| Legacy note, `refill-culture…` | 96 | **100** |
| Legacy note, `black-dont-crack` | 95 | **98** |
| Primary essay, `well-aging-is-not-disappearing` | 100 | **100** |
| `/journal` | 96 | 96 |

The shared fix repaired two pre-existing legacy failures as a side effect and
regressed nothing.

## Journal accessibility now 100

The founder subsequently authorized correcting the shared defects outright. All
muted Journal metadata labels were lifted to `text-nfe-ink/65`:

| Element | Ground | Before | After |
| --- | --- | ---: | ---: |
| Supporting-note label and theme eyebrow | `#fafaf8` | 3.02:1 | **5.76:1** |
| Theme-section card metadata (×2) | `#fdfdfc` | 3.02:1 | **5.82:1** |
| Featured card metadata | `#ffffff` | 4.17:1 | **5.92:1** |

Measured result: `/journal` **96 → 100** on desktop and mobile. The typography,
hierarchy and layout are unchanged; only the muted grey was deepened.

## Structured data

`ArticleJsonLd` previously hardcoded an Organization author. It now accepts an
optional byline: founder-written pieces emit
`author: { "@type": "Person", "name": "Vanessa McCaleb" }`, while house-written
articles keep `{ "@type": "Organization", "name": "NFE Beauty" }` exactly as
before. Verified on both new articles and on a control article.

## Outstanding item

**Hero crop visual confirmation.** The crops are measured and verified to fill
the 4:5 mobile frame with no further cropping, and the file geometry and
skin-tone corroboration are recorded above. Nobody has yet *looked* at them to
confirm the Beauty Cabinet crop retains the intended products or that the Scent
crop frames the face as intended. This is the remaining item for founder visual
review before deployment.

`black-dont-crack` sits at 98 rather than 100 because of an `h3` in that legacy
article's own body. The shared fix lifted it from 95; going further means
rewriting legacy article copy, which is outside this task.
