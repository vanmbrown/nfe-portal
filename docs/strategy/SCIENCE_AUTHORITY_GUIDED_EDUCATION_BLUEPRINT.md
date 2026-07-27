# NFE Science Authority & Guided Education System

Planning artifact. No implementation, no deployment, no source change.

---

## 1. Executive summary

The `/science` route is currently a **skin-profiling quiz**, not an authority
system. A visitor selects a skin type and up to four concerns, presses "View My
NFE Skin Profile," and receives a named profile, three ranked priorities, up to
nine matched Face Elixir actives, and generated ritual guidance.

Mechanically it is sound: accessibility scores 100 with zero weighted findings,
there is no persistence of any kind, and no network submission occurs. Those
are real strengths and should be preserved.

Strategically it is misaligned. The page assigns quasi-clinical labels
("Barrier-Depleted Glow Loss," "Reactive Barrier Stress," "Tone-Uneven
Dehydration"), scores the visitor's inputs, and matches ingredients to their
self-reported concerns. That is `concern → diagnosis → product` — the exact
sequence the brief rules out — dressed in cosmetic language.

Three concrete defects were found, all live in production today:

1. **Internal authoring notes render to customers.** The GHK-Cu card displays
   "Expectation: Use careful cosmetic language: appearance, conditioning, and
   visible support." That is an instruction to a copywriter, visible to
   visitors.
2. **The output contradicts itself.** Selecting *Uneven Tone* + *Dryness* with
   *Mature / Changing Skin* produces the profile "Tone-Uneven Dehydration"
   while tone evenness does not appear in the three displayed priorities.
3. **Health-adjacent data is placed in an analytics payload.** The
   `nfe.cta.clicked` event carries the literal `skinType` value. Nothing
   consumes the event today, so nothing is transmitted — but the payload is
   already shaped to leak if a listener is ever added.

**Recommendation: Model D — a hybrid editorial system.** A strong linear,
readable Science page with optional educational *pathways* that change emphasis,
never generating a profile, score, or recommendation. This preserves the
existing accessibility and privacy strengths, removes the diagnostic surface,
and converts the page from a funnel into the authority artefact the brand needs.

Fourteen founder decisions are listed in §33. Two of them — the profiling
question and the "skin profile" language question — gate the architecture.

---

## 2. Current production baseline

| | |
|---|---|
| Canonical production source | `release/production-hygiene-assets-fonts` |
| Baseline HEAD | `4d779c8e21c343b119d243ce488ae2fb72250e6a` |
| Exact deployed source | `c81b7c25bff7f4c774721d9bcd2f4f2eacd14627` |
| Live Worker | `1ba7471d-53f8-42f8-aa71-299657b7bf42` @ 100% |
| Primary rollback Worker | `692bc54f-c280-4174-b488-1707c8e36d07` |
| Older rollback Worker | `c22fca1d-5b51-456c-9412-9dcee433ff76` |
| Planning branch | `feature/nfe-science-authority-strategy` |

Live measurement of `/science` during this audit: Performance 97, Accessibility
**100**, Best Practices 100, SEO 91. Zero weighted accessibility findings. The
SEO figure is the known Cloudflare-managed `robots.txt` item, unrelated to this
route.

---

## 3. Current Science architecture

| Item | Detail |
|---|---|
| Route | `/science`, inside the `(education)` route group |
| Route file | `src/app/(education)/science/page.tsx` — 13 lines, server component, exports `metadata` only |
| Page component | `src/app/(education)/science/ScienceIntelligence.tsx` — **1,616 lines**, `'use client'` |
| Group layout | `src/app/(education)/layout.tsx` — `'use client'`, renders `EducationNavTabs` |
| Group nav | `src/components/navigation/EducationNavTabs.tsx` — `role="tablist"` / `role="tab"` with `router.push` |
| Sibling route | `/inci` (Ingredients) shares the group and the tab bar |
| State | Three `useState` hooks: `skinType`, `selectedConcerns`, `submitted`. One `useRef` for scroll target |
| Derived state | Four `useMemo`: `priorities`, `profile`, `matchedActives`, `ritualGuidance` |
| Data source | **All content hardcoded as module constants inside the component file** |
| Persistence | None |
| Network | None from the page itself |
| Analytics | `trackNfeEvent` from `src/lib/analytics/track.ts` — dispatches a `window` CustomEvent, no consumer |
| GA4 | `src/lib/analytics.ts` exists and is used by `/learn`, `/skin-strategy`, `NewsletterSignup`, `CookieConsent` — **not** by `/science`; no `gtag` present on the live page |
| Structured data | None on this route |
| Unit tests | **None** |
| E2E references | `tests/accessibility-enhanced.spec.ts` (×2), `tests/navigation.spec.ts` (×1) |

### Hardcoded content constants

| Constant | Shape | Count |
|---|---|---|
| `SKIN_TYPES` | `SkinTypeOption[]` with priority `modifiers` | 7 |
| `CONCERNS` | `ConcernOption[]` with `primary`/`secondary` priorities | 8 |
| `PRIORITIES` | `Record<PriorityId, Priority>` | 9 |
| `PROFILES` | `Record<ProfileId, Profile>` | 6 |
| `ACTIVES` | `Active[]` with 9 fields each incl. `whySelected`, `whatYouMayNotice`, `pairsWith`, `expectation` | 14 |
| `HOW_IT_WORKS` | step cards | 3 |
| `PROOF_STAGES` | proof-discipline cards | 3 |
| `SKIN_LAYER_MAP` | layer schematic rows | 5 |
| `CONCERN_MATRIX` | concern→formula table rows | 7 |

### Logic functions

| Function | Behavior |
|---|---|
| `assignProfile(concerns)` | Cascading `if` rules → one of six named profiles; falls through to `balanced_preventive_support` |
| `scorePriorities(skinType, concerns)` | Numeric scoring: primary +2, secondary +1, skin-type modifiers; sorts, filters `>0`, **slices top 3** |
| `matchActives(concerns, priorities)` | `concernMatches*3 + priorityMatches*2 + hero*1`; sorts, **slices top 9** |
| `buildRitualGuidance(concerns)` | Appends per-concern strings, **slices to 5** |

### Data duplication

`ACTIVES` (14 entries) is hardcoded in the component. A separate
`data/education/activesTable.json` exists and is consumed by `src/lib/actives.ts`.
The Science page does **not** read it. Two active-ingredient sources of truth
now exist with no synchronisation.

---

## 4. Current user journey

**Entry** → hero on dark green: eyebrow "NFE Skin Intelligence", H1 *"Science
that interprets skin, not just ingredients."* Two CTAs: "Start Your Skin
Interpretation" (anchor) and "Explore the Active Index" (anchor).

**Method** → three step cards: "Select Your Skin Signals" / "See Your NFE Skin
Profile" / "Understand the Formula Logic".

**Builder** (`#skin-profile-builder`) →
1. `<select id="science-skin-type">` — 7 options plus "Select one".
2. `<fieldset>` legend "Primary Skin Concerns" — 8 `<button aria-pressed>`
   toggles, hard cap of 4, excess buttons become `disabled` + `opacity-50`.
3. "View My NFE Skin Profile" — `disabled` until a type and ≥1 concern exist.
4. "Start Over".
5. A scoped disclaimer sits beside the controls.

**Result** (conditional, `submitted && profile`) → smooth-scrolls into view.
Renders: profile name + summary + formula logic on dark green → three "Priority
N" cards → up to nine matched active cards (each with *What you may notice*,
*Works with*, *Expectation*) → ritual guidance list.

**Always-on sections below** → Layer Science (3 cards) · Active Ingredient Index
(all 14) · Skin Layer Intelligence Map (SVG schematic + 5 layer rows + 7-row
concern matrix) · Proof Discipline (3 cards) · Founder Science Note with three
outbound CTAs · closing disclaimer.

