# NFE Maison Wave 2 — Homepage Audit and Proposed Architecture

Phase A deliverable. Recorded 2026-07-31, before any application source change.

Branch `feature/nfe-maison-wave-2-homepage-continuity`, cut from
`origin/release/science-final-refinement` @ `811f862`.

Everything below was measured on a production-style build served from
`.open-next/worker.js`, not inferred from CSS. Mobile was rendered and
inspected separately at every width.

---

## 1. Existing homepage architecture

Twelve sections. Measured at 1440.

| # | Section | Purpose as built | Desktop issue | Mobile issue | Decision |
|---:|---|---|---|---|---|
| 1 | Hero, "For skin that has lived." | Emotional entrance | Leads with two lead-capture CTAs, not philosophy | 1269px tall, 1.56x viewport at 375; 1.89x at 320 | Refine |
| 2 | Founder Story Snapshot | Founder origin | Arrives before any statement of belief | Portrait stacks above copy, order reads oddly | Move |
| 3 | The NFE Difference | Brand thesis | Reads as three feature cards, not conviction | Three stacked bordered cards | Refine |
| 4 | Product Ritual Preview | The two elixirs | Products arrive at position 4, before philosophy | Two dark cards stacked; CTAs are 20px text links | Move + Refine |
| 5 | Enter NFE, "Three ways" | Entry routing | Three competing CTAs in one row | Three more stacked cards | Remove |
| 6 | Proof & Testing Roadmap | Proof discipline | The only narrative Science link, framed as roadmap | Three more stacked cards | Refine |
| 7 | Skin Ritual Quiz + Discovery | Conversion pair | Two more CTAs, dark green slab | Splits into two full-width blocks | Remove |
| 8 | Through the Maison | Link grid | Five link cards, duplicates earlier CTAs | Five more stacked cards | Remove |
| 9 | Customer Proof In Progress | Proof signals | Overlaps section 6 | Three more stacked cards | Remove |
| 10 | Founder Access panel | Lead capture | Third appearance of the same CTA | Centred panel | Refine |
| 11 | Brand Philosophy | Philosophy | **Philosophy arrives last, at position 11** | Four more stacked cards | Move |
| 12 | Disclaimer | Claims safety | Correct | Correct | Keep |

### The three structural findings

**Philosophy is last.** The page states what NFE believes in section 11, after
product, proof, quiz, discovery and lead capture. The brief's required order is
philosophy first, product late. The current page is the inverse.

**There is no editorial grid.** Section headings sit at six different left
edges: 48, 64, 137, 265, 313, 329. Science, by contrast, holds a single spine at
201. Nothing on the homepage aligns to anything else.

**The page is a card catalogue.** Nineteen bordered `rounded-3xl` cards across
five grid sections. Sections 3, 5, 6, 8, 9 and 11 are all the same shape. The
brief explicitly names "boxed-everything layouts" and "generic two-column
template repetition" as things to avoid.

---

## 2. Typography

Measured from the rendered page. Seventeen distinct type voices.

| Role | Family as rendered | Size | Intended | Issue |
|---|---|---:|---|---|
| H1 hero | **`ui-serif`** | 72px | brand serif | Generic fallback |
| H2 section | **`ui-serif`** | 48px x11 | brand serif | Generic fallback |
| H3 card | **`ui-serif`** | 24px x9, 30px x2 | brand serif | Generic fallback |
| Philosophy card | **`ui-serif`** | 20px x4 | brand serif | Generic fallback |
| Body | Inter | 16px | Inter | Correct |
| Eyebrow | Inter 12px UC | 12px x17 | Inter | Correct |
| CTA | Inter 14px w500 UC | 14px x13 | Inter | Correct |

**Every serif element on the homepage resolves to `ui-serif`** — Times New Roman
on Windows, New York on macOS. This is the same defect that was just corrected
on Science, where headings now resolve to `font-primary` and render Georgia.

