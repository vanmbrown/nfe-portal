# NFE Deferred Work Register

Work that has been identified, understood, and deliberately postponed.

Nothing in this register is implemented. Each entry records what was found and
what the open decision is, so a later pass can act without rediscovering it.

Opened: 2026-07-26, at the closeout of the Accessibility & Quality release
(`docs/releases/ACCESSIBILITY_QUALITY_RELEASE_CLOSEOUT.md`).

---

## Editorial and product decisions

**Face Elixir size copy contradiction.** `/products/face-elixir` asks "How long
will a 30 ml or 50 ml bottle last?" while the page carries a single `30 ml` and
a single `50 ml` reference. Left untouched through the accessibility release by
explicit instruction. Founder decision: which size is correct, and whether the
question should name one size or both.

**Future use of "The first release will be shared privately."** Approved as
editorial supporting wording during the Founder Access copy ruling, but not
added anywhere — no existing sentence required it, and the ruling did not call
for new copy. Available if a narrative surface later needs it.

**Final treatment of unreachable "Join Waitlist" language.** See the
architecture entry below; the wording and the route's fate are the same
decision.

---

## Architecture and cleanup

**Remove dead `src/app/shop/ShopCard.tsx`.** Zero references anywhere in `src`.
Still contains the old "Coming Soon" string. Left unedited by founder ruling:
remove in a cleanup pass rather than editing copy that reaches no one.

**Remove dead `src/components/products/ProductCard.tsx`.** Zero references —
the `ProductCard` imports elsewhere resolve to different components in
`ui/Card.tsx` and `articles/MDXComponents.tsx`. Same "Coming Soon" string, same
ruling.

**Remove dead `src/components/products/FaceElixirSections.tsx`.** Zero
references. Contains CMS fallback strings ("Product details coming soon.").

**Decide whether to remove or revive `/products/[slug]`.** The route is
unreachable: `/products/face-elixir` and `/products/body-elixir` have dedicated
static page files that outrank the dynamic `[slug]` segment, and the product
registry declares only those two slugs, so every other slug hits `notFound()`.
Confirmed against the build — "Ritual Pairing" appears only in the compiled
`[slug]` bundle and in no prerendered HTML.

**Decide whether `ProductPageClient` remains necessary.** It is reached only
through the unreachable `[slug]` route. It also holds the off-brand "Join
Waitlist" CTA, which renders when `product.status === 'coming_soon'` and
therefore reaches no customer today. Either delete it with the route, or
restate the CTA (for example "Founder Access opens first") if the route is
revived. This is a purchasing-flow decision, not a wording fix.

**Remove unreachable `RitualPairing` flow if architecture confirms it is
obsolete.** It carries the approved "Founder Access opens first" wording in
source but renders on no URL. Its fate follows the `[slug]` decision above.

---

## Performance

**`/skin-strategy` performance optimization.** Measured ~65–71; pre-existing and
untouched. The route ships two heavy interactive map components.

**Evaluate bundle splitting.** Candidate approach for the two maps.

**Evaluate lazy loading.** Candidate approach for below-the-fold map content.

**Constraint:** any optimization must preserve the accessibility result (100,
zero weighted findings) and the editorial experience. The maps' dark-surface
rendering, contained backgrounds, heading structure, and accessible names are
all load-bearing and were fixed in this release.

---

## Infrastructure and SEO

**Review Cloudflare-managed robots.txt prepend.** The served `/robots.txt` is
Cloudflare Managed Content — an AI content-signals block terminated by
`# END Cloudflare Managed Content` — prepended to the application's own output.
Lighthouse scores the combined file as invalid, costing roughly 8 SEO points on
every route. The application's `src/app/robots.ts` is correct and unchanged,
including its `/dev/` disallow.

**Determine whether AI content-signals configuration should remain.** This is a
Cloudflare zone-level setting, not application code. Keeping it is a deliberate
content-licensing posture; the SEO cost is the trade-off. Founder decision.

**Review `/dev/token-specimen` 404 metadata title.** The route correctly returns
HTTP 404 and renders the 404 page with no specimen content exposed, but Next.js
still applies the route's metadata, so the browser tab reads "Token Specimen
(internal)". Cosmetic information leak only.

**Do not expose the route.** The runtime 404 and the `robots.txt` `/dev/`
disallow are both intentional and must stay.

---

## Study Circle

Frozen at `feature/nfe-seed-access` @ `1f055123c12c332f89ede4e3722d999b72878144`.

Status: implementation complete; database validation deferred; legal review
pending; no live participants; no production migration.

- staging project;
- real database validation;
- legal review;
- production migration;
- first participant invitations.

---

## Future platform work

- founder dashboard;
- formula and ingredient updates;
- future editorial expansion.
