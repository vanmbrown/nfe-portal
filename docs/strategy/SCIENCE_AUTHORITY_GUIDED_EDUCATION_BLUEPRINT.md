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

---

# Phase 1 refinement — Layer Context and Concern-to-Formula Matrix

Appended after the refinement. The strategy audit and the Phase 1
implementation record above are unchanged.

## Founder decision

Restore two modules from the previous Science page — Layer Context and the
Concern-to-Formula Matrix — as part of the new hybrid editorial system, placed
directly beneath the expanded interactive map, fully visible in the default
state, with pathway selection bringing the relevant panel and row forward. The
map stays the centrepiece. Profiling, scoring, ranking and personalised results
stay removed. Ingredient families remain the language until the glossary and
product INCI sources are reconciled.

This is a refinement of Phase 1, not a reversal.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-layer-context-refinement` |
| Branched from | `feature/nfe-science-authority-phase-1` @ `9a6b242` |
| Canonical production baseline | `4d779c8` |
| Deployed | No. Implementation and local validation only |

## Why both modules were worth restoring

Neither module depended on the profiling engine. Both read from plain arrays
and rendered the same content for every visitor; only their placement inside
the old client component tied them to the quiz. Removing them in Phase 1 lost
genuine education for no architectural gain.

## Placement

Sections 5 and 6, immediately beneath the map, inside the same continuous dark
chapter. They interpret the map, so they sit next to it rather than further
down the page.

## Content model

`src/content/science/layer-context.ts` and `formula-matrix.ts`, with
`LayerContextPanel` and `ConcernFormulaMatrixRow` added to `types.ts`.

Panels and rows reference pathways, layers and ingredient families by id
rather than restating their labels, so those stay single-sourced. Each module
owns only its own prose. That separation is deliberate: Layer Context is
written to reward slower reading, the matrix to be understood at a glance, so
they share no sentences.

Neither type can hold a score, rank, severity or profile field. Rows carry no
`claimsBoundary` of their own — a row's boundary is its pathway's, reachable
through `pathwayId`, and a second copy would be a second source of truth.

`order` is explicit rather than implied by array position, so canonical
ordering is an assertable property. Panels read surface downward, mirroring the
schematic bands above them.

## Layer Context

Five panels: Skin surface and moisture context · Barrier comfort and lipid
context · Epidermal appearance and tone integrity · Texture and visible
refinement · Environmental context and visible radiance.

All five always render. Selection never filters, hides, reorders or ranks them,
and an unemphasised panel keeps full text contrast — only its border,
background and title colour shift. Emphasis carries a visible "In focus"
marker, so it never depends on colour alone.

Visually this departs from the original on purpose: generous panels on a
continuous surface with hairline divisions, rather than dense cards nested
inside the map card. Ingredient families read as a plain interpunct-separated
line instead of a chip cloud.

## Concern-to-Formula Matrix

Columns: What you are exploring · Layer context · NFE formulation principle ·
Ingredient family.

Seven rows became five, one per pathway. The old seven split texture from fine
lines and radiance from sensitivity, implying a precision the content did not
have and leaving two rows belonging to no pathway.

The original was built from CSS-grid divs — no table, no headers, no caption.
This is a real semantic table with `caption`, `thead`, `th scope="col"` and
`th scope="row"`. Below `lg` it becomes a stacked list whose column names are
real elements rather than `::before` content.

The table breaks at `lg`, not `md`, because it was measured: at 768px the four
columns come out around 160px each and every cell wraps to four to six lines.
Tablets get the stacked layout instead.

Selection emphasises rows. It never sorts, filters, hides, ranks or promotes
them, and no row is ever marked recommended.

## Shared state

One owner: `ScienceMapExperience`. It holds a single `useState` and hands the
same value to all three modules, each of which is a pure, stateless child. No
second island, no context provider, no global store.

Multi-selection is deterministic. Verified by clicking Visible Resilience and
then Tone Integrity and observing Tone Integrity render first — canonical
content order, not click order.

## Ingredient sources

Unchanged from Phase 1 and still unresolved: the glossary and
`data/products/face-elixir.json` list different ingredient sets. Neither module
names a specific ingredient or asserts what is in a product. The matrix closes
with a line pointing at Ingredients, which owns per-product INCI.

## Claims

All new copy is appearance and feel language. Panels carry `claimsBoundary`
lists retained in content so the governance tests assert against them. The
approved "Well-aging, not anti-aging" contrast is used once.

The whole of the new copy is new customer-facing writing and has not had a
founder read.

## Two defects fixed along the way

**Focus loss on clearing pathways.** "Clear pathways" only exists while
something is selected, so activating it by keyboard destroyed the control the
user was standing on and dropped focus to `<body>`. Focus now moves to the
start of the pathway group. This was a Phase 1 defect, confirmed against that
build — Lighthouse does not detect focus loss on unmount, so it scored 100
throughout.

**Science content in the client bundle.** Restoring both modules took the
`/science` client chunk from 16,579 to 28,964 bytes and cost about three
Lighthouse Performance points at the median. Two causes: the island imported
the content directly, and after that was moved to props the client components
still imported from the `@/content/science` barrel, which re-exports the same
content and is not tree-shaken back out. Per-module imports in the four client
components dropped the chunk to 23,679 with the prose verifiably gone from it.

## Accessibility

`/science` Accessibility **100**, zero weighted findings, zero failing
contrast audits. Fourteen contrast samples measured directly on the new dark
ground, lowest 5.21:1 against a 4.5:1 threshold.

Heading order h1 → h2 → h3 → h4 with no skips. Real table semantics. Exactly
one matrix representation exposed to assistive technology at every viewport,
verified at 320, 375, 768, 1024 and 1440px rather than assumed. No auto-scroll
and no focus movement on selection; focus stays on the activated control.

## Performance

Measured with four interleaved Lighthouse runs against each branch, because a
single run on this machine varies by up to six points on identical code.

| Metric | Phase 1 | Refinement |
|---|---|---|
| Perf (4 runs) | 96, 98, 92, 97 — median **97** | 97, 97, 96, 97 — median **97** |
| Accessibility | 100 | **100** |
| TBT median | 130 ms | 137 ms |
| CLS | 0 | **0** |
| `/science` client chunk | 16,579 B | **23,679 B** (+7,100) |
| Total referenced JS | 562,023 B | ~569,000 B (+1.3%) |
| Routes | 62 | **62** |
| Dependencies | — | **unchanged** |

The remaining 7,100 bytes is the two new components' own code, which is
unavoidable — they are interactive.

Note on a Phase 1 reporting error: that record stated 65 routes and a 17,341
byte chunk. The correct figures at `9a6b242` are **62** unique app routes and
**16,579** bytes; the earlier numbers came from counting build-output lines and
from an intermediate build. Both branches measure identically, so no regression
is hidden by the correction.

## Tests

`tests/unit/science-authority.test.ts` — 40 tests added across 6 suites, taking
the file from 48 to **88**, all passing.

Three were verified by deliberately breaking the code rather than trusting a
green run: naming a specific ingredient in a matrix row, filtering rows by
selection, and adding a `localStorage` write to the panels. Each failed the
suite; the suite returned to 88 green once reverted.

## Files

**Added** — `content/science/layer-context.ts`,
`content/science/formula-matrix.ts`, `components/science/LayerContextPanels.tsx`,
`components/science/ConcernFormulaMatrix.tsx`.

**Changed** — `content/science/types.ts`, `content/science/page.ts`,
`content/science/index.ts`, `components/science/ScienceMapExperience.tsx`,
`components/science/SkinLayerSchematic.tsx`,
`app/(education)/science/page.tsx`, `tests/unit/science-authority.test.ts`.

**Removed** — nothing.

## Intentional customer-visible changes

`/science` gains two substantial modules beneath the map. No other route
changed.

## Deferred

Reconciliation of the ingredient glossary and product INCI sources; founder
claims read of all new copy; expert scientific review before melanin and
post-inflammatory content is written; Phase 2 pathway refinement; commissioned
diagrams; Journal expansion; future CMS decision; product accordion
`aria-controls`; `/skin-strategy` performance; Face Elixir size wording;
Cloudflare-managed robots.txt; `/dev/token-specimen` metadata; Study Circle;
founder dashboard; formula and ingredient updates.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity or CMS change. No product price, size, availability, formula,
ingredient or claims change. No Founder Access or Study Circle change. No
waitlist activation and no `/api/waitlist` request. No release branch, tag or
merge. No new dependency and no lockfile change. No restoration of profiling,
scoring, ranking or personalised recommendation.

---

# Phase 1 visual refinement — Layer Context as schematic companion

Appended after the visual refinement. The strategy audit, the Phase 1
implementation record and the Layer Context refinement record above are
unchanged.

## Founder decision

Keep the current Science page flow and every other section as approved. Restore
Layer Context as a large, visually distinct companion to the schematic:
framed container, numbered support-zone panels, vertical zone-colour bars, and
a clear two-column reading structure, at the full content width of the dark
chapter. One visual refinement, not another redesign.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-layer-context-visual-refinement` |
| Branched from | `feature/nfe-science-layer-context-refinement` @ `215b391` |
| Canonical production baseline | `4d779c8` |
| Deployed | No. Implementation and local validation only |

## The visual problem

The previous implementation was structurally correct but visually recessive: a
run of near-flat full-bleed strips separated by hairlines, with the heading
floating outside them in a narrow column. Nothing framed the module, nothing
tied a panel to the band of the schematic it explained, and the eye had no
reason to enter it.

Two causes turned out to be mechanical rather than compositional, and both are
fixed here.

## Cause one — zone colour had no shared token

`layers.ts` carried `bandClass: 'bg-[#f4eadb]'` and `labelClass`, and the
schematic carried its own hardcoded hex fills. Two sources for one colour.

Worse, both fields were dead: nothing read them, and `src/content` sits outside
the Tailwind content globs, so those arbitrary classes could never have been
generated even if something had.

`bandClass` is now `bandHex`, a plain hex; `labelClass` is removed. The
schematic keeps its geometry and takes its fills from that token, and the Layer
Context colour bar reads the same one. All five resolved fills were verified
identical to the previous hardcoded values, so the drawing is unchanged.

## Cause two — opacity utilities that emitted no CSS

Tailwind's opacity scale runs in steps of 5. Utilities using `12`, `68`, `72`
or `78` parse fine and look correct in review, but emit nothing — the element
silently falls back to Tailwind's default border colour or an inherited text
colour.