The two pages are currently set in different typefaces, and the homepage's
typeface changes with the visitor's operating system. This is the single
clearest reason the homepage does not feel like the entrance to the same maison
as Science. It is also the cheapest fix: a token swap, no size or weight change.

---

## 3. Narrative assessment

| Stage | Current support | Gap | Required correction |
|---|---|---|---|
| Philosophy | Section 11, last | Arrives after everything it should frame | Move to position 2 |
| Worldview | Partial, section 3 | Reads as feature cards | Restate as conviction |
| Education | Section 6 only, as "roadmap" | Science framed as testing status, not authority | Dedicated Science invitation |
| Trust | Sections 2, 6, 9, 10 | Diffused across four sections | Consolidate to founder + proof |
| Product | Section 4 | Arrives before philosophy | Move after philosophy |
| Ritual | **Absent** | `/ritual` exists but is never introduced | Add section |
| Refill | **Absent** | Vessel and refill never mentioned | Add section |
| Journal | Link card only | No editorial presence | Add curated selection |
| Concierge | Link card only | No hospitality presence | Add section |

Four of the nine required narrative stages have no section at all.

---

## 4. CTA inventory

Eighteen links. Eleven are repeats.

| CTA | Appearances | Destination |
|---|---:|---|
| Join Founder Access | **3** | `/founder-access` |
| Take the Skin Ritual Quiz | **3** | `/skin-ritual-quiz` |
| Explore Discovery Ritual | **3** | `/discovery` |
| Explore The Atelier | 2 | `/shop` |
| Read the Science | 2 | `/science#testing-roadmap`, `/science` |
| Explore Face Elixir | 1 | `/products/face-elixir` |
| Explore Body Elixir | 1 | `/products/body-elixir` |
| Read the Philosophy | 1 | `/our-story` |
| Ask Concierge | 1 | `/concierge` |
| Read the Journal | 1 | `/journal` |

The narrative Science link points at `/science#testing-roadmap` — an anchor deep
inside the proof section. The approved Science Map, pathways, schematic and
Layer Context are never introduced to the visitor.

---

## 5. Desktop and mobile comparison

| Section | Desktop | Mobile | Parity issue | Recommendation |
|---|---|---|---|---|
| Hero | Two-column, image right | Stacked, 1269px tall | Hero is 1.56x viewport at 375, 1.89x at 320 | Reduce height, keep full proposition |
| Founder | Two-column | Portrait then copy | Order acceptable | Keep order, refine spacing |
| Elixirs | Two dark cards side by side | Stacked | **CTAs are 20px text links, below the 44px minimum** | Promote to proper controls |
| All card grids | 3-up / 4-up / 5-up | Single column | Nineteen cards become one long stack | Reduce card count |
| Whole page | 7,108px | **12,478px at 375, 13,593px at 320** | Very long scroll | Consolidate sections |

Content parity is currently **intact** — nothing is hidden on mobile, there are
no carousels, no horizontal overflow at any width, the gutter is 24px, and no
text touches the viewport edge. The mobile problems are proportion and touch
target, not missing meaning.

### Measured mobile defects

1. **Two CTAs below the 44px minimum.** "Explore Face Elixir" and "Explore Body
   Elixir" render at 20px tall. These are the two product CTAs.
2. **Hero occupies 1.56 viewports at 375 and 1.89 at 320.**
3. **13,593px of scroll at 320px**, driven by eleven sections each at `py-20`
   plus nineteen stacked cards.

---

## 6. Colour, commerce, claims

**Colour.** Dark green appears as a full-bleed slab once (section 7). White
sections appear four times, warm `#efe4d5` twice. Gold is used only inside the
dark slab and on product cards. Green currently reads as one loud panel rather
than a signature.

**Commerce pressure.** No urgency language, no badges, no discounting, no
product grid with prices. Checkout is inactive by design and the page says so.
Pressure comes from repetition, not tone: the same three CTAs nine times.