| Aspect | Observed |
|---|---|
| Reset | Clears type, concerns, and result; verified zero residue |
| Product relationship | Ingredient-level, tied to Face Elixir; no purchase CTA |
| Exit paths | `/skin-ritual-quiz`, `/discovery`, `/concierge` |
| Mobile | Concern grid collapses to one column; matrix swaps to stacked cards |
| Keyboard | Native `<select>` and `<button>`; reachable and operable |
| Screen reader | `aria-pressed` on toggles; `fieldset`/`legend`; SVG has `<title>`/`<desc>` |
| Persistence | **0** localStorage, **0** sessionStorage, **0** cookies |
| Network | **0** requests on interaction (only initial load + Cloudflare RUM) |

---

## 5. Strategic role

**Purpose statement (recommended):**

> The NFE Science experience is a guided editorial education system that helps
> visitors understand mature melanated skin, barrier-first care, tone
> integrity, and formulation intention — without diagnosing, scoring, or
> prescribing.

The audit supports this statement without modification.

| | |
|---|---|
| Primary audience | A sophisticated adult with mature melanated skin, evaluating whether NFE understands her |
| Primary user need | To be understood and educated, not sorted |
| Primary brand function | Establish authority and earn trust before any commercial ask |

**Roles it should serve:** editorial education · formulation philosophy · skin
literacy · mature melanated skin education · barrier-first education ·
ingredient interpretation · trust building · brand authority · a quiet
Concierge bridge.

**Roles it must not serve:** skin quiz · concern finder · product recommender ·
lead capture · diagnostic tool · treatment selector · routine generator ·
account personalization · medical education portal · conversion funnel.

The current implementation serves at least four of the second list.

---

## 6. What Science is not

It is not a dermatologist intake form, a diagnostic questionnaire, a drugstore
concern finder, a retail product quiz, a short-form skincare explainer, a
recommendation engine, a medical portal, a lead-generation funnel, a
pseudo-clinical app, or a conversion trap disguised as education.

The present page most resembles the second and third of those.

---

## 7. Brand alignment

| Doctrine | Current state | Assessment |
|---|---|---|
| Quiet Authority | Authority asserted through volume — 14 actives, 5 layers, 7 matrix rows | Density is doing the work restraint should do |
| Luxury restraint | Result view stacks up to nine cards | Not restrained |
| Mature melanated specificity | Present and genuine in hero, Layer Map, Founder Note | **Real strength** |
| Well-aging not anti-aging | Consistently "visible well-aging support" | **Compliant** |
| Restorative over corrective | Mostly restorative | Profile names break this — see §9 |
| Scientific clarity without coldness | Warm in prose, clinical in the builder | Mixed |
| Cultural specificity without tokenization | Founder Note is specific and earned | **Strength** |
| Founder intimacy | One Founder Science Note | Appropriate |
| Education without jargon overload | Gamma-PGA, THD Ascorbate, GHK-Cu, Argireline presented with little scaffolding | Overload risk |
| Commerce held quietly | No purchase CTA | **Strength** |

The brand voice is strongest in the static editorial sections and weakest
inside the interactive builder. That asymmetry is itself the finding: the
editorial layer already works; the quiz layer is what fights the brand.

---

## 8. Non-diagnostic boundary

**Standard.** The Science experience will not: identify a medical condition ·
infer melasma, dermatitis, eczema, acne pathology, or inflammation · treat
barrier damage as a diagnosis · give treatment advice · recommend medication ·
replace a dermatologist · classify the visitor as having a disease · score skin
health · assign severity · imply clinical certainty.

**It may:** offer educational framing · explain cosmetic concerns · describe
appearance-related patterns · explain NFE formulation philosophy · explain
barrier-supportive cosmetic care · connect to relevant editorial · explain
ritual and product context · encourage professional consultation.

### Current conformance

| Prohibition | Current status |
|---|---|
| Identify a medical condition | Pass |
| Give treatment advice | Pass |
| Recommend medication | Pass |
| Score skin health | **Fail** — `scorePriorities` produces a numeric ranking |
| Assign severity | Pass (no severity scale) |
| Classify the visitor | **Fail** — six named profile labels assigned |
| Imply clinical certainty | **At risk** — "Barrier-Depleted Glow Loss", "Reactive Barrier Stress" read clinical |

The scoring is invisible to the visitor, but its *output* — a ranked priority
list and an assigned label — is the visible artefact of a scoring system.

**Disclaimers are not the safeguard.** Three disclaimers exist (lines 988,
1292, 1609). Their number is itself a signal: the architecture is being
defended by copy. The architecture should not require defending.

---

## 9. Claims framework

Language is largely well-controlled. Actives use "supports", "helps",
"appearance of", "may notice", "look" — appropriate cosmetic hedging. "Well-aging"
is used consistently. There is an explicit note that NFE "does not claim to
change dermal structure."

### Findings requiring attention

**F-1 — Internal authoring notes are customer-visible. HIGH.**
The `expectation` field renders in matched-active cards. Two entries contain
instructions to the author, not education for the reader:

- GHK-Cu — "Use careful cosmetic language: appearance, conditioning, and
  visible support." — **confirmed rendering live in production**
- Argireline — "Do not compare this support to injectables; this is cosmetic
  appearance support."

Three more read as internal brand shorthand: "A premium active within the
formula luxury-science story", "Part of the formula long-game support system",
"Positioned as visible well-aging support, not as a structural claim."

The Argireline note is doubly problematic: by naming injectables in order to
disclaim them, it introduces the comparison it forbids.

**F-2 — Quasi-clinical profile labels. MODERATE.**
"Barrier-Depleted Glow Loss", "Reactive Barrier Stress", "Tone-Uneven
Dehydration" are constructed like conditions. "Depleted", "Reactive", and
"Stress" imply a state assessed rather than a topic explained.

**F-3 — Output incoherence. MODERATE.**
Verified live: *Mature / Changing Skin* + *Dryness* + *Uneven Tone* yields
profile "Tone-Uneven Dehydration" while the three displayed priorities are
Barrier comfort, Visible well-aging support, and Hydration. Tone evenness ties
at 2 points with hydration and loses on sort order, then is cut by
`.slice(0, 3)`. The visitor names tone as one of two concerns and is shown a
tone-named profile that omits tone from its priorities.

**F-4 — "Dermis Support Story". LOW, monitor.**
Honest and self-limiting, but it invites a structural reading. Worth reviewing.

**F-5 — Sunscreen guidance. LOW.**
"Pair the ritual with daily sunscreen" is sound advice and not a claim about
NFE products. Retain, but keep it clearly general.

**F-6 — Ingredient names as implied efficacy. MODERATE, systemic.**
Tranexamic acid, alpha-arbutin, and GHK-Cu carry strong associations. Listing
them beside a visitor's self-declared concerns implies suitability without
stating it. The risk lives in the adjacency, not the wording.

---

## 10. Mature melanated skin specificity

**Strengths — genuine and worth preserving.** The hero names overlapping needs
of mature melanated skin directly. The Founder Science Note — *"Mature
melanated skin should not be treated as an afterthought"* — is the strongest
sentence on the page. "Ashiness" appears in the Layer Map, a specific and
credible term. "Post-blemish-looking marks" is correctly hedged. "Crepey-looking
texture" is well-chosen.

**Gaps.**

| Gap | Detail |
|---|---|
| Melanin is never explained | Tone, marks, and unevenness are discussed without explaining why melanin-rich skin responds differently to inflammation and injury. This is the single largest missed opportunity |
| Concern taxonomy is generic | Dry / Normal / Combination / Oily / Sensitive is standard industry segmentation, unchanged for decades and not specific to the audience |
| "Mature" is under-defined | Appears as a skin-type option and an adjective, never as an explanation of how skin changes and why that warrants different care |
| Under-service is asserted, not evidenced | The Founder Note states the problem without explaining its history |
| Cultural context absent | No acknowledgement of the specific history of skincare for Black women |