`border-nfe-paper/12` was used in five places, **including the schematic's own
container since Phase 1**, so that frame had been rendering a cool grey-200
hairline on the warm dark green ground. That is a large part of why the chapter
did not read as one plate.

Corrected inside the dark chapter:

| Before | After | Where |
|---|---|---|
| `border-nfe-paper/12` | `/15` | schematic container, families divider, matrix row rules, panel borders |
| `text-nfe-paper/78` | `/80` | interpretation body, matrix stacked values |
| `text-nfe-paper/72` | `/70` | interpretation labels, families list |
| `text-nfe-paper/68` | `/70` | default layer list |

Two remain in the light sections of `science/page.tsx` —
`border-nfe-green-900/12` and `text-nfe-ink/72`. Those sections are protected,
the fallback there is harmless, and fixing them is not needed for this
refinement. Reported, not changed.

A test now walks every `nfe` opacity utility in the dark chapter and fails on
any step Tailwind cannot emit.

## Outer container

A framed plate at the full content width of the dark chapter, sharing the
schematic's `1.75rem` radius, with a restrained gold/25 border and a slightly
lifted surface. Its left edge aligns with the schematic container's to the
pixel at every width measured. The eyebrow, heading and the restored
"Cosmetic support zones" label now sit inside the frame with the panels they
introduce.

## Panel composition

Five panels, `01`–`05`, ordered surface downward to mirror the schematic bands.

Left column: vertical zone-colour bar, numbered eyebrow naming the zone,
editorial title, visible appearance context. Right column: formulation support,
ingredient-family pills, and a closing line naming the map zone and the pathway.

Measured split **42 / 58** at 1440, 1280 and 1024px, inside the intended
38–45 / 55–62. Panels stack below `lg`.

The numbered eyebrow uses the layer's own zone name — "01 · Surface hydration" —
so a panel and the band it explains cannot drift apart.

## Zone colour system

| # | Zone | Token |
|---|---|---|
| 01 | Surface hydration | `#f4eadb` |
| 02 | Barrier comfort | `#a5ad86` |
| 03 | Tone integrity | `#d5ae62` |
| 04 | Texture and suppleness | `#a66f45` |
| 05 | Visible resilience | `#ead7aa` |

One token per zone, read by the schematic band and the panel bar. The bar is
`aria-hidden`; the zone name beside it carries the same information as text.

## Ingredient treatment

Families only, as warm cream pills with dark green text, at **13.06:1**. No
panel carries more than four, and a test enforces that. No named active
appears, and nothing asserts the composition of a product. The label
"Formulation support" replaces the old "Formula support", which sat directly
above named actives and together read as a statement of what is in the formula.

The glossary and product INCI discrepancy is untouched and still open.

## Behaviour

Default: all five panels equal, no focus markers, bars at full strength.
Selected: gold border, lifted surface, gold title, and a visible "In focus"
marker. Unselected panels keep full text contrast — only the decorative bar
dims. Multi-selection emphasises every match equally in canonical order with no
ranking. Clearing returns everything to default with focus preserved on a
control and no scroll movement.

## Accessibility

`/science` Accessibility **100**, zero failing audits including contrast,
heading order, list and definition-list semantics.

178 text samples measured across default, single and multi-selected states —
zero failures, lowest **5.7:1**. No interactive control inside a panel, no
second live region, no focus movement, no auto-scroll. All content
server-rendered: frame, label, five bars with their exact hexes, and 14 family
pills, with zero "In focus" markers in the default state.

## Responsive

| Viewport | Layout | Columns | Overflow | Clipped | Pill rows |
|---|---|---|---|---|---|
| 1440 | framed, aligned | 42/58 | none | 0 | 1 |
| 1280 | framed, aligned | 42/58 | none | 0 | 1 |
| 1024 | framed, aligned | 42/58 | none | 0 | 1 |
| 768 | framed, stacked | stacked | none | 0 | 1 |
| 375 | framed, stacked | stacked | none | 0 | 2 |
| 320 | framed, stacked | stacked | none | 0 | 3 |

Minimum font size 12px at every width (uppercase labels); body copy 17px.

## Performance

Three interleaved Lighthouse runs against the parent branch and this one:

| Metric | Parent | Visual |
|---|---|---|
| Performance | 98, 98, 98 — median **98** | 98, 98, 98 — median **98** |
| Accessibility | 100 | **100** |
| CLS | 0 | **0** |
| `/science` client chunk | 23,679 B | **24,432 B** (+753) |
| Routes | 62 | **62** |
| Dependencies | — | **unchanged** |

Other routes: `/` 97, `/skin-strategy` 72, `/products/face-elixir` 76 — all
Accessibility 100, all pre-existing.

## Copy changes