**Claims.** Scanned for the prohibited vocabulary in the brief. **Zero hits** for
miracle, magic, anti-aging, age-defying, flawless, glow-up, holy grail, reverse
aging, erase wrinkles, ageless, affordable luxury and the rest. Existing copy is
claim-safe and uses approved language: barrier comfort, tone integrity, visible
radiance, well-aging, restraint. Nothing needs removing for safety.

---

## 7. Accessibility and performance baseline

| Route | a11y | perf | LCP | CLS |
|---|---:|---:|---:|---:|
| Homepage desktop | 100 | 100 | 0.6 s | 0.004 |
| Homepage mobile | 100 | 94 | 3.1 s | 0 |
| `/science` | 100 | 100 | 0.6 s | 0 |
| `/science?pathways=` | 100 | 100 | 0.6 s | 0 |
| `/inci` | 100 | 100 | 0.5 s | 0 |

One h1, no duplicate IDs, no horizontal overflow at any width, 63 routes, 28
production dependencies.

Two baseline items to improve rather than preserve: desktop CLS is 0.004 rather
than 0, and mobile LCP is 3.1 s against 0.6 s on desktop.

---

## 8. Proposed homepage sequence

Eleven narrative sections, down from twelve, with four new and four removed.

| # | Section | Message | CTA | Destination |
|---:|---|---|---|---|
| 1 | Quiet Hero | For skin that has lived | Discover the philosophy / Enter the Atelier | `/our-story`, `/shop` |
| 2 | Brand Thesis | What NFE believes: well-aging, specificity, fewer and better | none | — |
| 3 | Founder Proof | Made for me. Shared with you. | Read the philosophy | `/our-story` |
| 4 | Product Philosophy | Why only two elixirs | none | — |
| 5 | The Elixirs | Two considered objects | Discover Face Elixir / Discover Body Elixir | `/products/face-elixir`, `/products/body-elixir` |
| 6 | Science and Sensory | NFE interprets skin by pathway and layer | Explore the NFE Science Map | `/science` |
| 7 | Ritual | Application as care and intention | Enter the ritual | `/ritual` |
| 8 | Refillable Luxury | Preserve the vessel. Designed to stay. | Continue the ritual | `/discovery` |
| 9 | Editorial Invitation | The Journal as authority and culture | Read the Journal | `/journal` |
| 10 | Concierge | Private guidance | Begin a considered conversation | `/concierge` |
| 11 | Closing Invitation | One clear next step | Enter the Atelier | `/shop` |
| 12 | Disclaimer | Unchanged | — | — |

**Removed:** "Three ways to enter NFE" (5), the Quiz + Discovery slab (7),
"Through the Maison" link grid (8), "Customer Proof In Progress" (9). All four
are CTA routing or proof repetition already covered elsewhere. Their
destinations survive: Founder Access and Discovery move into the closing
sequence and the footer, the quiz remains reachable from navigation.

**Moved:** philosophy from 11 to 2; founder from 2 to 3; products from 4 to 5,
after philosophy.

**Added:** Product Philosophy, Ritual, Refillable Luxury, Journal, Concierge.

**Kept:** hero, founder, elixirs, Science, disclaimer.

### Decisions that need founder confirmation

1. **Removing four sections.** They are repetition, but they are shipped
   content. Confirm removal rather than relocation.
2. **Hero CTA change.** From "Join Founder Access" and "Take the Skin Ritual
   Quiz" to "Discover the philosophy" and "Enter the Atelier". Founder Access is
   currently the primary conversion path while checkout is inactive; demoting it
   is a commercial decision, not a design one.
3. **Founder Access placement.** If it leaves the hero, it needs a home. Options
   are the closing invitation, or keeping one instance mid-page.
4. **Refill section content.** The vessel and refill programme are not described
   anywhere in the current source. Copy would be new, and new copy needs
   approval before it is written.

---

## 9. Non-actions in this phase

No application source was changed. Science, Ingredients, product pages, Journal,
Concierge, navigation, footer, product data, formula data, pricing, Shopify
logic, dependencies and deployment configuration are all untouched. Nothing was
deployed.