**Recommended emphasis:** explain melanin's role in post-inflammatory response;
define what changes in experienced skin; give the under-service claim its
history. Each requires source validation before publication — see §18.

---

## 11. Current content inventory

| Block | Purpose | NFE specificity | Claims risk | Classification | Recommendation |
|---|---|---|---|---|---|
| Hero | Framing | High | Low | **CORE** | Keep; strongest framing on the page |
| "How the NFE Science Map works" | Explains the quiz | Low | Low | **MISPLACED** | Obsolete if profiling is removed |
| Skin type `<select>` | Segmentation | Low | Low | **GENERIC** | Remove — standard industry taxonomy |
| Concern toggles | Self-report | Moderate | Moderate | **DEFERRED** | Convert to pathway doorways |
| Profile output | Classification | Moderate | **Moderate–High** | **CLAIMS REVIEW** | Remove labels; keep educational prose |
| Priority cards | Ranked needs | Moderate | Moderate | **CLAIMS REVIEW** | Remove ranking; keep concepts as chapters |
| Matched actives | Ingredient match | High | **High** | **CLAIMS REVIEW** | Remove matching; relocate to Ingredients |
| Ritual guidance | Use guidance | Moderate | Low | **MISPLACED** | Belongs on Ritual |
| Layer Science (3 cards) | Layer literacy | High | Low | **CORE** | Keep; excellent foundation |
| Active Ingredient Index (14) | Ingredient reference | High | Moderate | **DUPLICATIVE** | Belongs on Ingredients |
| Skin Layer Intelligence Map | Visual education | High | Low | **CORE** | Keep; best asset on the page |
| Concern-to-Formula Matrix | Cross-reference | High | Moderate | **SUPPORTING** | Keep concept, soften product coupling |
| Proof Discipline | Evidence honesty | High | Low | **CORE** | Keep; rare and brand-defining |
| Founder Science Note | Positioning | **Very high** | Low | **CORE** | Keep; expand |
| Three disclaimers | Legal | — | — | **CLAIMS REVIEW** | Consolidate to one once architecture is safe |

---

## 12. Interaction-model assessment

| Question | Finding |
|---|---|
| Too quiz-like? | **Yes.** Select, toggle, submit, receive result |
| Transactional? | **Yes.** Gated behind a submit button |
| Too many choices? | **Yes.** 7 types × up to 4 of 8 concerns |
| Does concern language create anxiety? | **Partly.** "Depleted", "Reactive", "Stress", "loss" |
| Generic output? | Six profiles for 7×C(8,≤4) input combinations — most inputs collapse into a small set |
| Diagnostic-feeling result? | **Yes.** A named label assigned after answering questions |
| Product relevance too early? | **Yes.** Actives appear immediately in the result |
| Should it be simplified? | **Yes** |
| Can a visitor read without selecting? | **Partially** — Layer Science, Index, Map, Proof, Founder Note are always visible; the result region is not |
| Should linear reading be supported? | **Yes, as the primary mode** |

The strongest structural evidence: **the always-visible sections are already
better than the gated ones.** Layer Science, the Intelligence Map, Proof
Discipline, and the Founder Note need no selection and carry the brand well.
The page already contains the editorial system it should become.

---

## 13. Future interaction options

### Model A — Current guided selection

Retain select + concern toggles + generated profile.

Strengths: already built; feels bespoke; gives a reason to engage.
Weaknesses: profiling is the core problem; scoring is invisible and
unauditable; six labels cannot honour input variety; every active/profile edit
is a code change.

Luxury fit **Low** · Education **Moderate** · Claims risk **High** ·
Accessibility **Good** · Maintenance **High** · CMS fit **Poor** ·
Recommendation risk **High**.

### Model B — Editorial chapters

Linear reading with optional expandable depth: experienced skin → barrier →
hydration → tone integrity → visible resilience → formulation → ritual →
product context.

Strengths: highest luxury fit; zero claims risk from personalization; excellent
accessibility; ideal CMS shape; no scoring possible by construction.
Weaknesses: less interactive; requires genuinely excellent writing; no
mechanism for a visitor to self-navigate to what she cares about.

Luxury fit **High** · Education **High** · Claims risk **Low** ·
Accessibility **Excellent** · Maintenance **Low** · CMS fit **Excellent** ·
Recommendation risk **None**.

### Model C — Guided pathways without profiling

Visitor chooses an educational doorway: *Understanding the barrier* ·
*Understanding visible tone* · *Understanding hydration* · *Understanding
texture and suppleness* · *Understanding the NFE formulation approach*.

Strengths: agency without self-diagnosis; a topic chosen is not a condition
declared; each pathway is an authored essay; naturally CMS-shaped.
Weaknesses: risks becoming a concern finder if doorways are named as symptoms;
content must exist for every doorway before launch.

Luxury fit **High** · Education **High** · Claims risk **Low–Moderate** ·
Accessibility **Good** · Maintenance **Moderate** · CMS fit **Excellent** ·
Recommendation risk **Low**.

### Model D — Hybrid editorial system

A complete linear editorial page, with optional pathways that change *emphasis
and ordering* only. No profile, no score, no recommendation. Every word
readable without interacting.

Strengths: combines B's safety with C's agency; degrades gracefully; the
linear page is the product and pathways are an enhancement; strongest CMS fit;
scoring is impossible by construction.
Weaknesses: requires disciplined design to keep emphasis-shifting from becoming
filtering; slightly more implementation than B.

Luxury fit **High** · Education **High** · Claims risk **Low** ·
Accessibility **Excellent** · Maintenance **Moderate** · CMS fit **Excellent** ·
Recommendation risk **None**.

---

## 14. Recommended experience model

**Model D — Hybrid editorial system.**

Reasoning:

1. **It removes the diagnostic surface by construction**, not by disclaimer.
   With no profile and no score, §8 conformance follows from architecture.
2. **It keeps what already works.** The four strongest blocks are already
   non-interactive.
3. **It preserves agency.** Pathways let a visitor pursue what she cares about
   without declaring a condition.
4. **It resolves the incoherence class.** No derived ranking means no F-3.
5. **It is the right CMS shape.** Chapters and pathways map to content entries.
6. **It matches the brand.** An editorial house with an index, not a form.

### Proposed structure

Hero → *Why experienced skin deserves specific care* → *Why melanin matters
here* → **Optional pathway selector** → Barrier · Hydration · Tone integrity ·
Texture and suppleness → *How NFE formulates* → *Proof discipline* → Founder
note → quiet Concierge invitation.

- **Reading path:** fully linear and complete without interaction.
- **Interaction:** pathway selection emphasises and may reorder; it never hides
  content or produces an output.
- **Product relationship:** one restrained context section near the end.
- **Concierge:** a single quiet invitation at the close.
- **Privacy:** no persistence, no storage, no submission — matching today.

---

## 15. Information architecture

**Principle: one authoritative home per idea.**

| Idea | Authoritative home | Science's role |
|---|---|---|
| Why mature melanated skin needs specific care | **Science** | Owns it |
| Barrier-first philosophy | **Science** | Owns it |
| Tone integrity as a concept | **Science** | Owns it |
| Formulation intention | **Science** | Owns it |
| Proof discipline | **Science** | Owns it |
| Individual ingredient roles | **Ingredients** | Links only |
| INCI detail | **Ingredients** | Links only |
| Application sequence and cadence | **Ritual** | Links only |
| Long-form essays and cultural context | **Journal** | Links only |
| Product dossiers | **Atelier / product pages** | Links only |
| Private guidance | **Concierge** | Invites only |

Current violations: the Active Ingredient Index duplicates Ingredients
territory; ritual guidance duplicates Ritual territory.

---

## 16. Science-to-site relationship map