Two, both minimal: `zonesLabel` added as new content ("Cosmetic support
zones"), and one word in the module intro, "part" to "band", so the sentence
names what a panel actually reads. No panel copy changed. No claim changed.

## Tests

88 to **112**. Four of the new guards were verified by deliberately breaking
the code — reintroducing `border-nfe-paper/12`, putting a button inside a
panel, pushing the column split out of range, and restoring a `bandClass`
field. Each failed the suite; it returned to 112 green once reverted.

## Files

**Changed** — `content/science/types.ts`, `content/science/layers.ts`,
`content/science/page.ts`, `components/science/LayerContextPanels.tsx`,
`components/science/SkinLayerSchematic.tsx`,
`components/science/ScienceMapExperience.tsx`,
`components/science/ConcernFormulaMatrix.tsx`,
`tests/unit/science-authority.test.ts`.

**Added / removed** — none.

## Customer-visible changes

Layer Context becomes a framed plate with numbered panels and zone-colour bars.
Borders in the dark chapter, including the schematic's own container, change
from an unintended grey to the intended warm paper tint. Nothing else on the
page changes.

## Founder review notes

The point of the module is that the first panel should make the drawing above
it easier to understand. Worth checking against that directly: read panel 01,
then look back at the top band of the map.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity or CMS change. No product price, size, availability, formula,
ingredient or claims change. No Founder Access or Study Circle change. No
waitlist activation and no `/api/waitlist` request. No matrix redesign, no
redesign of any other Science section. No profiling, scoring, ranking or
personalised recommendation. No release branch, tag or merge. No new dependency
and no lockfile change.

---

# Final Phase 1 refinement — pathway synchronization and schematic scale

Appended after the refinement. The strategy audit and the three earlier records
above are unchanged.

## Founder decision

Two focused changes to the approved Science page. Make the Layer Context panel
visibly highlight in synchronization with the map, the interpretation and the
matrix. Make the Skin Layer Intelligence Map larger and easier to read. Change
nothing else.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-pathway-sync-schematic-scale` |
| Branched from | `feature/nfe-science-layer-context-visual-refinement` @ `0953c15` |
| Canonical production baseline | `4d779c8` |
| Deployed | No. Implementation and local validation only |

## The visual issue, measured

The state and the styling were both correct. Measuring composited pixels rather
than class names showed why it still could not be seen:

| Cue | Delta | Verdict |
|---|---|---|
| Surface | RGB distance 14, luminance +0.0087 | Effectively invisible on dark ground |
| Border | RGB distance 77, but 1px | A hairline |
| Title | RGB distance 178 | Real, but a hue shift in the left column |
| Zone bar | opacity 1 → 1 | **No change at all** |

The bar was the clearest miss: the rule only dimmed the *other* panels, so
nothing about the selected panel itself changed.

## Selected-state treatment

Six cues instead of two.

| Property | Unselected | Selected |
|---|---|---|
| Border | `nfe-paper/15`, 2px | `nfe-gold/60`, 2px — RGB distance 88 |
| Surface | white 3.5% | warm cream 14% — RGB distance 36, up from 14 |
| Inset ring | none | gold 1px inset |
| Zone bar | full, or 0.5 when another panel is selected | full plus a gold ring |
| Eyebrow | `nfe-paper/70` | gold — RGB distance 178, previously unchanged |
| Title | cream | gold |
| Marker | none | filled gold "In focus" pill |

Border weight is 2px in both states, so selection causes no layout shift. Body
copy is untouched by selection: an unselected panel keeps full text contrast.

This shares the matrix's language — same gold, same "In focus" wording, same
200ms ease-out — and is deliberately a little stronger, because Layer Context
is the richer explanatory module.

## State architecture

One owner, `ScienceMapExperience`, holding a single `useState`, feeding all
four expressions. Verified: one `useState` call, no context, no global store,
zero string-based pathway comparisons.

Panels expose `data-pathway-id`, `data-active` and `data-has-selection`. No
ARIA is invented for elements that are not controls.

## Synchronization, verified in the browser

Every pathway singly, five combinations, all five at once, and clear:

| Pathway | Map | Panel | Matrix row |
|---|---|---|---|
| Hydration | Surface | 01 Surface hydration | Dryness and ashiness |
| Barrier Comfort | Barrier | 02 Barrier comfort | Tightness and barrier comfort |
| Tone Integrity | Tone | 03 Tone integrity | Uneven-looking tone |
| Texture & Suppleness | Texture | 04 Texture and suppleness | Texture and fine-line appearance |
| Visible Resilience | Radiance | 05 Visible resilience | Dull or tired-looking appearance |

In every state the panel order stayed `hydration, barrier-comfort,
tone-integrity, texture-suppleness, visible-resilience`, all five panels and
all five rows stayed present, and clearing returned everything to default.

## Schematic scale

Measured at 1440px:

| Metric | Before | After | Change |
|---|---|---|---|
| Block rendered | 266 × 216 | **339 × 289** | +27% / +34% |
| SVG rendered | 526 × 271 | 552 × 318 | |
| Card | 584 × 329 | 610 × 376 | |
| viewBox | 566 × 292 | 520 × 300 | |
| Block share of viewBox | 51% / 79% | 62% / 91% | |
| Unused viewBox | 8% / 20% | 8% / 4% | |
| Label units | 19 / 18 / 13 | 22 / 20 / 15 | |
| Smallest label at 375px | ~10.4px | 13.1px | |
| Smallest label at 320px | ~5.8px | 7.3px | |
| Column ratio | 57 / 43 | **60 / 40** | inside the 58-65 target |

Three changes made the room: a tighter viewBox, a wider schematic column, and
wrapping long zone names onto a second line. The wrapping is what actually
mattered — single-line labels were forcing the viewBox wide enough for "Texture
and suppleness", and every unit of label width shrank the drawing at a fixed
column width.

Band proportions, ordering, colours, labels, caption and interactive emphasis
are unchanged, and no biological detail was added. Geometry is now anchored to
one `BLOCK` constant so the frame, clip path, bands, sheen and focus outlines
cannot drift apart.

**Above the stated range.** The brief asked for 20-35% larger diagram area.
This is +27% and +34% per dimension, which compounds to roughly +70% by area.
It is legible and unclipped at every width tested, but if the range meant area
rather than dimensions it is about double. Straightforward to dial back.

## Responsive

| Viewport | SVG | Block | Smallest label | Overflow | Clipped |
|---|---|---|---|---|---|
| 1440 | 552 × 318 | 339 × 289 | 15.9px | none | 0 |
| 1280 | 552 × 318 | 339 × 289 | 15.9px | none | 0 |
| 1024 | 466 × 269 | 287 × 244 | 13.4px | none | 0 |
| 768 | 599 × 346 | 369 × 313 | 17.3px | none | 0 |
| 375 | 309 × 178 | 190 × 162 | 8.9px | none | 0 |
| 320 | 254 × 147 | 156 × 133 | 7.3px | none | 0 |

The schematic is larger than baseline at every width. At 768 and below it
stacks full width, which makes it the largest of all.

## Accessibility

`/science` Accessibility **100**, zero failing audits. 62 contrast samples
measured with all five pathways active — zero failures, lowest 5.7:1. Non-colour
active marker retained, no new live region, no focus movement, no auto-scroll,
SVG title and description intact, no duplicate IDs. All five panels with
`data-active="false"` and zero "In focus" markers render server-side without
JavaScript.

## Performance

Three interleaved Lighthouse runs per branch:

| Metric | Parent | This branch |
|---|---|---|
| Performance | 100, 98, 98 — median 98 | 97, 98, 97 — median **97** |
| Accessibility | 100 | **100** |
| CLS | 0 | **0** |
| `/science` client chunk | 24,432 B | **24,944 B** (+512) |
| Routes | 62 | **62** |
| Dependencies | — | **unchanged** |

The 1-point median difference sits inside the run-to-run spread observed on
identical code earlier in this work.

## Copy changes

None. No customer-facing string changed. "In focus" already existed.

## Tests

112 → **131**. All four required violation tests performed and caught: a broken
panel mapping, a weakened active border, an inverted `data-active` value, and a
schematic block shrunk back toward baseline.

## Files

**Changed** — `components/science/LayerContextPanels.tsx`,
`components/science/SkinLayerSchematic.tsx`,
`components/science/ScienceMapExperience.tsx`,
`tests/unit/science-authority.test.ts`.

**Added / removed** — none.

## Customer-visible changes

A selected pathway now clearly marks its Layer Context panel. The schematic is
about a quarter larger in each dimension with larger labels. Nothing else on
the page changes.

## Founder review status

Awaiting visual approval. The check that matters: select one pathway and
confirm that the map band, the interpretation, the Layer Context panel and the
matrix row all read as the same answer.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity or CMS change. No product price, size, availability, formula,
ingredient or claims change. No Founder Access or Study Circle change. No
waitlist activation and no `/api/waitlist` request. No matrix redesign and no
other Science section touched. No profiling, scoring, ranking or personalised
recommendation. No release branch, tag or merge. No new dependency and no
lockfile change.

---

# Final Phase 1 refinement — Science-to-Ingredients family navigation

Appended after the refinement. The strategy audit and the four earlier records
above are unchanged.

## Founder decision

Make each ingredient-family pill in Layer Context a link to that family's
section on Ingredients, and organise Ingredients around the same taxonomy.
Science explains the family, Ingredients reveals what is inside it, product
pages stay authoritative on verified composition. Change nothing else.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-ingredient-family-links` |
| Branched from | `feature/nfe-science-pathway-sync-schematic-scale` @ `f3bcfac` |
| Canonical production baseline | `4d779c8` |
| Deployed | No. Implementation and local validation only |

## Shared taxonomy

`src/content/ingredients/` is the one authoritative source.

| # | Id | Label | Ingredients |
|---|---|---|---|
| 1 | `humectants` | Humectants | 4 |
| 2 | `emollients` | Emollients | 3 |
| 3 | `barrier-supportive-lipids` | Barrier-supportive lipids | 2 |
| 4 | `tone-supportive-cosmetic-ingredients` | Tone-supportive cosmetic ingredients | 5 |
| 5 | `peptides` | Peptides | 2 |
| 6 | `antioxidant-supportive-ingredients` | Antioxidant-supportive ingredients | 6 |
| 7 | `botanical-oils` | Botanical oils | 2 |
| 8 | `sensorial-support` | Sensorial support | 3 |

Three Science ids were renamed to the canonical form, because these ids are now
public URLs: `barrier-lipids`, `antioxidant-support` and `tone-supportive`.
Science no longer defines family labels at all — it keeps only the family's
role in its own voice and its representative examples, and resolves the label
from the taxonomy at render time.

The module is split. `families.ts` holds identity (id, label, order, href) and
is safe for the Science client island. `family-copy.ts` holds descriptions and
claims boundaries and is imported only by Ingredients. Without that split the
prose added 2.4KB to the Science chunk for text that page never shows.

## Science links

Fourteen links across five panels, all plain `Link` elements with real hrefs
built by `familyHref()` rather than by hand. No button, no `role="button"`, no
click handler, no scroll script, no query string, no new tab, no
`aria-label` override, no analytics. Repeated families share one canonical
href — `emollients`, `antioxidant-supportive-ingredients` and
`sensorial-support` each appear in three panels.

The approved pill treatment is unchanged. Hover warms the surface and
underlines; focus uses the existing gold ring with an offset.

## Ingredients architecture

The route was a client component whose content lived in three tabs. An anchor
cannot land inside a tab panel that starts hidden, and a visitor without
JavaScript would have found nothing. The tab UI moved verbatim into
`INCITransparencyTabs`; the page around it is now server-rendered.

Page order: intro, a compact index of eight plain anchors, the eight family
sections, the composition clarification, the full transparency reference —
INCI lists, actives table, complete glossary, unchanged — then a return link to
Science.

Each section has a stable id, an `aria-labelledby` pointing at a distinct
`-heading` id, a visible `h2` carrying the canonical label, a claims-safe
description, its ingredients with concise roles, and `scroll-mt-24`. Neither
the site header nor the education nav is sticky, so that margin is breathing
room rather than compensation.

## Ingredient membership

Membership follows the `category` and `function` values already recorded in
`data/education/ingredientGlossary.json`. Nothing was invented.

Five glossary entries are deliberately unassigned. Aqua, Optiphen Plus and the
pH/stabilisation group are formulation infrastructure. Bakuchiol is recorded as
"Retinol Alternative / Skin Conditioning", which maps to none of the eight, and
Ectoin was assigned to barrier-supportive lipids on the strength of its
recorded "Barrier Support" function despite not itself being a lipid — both are
judgement calls worth a second look. All five remain visible in the full
glossary, so nothing is hidden.

## Product-composition boundary

One line, once, before the full reference: *Ingredient families describe
cosmetic roles and formulation logic. For what is in a particular formula, see
that product's own ingredient declaration.*

No family surface names Face Elixir or Body Elixir or claims presence in every
product. No internal source-conflict vocabulary reaches customers.

The glossary and `data/products/*.json` still list different ingredient sets.
That discrepancy is untouched and still deferred. No product data, INCI
declaration, percentage or claim was modified.

## Accessibility

`/science` **100** and `/inci` **100**, zero failing audits on both.

`/inci` was at **94** on the parent branch, with one pre-existing failure: the
product selector in `INCILists` used white text on the gold at 2.29:1. This
work took it to 96, and the selector was corrected to the deep green already
used on the page, which measures 6.66:1, bringing it to 100. Two colour tokens,
not a redesign.

All eight anchors land with the heading at a consistent 137px from the top at
1280, 375 and 320px. Zero duplicate ids, one `h1`, native link semantics,
keyboard focusable, no nested interactive elements, no focus ring clipped by an
overflow ancestor, no page overflow at any width.

## Link behaviour

Normal click navigates. Keyboard Enter activates. No new tab. Browser Back
returns to Science with the page still interactive — pathway selection
re-tested after returning and still works. Direct hash loads resolve against
server-rendered HTML with no JavaScript. No custom scroll handler, no focus
trap, no analytics.

## Performance

| Metric | Baseline | After |
|---|---|---|
| `/science` client chunk | 24,944 B | **25,716 B** (+772) |
| `/science` Lighthouse | Perf 97, A11y 100 | Perf 98, A11y **100** |
| `/inci` Lighthouse | Perf ~97, A11y **94** | Perf 97, A11y **100** |
| CLS | 0 | **0** |
| Routes | 62 | **62** |
| Dependencies | — | **unchanged** |

## Copy changes

| Location | Change | Reason |
|---|---|---|
| Science family label | "Tone-supportive ingredients" → "Tone-supportive cosmetic ingredients" | Canonical taxonomy label |
| `/inci` intro | New paragraph | Frames the family organisation |
| `/inci` family descriptions | Eight new | Required by the section architecture |
| `/inci` clarification | New line | Product-composition boundary |
| `/inci` reference heading | New | Introduces the existing tabs |
| `/inci` return link | New | Orientation back to Science |

No Science panel copy, matrix row, pathway label, schematic label or ingredient
description was rewritten.

## Tests

131 → **159**. All four required violation tests performed and caught: a
hardcoded incorrect href, an anchor section stripped of its id, a duplicated
family id, and a pill converted to a button.

## Files

**Added** — five `src/content/ingredients/` modules,
`components/ingredients/IngredientFamilySections.tsx`,
`components/education/INCITransparencyTabs.tsx`.

**Changed** — `app/(education)/inci/page.tsx`,
`app/(education)/science/page.tsx`, `components/education/INCILists.tsx`,
three Science components, four Science content modules, the test file.

**Removed** — none.

## Customer-visible changes

Ingredient families on Science become links. Ingredients gains eight anchored
family sections above its existing reference tabs, and its product selector
reads dark green on gold instead of white. Nothing else changes.

## Deferred

Founder visual and copy approval; the glossary and product INCI reconciliation;
the Bakuchiol and Ectoin family assignments; expert scientific review;
commissioned diagrams; Phase 2 pathway refinement; Journal expansion; CMS
decision; product accordion `aria-controls`; `/skin-strategy` performance; Face
Elixir size wording; robots.txt; token-specimen metadata; Study Circle; founder
dashboard.

`/inci` still has no route metadata. It had none before, so adding a title and
description would be a change beyond this task's scope — worth doing, not done
here.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity or CMS change. No product price, size, availability, formula,
ingredient declaration or claims change. No Founder Access or Study Circle
change. No waitlist activation and no `/api/waitlist` request. No new route. No
Science, matrix or schematic redesign. No profiling, scoring, ranking or
personalised recommendation. No release branch, tag or merge. No new dependency
and no lockfile change.

---

## Correction — schematic label collision and revised scale

The wrapped zone sub-labels introduced in the pathway-synchronisation work
overlapped the next zone's label. Wrapping could not have fitted: a band is
52-58 units tall and a wrapped label group needs 62.

Labels are back to one line and the geometry is sized to text measured in the
browser rather than estimated. viewBox 620x300, block 360x280, bands 56/56/58/
58/52, main label 22 units at midY-8, sub-label 18 units at midY+18.

**The schematic figures recorded in the record above are wrong.** They were
measured on the broken layout. Corrected against the Phase 1 baseline of
266x216:

| Metric | Recorded | Actual |
|---|---|---|
| Block width | +27% | **+20%** |
| Block height | +34% | **+15%** |
| Block area | ~+70% | **+39%** |

The corrected result sits inside the 20-35% the brief asked for, rather than
above it as previously flagged.

Label sizes: zone 19 to 22 units and anatomical 13 to 15, both larger. The
sub-label stays at 18 — unchanged, not larger — because it is the longest
string and its width sets the viewBox width, which scales the whole drawing.

Verified at 1440 and 320px, default and all-five-selected: zero overlapping
label pairs, zero labels outside the viewBox. A test now computes
baseline-to-baseline spacing between each zone's sub-label and the next zone's
main label and requires at least one font size of clearance.

---

# Final Phase 1 refinement — Founder-guided orientation restoration

Appended after the restoration. The strategy audit and the five earlier records
above are unchanged.

## Founder decision

Restore four orientation elements the redesign lost — the method explanation,
the three-step orientation, the invitation into the pathway selector, the
"Build Your NFE Skin Profile" framing, and the Layer Science introduction —
adapted to the current non-diagnostic, pathway-led architecture. Change nothing
else.

## Branch

| | |
|---|---|
| Branch | `feature/nfe-science-orientation-restoration` |
| Branched from | `feature/nfe-science-ingredient-family-links` @ `eb8eb27` |
| Canonical production baseline | `4d779c8` |
| Deployed | No. Implementation and local validation only |

**Branch-point note.** The brief named `f4614fa` as the starting HEAD. That
branch had since moved to `eb8eb27`, adding the schematic label-collision fix
and its documentation correction. Branching from `f4614fa` would have silently
re-introduced the colliding zone labels, so this work starts from the current
tip.

## Restored modules

**Method.** "How the NFE Science Map works." with an introduction and three
steps, between the opening explanation and the dark chapter. Server-rendered,
warm ground, an ordered list of three cards. No progress indicator, no numbered
circles, no animation: it orients, then recedes.

Step 2 states in as many words that nothing is diagnosed, scored or saved,
because that is the question this module invites.

**Invitation.** "Start your skin interpretation" — a plain `Link` to
`#build-your-nfe-skin-profile`. No handler, no scroll script, no router, no
query string, no new tab. The href is asserted equal to the destination anchor
id, so the two cannot drift apart.

**Profile framing.** "Build Your NFE Skin Profile" opens the dark chapter
directly above the pathway controls and carries the anchor. Two short lines set
beside each other rather than stacked as disclaimers: *An interpretive guide,
not a diagnosis.* and *Nothing is saved or submitted.*

**Layer Science.** "How NFE Face Elixir supports the skin by layer." sits
between the pathway controls and the schematic, passed into the island as a
server-rendered node so the copy travels as markup rather than client code.

## The privacy statement was verified before publishing

The brief requires that "Nothing is saved or submitted" be factually true. The
Science components and route were scanned with comments stripped: zero
occurrences of localStorage, sessionStorage, cookies, fetch, sendBeacon,
analytics, form or submit in executable code. The only raw matches sit in a doc
comment describing what the component does not do. The statement is true.

## What "profile" means here, and where it is allowed

A temporary, page-local view. Not a record, an account, a score, a rank, a
diagnosis or a recommendation. Every occurrence of the word in the Science
source is one of three things: the approved heading, its anchor or identifier,
or a denial of profiling. A test confines it to those, and would fail if the
word spread to panels, matrix, pathways, steps or layer copy.

## One existing string moved

The map intro paragraph about how visible needs relate is now the closing line
of the Layer Science block. The map intro eyebrow and heading it sat under are
superseded by the founder's headings. Reported rather than silently dropped.

## Preserved unchanged

Pathway controls and their single selection owner, the enlarged schematic, the
dynamic interpretation, Layer Context and its active-state synchronisation, the
Concern-to-Formula Matrix, all fourteen ingredient-family links, the `/inci`
anchor architecture, formulation principles, ingredient families, proof
discipline, Founder Note, product context, Concierge and the closing note.

Verified across every pathway singly, all five together, and clear: identical
behaviour, no result block at any point, and no change in how often the word
"profile" appears.

## What was not restored

No skin-type dropdown, concern checkbox grid, submit button, validation, result
banner, profile generator, score, rank, active matching, personalised ritual or
product recommendation. Zero `<select>`, `<input>`, `type="checkbox"`,
`<form>` or `onSubmit` anywhere in the Science components or route.

## Accessibility

`/science` **100** and `/inci` **100**, zero failing audits on both. One `h1`,
**zero skipped heading levels** across 35 headings, zero duplicate ids. The
invitation is a keyboard-focusable anchor with no role or target override; its
destination heading lands at 132px, visible; browser Back returns cleanly and
the page stays interactive. No new live region, no focus movement, no
JavaScript required for any orientation content.

## Responsive

| Viewport | Step columns | Card text | Chars/line | Anchor heading | Overflow |
|---|---|---|---|---|---|
| 1440 | 3 | 261px | 33 | visible | none |
| 1280 | 3 | 261px | 33 | visible | none |
| 1024 | 3 | ~237px | ~30 | visible | none |
| 768 | 2 | 253px | 32 | visible | none |
| 375 | 1 | ~250px | ~31 | visible | none |
| 320 | 1 | 216px | 27 | visible | none |

Three columns break at `lg`, not `md`. At 768px three cards gave 139px of text
and about seventeen characters a line, running a short paragraph to eleven
lines — measured, then corrected.

## Performance

| Metric | Baseline | After |
|---|---|---|
| Science client chunk | 25,447 B | **25,522 B** (+75) |
| `/science` Lighthouse | Perf 98, A11y 100 | Perf **98**, A11y **100** |
| `/inci` Lighthouse | Perf 97, A11y 100 | Perf **97**, A11y **100** |
| CLS | 0 | **0** |
| Routes | 62 | **62** |
| Dependencies | — | **unchanged** |

The restored modules are server-rendered HTML and CSS. The +75 bytes is the
optional node prop on the island, not the copy.

## Tests

160 → **187**. Four violation tests performed and caught: a removed step, the
invitation turned into a button, the anchor id changed so link and destination
disagree, and a ranking phrase inserted into the boundary line.

## Files

**Added** — `components/science/ScienceMethod.tsx`.

**Changed** — `content/science/types.ts`, `content/science/page.ts`,
`app/(education)/science/page.tsx`,
`components/science/ScienceMapExperience.tsx`,
`tests/unit/science-authority.test.ts`.

**Removed** — none.

## Customer-visible changes

`/science` gains a method explanation with three steps and an invitation, a
"Build Your NFE Skin Profile" framing above the pathway controls, and a Layer
Science introduction before the schematic. The page is longer by design. No
other route changed.

## Claims review

All restored copy is new customer-facing writing and needs a founder read. The
two statements carrying the most weight are the boundary line and the privacy
line, because they are what make the restored "profile" language safe; both are
asserted verbatim by tests so they cannot be softened by accident.

## Founder review status

Awaiting approval. The check that matters: read the three steps, then look at
the pathway controls, and see whether it is obvious what will happen and what
will not.

## Explicit non-actions

No deployment, Worker version, traffic, DNS, Cloudflare, wrangler, Supabase,
Shopify, Sanity or CMS change. No product price, size, availability, formula,
ingredient declaration or claims change. No Founder Access or Study Circle
change. No waitlist activation and no `/api/waitlist` request. No old form,
dropdown, checkbox grid, profile generator, score, rank, diagnosis or
personalised recommendation. No matrix, schematic, Layer Context or `/inci`
redesign. No new route, release branch, tag or merge.

---

# Final founder correction — Complete Layer Science module restoration

## Founder direction

Restore the complete Layer Science module — the left editorial column and the
three layer cards — and change absolutely nothing else.

| | |
|---|---|
| Branch | `feature/nfe-science-layer-science-module-restoration` |
| Branched from | `feature/nfe-science-orientation-restoration` @ `59898d6` |
| Deployed | No |

## What was missing, and why

The eyebrow, heading and a supporting paragraph existed, tucked inside the dark
chapter as a node passed to the client island. **The three cards had never been
built.** The brief that introduced Layer Science specified only an eyebrow,
heading and supporting copy; the cards were not part of it, so they were never
made. This was an omission of scope, not a regression.

## Restored

A white editorial section immediately before the dark chapter. Left column:
eyebrow, heading, supporting paragraph. Right column: Stratum Corneum,
Epidermis, Dermis Support Story, in that order, with the approved copy verbatim.

The Dermis card closes with *NFE does not claim to change dermal structure.* —
the claims boundary for the module, asserted verbatim by test. No card says
what a product does at a layer; each says what is seen or felt there.

## Copy changes

The supporting paragraph is now the founder's reference copy, which differed
from the previous wording by more than punctuation. One adjustment: *the
formula visible well-aging* reads as a missing possessive and is set as *the
formula's*. Flagged rather than applied silently.

## Duplication

The partial intro is gone. What remains in its place is the single approved map
paragraph it also carried, so nothing is duplicated and nothing approved is
lost. The island prop `layerScienceIntro` is renamed `mapChapterNote` to match
what it now holds; no behaviour changed.

Verified: the heading and card titles appear in no other file, and no
`layerScienceIntro` remains anywhere.

## Placement, and one ambiguity

The module sits outside the client island, immediately before the dark chapter,
never inside it — the three consistent statements in the brief.

**The numbered list in §5 implies otherwise**: it places the profile framing
and pathway controls *before* the module. In the current build both live inside
the dark chapter, so that reading would require splitting it. Recorded for the
founder rather than assumed. Moving the module is a one-line change if the
numbered list was the intent.

## Visual and responsive

| Viewport | Columns | Cards | Heading | Overflow | Clipping |
|---|---|---|---|---|---|
| 1440 | 42/58 | 3 × 633px | 44px | none | 0 |
| 1280 | 42/58 | equal | 44px | none | 0 |
| 1024 | 42/58 | 3 × 494px | 44px | none | 0 |
| 768 | stacked | 3 × 657px | 36px | none | 0 |
| 375 | stacked | equal | 30px | none | 0 |
| 320 | stacked | 3 × 272px | 30px | none | 0 |

White ground, warm-bone cards, restrained borders, no shadow, no icons, no
interactive control inside any card.

## Accessibility and performance

`/science` Accessibility **100**, zero failing audits, one `h1`, zero duplicate
ids, CLS 0. The module is static and server-rendered: the Science client chunk
moved 25,522 → **25,519 bytes**, and none of its copy appears in the bundle.
62 routes, no dependency change.

## Interaction

Retested after insertion: all five pathways singly, three-of-five, all five,
clear, and the method anchor. Panel, map-zone and matrix counts identical to
before; 14 family links throughout; the module renders exactly once in every
state.

## Nothing else changed

Six files: the page, the new module, the island prop rename, Science content
and types, and tests. Zero unrelated files, zero product or ingredient data,
zero `/inci` code, zero global styles, zero dependency or lockfile changes.

## Founder review status

Awaiting approval, with the §5 placement ambiguity flagged above.

---

# Final Phase 1 continuity refinement — Return from Ingredients with pathway state

## Founder decision

A visitor exploring pathways on Science who follows an ingredient-family link
should be able to come back to the same focused view. Without a stored profile,
an account, or anything saved.

| | |
|---|---|
| Branch | `feature/nfe-science-ingredient-return-continuity` |
| Branched from | `feature/nfe-science-layer-science-module-restoration` @ `2171199` |
| Deployed | No |

## The model: URL state, and nothing else

Pathways travel in the address bar. They last exactly as long as the URL does.

| | |
|---|---|
| Science → Ingredients | `/inci?from=science&pathways=hydration,tone-integrity#humectants` |
| No selection | `/inci?from=science#humectants` |
| Return | `/science?pathways=hydration,tone-integrity#science-map` |
| Nothing to restore | `/science#science-map` |

Canonical ids only — `barrier-comfort`, `hydration`, `tone-integrity`,
`texture-suppleness`, `visible-resilience` — drawn from the existing pathway
content, never invented and never renamed. Labels never appear in a URL.

The URL is an opening position, not a synchronised copy. Selections stay in
React; the address bar is not rewritten on every click. Measured: five toggles
plus Clear added **zero** history entries.

## Security boundary

No function in `src/lib/science-pathway-state.ts` accepts a URL. The return
href is built from a fixed path constant and validated ids, so there is no
`returnTo` parameter and no open redirect to have.

Nothing trusts the query. Every inbound value is checked against the canonical
ids and dropped unless it matches exactly; duplicates collapse; order is
canonical, not the order given; malformed input returns an empty array and
nothing throws. Serialization validates too, because its output goes into a
public URL where the type no longer holds.

The origin marker is strict — exactly one value, exactly `science`. So
`?from=other` and `?from=SCIENCE` show nothing.

Verified against `invalid`, mixed valid and invalid, repeats, a null byte,
empty, path traversal, a script tag, a 10,000-character value, and 500 repeated
segments. Every case: HTTP 200, correct output, no error.

## Privacy

No localStorage, sessionStorage, cookie, IndexedDB, API, database or analytics.
The six touched files are scanned for all of them by test.

**Analytics audit.** GA4 is defined in `src/lib/analytics.ts` but
`initializeAnalytics()` is never called, and `trackPageView` — the only thing
that would send `page_location` — is imported by `/learn` and `/skin-strategy`
only. Neither Science nor Ingredients emits any event. The UTM helper writes a
landing page to sessionStorage but runs only on Concierge and Founder Access.
**No pathway id can reach analytics.** No new analytics was added.

One thing to know rather than discover later: on a *hard* navigation from a
Science URL carrying pathways to Concierge or Founder Access,
`document.referrer` would contain that URL, and the existing attribution helper
stores the referrer. Soft navigation — every in-app link — does not update
`document.referrer`, so the ordinary path does not reach it. Recorded, not
changed: that helper is outside this task's scope.

## Ingredients

One quiet return link, under the family introduction, shown only for the
Science journey. *Return to your Science Map*, with *Continue with the pathways
you were exploring.* only when there are pathways to continue with.

Nothing was saved and nothing was restored from a record, so no wording claims
a session, a profile, results or a diagnosis. A test asserts the absence of all
of them.

A restrained text link with a small arrow on a gold rule — not sticky, not
floating, not a banner, not a filled button. 14.04:1; the supporting line
5.52:1. Keyboard focus reaches it and draws a real 2px gold ring.

The existing *Return to Science* link at the foot of the page is untouched and
still goes to `/science` without pathways.

## The anchor, and a correction

`science-map` sits on the wrapper of the interactive chapter.

It was first placed on the dark chapter wrapper. Browser measurement showed a
returning visitor landing on the first-visit framing, with the controls only
fully in view at 900px tall and the schematic below the fold at every height
tested. Moved onto the map wrapper, both are in view from 720px up.

| Anchor on | Controls | Schematic |
|---|---|---|
| chapter wrapper | 676px | 1081px |
| map wrapper | 224px | 629px |

## Restored state

Verified at 1440, 1280, 1024, 768, 375 and 320 — identical at every one:
two buttons `aria-pressed`, two panels in focus, two matrix rows, two matrix
cards, four schematic zones, the interpretation naming both, and all 14 family
links carrying the state. No overflow, one `h1`, no duplicate ids anywhere.

**Clear-state freshness.** Restore two pathways from a URL, press Clear, then
follow a family link: all eight hrefs drop back to `?from=science` and the
outgoing link carries nothing stale. The address bar still shows the old query,
which is expected — hrefs come from live state, never from the query.

**Browser Back** returns to a working Science page; React state is not
preserved by the page cache, which is why the explicit return link exists. The
link is the deterministic mechanism; Back is not depended on.

## Performance

Reading searchParams moves `/science` and `/inci` from prerendered to
per-request. Measured against the parent build in the same session:

| | Parent (static) | Branch (dynamic) |
|---|---|---|
| `/science` | 97 · TTFB 50ms · LCP 2.5s | **98** · TTFB 20ms · LCP 2.3s |
| `/inci` | 97 · TTFB 30ms · LCP 2.5s | **97** · TTFB 20ms · LCP 2.5s |

No local cost. Worth knowing that local `wrangler dev` does not reproduce
production edge caching of static assets, so the real difference may be larger
than these numbers suggest.

Science client chunk 25,519 → **25,770** (+251, the URL builders). Ingredients
chunk unchanged at 14,342 — the return module is server-rendered. Route count
63 → 63. No dependency change.

## Accessibility — one blocker, pre-existing

`/science` **100**, `/inci` **100**, `/inci` with the return module **100**.

`/science?pathways=…` scores **96**: four contrast failures on *active* Layer
Context panels — the gold zone eyebrow at 4.18:1 and *Formulation support* at
3.7:1, both against the lifted active-panel ground, both under the 4.5:1 AA
threshold.

**This is not introduced here.** `git diff` against the parent shows the only
change to `LayerContextPanels.tsx` is the import and the href; every colour
class is byte-identical. Measured in the click-only path that predates this
branch, the same foreground `#c6a664` fails the same way. What changed is that
the selected state is now reachable by URL, so it can be audited — and shared.

Not fixed here: Layer Context active states are protected by the brief. The
remedy is small — the gold reaches 4.15:1 on that ground and needs roughly ten
percent more luminance, for example `#d3b478` at 4.85:1, plus dropping the
`/90` on *Formulation support*. Two tokens on a protected surface. Founder's
call.

## Tests

200 → **264**. Parser, serialization, origin marker, both href builders across
every family, the return module, restored state, the anchor, and a privacy and
security sweep of all six touched files.

Four guards deliberately broken and each caught: an invalid id through the
parser (6 failures), a duplicated serialization (5), a raw `returnTo` on the
return link (2), stale pathways after Clear (2). The first attempt at the
invalid-id break was a no-op — the parser filters twice, so defeating it needed
both removed.

## Files changed

Seven. The utility, the two pages, the panels, the island, the return module,
and tests. Zero product, ingredient, formula, style, dependency or lockfile
changes; no new route; no unrelated file.

## Founder review status

Awaiting approval, with the pre-existing active-panel contrast failure above as
the one open item.

---

# Final continuity refinement — Persistent Ingredients return navigation

## Founder decision

The return link must be visible wherever the visitor lands on Ingredients, and
stay visible while she reads.

| | |
|---|---|
| Branch | `feature/nfe-inci-floating-science-return` |
| Branched from | `feature/nfe-science-ingredient-return-continuity` @ `2fc38c8` |
| Deployed | No |

## The problem

The return link sat in the page flow near the top. A visitor following a family
link lands deep in the document — Sensorial support is past eight sections — so
by the time she arrived the way back had already scrolled off. She had to
scroll to the top to find it.

## Fixed, not sticky

`position: fixed`. A sticky element stops following once its own section ends,
and the requirement is that this stays visible for the whole page. Confirmed
`fixed` at every viewport, with a test that fails if it becomes static.

## Placement, measured rather than assumed

The reading column on Ingredients leaves this much room to its right:

| Viewport | Right margin |
|---|---|
| 1440 | 88px |
| 1280 | 15px |
| 1024 | 15px |
| 768 | 15px |
| 375 | 15px |
| 320 | 15px |

A side rail needs 190–260px. It would have sat on top of the text at every
width, so the compact bottom-corner fallback was taken instead.

| | Placement | Control |
|---|---|---|
| Desktop ≥1024 | fixed bottom-right, 32px inset | 260 × 46 |
| Tablet 768 | fixed bottom-right, 24px inset | 260 × 46 |
| Mobile 375 | fixed bar, 16px both edges | 328 × 46 |
| Mobile 320 | fixed bar, 16px both edges | 273 × 46 |

Safe-area padding on the wrapper lifts the mobile bar clear of a phone's home
indicator; it resolves to zero everywhere else.

The pill was also narrowed. The uppercase treatment used elsewhere on this page
rendered it at 360px — well past what a floating control should take. Sentence
case with slight tracking measures 253–260px.

## Visibility through the page

All eight family anchors, at landing and at 25, 50, 75 and 100 percent scroll:
**visible in all forty cases**. The family heading is visible at 137px on
landing at every anchor, and the control never covers it.

## Content protection

Contextual bottom padding — 112px from `md` up, 128px below — applied only when
the control renders. An ordinary visit keeps exactly the spacing it always had.

Scrolled to the very bottom of the document at six viewports: **zero footer
links covered**, closing content clears the pill at every width, no horizontal
overflow.

Stated plainly rather than claimed away: a fixed control passes over body text
at intermediate scroll positions — 3 instances across 13 scroll samples at
1440, more at narrower widths where the column runs to the edge. Nothing is
lost, because the text scrolls past. That is inherent to the fixed model the
brief chose, not a defect of this implementation.

## Stacking

`z-40`, deliberately below the cookie consent dialog at `z-50`. A consent
decision should outrank navigation, so on a first visit the banner covers the
control until it is answered. The test asserts *any* value below 50 rather than
the literal, because that is the property that matters.

## Conditional rendering

Rendered only for a validated Science origin, using the existing strict parser.
Verified in server HTML with JavaScript out of the picture:

| URL | Control |
|---|---|
| `/inci` | absent |
| `/inci#humectants` | absent |
| `/inci?from=other#humectants` | absent |
| `/inci?from=SCIENCE#humectants` | absent |
| `/inci?pathways=hydration#humectants` | absent |
| `/inci?from=science&from=science` | absent |
| `/inci?from=science#humectants` | present |

Origin is never inferred from the referrer or from history.

## Return URL — unchanged

No new parser, no new route, no `returnTo`. Server HTML:

- `?from=science` → `/science#science-map`
- `?from=science&pathways=hydration` → `/science?pathways=hydration#science-map`
- `?from=science&pathways=invalid,hydration,hydration` → `/science?pathways=hydration#science-map`

Returning from the deepest anchor restores both pathways, both panels, two
matrix rows, four schematic zones and the interpretation, landing at 96px.

## Accessibility

`/inci` **100** plain and **100** with the control; no failing audits either
way, and no fixed-element finding. Native anchor, no role override, no
auto-focus, no live region, no keyboard interception. Accessible name equals
the visible label; the arrow is `aria-hidden`. Warm cream on deep green at
**12.85:1**. Target 260 × 46, above the 44px minimum. One labelled landmark,
no duplicate landmark labels, one `h1`, no duplicate ids.

At 200% zoom the control fits the viewport at desktop and both phone widths.
The horizontal overflow that appears on narrow phones at that zoom is
**pre-existing** — identical with and without the control, `scrollWidth` 318
either way — and belongs to something else on the page.

## Performance

CSS and markup only. No listener, no observer, no state, no dependency.

| | Before | After |
|---|---|---|
| `/inci` client chunk | 14,342 | 14,344 (+2) |
| `/science` client chunk | 25,770 | 25,768 (−2) |
| `/inci` Lighthouse | 97 · a11y 100 · CLS 0 | 97 · a11y 100 · CLS 0 |
| Route count | 63 | 63 |

## Tests

264 → **287**. Visibility conditions, fixed behaviour, breakpoint placement,
safe area, stacking order, pointer-events, absence of listeners and state, no
dismiss control, target size and focus, semantics, landmark, contextual
padding, duplication, and regression.

Four guards deliberately broken and each caught: static instead of fixed,
safe-area padding removed, the control on plain `/inci`, and the link
duplicated. Three earlier guards were rewritten — one asserted a supporting
sentence the floating model no longer has, one banned `aria-label` anywhere
when the new landmark needs it, one banned `fixed` and `z-40` which are now the
design.

## Files changed

Three: the Ingredients page, the return component, and tests. Zero ingredient,
taxonomy, product, formula, global-style, dependency or lockfile changes. The
pathway URL state — parser, serializer, builders, Science restoration — was not
touched.

## Known separate issue

The active Layer Context contrast failure recorded in the previous entry is
unchanged: still present, still pre-existing, still not introduced or modified
here, still deferred pending founder authorization. `/science?pathways=…`
scores 96 for that reason and that reason alone.

## Founder review status

Awaiting approval.

---

# Final founder refinement — Dual pathway and Skin Profile entry

## Founder decision

Keep the pathway experience exactly as approved, add a second way in for a
visitor who would rather describe what her skin is asking for, and make the
invitation into the map look like the invitation it is.

| | |
|---|---|
| Branch | `feature/nfe-science-dual-entry-profile` |
| Branched from | `feature/nfe-inci-floating-science-return` @ `f1fda2a` |
| Deployed | No |

## Two ways in, one map

Two plain buttons with `aria-pressed` rather than an ARIA tab widget — there is
no roving focus to manage and nothing hidden a tab panel would need to
describe, so the simpler semantics are the more accurate ones.

*Explore by pathway* is the default. The page reads fully without ever opening
the other.

Both are inputs to the same selected-pathway state, which stays where it always
was, in the Science chapter. No second store, no provider, no context, no
duplicate state, no separate result system. The builder holds its own form
state and reaches the map only by handing pathway ids to its parent.

## The pathway experience is untouched

Same heading — *Choose a pathway, or read the layers as they are.* — same
supporting copy, same five controls in the same order, same multi-selection,
same Clear with its focus fix, same schematic, Layer Context and matrix
synchronisation. It gained a wrapper for the mode switch and nothing else.

## The Skin Profile builder

| Element | Copy | Control | Required |
|---|---|---|---|
| Eyebrow | Build Your NFE Skin Profile | — | — |
| Heading | Select what your skin is asking for. | — | — |
| Boundary | An interpretive guide, not a diagnosis. | — | — |
| Privacy | Nothing is saved or submitted. | — | — |
| Skin context | 7 options | radios, one choice | optional |
| Signals | 10 options | checkboxes, up to five | at least one |
| Action | View my NFE Skin Profile | button | — |
| Reset | Start over | button | — |

Native inputs throughout — real fieldsets, legends and labels, no custom
keyboard handling, no focus management, no auto-scroll. The sixth signal is
quietly unavailable rather than refused, and the action explains itself through
a helper line reached by `aria-describedby`, never an error.

## Mapping

| Input | Pathways |
|---|---|
| Dry or easily depleted | Barrier Comfort · Hydration |
| Sensitive or easily unsettled | Barrier Comfort |
| Mature or changing | Hydration · Texture & Suppleness · Visible Resilience |
| Balanced · Combination · Oily · Not sure | — |
| Dryness or ashiness | Hydration |
| Tightness or reduced comfort | Barrier Comfort |
| Uneven-looking tone | Tone Integrity |
| Visible dullness | Tone Integrity · Visible Resilience |
| Post-blemish-looking marks | Tone Integrity |
| Fine-line appearance | Texture & Suppleness |
| Crepey-looking texture | Texture & Suppleness |
| Loss of suppleness | Texture & Suppleness |
| Tired-looking skin | Visible Resilience |
| Sensitivity awareness | Barrier Comfort |

Deduplicated, canonical order, unknown ids ignored. Four contexts map to
nothing, which is honest: they describe how skin behaves without pointing at a
particular reading of the map.

No profile name, no score, no rank, no primary or secondary concern, no
recommendation. The option shape is exactly `id`, `label`, `pathways` — a
weight cannot be expressed even by accident, and a test asserts those three
keys.

## When it writes

Only on the action. Remapping on every checkbox would shift the map while she
was still reading, and would silently overwrite pathways she had set by hand.

Applying replaces the selection, so what she described is what she sees. The
moment she toggles a pathway herself the controls are authoritative again and
the status line clears — it would otherwise keep claiming the map reflects a
profile it no longer matches. *Start over* clears both form and map through the
chapter's existing clearing logic.

Switching modes never disturbs the selection. The builder is hidden rather than
unmounted, so her description survives a glance at pathway mode — browser
testing caught that it did not, at first.

## Privacy and URL

No storage, cookie, request or analytics. The form cannot submit: its only
handler prevents it, and there is no action or method.

Only canonical pathway ids travel. Verified end to end: a profile of
*Uneven-looking tone* + *Tired-looking skin* produced
`/inci?from=science&pathways=tone-integrity,visible-resilience#…`, the return
restored both pathways, and no signal or context id appeared anywhere in the
URL. A test asserts the URL layer contains none of the seventeen input ids.

## The invitation

*Start Your Skin Interpretation*, title case, in muted gold with deep green
text — **6.7:1** measured, **5.19:1** on hover. The focus ring changed from
gold to deep green, because a gold ring on a gold fill is the one pairing that
would not have been visible.

The brief asked to correct a misspelling, *Intepretation*. That spelling
appears nowhere in this codebase; only the casing changed.

Same destination, same semantics, still a plain anchor that works without
JavaScript.

## Accessibility

Every new control measured on its real ground, all passing AA:

| Control | Ratio |
|---|---|
| Gold CTA | 6.70 |
| Active mode button | 6.70 |
| Inactive mode button | 11.07 |
| Apply, disabled | 5.79 |
| Start over | 8.15 |
| Fieldset legend | 5.99 |
| Helper text | 7.31 |

17 inputs, 17 labelled. Two fieldsets, two legends. Every target 44px or more.
One `h1`, valid heading order, no duplicate ids, no auto-focus, and one
`aria-live` region — the pre-existing one, not a new one.

`/science` **100**, `/inci` **100** plain and contextual, CLS 0.

## Responsive

| Viewport | Entry selector | Profile | CTA | Overflow |
|---|---|---|---|---|
| 1440 · 1280 · 1024 | one row | two columns | 381×44 | none |
| 768 | one row | single column | 381×44 | none |
| 375 · 320 | wraps to two rows | single column | full width | none |

Heading 36px down to 30px; helper text stays 14px. Smallest signal target 46px
everywhere.

## Performance

| Metric | Before | After |
|---|---|---|
| Science client chunk | 25,768 | **31,997** |
| `/science` Perf · A11y · CLS | 98 · 100 · 0 | 98 · 100 · 0 |
| Route count | 63 | 63 |

The chunk first went to 33,320 because the mapping function reads the option
arrays, so importing it into the island pulled every label into the browser —
the same shape as the barrel-import problem this page has hit before.
Extracting the ordering rule into a prose-free helper brought it to 31,997 with
the labels verifiably gone. The remaining 6,229 is the builder itself: two
fieldsets, radios, checkboxes and the action row. That is interactive code and
cannot travel as data.

## Tests

287 → **326**. Both entry modes and the default, pressed-button semantics, one
pathway state, preserved pathway behaviour, every profile field, the complete
mapping, shared state, privacy, the gold CTA, and regression.

Four guards deliberately broken and each caught: a signal pointed at a
non-existent pathway (3 failures), a severity field added to the option shape
(1), profile input written to localStorage (2), the gold CTA reverted (1).

Five earlier guards were tightened rather than relaxed. Three counted every
`useState` in the chapter to prove one selection owner; they now count
`useState<PathwayId[]>`, which is narrower and still catches a duplicated
pathway state. One pinned the CTA to sentence case. One banned the phrase that
is now approved copy, while every result-language pattern around it stayed.

## Files changed

Nine: the Science page, the chapter, the method section, the new builder, the
new profile content, the new mapping helper, Science content and types, and
tests. Zero `/inci`, ingredient, taxonomy, product, formula, global-style,
dependency or lockfile changes. The pathway URL state was not touched.

## Known separate issue

The active Layer Context contrast failure is unchanged: the same four nodes at
the same 4.18:1 and 3.7:1, and `LayerContextPanels.tsx` has an empty diff
against the parent. Not introduced here, not modified here, still deferred
pending authorization. `/science?pathways=…` scores 96 for that reason alone.

## Founder review status

Awaiting approval.

---

# Founder-approved correction — Active Layer Context contrast

## Founder decision

Change the active Layer Context gold from `#c6a664` to `#d3b478`. Remove the
`/90` opacity from the active *Formulation support* label. Change nothing else.
`/science?pathways=…` must score Accessibility 100 before release assembly.

| | |
|---|---|
| Branch | `feature/nfe-science-layer-context-contrast` |
| Branched from | `feature/nfe-science-dual-entry-profile` @ `525f6cd` |
| Deployed | No |

## What was failing

The active panel lifts its ground with a warm cream overlay. On that raised
surface the approved gold fell under AA, while the same gold on the darker
inactive ground passed. The defect had been carried since the pathway-sync
refinement and was reachable by URL once pathway state became restorable.

| Element | Before | After |
|---|---|---|
| Active zone eyebrow | 4.18 | **4.86** |
| Active panel title | 4.18 | **4.86** |
| Active *Formulation support* | 3.70 | **4.86** |

Measured on the composited active ground `#324a3e`.

## What changed

`#d3b478` in the three places the active state renders gold text — zone
eyebrow, panel title, formulation label — and the `/90` removed from that
label on active panels only.

## What did not change

Inactive panels are untouched and measure exactly as before: eyebrow 6.91,
title 12.38, formulation label 4.81 with its `/90` intact.

The *In focus* badge is a gold **fill** with dark green text, not gold text. It
passed at 6.63:1 and needed nothing, so it remains `#c6a664`. It now sits beside
an eyebrow at `#d3b478` — an RGB distance of 27.7, perceptible if looked for.
Recorded for a decision rather than changed silently. The panel border, zone-bar
ring and inset hairline are likewise unchanged structural gold.

## The release gate

| URL | Accessibility | Failing audits |
|---|---|---|
| `/science?pathways=hydration` | **100** | none |
| `/science?pathways=hydration,tone-integrity` | **100** | none |
| `/science?pathways=` all five | **100** | none |
| `/science` | 100 | none |
| `/inci` and contextual `/inci` | 100 | none |

CLS 0 throughout. The blocker recorded in the two previous entries is cleared.

## Validation

`npm ci` 0 · `tsc` 0 · `lint` 0 · **329/329** · `next build` 0 · OpenNext 0 ·
63 routes · Science chunk 31,997 → 32,023.

The arbitrary colour class was checked in the built stylesheet rather than
assumed — this page has been bitten before by Tailwind classes that emit no CSS.

## Tests

326 → **329**. One existing guard followed the approved value; three added so
the correction cannot be undone by accident: the exact gold in exactly three
places, the label's opacity conditional rather than blanket, and the inactive
treatment intact.

## Files changed

Two: `LayerContextPanels.tsx` and tests. Nothing else in the repository.

## Founder review status

Awaiting approval. No blocker outstanding.

---

# Science release readiness — Founder sign-off

## Founder decision

The *In focus* badge stays at `#c6a664`. It already passes at 6.63:1, and the
instruction was to change nothing else; the slight difference from the adjacent
`#d3b478` eyebrow reads as intentional tonal layering. The visual system is not
to be reopened for it.

Recorded honestly: the badge was not visually reviewed in the implementation
session — the preview pane was not compositing frames, so no screenshot was
possible. The decision rests on the founder's review, not on an observation
this record can claim.

## Status

```
NFE DUAL-ENTRY SCIENCE INTERPRETATION

IMPLEMENTATION COMPLETE
TECHNICAL VALIDATION PASSED
FOUNDER VISUAL REVIEW COMPLETE
SELECTED-STATE CONTRAST CORRECTION COMPLETE
ACCESSIBILITY 100
READY FOR RELEASE ASSEMBLY
```

## Release assembly source

| | |
|---|---|
| Branch | `feature/nfe-science-layer-context-contrast` |
| HEAD | `ee35bf05ab3dc9dd2fb2c2b82f952deff9ce6de8` |

No further feature changes are required before assembling the Science release.

## What that branch carries

The full Science lineage, each stage founder-approved in turn:

| Stage | Ends at |
|---|---|
| Science Authority Phase 1 | `9a6b242` |
| Layer Context + Concern-to-Formula Matrix | `215b391` |
| Layer Context as schematic companion | `0953c15` |
| Pathway synchronisation + enlarged schematic | `f3bcfac` |
| Ingredient-family links to anchored `/inci` | `eb8eb27` |
| Founder-guided orientation restoration | `59898d6` |
| Complete Layer Science module | `2171199` |
| Science-to-Ingredients pathway continuity | `2fc38c8` |
| Persistent floating return navigation | `f1fda2a` |
| Dual pathway and Skin Profile entry | `525f6cd` |
| Active Layer Context contrast correction | `ee35bf0` |

## State at sign-off

329 tests passing · TypeScript, lint, Next build and OpenNext all clean ·
63 routes · CLS 0.

| Surface | Accessibility |
|---|---|
| `/science` | 100 |
| `/science?pathways=…` (one, two, all five) | 100 |
| `/inci` | 100 |
| `/inci?from=science&pathways=…` | 100 |

No blocker outstanding. Release assembly is a separate, separately authorised
task: no release branch, tag, merge, Worker version or deployment has been
created by any of the work above.

---

# Science Authority Phase 1 — Release assembly and predeployment review

Date: 2026-07-29

## Founder authorization

Assemble the approved Science experience into a release branch based on the
verified current production source. Do not deploy.

The approved Science tip was frozen at `499d488`; the prompt's `ee35bf0`
references were superseded by founder instruction, `ee35bf0` remaining the
code-complete parent.

## Verified current production source

| | |
|---|---|
| Branch | `release/production-hygiene-assets-fonts` |
| HEAD | `4d779c8e21c343b119d243ce488ae2fb72250e6a` |
| Deployed commit | `c81b7c25bff7f4c774721d9bcd2f4f2eacd14627` |
| Live Worker version | `1ba7471d-53f8-42f8-aa71-299657b7bf42` |
| Traffic | 100% |

Three independent lines of evidence agree:

1. **Cloudflare** — `wrangler deployments list` returns ten deployments; the
   most recent, 2026-07-26T22:14:55Z, carries version `1ba7471d`.
2. **Repository** — the product-architecture-cleanup closeout records the same
   version id, the same date, and names `c81b7c2` as the deployed commit.
3. **Live probe** — `/products/hydration-serum` returns 404 on
   www.nfebeauty.com, matching the dynamic product route deleted in that
   release. Live `/science` carries the pre-Phase-1 page.

`4d779c8` is `c81b7c2` plus the closeout record: zero difference under `src/`,
`tests/` or `public/`.

**`main` is not production.** At `4f2c411` it is 29 commits behind the
pre-maison-wave-1 tag and carries neither live marker. A release branched from
`main` would have reverted three shipped releases.

## Ancestry

| | |
|---|---|
| merge base | `4d779c8` — production itself |
| production ancestor of Science | yes |
| Science ancestor of production | no |
| production-only commits | 0 |
| Science-only commits | 64 |

Classification **A**. Fast-forward available, nothing to reconcile.

## Integration

`release/science-authority-phase-1`, created from `4d779c8`, fast-forwarded to
`499d488` — §7 Option 1, the least destructive method. **No merge commit, no
cherry-pick, no rebase, no squash. No conflicts.** Approved feature history is
preserved commit for commit.

Production preservation proved after the fact: zero commits in production that
are not in the release, and production remains an ancestor of the release HEAD.

## Production diff — 34 files

Thirty are Science and Ingredients modules, shared typed content, the URL-state
helpers, tests, and the blueprint. Four sat outside that boundary and were
inspected rather than accepted:

| File | Change | Finding |
|---|---|---|
| `ScienceIntelligence.tsx` | deleted, 1,616 lines | The old profiling engine Phase 1 replaced. Expected. |
| `skin-strategy/page.tsx` | 4 lines | Comment only. It referenced the deleted file by name. Zero runtime effect. |
| `INCILists.tsx` | 4 lines | Contrast fix: white on gold → deep green. Repairs a live AA failure. |
| `EducationNavTabs.tsx` | 91 lines | `role="tab"` buttons calling `router.push` replaced by real links with `aria-current`. Scoped to the `(education)` layout — `/science` and `/inci` only, not global navigation. Visual treatment preserved; a framer-motion layout animation was dropped. |

Zero changes to: dependencies, `package-lock.json`, wrangler/Next/Tailwind
config, `public/`, `data/`, API routes, product or shop routes, Study Circle,
Founder Access, Supabase or auth, legal copy, analytics.

## An existing production defect this release repairs

Production `/inci` scores **Accessibility 95** today, with one contrast
failure: the product-toggle buttons render white on `#C9A66B` at **2.29:1**.
The release takes `/inci` to **100**. Not a goal of this work — a consequence
of the Phase 1 accessibility pass — but it ships with the release.

## Accessibility release gate

| URL | Accessibility | Contrast failures | CLS |
|---|---:|---:|---:|
| `/science` | 100 | 0 | 0 |
| `/science?pathways=hydration` | 100 | 0 | 0 |
| `/science?pathways=hydration,tone-integrity` | 100 | 0 | 0 |
| `/science?pathways=` all five | 100 | 0 | 0 |
| `/inci` | 100 | 0 | 0 |
| `/inci?from=science&pathways=hydration` | 100 | 0 | 0 |
| `/` | 100 | 0 | 0 |
| `/products/face-elixir` | 100 | 0 | 0 |

Active Layer Context: token `#d3b478`, measured 4.86:1, `/90` removed from the
active *Formulation support* label. **Gate passed.**

## Performance against an equivalent production build

Both sides built with `next build` + OpenNext and served by `wrangler dev`.

| Metric | Production | Release | Δ |
|---|---:|---:|---:|
| Science client chunk | 50,000 | **32,023** | −17,977 |
| Ingredients client chunk | 14,551 | **14,344** | −207 |
| `/science` Performance | 97 | 97 | 0 |
| `/inci` Performance | 96 | 97 | +1 |
| `/` Performance | 96 | 95 | −1 |
| `/products/face-elixir` | 76 | 76 | 0 |
| CLS | 0 | 0 | 0 |
| Route count | 63 | 63 | 0 |

The Science chunk falls by 36% — the old profiling engine leaving the bundle.
An initial `/science` reading of 99 versus 97 did not reproduce; a second
measurement returned 97 on both sides, with the release ahead on LCP, TBT and
TTFB. Recorded as run-to-run variance, not a regression.

## Behaviour verified in the browser

Dual entry, both modes, converging on one state. Profile of *dry or easily
depleted* + *dryness or ashiness* + *fine-line appearance* resolved to Barrier
Comfort, Hydration and Texture & Suppleness across buttons, schematic,
interpretation, Layer Context and matrix. Mode switching preserved both the map
state and the visitor's description. Manual pathway changes took authority back
and cleared the status line. *Start over* cleared form, map and outgoing links.

All eight family anchors: heading visible on landing, floating return visible at
landing and at 25%, 50%, 75% and the footer — **40 of 40** — with no heading
obstruction and the correct return href at each.

Responsive at 1440, 1280, 1024, 768, 375 and 320: no overflow, one `h1`, no
duplicate ids, every target at least 44px, gold CTA present at every width.

## Claims and privacy

No prohibited claim appears in served HTML on `/science`, a restored-pathway
`/science`, `/inci`, or contextual `/inci`. The phrases the scan surfaced in
the diff live only inside `claimsBoundary` arrays — the guard data the suite
asserts against. Every occurrence of "diagnosis" is a boundary statement.

Malformed input — invalid, mixed, duplicated, `%00`, wrong origin, and a
crafted `returnTo` — all return HTTP 200 with the return href fixed to
`/science`. The return control renders only for an exact `from=science`.

## Tests

**329 of 329 passing**, meeting the required minimum exactly. None deleted,
none weakened.

## Metadata

`/science` and `/inci` titles byte-identical to production. A query-bearing
Science URL serves the same title. No canonical tags exist on either page —
pre-existing and unchanged; recorded as deferred, not introduced here.

## Deferred, and untouched

Bakuchiol and Ectoin classification, glossary versus product-INCI
reconciliation, family description rewrites, product accordion `aria-controls`,
`/skin-strategy` performance, robots.txt, `/dev/token-specimen` metadata,
`/inci` metadata, Founder Dashboard, Study Circle, legal review, staging,
formula, ingredient and pricing changes, Discovery size strategy. None was
altered by the release diff.

## Rollback

| | |
|---|---|
| Current Worker version | `1ba7471d-53f8-42f8-aa71-299657b7bf42` |
| Traffic | 100% |
| Production commit | `c81b7c2` (branch HEAD `4d779c8`) |
| Rollback version | `692bc54f-c280-4174-b488-1707c8e36d07` |
| Second rollback retained | `c22fca1d-5b51-456c-9412-9dcee433ff76` |

Not executed. No traffic altered.

## Explicit non-actions

No deployment, Worker version, traffic change, DNS change, environment change,
production merge, merge into `main`, tag, force-push, history rewrite, squash,
dependency, lockfile change, feature addition, copy rewrite, redesign, product,
formula, ingredient, pricing or Study Circle change.

## Deployment status

**Not deployed.** Founder authorization required before deployment.

---

# Science Authority Phase 1 — Production release closeout

## Founder authorization

Deployment authorized 2026-07-29, conditional on source integrity, a production
environment gate, full build validation, production smoke tests and a live
accessibility gate. Every condition was met before traffic moved. Release tag
and closeout authorized separately after production review.

## Release

| | |
|---|---|
| Release branch | `release/science-authority-phase-1` |
| Deployed source commit | `5c377fede2553657d89cd80608e3f32c0b745cf7` |
| Release tag | `nfe-science-authority-phase-1-2026-07-30` (annotated, peels to the deployed commit) |
| Prior Worker | `1ba7471d-53f8-42f8-aa71-299657b7bf42` |
| **New Worker** | **`c25b8b8a-5a4a-44ea-8812-df0ccf619008`** |
| Version created | 2026-07-30T01:59:46.961Z |
| Deployed | 2026-07-30T01:59:48.431Z |
| Traffic | **100%** |

## Production environment gate

The only rollback in this Worker's history was a build shipped with zero
environment values, which broke `/focus-group/login`. That failure mode was
reproduced locally before deployment and closed.

Values came from the canonical `.env.production` — not `.env.local` — and were
supplied to the build process only. Nothing was written into the release
worktree, printed, logged or committed. `NEXT_PUBLIC_SITE_URL` was set to the
production host and `NEXT_PUBLIC_BUILD_SHA` to the deployed commit.
`NEXT_PUBLIC_GA4_MEASUREMENT_ID` and `NEXT_PUBLIC_MOCK_USER_ID` were left unset.
Analytics was not enabled or altered, and the pre-existing GA name mismatch was
left alone.

`/focus-group/login` moved from **500 to 200** once the environment was present.
That was the mandatory gate.

## Focus-group routes, live

`/focus-group/login` 200 · `/focus-group/enclave` 200 · `/focus-group/feedback`
200 · no missing-environment error · no authentication initialisation error ·
zero console errors.

## Science, live

Hero, Method, the gold *Start Your Skin Interpretation* invitation, and the
Layer Science module — the last at byte 8,773, before the dark chapter at
11,357, confirming its approved position. Two entry-mode controls with
*Explore by pathway* default, the enlarged schematic, five Layer Context panels,
the Concern-to-Formula Matrix, and the `science-map` anchor.

**Dual entry.** Hydration alone brings forward 1 panel, 1 matrix row, 2 map
zones. The profile *Dry or easily depleted* + *Dryness or ashiness* +
*Fine-line appearance* resolves to **Barrier Comfort, Hydration, Texture &
Suppleness** — 3 panels, 3 rows, 3 zones — with the status line shown. Both
inputs write to one state.

**Continuity.** Family links carry canonical pathway ids; the floating return
control renders on `/inci` only for `from=science` and is absent on an ordinary
visit; a crafted `returnTo=https://example.com` still returns
`/science#science-map`. A malformed `?pathways=invalid,hydration,hydration`
restores Hydration alone.

**Clear-state freshness.** *Start over* clears the form, the map and the
outgoing links, which fall back to `?from=science` with no stale pathways.

## Accessibility, live

| URL | Accessibility | Contrast failures | Duplicate ids | CLS |
|---|---:|---:|---|---:|
| `/science` | **100** | 0 | none | 0 |
| `?pathways=hydration` | **100** | 0 | none | 0 |
| `?pathways=hydration,tone-integrity` | **100** | 0 | none | 0 |
| all five pathways | **100** | 0 | none | 0 |
| `/inci` | **100** | 0 | none | 0 |
| contextual `/inci` | **100** | 0 | none | 0 |

Active Layer Context measured on the live page: zone eyebrow and *Formulation
support* both `rgb(211,180,120)` — **`#d3b478`** — six occurrences across two
active panels, with the CSS rule present in the served stylesheet. The three
remaining `/90` labels belong to the inactive panels, which were to stay as
approved.

`/inci` also moved from **95 to 100**. A 2.29:1 white-on-gold contrast failure
had been live on the product-toggle buttons; the Phase 1 accessibility pass
carries the repair.

## Production routes

Nineteen routes verified live: `/`, `/shop`, `/our-story`, `/science`, two
restored-pathway Science URLs, `/inci`, contextual `/inci`, `/ritual`,
`/journal`, `/concierge`, both product pages and `/founder-access` all **200**;
the three focus-group routes **200**; `/study-circle` and `/dev/token-specimen`
**404**. No unexpected redirect, no console error, no hydration error.

## Build

329 tests passing, 63 routes, `npm ci`, TypeScript, lint, Next build and
OpenNext all exit 0. No dependency change, no lockfile change.

## Rollback readiness

Rollback target `1ba7471d-53f8-42f8-aa71-299657b7bf42` retained, with
`692bc54f-c280-4174-b488-1707c8e36d07` as a second fallback. Procedure:
`wrangler rollback --version-id 1ba7471d-53f8-42f8-aa71-299657b7bf42`.

**Rollback was not executed. No hotfix was required.**

## Monitoring note

`/inci` Performance reads **92** live against 97 on the local Worker. The
difference is the real edge serving real assets rather than a defect:
Accessibility is 100 and CLS is 0. Worth watching rather than acting on.

## Deferred, and untouched by this release

Bakuchiol and Ectoin classification, glossary versus product-INCI
reconciliation, ingredient-family description rewrites, product accordion
`aria-controls`, `/skin-strategy` performance, `robots.txt`,
`/dev/token-specimen` metadata, `/inci` metadata and canonical tags, the
`NEXT_PUBLIC_GA_MEASUREMENT_ID` versus `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
mismatch, the *In focus* badge gold, Founder Dashboard, Study Circle, legal
review, staging, formula, ingredient and pricing work, Discovery size strategy.

## Explicit non-actions

No source, test, product, formula, ingredient, pricing, dependency,
environment-file or deployment-configuration change during closeout. No
redeployment, no additional Worker version, no traffic change, no DNS change,
no merge into any other branch, and no environment file committed at any point.

## Final production status

**Deployed from `5c377fede2553657d89cd80608e3f32c0b745cf7`. Worker
`c25b8b8a-5a4a-44ea-8812-df0ccf619008` serving 100% of traffic. Production
validation passed. Rollback not executed. No hotfix required.**