| Surface | Boundary | Link relationship |
|---|---|---|
| Philosophy | Philosophy owns brand worldview; Science owns skin worldview | Editorial, reciprocal |
| The Atelier (`/shop`) | Atelier owns the product room | Educational → commercial, one-way, restrained |
| Face Elixir | Product page owns the dossier | Contextual, late, one per page |
| Body Elixir | Same | Contextual, late |
| Ritual | Ritual owns sequence, cadence, touch | Educational → ritual |
| Ingredients (`/inci`) | Ingredients owns names, INCI, roles | Educational → reference, **currently duplicated** |
| Founder | Founder owns biography | Science carries one founder note only |
| Journal | Journal owns essays and culture | Educational → editorial, reciprocal |
| Concierge | Concierge owns private guidance | Single quiet invitation |
| Founder Access | Owns access and allocation | **No link from Science** — keep separated |

**Current cross-link state.** Outbound: `/skin-ritual-quiz`, `/discovery`,
`/concierge`. Inbound: `/discovery`, `/journal`. Notably **no link to `/inci`**
despite sharing the `(education)` route group and tab bar — the two education
surfaces do not reference each other in content.

`/skin-ritual-quiz` as an outbound CTA compounds the quiz framing and should be
reconsidered.

---

## 17. Product relationship

**Should:** explain formulation philosophy · explain why fewer, better
formulations · explain barrier-first care · explain sensory and functional
intention · connect education to ritual · offer restrained product context.

**Must not:** recommend from self-diagnosis · imply treatment suitability ·
score products · classify the visitor · generate a regimen · show a "best
match" · pressure purchase.

Current state matches four of the "must not" list. Matched actives are a
recommendation surface even without a buy button — the visitor states concerns
and receives ingredients "matched to your profile."

**Recommendation:** one product-context section, placed after the education, in
prose. Ingredient specifics move to Ingredients. At most one link each to Face
Elixir and Body Elixir.

---

## 18. Concierge relationship

**Placement:** one invitation at the close. Not at educational junctions —
mid-page invitations convert education into a funnel.

**Should convey:** private guidance · thoughtful interpretation · ritual
support · unhurried.

**Must not imply:** medical advice · diagnostic consultation · a skin
assessment · obligation · scarcity.

Directional example only, not production copy:

> *If you would like to think this through with us, the Concierge is open for
> quiet, unhurried conversation.*

Current state: Concierge is one of three CTAs beside "Skin Ritual Quiz" and
"Discovery Ritual", which dilutes it into a button row.

---

## 19. Journal relationship

**Science owns:** durable structured education · formulation philosophy ·
foundational mature melanated skin knowledge · claims-safe explanations.

**Journal owns:** deeper essays · cultural context · interviews · long-form
ingredient and ritual stories · seasonal reflection · founder perspective ·
expert commentary.

### Proposed editorial topic map

| Topic | Home | Note |
|---|---|---|
| What melanin does in skin | Science (foundational) → Journal (depth) | Requires source validation |
| The history of under-serving mature melanated skin | **Journal** | Cultural, needs research |
| What changes in experienced skin | Science | Requires source validation |
| Barrier-first care | Science | Already strong |
| Why fewer products | Science → Journal essay | |
| Individual ingredient stories | **Journal** | Currently crowding Science |
| Proof and testing honesty | Science | Rare, brand-defining |
| Founder's own skin history | **Journal** | |

An existing article, `src/content/articles/calm-is-part-of-the-science.mdx`,
already links Journal to Science thematically.

---

## 20. Ingredients relationship

**Science explains:** formulation intention · why barrier-first · how NFE
thinks about tone, hydration, comfort, resilience · how ingredient *categories*
work together.

**Ingredients owns:** ingredient names · roles · source/supplier notes ·
formulation rationale · cosmetic-function descriptions · INCI.

### Duplication-prevention rule

> Science may name an ingredient **category** (humectants, emollients,
> antioxidants, tone-supportive actives). Science may not enumerate individual
> ingredient entries with their own descriptions. Any named ingredient in
> Science must link to its authoritative entry on Ingredients.

The 14-entry Active Ingredient Index violates this rule today.

Additionally: `data/education/activesTable.json` (used by `src/lib/actives.ts`)
and the hardcoded `ACTIVES` array are two unsynchronised sources of truth for
the same subject. Consolidation should be part of Ingredients ownership.

---

## 21. Ritual relationship

**Science may explain:** why consistency matters · why touch and application
matter · why hydration and replenishment belong to well-aging · why fewer steps
can be intentional · why sensorial use supports adherence.

**Ritual owns:** application sequence · cadence · sensory guidance · touch ·
layering · time of day · use with both elixirs.

**Boundary:** Science explains *why*; Ritual instructs *how*. The current
`buildRitualGuidance` output ("Start with barrier comfort", "Go slowly", "Pair
with daily sunscreen") is *how* — it belongs on Ritual.

---

## 22. Content ownership and CMS recommendation

**Current state:** entirely hardcoded inside a 1,616-line client component.
Content and logic are interleaved; every copy change is a code change and
deployment; no preview; no claims-review workflow; no reuse; content is
untestable independent of the component.

### Option 1 — Keep static in code
Simple, durable, fast, fully version-controlled, claims changes visible in diff.
But developer-dependent for every edit, no preview, no editorial workflow,
content and layout remain entangled.

### Option 2 — Structured local content model
Typed schema in `src/content/science/`, component renders from data. No new
dependency; content becomes independently testable (including claims-governance
tests); a clean migration path to CMS later; diffs stay reviewable; still
requires deployment to publish.

### Option 3 — Sanity CMS
Editorial independence, preview, workflow. But a new external dependency and
runtime; content becomes editable without code review — **a claims-governance
risk for a page making cosmetic claims about melanated skin**; fragmentation
across code and CMS; significant implementation burden.

### Recommendation — **Option 2 now, Option 3 only if editorial velocity later demands it**

Rationale: the immediate problem is not editorial velocity — it is that the
content is entangled with quiz logic and unreviewable. Option 2 solves that at
near-zero risk, makes claims-governance testing possible, and is the necessary
precondition for any future CMS migration. Adopting Sanity now would place
claims-bearing copy behind a workflow that does not yet exist.

**If Sanity is later approved:** CMS-owned — chapter prose, pathway
descriptions, Journal cross-links, founder notes. **Code-controlled and never
CMS-owned** — claim-bearing sentences, disclaimers, ingredient-category
language, the non-diagnostic boundary, and any statement in the §19 claims
matrix rated MODERATE or higher.

---

## 23. Proposed content schema

Technology-independent.

| Entity | Purpose | Required fields | Optional fields | Constraints | Relationships |
|---|---|---|---|---|---|
| `SciencePage` | Root | `title`, `metaDescription`, `heroEyebrow`, `heroHeading`, `heroIntro`, `chapters[]` | `pathways[]`, `founderNote`, `conciergeInvitation` | Exactly one; must render fully with no interaction | → `ScienceChapter`, `EducationalPathway` |
| `ScienceChapter` | One editorial unit | `id`, `order`, `heading`, `body`, `claimsReviewed` | `concepts[]`, `expandable`, `relatedJournal[]`, `relatedIngredientCategory[]` | Body must stand alone; no ranking; `claimsReviewed` must be true to publish | → `ScienceConcept`, `RelatedJournalEntry` |
| `EducationalPathway` | Optional doorway | `id`, `label`, `description`, `emphasizedChapters[]` | `introduction` | Label must be a topic ("Understanding the barrier"), never a symptom or condition; must not hide chapters | → `ScienceChapter` |
| `ScienceConcept` | Reusable idea | `id`, `term`, `plainDefinition` | `cosmeticFraming`, `evidenceNote` | No medical definitions; cosmetic framing only | → `EvidenceNote` |
| `EvidenceNote` | Substantiation | `id`, `statement`, `evidenceLevel`, `substantiationRequired` | `sourceRef`, `reviewedBy`, `reviewedOn` | Not customer-visible in phase 1; internal governance record | → `ScienceConcept`, `ClaimBoundary` |
| `ClaimBoundary` | Guardrail | `id`, `prohibited[]`, `approvedFraming[]`, `riskLevel` | `notes` | Code-controlled always; never CMS-editable | → `ScienceConcept` |
| `RelatedJournalEntry` | Depth link | `slug`, `title` | `context` | Must resolve to a real article | → Journal |
| `RelatedIngredientCategory` | Reference link | `categoryId`, `label` | `context` | Category-level only, never a single ingredient entry | → Ingredients |
| `RitualConnection` | Ritual bridge | `heading`, `body`, `href` | — | Explains *why*, never *how*; at most one per page | → Ritual |
| `ConciergeInvitation` | Quiet handoff | `heading`, `body`, `href` | — | Exactly one per page; closing position; no urgency | → Concierge |
| `ProductContext` | Restrained product tie | `heading`, `body`, `links[]` | — | Max one section; max one link per product; no matching, no scoring | → product pages |

Cross-cutting constraints: no entity may hold a score, severity, rank, or
profile label. No entity may store visitor input. Every customer-visible field
must pass claims review before publication.

---

## 24. Accessibility architecture

**Current — verified live.** Accessibility **100**, zero weighted findings.
Single `h1`. No duplicate IDs. No broken ARIA references. `fieldset`/`legend`
correctly used. `aria-pressed` correct on toggles. Native `<select>` and
`<button>`. SVG has `<title>` and `<desc>` and an `aria-label`. Decorative
swatches `aria-hidden`. Disabled state communicated in text, not colour alone.

This is a strong baseline and the rebuild must not regress it.

**Concerns to carry forward.**

| Concern | Detail |
|---|---|
| Result appears without announcement | The result region renders and is scrolled to; no live-region announcement. A screen-reader user is moved without being told |
| Smooth scroll ignores reduced-motion | `scrollIntoView({behavior:'smooth'})` is unconditional |
| Disabled toggles at the cap | Cap of 4 disables remaining buttons; explanatory text appears only after the cap is reached |
| Tab semantics for navigation | `EducationNavTabs` uses `role="tablist"`/`role="tab"` but performs route navigation. These should be links |
| No-JavaScript | The entire page is one client component; without JS a visitor gets nothing |

**Recommendations for Model D.**

- Chapters as semantic `<section>` with real headings — linear reading needs no ARIA.
- Expandable depth via native `<details>`/`<summary>`, or a disclosure button with `aria-expanded` pointing at an **always-rendered** container (avoiding the collapsed-panel `aria-controls` pattern noted elsewhere in the deferred register).
- Pathways as **links** (`aria-current="true"` on the active one), not tabs and not a radio group — a link is a doorway, a radio group is a form.
- Never use quiz semantics: no `aria-pressed` toggles that imply answers, no submit button, no results region.
- Preserve linear reading: pathways must reorder or emphasise, never hide.
- Announce any emphasis change with a polite live region.
- Honour `prefers-reduced-motion` for all scroll and reveal behaviour.
- Server-render everything; interaction is progressive enhancement only.

---

## 25. Motion and interaction principles

Restrained transitions · quiet reveals · no gamification · no progress bars ·
no completion state · no scoring animation · no pulsing CTA · no urgency · no
auto-advance · no forced path · no motion that conceals content · full
reduced-motion support.

| Property | Recommendation |
|---|---|
| Transition duration | 150–250 ms; never exceed 300 ms |
| Easing | Standard ease-out; no bounce, no spring |
| Reveal | Opacity and small translate (≤8 px); content present in DOM before animation |
| Scroll | Respect `prefers-reduced-motion`; use `auto` when reduce is set |
| Focus | Never scroll focus away from a keyboard user's position without announcement |
| Mobile | Tap targets ≥44 px; no hover-dependent behaviour |
| Reduced motion | All transitions collapse to instant; nothing becomes unreachable |

---

## 26. Visual direction

**Current strengths:** generous section padding; serif display against sans
body; the dark-green hero and Intelligence Map are genuinely beautiful; the
Layer Map's earth palette is distinctive and on-brand; contrast fixes from the
accessibility pass are intact and verified live.

**Current weaknesses:** card density — up to nine active cards plus three
priority cards plus three step cards in one view; heavy `rounded-3xl` bordered
white card usage reads generic-SaaS; the concern grid is a control panel, not
editorial; the 7-column matrix is a spreadsheet.

**Recommended direction.**

| Aspect | Direction |
|---|---|
| Typography | Serif for chapter headings; longer measure for body; increase reading line-height |
| Spacing | Increase vertical rhythm between chapters; let sections breathe |
| Pacing | One idea per screen; alternate dark and light grounds for chapter transitions |
| Surfaces | Reduce bordered cards sharply; prefer full-bleed sections and typographic hierarchy |
| Green usage | Keep dark green for chapter openings and the Map; avoid on every control |
| Control density | Pathways as a single restrained row of ≤5 links |
| Imagery | Mature melanated skin, minimally retouched; texture over perfection |
| Diagrams | Keep and extend the Intelligence Map; it is the best asset on the page |

No dashboards, charts, scores, or generic card grids without strong
justification.

---

## 27. Diagram and illustration strategy

| Visual | Educational purpose | Accuracy need | Accessibility need | Risk |
|---|---|---|---|---|
| Skin-barrier diagram | Make barrier-first tangible | Moderate — schematic, labelled as cosmetic framework | Full `<title>`/`<desc>`, text equivalent | Clinical coldness |
| Melanin / tone diagram | Explain why melanated skin responds differently | **High — requires expert review** | Text equivalent mandatory | Oversimplification; highest sensitivity on the page |
| Hydration illustration | Show surface vs. sustained hydration | Moderate | Caption | Over-promise |
| Ingredient-family diagram | Show categories working together | Moderate | Text equivalent | Rebuilding the Active Index visually |
| Texture / sensorial imagery | Convey the ritual | N/A — photographic | Descriptive alt | Over-retouching |
| Mature melanated skin photography | Representation | N/A | Descriptive alt | Tokenization if generic stock |

Existing asset: the inline SVG schematic in the Intelligence Map is already
accessible and on-brand. Extend this style rather than introducing a new visual
language.

No images created or sourced in this phase.

---

## 28. Privacy and data principles

**Privacy-preserving by default.** No account · no profile · no persistent
selection · no localStorage · no sessionStorage · no cookies for Science state ·
no API submission · no customer-data storage · no lead capture · no health data
· no concern history · **no analytics event containing selected skin concerns**.

**Current conformance — verified live.**

| Principle | Status |
|---|---|
| No account / profile / persistence | **Pass** — 0 localStorage, 0 sessionStorage, 0 cookies, before and after interaction |
| No API submission | **Pass** — 0 network requests on interaction |
| No lead capture | **Pass** |
| No health data stored | **Pass** |
| No analytics containing skin concerns | **Fail in payload shape** — see below |

**Finding P-1 — health-adjacent data in an analytics payload. MODERATE (latent).**
`viewProfile()` emits `nfe.cta.clicked` with metadata including the literal
`skinType` (observed: `"mature_changing"`) and `selectedConcerns` count.

`trackNfeEvent` dispatches a `window` CustomEvent and nothing else. A repository
search found **no listener**, so nothing is transmitted or stored today, and the
live page loads no `gtag`. The risk is latent, not active: the payload is
already shaped to carry health-adjacent data the moment any consumer is
attached.

**Recommendation:** self-reported skin attributes must never enter an analytics
payload, even an unconsumed one. If interaction measurement is later wanted,
limit it to aggregate, non-sensitive signals — e.g. "a pathway was opened" —
never *which* attribute a visitor selected. No analytics implemented in this
phase.

---

## 29. Performance architecture

**Current.** Live Performance 97 — good. But the entire 1,616-line page is a
single `'use client'` component, so all content ships as JavaScript and the
whole page hydrates, including static prose. Content volume is large (14 actives
× 9 fields, 5 layer rows, 7 matrix rows, all inline). One inline SVG. No
third-party libraries on this route.

**Recommended.**

| Aspect | Recommendation |
|---|---|
| Rendering | Static by default; server components for all chapter prose |
| Client scope | Only the pathway selector is a client component |
| Data | Content in `src/content/science/`, imported statically |
| JavaScript | Should fall substantially — most of the page becomes zero-JS |
| Images | `next/image`, explicit dimensions, lazy below the fold |
| Third parties | None |
| Progressive enhancement | Full content without JS |

Performance is not the problem today; the point is that Model D should *improve*
it as a by-product of correct architecture.

---

## 30. Testing strategy

| Category | Behavior protected | Tooling | Release blocker | Notes |
|---|---|---|---|---|
| Content governance | Every chapter has required fields; `claimsReviewed` true | `node:test` | **Yes** | Enabled by Option 2 |
| Claims governance | No prohibited term in customer-visible content | `node:test` | **Yes** | Assert against the §19 matrix |
| **Internal-note leakage** | No authoring instruction reaches customer copy | `node:test` | **Yes** | Directly targets finding F-1 |
| Non-diagnostic | No profile label, score, severity, or ranking in output | `node:test` | **Yes** | Architectural guarantee |
| Route | `/science` 200; `/inci` 200 | Playwright | **Yes** | |
| Interaction | Pathway changes emphasis, hides nothing | Playwright | Yes | |
| Accessibility | Single `h1`, valid heading order, no dup IDs, no broken ARIA | Playwright + axe | **Yes** | Protects the 100 |
| Keyboard | All pathways reachable and operable | Playwright | Yes | |
| **No persistence** | 0 localStorage, 0 sessionStorage, 0 Science cookies | Playwright | **Yes** | Protects a verified strength |
| **No network submission** | No request on interaction | Playwright | **Yes** | Protects a verified strength |
| **No health data in analytics** | No skin attribute in any event payload | `node:test` | **Yes** | Targets finding P-1 |
| Product links | ≤1 link per product; no matching language | `node:test` | Yes | |
| Mobile | No horizontal overflow at 375 px | Playwright | Yes | |
| Reduced motion | Transitions collapse; nothing unreachable | Playwright | Yes | |
| Visual regression | Chapter layout stability | Deferred | No | Only if tooling already exists |

Current coverage: **zero unit tests** for `/science`; three incidental
Playwright references. The testing gap is as significant as the design gap.

No tests written in this phase.

---

## 31. Implementation phases

### Phase 1 — Architecture and content foundation
Extract content to a typed local model; convert page to server-rendered
chapters; remove profiling logic; consolidate disclaimers; fix F-1, F-2, F-3.
Files: `src/app/(education)/science/*`, new `src/content/science/*`,
`tests/unit/science-content.test.ts`.
Dependencies: founder decisions 1, 2, 9, 10.
Risks: largest single change; content must be rewritten before removal of the
old structure.
Validation: content + claims + non-diagnostic + a11y + no-persistence tests.
**Deploy independently: yes.**

### Phase 2 — Guided pathways
Add pathway links that emphasise chapters; live-region announcement;
reduced-motion; no persistence, no profiling.
Dependencies: Phase 1; decisions 1, 2.
Risks: pathways drifting toward filtering.
Validation: interaction, keyboard, reduced-motion, no-persistence tests.
**Deploy independently: yes.**

### Phase 3 — Editorial enrichment
Diagrams; Journal cross-links; ingredient-category education; Concierge handoff;
relocate ritual guidance to Ritual and the Active Index to Ingredients.
Dependencies: Phases 1–2; decisions 6, 8, 12, 13; expert review for the melanin
diagram.
Risks: relocation touches Ritual and Ingredients — those pages need their own
review.
**Deploy independently: yes, per sub-item.**

### Phase 4 — CMS, only if approved
Schema; governance; preview; claims workflow; permissions.
Dependencies: decision 5; a functioning claims-review process.
Risks: ungoverned edits to claim-bearing copy — the primary reason to defer.
**Deploy independently: yes, but only after Phases 1–3 are stable.**

---

## 32. Risks and mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Internal authoring notes visible to customers (F-1) | **High** | Fix in Phase 1; add the leakage test; never render an authoring field |
| Pathways drift back into profiling | High | Encode in schema: pathways may not produce output; enforce with the non-diagnostic test |
| Melanin education stated without substantiation | High | Expert review before publication (decision 8); `EvidenceNote` gates it |
| Losing the accessibility 100 | Moderate | Accessibility tests as release blockers; server-rendered semantics |
| CMS introduces ungoverned claim edits | Moderate | Defer CMS; keep claim-bearing copy code-controlled permanently |
| Removing the quiz feels like feature loss | Moderate | Frame as replacing a funnel with an authority artefact; the best content is already non-interactive |
| Relocation breaks other pages | Moderate | Sequence: build the destination before removing the source |
| Analytics payload leaks skin attributes (P-1) | Moderate (latent) | Remove attributes from payloads in Phase 1; add the test |
| Two unsynchronised active-ingredient sources | Low | Consolidate under Ingredients ownership in Phase 3 |
| Editorial burden underestimated | Moderate | Model D requires genuinely excellent writing; budget for it explicitly |

---

## 33. Founder decisions required

| # | Decision | Options | Recommendation | Consequence | Required before |
|---|---|---|---|---|---|
| 1 | Guided editorial or selectable pathway system? | Editorial only / Pathways / Hybrid | **Hybrid (Model D)** | Determines whole architecture | Phase 1 |
| 2 | Full reading without any selection? | Yes / No | **Yes** | Guarantees accessibility and non-diagnostic safety | Phase 1 |
| 3 | Product context inside Science or only at the end? | Throughout / End only | **End only, one section** | Prevents funnel framing | Phase 1 |
| 4 | Concierge as a quiet handoff? | Yes / No / Multiple points | **Yes, single closing invitation** | Preserves restraint | Phase 3 |
| 5 | Content code-controlled or partly Sanity? | Code / Structured local / Sanity | **Structured local now; Sanity only if velocity demands** | Governs claims risk | Phase 4 |
| 6 | Commission diagrams? | Yes / No / Later | **Yes, after Phase 1** | Determines budget and timeline | Phase 3 |
| 7 | How directly to discuss under-service of mature melanated skin? | Brief / Substantial / Journal-only | **Substantial in Science, deeper in Journal** | Core to authority | Phase 1 |
| 8 | Which topics need external expert review? | — | **Melanin and post-inflammatory response; what changes in experienced skin** | Gates publication of the strongest content | Phase 3 |
| 9 | Retain, simplify, or replace the interaction model? | Retain / Simplify / Replace | **Replace** | Removes the diagnostic surface | Phase 1 |
| 10 | Is "skin profile" language acceptable? | Keep / Soften / Remove | **Remove** | "Profile" implies assessment | Phase 1 |
| 11 | Remain entirely non-persistent? | Yes / No | **Yes** | Preserves a verified strength | Phase 1 |
| 12 | Journal as home for deeper essays? | Yes / No | **Yes** | Prevents Science bloat | Phase 3 |
| 13 | Ingredient-level education entirely on Ingredients? | Yes / Partly / No | **Yes** | Resolves duplication | Phase 3 |
| 14 | Appropriate level of product linkage? | None / One section / Throughout | **One restrained section** | Sets commercial tone | Phase 1 |

---

## 34. Recommended next branch and scope

**Next branch:** `feature/nfe-science-content-foundation`
**Branch from:** `release/production-hygiene-assets-fonts` at its then-current HEAD.

**Scope (Phase 1 only):** extract content to a typed local model · convert to
server-rendered chapters · remove profiling, scoring, and profile labels · fix
F-1, F-2, F-3 and P-1 · consolidate disclaimers · add content, claims,
non-diagnostic, no-persistence, and no-analytics-leakage tests.

**Out of scope:** pathways (Phase 2) · diagrams (Phase 3) · CMS (Phase 4) ·
Ritual and Ingredients relocation (Phase 3) · any change to `/inci`, `/ritual`,
Journal, or product pages.

**Blocked until decided:** 1, 2, 3, 9, 10, 11, 14.

---

## 35. Explicit non-actions

This phase made **no** change to: the Science route, Science copy, any source
file, navigation, routes, dependencies, `package.json`, `package-lock.json`,
CMS, analytics, product data, pricing, sizes, availability, formulas,
ingredients, claims, Founder Access, Study Circle, Supabase, Shopify, Sanity,
Cloudflare, DNS, `wrangler`, secrets, or the Worker.

No deployment. No Worker version. No traffic change. No tag. No release branch.
No implementation branch. No images created. No tests written. No web research
was required — all findings derive from repository source and read-only
inspection of the live page. `/api/waitlist` was not invoked. No form was
submitted. No data was stored or transmitted.

Live interaction with `/science` was read-only and non-persisting: selections
were exercised in-browser to observe rendering, then reset. Verified afterward:
zero localStorage, zero sessionStorage, zero cookies, zero network requests.

---

## Appendix A — Current-state map

Exact paths and symbol names, as of baseline `4d779c8e21c343b119d243ce488ae2fb72250e6a`.

### File map

| Path | Lines | Role |
|---|---|---|
| `src/app/(education)/science/page.tsx` | 13 | Server component; exports `metadata`, renders `ScienceIntelligence` |
| `src/app/(education)/science/ScienceIntelligence.tsx` | 1,616 | `'use client'`; entire experience |
| `src/app/(education)/layout.tsx` | ~20 | `'use client'`; renders `EducationNavTabs` |
| `src/components/navigation/EducationNavTabs.tsx` | ~60 | Tab-role navigation between `/science` and `/inci` |
| `src/lib/analytics/track.ts` | ~40 | `trackNfeEvent`, `buildTrackedEvent`; dispatches `nfe:analytics-event` |
| `src/lib/analytics/events.ts` | ~40 | `NFE_EVENT_NAMES`, payload types |
| `src/lib/analytics.ts` | ~120 | GA4 module — **not used by `/science`** |
| `src/context/ScienceContext.tsx` | ~90 | `ScienceProvider` / `useScience` — used by `/skin-strategy`, **not** `/science` |
| `data/education/activesTable.json` | — | Consumed by `src/lib/actives.ts`; **not** by `/science` |

### Symbol map — `ScienceIntelligence.tsx`

Types: `SkinTypeId` · `ConcernId` · `PriorityId` · `ProfileId` · `SkinTypeOption`
· `ConcernOption` · `Priority` · `Active` · `Profile`

Constants: `SKIN_TYPES` (7) · `CONCERNS` (8) · `PRIORITIES` (9) · `PROFILES` (6)
· `ACTIVES` (14) · `HOW_IT_WORKS` (3) · `PROOF_STAGES` (3) · `SKIN_LAYER_MAP` (5)
· `CONCERN_MATRIX` (7)

Functions: `includes` · `assignProfile` · `scorePriorities` · `matchActives`
· `buildRitualGuidance` · `ScienceLink` · `ScienceIntelligence` (default)

Handlers: `toggleConcern` · `viewProfile` · `resetProfile`

### State map

| State | Type | Initial | Reset by |
|---|---|---|---|
| `skinType` | `SkinTypeId \| ''` | `''` | `resetProfile` |
| `selectedConcerns` | `ConcernId[]` | `[]` | `resetProfile` |
| `submitted` | `boolean` | `false` | `resetProfile`, any selection change |
| `resultsRef` | `useRef<HTMLDivElement>` | — | — |

Derived (`useMemo`): `priorities` · `profile` · `matchedActives` · `ritualGuidance`

### Route map

`/science` — in `(education)` group · sibling `/inci` · sitemap entry present at
`src/app/sitemap.ts:26` · no `generateStaticParams` · no structured data.

### Test map

| File | Reference |
|---|---|
| `tests/accessibility-enhanced.spec.ts:23` | `page.goto('/science')` |
| `tests/accessibility-enhanced.spec.ts:106` | `page.goto('/science')` |
| `tests/navigation.spec.ts:30` | `toHaveURL('/science')` |
| `tests/unit/` | **no coverage** |

### Claims inventory — disclaimers

| Line | Text |
|---|---|
| 988 | "This tool provides cosmetic skincare guidance based on your selected concerns. It does not diagnose, treat, cure, or prevent any medical condition." |
| 1292 | "This map is an educational cosmetic framework. NFE products are not intended to diagnose, treat, cure, or prevent disease. Results vary." |
| 1609 | "NFE Skin Intelligence provides cosmetic skincare guidance… For persistent or complex skin concerns, consult a licensed professional." |

### Claims inventory — internal notes rendered to customers

| Location | Text | Status |
|---|---|---|
| `ACTIVES.ghk_cu.expectation` | "Use careful cosmetic language: appearance, conditioning, and visible support." | **Confirmed rendering live** |
| `ACTIVES.argireline.expectation` | "Do not compare this support to injectables; this is cosmetic appearance support." | Reachable via matched actives |
| `ACTIVES.thd_ascorbate.expectation` | "A premium active within the formula luxury-science story." | Rendering |
| `ACTIVES.coq10_tocopherols.expectation` | "Part of the formula long-game support system." | Rendering |
| `ACTIVES.bakuchiol.expectation` | "Positioned as visible well-aging support, not as a structural claim." | Rendering |

### Live-behavior notes (read-only, production)

Title "Science, Method & Proof | NFE Beauty" · H1 "Science that interprets skin,
not just ingredients." · 1 `h1` · 8 `aria-pressed` toggles · 1 `<select>`
(8 options) · body text 10,655 chars pre-interaction, 15,554 post ·
Lighthouse Perf 97 / **A11y 100** / BP 100 / SEO 91, zero weighted findings.

Reproduced: *Mature / Changing Skin* + *Dryness* + *Uneven Tone* → profile
"Tone-Uneven Dehydration"; priorities shown = Barrier comfort, Visible
well-aging support, Hydration. **Tone evenness absent** (ties at 2 with
hydration, loses on sort, cut by `.slice(0,3)`).

### Accessibility notes

0 duplicate IDs · 0 broken ARIA references · `fieldset`/`legend` present ·
`aria-pressed` correct · SVG `<title>` + `<desc>` + `aria-label` · decorative
swatches `aria-hidden` · result region has no live-region announcement ·
`scrollIntoView({behavior:'smooth'})` unconditional.

### Network notes

Initial load: document + CSS + 12 JS chunks + 1 font + 1 image, all 200.
One `POST /cdn-cgi/rum` → 204 (Cloudflare RUM). **Zero requests during
interaction.** No `gtag`. No `/api/*` calls.

### Persistence notes

Before and after full interaction and reset: localStorage 0 · sessionStorage 0
· cookies 0.

---

# Phase 1 implementation record

Appended after implementation. The audit findings above are unchanged.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-authority-phase-1` |
| Branched from | `feature/nfe-science-authority-strategy` @ `66534b2384f42e4e167aa70e39804643e11766b0` |
| Canonical production baseline | `4d779c8e21c343b119d243ce488ae2fb72250e6a` |
| Deployed | No. Implementation and local validation only |

## Founder decisions implemented

All fifteen approved directions are implemented. Model D (hybrid editorial) is
the delivered model: the page reads completely top to bottom without any
selection, and pathways change emphasis only.

## Final experience model

Ten sections in the approved order: quiet hero, why this reads differently,
pathways, the map, what the layers mean, formulation principles, ingredient
families, proof discipline, founder note, and product context with one
Concierge invitation.

## Map architecture

Full-width dark chapter. At 1440px the schematic and interpretation split
measures **57% / 43%**, inside the intended 55-65 / 35-45 range. On mobile the
pathway selector sits above the schematic, which occupies 82% of viewport
width, and the interpretation stacks beneath.

The schematic is a pure, stateless component, so the same code renders the
server default and the interactive state. Emphasis is signalled three ways —
opacity, a gold outline, and a visible "In focus" label — so it never depends
on colour alone. Both anatomical labels (Epidermis, Dermis, Hypodermis) and
cosmetic zone labels are retained, unchanged from the previous schematic. No
biological mechanism was added and no penetration or dermal-action claim is
made or implied.

Two defects were found in my own implementation during mobile testing and
fixed: labels rendering at roughly 8px, and the longest zone name being
clipped at the SVG edge. The viewBox was widened to 566 units and label sizes
raised; final measurement at 375px is 10.4px primary, 9.8px secondary, zero
clipped labels. Every zone name also appears at full body size in the
interpretation panel beneath, so the drawing's labels reinforce rather than
carry the information.

## Pathway model

Five doorways: Barrier Comfort, Hydration, Tone Integrity, Texture and
Suppleness, Visible Resilience.

Toggle buttons with `aria-pressed` inside a labelled `role="group"`, plus a
"Clear pathways" action that appears only when something is selected.
Multi-selection is supported and deterministic: emphasis is the union of the
selected layers, and interpretation renders in canonical `PATHWAYS` order
rather than click order. Verified by selecting Tone, then Hydration, then
Texture and observing output order Hydration, Tone Integrity, Texture and
Suppleness. No combined label is ever generated.

## Server and client boundary

`page.tsx` is a server component. `ScienceMapExperience` is the only
`'use client'` module. `SkinLayerSchematic` is pure and holds no state.

## Content model

`src/content/science/` — `types.ts`, `layers.ts`, `pathways.ts`,
`ingredient-families.ts`, `page.ts`, `index.ts`. TypeScript only, no new
dependency, no CMS, no runtime fetching.

Two constraints are enforced by the shape of the types rather than by review:
no entity can hold a score, severity, rank, or profile label; and there is no
free-text field equivalent to the old `expectation`, which mixed customer copy
with authoring instructions.

## Removed profiling behaviour

`ScienceIntelligence.tsx` (1,616 lines) deleted in commit `f059085`. With it:
six named profiles and `assignProfile`; numeric `scorePriorities` and ranked
"Priority N" cards; `matchActives` and the fourteen-card active index;
`buildRitualGuidance`; the "View My NFE Skin Profile" submit step and
result-generation state; smooth-scroll-to-result; the skin-type select and
eight concern toggles; and the analytics payload carrying the visitor's
literal skin type.

`src/lib/analytics/track.ts` is deliberately untouched — Concierge, Discovery,
Skin Ritual Quiz and Founder Access all still use it. Only Science's usage was
removed.

Verified: searching `src/` for `assignProfile`, `scorePriorities`,
`matchActives`, `buildRitualGuidance`, `PROFILES` or `ProfileId` returns zero
results.

## Internal-note correction

All fourteen `expectation` values were audited. Eight were internal authoring
instructions or brand shorthand and are gone with the field:

| Ingredient | Removed text | Classification |
|---|---|---|
| GHK-Cu | "Use careful cosmetic language: appearance, conditioning, and visible support." | Authoring instruction — **was rendering live in production** |
| Argireline | "Do not compare this support to injectables; this is cosmetic appearance support." | Authoring instruction |
| THD Ascorbate | "A premium active within the formula luxury-science story." | Brand shorthand |
| CoQ10 + Tocopherols | "Part of the formula long-game support system." | Brand shorthand |
| Bakuchiol | "Positioned as visible well-aging support, not as a structural claim." | Claims-strategy note |
| Hyaluronic Acid 4D | "Best understood as surface hydration support, not a structural claim." | Claims-strategy note |
| Alpha-Arbutin | "Best positioned as part of a layered tone-support system." | Internal framing |
| Squalane and Emollients | "Emollient support is part of the sensory discipline of the ritual." | Brand shorthand |

The remaining six were genuine customer education. None was replaced with a
new efficacy claim; the per-ingredient presentation was replaced by ingredient
families, which is where that education now lives at family level.

## Ingredient families — data discrepancy flagged, not resolved

`data/education/ingredientGlossary.json` (28 entries) and
`data/products/face-elixir.json` (INCI) list different ingredient sets. The
previous Science page presented fourteen "actives behind Face Elixir", most of
which do not appear in that product's own INCI list.

Rather than pick a side, families now name a family's *character* with
representative examples and never assert the composition of a product.
Ingredients (`/inci`) remains authoritative for per-product INCI.
**Reconciling the two data sources is formulation work and remains open.**

## Claims changes

No claim was strengthened. Pathway content uses appearance and feel language
throughout, and each pathway carries a `claimsBoundary` list of wording it must
not drift into — retained in content so the governance test can assert against
it. The cosmetic-framework caution, including the explicit no-dermal-structure
statement, is preserved. Three prior disclaimers were consolidated to one
closing disclaimer plus the map's framework note.

## Privacy behaviour

No localStorage, sessionStorage, cookie, API call, form submission, or
analytics event. Verified in-browser before, during and after interaction:
zero on all three storage mechanisms, and zero network requests on pathway
selection.

## Accessibility

`/science` Accessibility **100**, zero weighted findings. One `h1`, valid
heading order, zero duplicate IDs, zero broken ARIA references, zero unnamed
controls, zero nested interactive controls, 70px touch targets, visible
focus ring, labelled group, polite live region for interpretation changes
only, labelled SVG with hidden decorative marks, no mobile overflow.

One accessibility regression was introduced and caught by Lighthouse during
validation: the ingredient-family "Such as..." line used `text-nfe-ink/55`,
which composites to `#7c7c7c` on white — 4.17:1, below the 4.5:1 threshold —
dropping the score to 96. Raised to `/70` and re-measured back to 100.

Reduced motion is handled by the existing global `prefers-reduced-motion` block
in `globals.scss`, which neutralises transitions and scroll behaviour. The
framer-motion tab animation was removed with the old navigation.

Without JavaScript the page is complete: all ten sections, the default map, all
five zone labels and all five pathway controls render server-side.

## Performance

| Metric | Baseline | After |
|---|---|---|
| `/science` client chunk | 50,000 bytes | **17,341 bytes** (−65%) |
| Lighthouse Performance | 97 | **99** |
| Routes | 65 | 65 |
| Dependencies | — | unchanged |

## Navigation semantics

`EducationNavTabs` moved from `role="tablist"` and `role="tab"` buttons calling
`router.push` to a `nav` element containing links with `aria-current="page"`.
Affects `/science` and `/inci`, which share the layout. Visual treatment
unchanged.

## Tests

`tests/unit/science-authority.test.ts` — 22 tests, 6 suites. Suite total
26 to **48**, all passing. Covers architecture, pathways, map, privacy, copy
governance, and cross-linking.

## Files

**Added** — the six `src/content/science/` modules, the two
`src/components/science/` components, and the test.

**Changed** — `src/app/(education)/science/page.tsx` (rewritten as a server
component), `src/components/navigation/EducationNavTabs.tsx`, and one stale
comment reference in `src/app/skin-strategy/page.tsx`.

**Removed** — `src/app/(education)/science/ScienceIntelligence.tsx`.

## Intentional customer-visible changes

The Science page is deliberately different: profiling is gone, the map is the
centre of the page, card density is much lower, and product context is a single
restrained section near the end. This is the approved redesign, not a
regression. No other route changed.

## Deferred

Phase 2 pathway refinement; commissioned diagrams; expert scientific review of
melanin and post-inflammatory content before it is written; Journal expansion;
future CMS decision; reconciliation of the glossary and product INCI sources;
product accordion `aria-controls`; `/skin-strategy` performance; Face Elixir
size wording; Cloudflare-managed robots.txt; `/dev/token-specimen` metadata;
Study Circle; founder dashboard; formula and ingredient updates.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity, or CMS change. No product price, size, availability, formula,
ingredient, or claims change. No Founder Access or Study Circle change. No
waitlist activation and no `/api/waitlist` request. No release branch, tag, or
merge. No new dependency and no lockfile change.
