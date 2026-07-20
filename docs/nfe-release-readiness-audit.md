# NFE Maison — Release-Readiness Audit

**Status:** Complete audit, release-candidate clarification pass, and
confidentiality-priority pass.

**Disposition: HOLD CONTROLLED RELEASE DEFINITION**
**Separate, higher-priority recommendation: PREPARE MINIMAL CONFIDENTIALITY
PATCH**

Method B (revert) is approved as the preferred construction mechanism for a
future non-Founder-Access candidate, but it is not by itself a valid release
candidate: nine other approved commits still route every major CTA to
`/founder-access`, and the route remains sitemapped. A release candidate
must choose one coherent state — Founder Access included and
production-ready, or Founder Access fully excluded — never a partial state
where the backend is gone but the funnel still points at it. Separately, a
live, currently-exposed confidentiality defect on `origin/main` (real
formulation percentages rendered on `/inci`) does not depend on any of this
and should ship first, on its own track.

**Audit HEAD:** feature branch @ `8d2b8f4`. **Compared against:**
`origin/main` @ `4f2c411`. **Date completed:** 2026-07-20

**Authorization boundary for this document:** documentation and read-only
verification only. Isolated, detached git worktrees were created under the
scratch directory across this audit's three passes (branch/history checks;
Method A/B construction tests; Garamond + malformed-JSON removal test;
confidentiality-patch test against `origin/main`) and every change tested
inside them was verified, then the worktree was removed. No branch was
created in the actual repository, no branch was pushed, and the working
tree was not modified except for this file.

---

## 1. Executive Summary

**Release-construction method (confirmed).** Cherry-picking 38 commits onto
`origin/main` and reverting 5 commits (`2474aff`, `2eede3b`, `8e3357c`,
`4d86fec`, `d82e3a9`, in that order) on the feature branch tip produce a
byte-identical resulting tree — proven by direct tree-hash comparison, not
inference. Method B (revert) is preferred: 5 operations vs. 38, and it
preserves the historical record that Founder Access was built and
deliberately held back.

**Method B alone is not a release candidate.** Reverting those five commits
removes the extended intake form, the dedicated Supabase table, the footer
link, and the `/subscribe` redirect hijack. It does **not** remove Founder
Access as the site's primary conversion destination, because nine other
commits already classified "ready to ship" in this audit were themselves
authored with `/founder-access` as their CTA target: the homepage (×2), Shop
(×2), Concierge, Discovery (×2), the Skin Ritual Quiz's entire result-routing
logic, and three journal/atelier components. Section 9 maps every one of
these with a proposed replacement. **No replacement has been made.**

**Garamond and malformed-JSON hygiene — verified removable.** Tested this
pass in an isolated worktree from the feature branch tip: removing
`public/fonts/garamondpremrpro.{otf,woff,woff2}` and `public/data/inci/
faceElixir.json`, then running install, typecheck, `next build --webpack`,
and `opennextjs-cloudflare build` — all succeeded. The actual Cloudflare
asset output directory (`.open-next/assets`) was inspected directly and
contains neither. Neither removal has been applied to the real branch.

**Confidentiality exposure — separate, higher-priority track.**
`origin/main`'s live, sitemapped `/inci` page today renders six real Face
Elixir formulation percentages via `public/data/formulas/faceElixir.json`.
A minimal two-file, twelve-line-per-file patch (tested this pass against
`origin/main` directly, not the feature branch) blanks exactly those six
values using the file's own existing "not disclosed" convention (empty
string), with zero code changes. Typecheck and production build both
succeeded against the patched tree. Section 15.

**Recommended sequence:** ship the confidentiality patch first and
independently (Section 16). It blocks nothing and is blocked by nothing in
the controlled release.

---

## 2. Branch & History Verification

Unchanged since the first pass:

- Merge base `4f2c411826c1c950c3385759084a9e56a87a9102`, identical to
  `origin/main`'s tip. 43 commits ahead (42 + this audit's own first-pass
  commit), 0 behind, linear history, zero merge-conflict markers in a
  dry-run merge.
- `git reflog` shows a clean, forward-only sequence; `git fsck
  --unreachable` findings are routine object-database litter, not evidence
  of tampering on this branch.
- No CI/CD exists (no `.github/`); deploys are manual (`npm run deploy` =
  `opennextjs-cloudflare build && npx wrangler deploy .open-next/worker.js`).
- Other repo branches, noted for completeness: `wip/our-story-maison`
  (superseded by the finished pilot), `audit/production-readiness`
  (superseded by this document).

---

## 3. Commit Classification

Unchanged since the first pass — all 42 original commits grouped into 15
logical units and classified across the 8 required categories (ready to
ship / ready after regression test / blocked by product fact / blocked by
founder decision / blocked by environment-configuration / internal
documentation only / should not ship / requires separate deployment). One
running correction from this pass: Group 2 (`b70dab5` and siblings) is now
understood to have also introduced the Founder Access CTA links mapped in
Section 9, and to have both fixed a live percentage exposure and corrupted
an unused public JSON duplicate (Section 7) — net effect on confidentiality
is positive, classification unchanged ("ready after regression test").

---

## 4. Route-by-Route Inventory

Unchanged since the first pass — full route list (new, modified, and
untouched routes on the feature branch vs. `origin/main`) stands as
previously reported.

---

## 5. Release Candidate Construction — Three Methods, Tested

### Method A — Cherry-pick onto `origin/main`

Tested in a detached worktree at `origin/main`. All 38 non-Founder-Access
commits cherry-picked in original chronological order (skipping `d82e3a9`,
`4d86fec`, `8e3357c`, `2eede3b`, `2474aff`) applied with **zero conflicts**.
Fragile in principle (depends on exact replay order across commits that
repeatedly touch `page.tsx`/`shop/page.tsx`), but succeeded in practice.

### Method B — Revert on the feature branch tip (recommended mechanism)

Tested in a detached worktree at the feature branch tip. Reverting only the
three named commits failed on a modify/delete conflict — `scripts/closeout-
founder-access-production.mjs` was created by `8e3357c` and later modified
by `2eede3b`/`2474aff`, so those two must be reverted alongside Group 8 for
a clean result. Reverting all five, in reverse-chronological order
(`2474aff`, `2eede3b`, `8e3357c`, `4d86fec`, `d82e3a9`), applied with **zero
conflicts**.

**Resulting tree confirmed identical to Method A by direct tree-hash
comparison** (`git rev-parse HEAD^{tree}` matched exactly between the two
worktrees). Method B is recommended: 5 operations vs. 38, and reverts (unlike
cherry-picks onto a fresh branch) preserve the historical record — a future
`git revert` of the revert would cleanly restore Founder Access if needed.

**Method B removes the backend, not the funnel** (Section 9). This is the
central finding of this pass: "ship the branch except Founder Access" is not
a fully specified release candidate until the Section 9 table is resolved.

### Method C — Keep Founder Access code, prove it dormant and unreachable

**Rejected as currently unachievable without new code**, tested rather than
assumed:

- No server-side or build-time gate exists on the route or its API — both
  are served regardless of environment configuration.
- Verified env-var behavior by reading the route and its three dependencies
  line by line: missing `SUPABASE_SERVICE_ROLE_KEY` makes
  `createAdminSupabase()` throw, caught by the route's try/catch, returning
  a 500 — the route *fails loudly to the submitting user*, it does not
  silently no-op. Missing `RESEND_API_KEY` degrades silently (DB write still
  succeeds if Supabase is configured). Missing `BEEHIIV_API_KEY` degrades
  silently (`{status: 'skipped', reason: 'beehiiv_not_configured'}`).
  Missing Upstash vars fail open (`'allow'`), not closed.
- With Supabase configured but nothing else, a real signup is written to the
  database. There is no environment-variable combination that makes this
  route "completely dormant and unreachable" as specified.
- Making Method C true would require a real code change — the same
  `notFound()`-in-production guard already proven on `/dev/token-specimen`
  — which does not currently exist for this route and was not added in this
  pass.

**Recommended method: Method B**, understood as backend-only, paired with
the Section 9 exclusion work if State B (Section 9) is the chosen path.

---

## 6. Candidate Tree — Build Verification

Run against the Method B candidate tree in its (now-removed) isolated
worktree:

| Step | Result |
|---|---|
| `npm install` | Succeeded — 1792 packages |
| `npx tsc --noEmit` | Passed, zero errors |
| `npm run build` (`next build --webpack`, the project's real script) | Succeeded |
| `npx opennextjs-cloudflare build` | Succeeded |

A bare `npx next build` (defaults to Turbopack under Next.js 16) failed on
an unrelated SCSS `@import`-deprecation/CSS-parsing error — reproduced
identically on the **unmodified** feature branch tip, confirming it is a
pre-existing Turbopack-specific condition, not something this pass
introduced, and not representative of the real build (the project's actual
script forces `--webpack`). No dangling imports of any deleted Founder
Access file were found anywhere in `src/` after the revert.

---

## 7. Asset & Media Findings (corrected)

### Malformed `public/data/inci/faceElixir.json` — origin corrected

The first pass treated this as unexamined-origin; that was incomplete.
Checked via `git log --follow` and `git show b70dab5 -- <path>` this pass:
at `0177b45` (2025-11-14, pre-existing on `origin/main`) and on `origin/main`
today, this file is a clean, well-formed JSON array. **`b70dab5` (this
branch) rewrote it into the corrupted `.NET`-serialization-artifact
structure** (`Count`, `SyncRoot`, `IsFixedSize`, etc.). This branch
introduced the malformation — it is not pre-existing. Confirmed (again,
this pass): nothing in `src/` fetches `/data/inci/*` at any path; removal is
safe (Section 4 test, Section 14).

### Formulation-percentage exposure — the more consequential finding

`public/data/formulas/faceElixir.json` on `origin/main` today contains 28
`percentageRange` occurrences, 6 of them real, non-empty values (Niacinamide
2–5%, Tranexamic Acid 3%, Alpha-Arbutin 2%, Kojic Dipalmitate 2%, THD
Ascorbate 5.21%, Ectoin 2%). `INCILists.tsx` fetches this exact path and
renders `item.percentageRange` when truthy. `/inci` renders `INCILists`, is
listed in `sitemap.ts`, and is not disallowed in `robots.ts`. **`origin/
main`'s live, indexed `/inci` page currently displays these percentages to
any visitor, today, independent of this branch.** On the feature branch,
`data/formulas/faceElixir.json` and its public copy carry zero
`percentageRange` occurrences — stripped, apparently as a side effect of
`b70dab5`'s broader data restructuring rather than a stated, deliberate
fix. Full inventory, exact values, and a tested minimal patch are in
Section 15.

### Carried forward, unchanged

No zero-byte images; the broken `/images/logo/nfe_logo.png` reference in
`ArticleJsonLd.tsx` remains confirmed pre-existing on `origin/main`;
favicon/icon correct; Our Story assets correct.

---

## 8. Garamond Font Binaries

| Path | Type | Size | Tracked? | Referenced? | Publicly servable? |
|---|---|---|---|---|---|
| `public/fonts/garamondpremrpro.otf` | OpenType | 428,520 bytes | Yes | No `@font-face`/`next/font` loader anywhere in `src/` | Yes |
| `public/fonts/garamondpremrpro.woff` | WOFF | 273,412 bytes | Yes | Same | Yes |
| `public/fonts/garamondpremrpro.woff2` | WOFF2 | 206,616 bytes | Yes | Same | Yes |

- **Origin:** added `0177b45`, 2025-11-14 — pre-existing on `origin/main`,
  not introduced by this branch.
- **Removal tested this pass**, not merely proposed: in an isolated
  worktree built from the feature branch tip, `git rm` on all three paths
  (together with the malformed JSON below), then `npm install` → succeeded;
  `npx tsc --noEmit` → passed; `npm run build` → succeeded; `npx
  opennextjs-cloudflare build` → succeeded. `.open-next/assets` — the exact
  directory `wrangler.jsonc` serves as static assets — was searched
  directly for `*garamond*` and returned **zero matches**.
  `public/fonts/` no longer exists in the tree after removal (it held
  nothing else).
- **Fallback confirmed unaffected:** `--font-primary: "Garamond Premier
  Pro", Georgia, serif` in `src/styles/tokens.scss` is a CSS font-family
  fallback stack only. A fresh repo-wide grep this pass for `fonts/garamond`
  or `garamondpremrpro` found no `@font-face`/`next/font` loader anywhere —
  only the fallback declaration itself and the token-specimen page's own
  documentation that "Garamond web embedding is unapproved" and Georgia is
  what actually renders. Removing the binaries changes nothing about what
  renders today, in either tree.
- **No private or alternately-licensed source copy of this font was
  located, opened, copied, or redistributed by this audit.** The three
  tracked files above are the only copies in scope. No replacement font was
  substituted.
- **Recommendation: remove from the release tree, or hold pending confirmed
  webfont-redistribution licensing.** Verified safe to remove; not yet
  performed on any real branch.

---

## 9. Founder Access — Full Exposure Map and Proposed Replacements

Supersedes the prior pass's framing. Every surface checked individually,
each with its origin commit and (where exclusion is the chosen path) a
proposed replacement. **No replacement has been made.**

| # | Surface / file | Origin commit | Present after Method B revert? | Proposed replacement if State B (fully excluded) is chosen |
|---|---|---|---|---|
| 1 | Footer link | `d82e3a9` | **No — removed by the revert** | N/A, already gone |
| 2 | `/api/founder-access` endpoint | `d82e3a9` | **No — file deleted, no dangling imports (re-verified this pass)** | N/A, already gone |
| 3 | `/subscribe` redirect to `/founder-access` | `d82e3a9` | **No — reverts to `/subscribe`'s own form** | N/A, already gone |
| 4 | Supabase `founder_access_signups` table + migration | `d82e3a9` | **No — file removed from tree** (does not undo anything already applied to a live database) | N/A |
| 5 | Homepage `threeWayEntries` primary CTA (~line 51) | `b70dab5` | **Still present** | Repoint `href` to `/subscribe`; entry copy names Founder Access explicitly and would need review |
| 6 | Homepage CTA (~line 183) | `b70dab5`/`aff206a` | **Still present** | Repoint to `/subscribe` |
| 7 | Homepage CTA (~line 519), preceded by "Founder Access is the primary path while checkout remains inactive" | `b70dab5` | **Still present** | Repoint link; paragraph copy needs review, not just the link |
| 8 | Shop CTA (~line 36) | `20ee75b` | **Still present** | Repoint to `/subscribe` |
| 9 | Shop CTA (~line 191), preceded by "Checkout is inactive. Join Founder Access..." | `20ee75b` | **Still present** | Repoint link; paragraph copy needs review |
| 10 | Concierge "Continue the Maison Path" CTA | `061a98f` | **Still present** | Repoint to `/subscribe`, or drop from the link cluster |
| 11 | Discovery CTA (~line 107) | `b70dab5`/`948f231` | **Still present** | Repoint to `/subscribe` |
| 12 | Discovery CTA (~line 299), preceded by "Founder Access is the supported path... while... remain in planning" | `948f231` | **Still present** | Repoint link; paragraph copy needs review |
| 13 | Skin Ritual Quiz `founder_access` result branch (title, body, `ritualNotes`, primary CTA) + secondary CTA on 3 other result states + scoring logic that routes into it | `733b061` | **Still present, including the routing logic itself** | **Not a link swap** — the branch's own copy is entirely about Founder Access by name; needs either a rewritten result branch or retiring the state and re-routing its scoring conditions (e.g. into `discovery_ritual`). Founder content decision required. |
| 14 | `ArticleMaisonLinks` link array entry | `a9a6110` | **Still present** | Repoint to `/subscribe`, or drop the row |
| 15 | `JournalArticleCard` link entry ("Join the private list without promotional noise") | `a9a6110` | **Still present** | Repoint `href` only — existing body copy already describes plain list-joining, no copy change needed |
| 16 | `AtelierMaisonLinks` entry | `20ee75b` | **Still present** | Repoint to `/subscribe`; description text is generic enough to survive |
| 17 | `ElixirEditorialPage` CTA (~line 70) | `20ee75b` | **Still present** | Repoint to `/subscribe` |
| 18 | `ElixirEditorialPage` CTA (~line 253), preceded by "Checkout remains inactive. Founder Access is the primary conversion path..." | `20ee75b` | **Still present** | Repoint link; paragraph copy needs review |
| 19 | `sitemap.ts` entry | Pre-Group-8, untouched by any revert | **Still present** | Remove if the route is retired; keep if it remains a static placeholder |
| 20 | `/founders-access` → `/founder-access` permanent redirect in `next.config.mjs` | Added alongside `d82e3a9` but the rule itself is not part of what the revert touches | **Still present** | If retiring the route, repoint destination to `/subscribe` rather than leaving a permanent redirect into a dead/repurposed page |
| 21 | `/founder-access/page.tsx` route itself | `b70dab5` (shell) | **Reverts to the original 87-line static page** ("Full segmentation is not active yet... uses the existing private list signup," linking to `/subscribe`) | Arguably already correct if the route is *kept*; if fully retiring it, apply the same `notFound()`-in-production guard already proven on `/dev/token-specimen` |

**Bottom line:** 14 of these 21 rows are mechanical link swaps to
`/subscribe` (already existing, unaffected by any revert, and literally
where `b70dab5`'s own original placeholder pointed). 5 rows carry
surrounding paragraph copy that names Founder Access as the site's stated
commerce substitute and need review beyond the link itself. Row 13 (the
quiz) needs a founder content decision on an entire result branch, not a
mechanical change. Rows 19–20 are configuration, not component code.
**Calling Method B alone "Founder Access excluded" is false. The accurate
description of the post-revert state is: the dedicated data-collection
backend is gone; roughly a dozen CTAs across the site still fund a
now-static placeholder page whose only action is a link to `/subscribe`
(which itself already writes to Supabase and calls Beehiiv/Resend, on
`origin/main` today, unrelated to this branch).**

---

## 10. Product-Size Classification

**Face Elixir 30ml/50ml contradiction:**
- Existing production defect, confirmed via `git show origin/main:src/
  components/products/face-elixir/FaceElixirFAQ.tsx` — predates this
  branch. `20ee75b` modified this file but did not create the
  contradiction (diffed against its pre-`20ee75b` parent — text unchanged
  by that commit).
- Founder verification required against physical packaging before any copy
  change. Not expanded, rewritten, or duplicated by this audit.
- **Exact affected surface:**
  - `src/components/products/face-elixir/FaceElixirFAQ.tsx` (lines 38–39) —
    imported into `src/app/products/[slug]/ProductPageClient.tsx`, live at
    `/products/face-elixir`. **The only reachable, customer-facing
    instance.**
  - `src/components/products/FaceElixirSections.tsx` (lines 44, 54, 57) —
    same contradiction, but **not imported anywhere in `src/app/`**
    (confirmed via repo-wide grep) — dead code, not customer-facing.

**Body Elixir 200ml vs. 125ml/75ml:**
- Internal-source contradiction. `src/content/products/body-elixir.ts`
  (lines 112, 116) consistently states 200ml in shipped code, on both
  `origin/main` and this branch.
- The conflicting 125ml/75ml figures come from a Maison design-package
  reference only, not any code path — confirmed not customer-facing (no
  match anywhere in `src/`).
- No public correction made or implied by inference in this document.

No product copy was changed in the course of producing this document.

---

## 11. Deployment Options — Exact Commits

Base commit for all options: `origin/main` @ `4f2c411`.

### Option A — Hold (no new production surface)
Included: none. All 43 commits remain unmerged on the feature branch. Risk:
none. Not recommended as a terminal state.

### Option B — Controlled release via Method B revert
- **Base:** `feature/nfe-digital-maison-upgrade` @ current tip.
- **Exact excluded commits:** `d82e3a9`, `4d86fec`, `8e3357c`, `2eede3b`,
  `2474aff` (reverted, 5 new commits, reverse-chronological order).
- **Exact included commits:** the other 38, plus the 5 revert commits.
- **Not yet a complete release candidate:** requires the State A/State B
  decision (Section 9) resolved, and if State B, the 21-row table actually
  patched — not just the backend commits reverted.
- **Additional pre-release cleanup, verified safe, not yet performed:**
  remove `public/data/inci/faceElixir.json` (Section 7); resolve the
  Garamond question (Section 8).
- **Required environment variables:** none newly required by the excluded
  system; `/api/subscribe`, `/api/concierge` need their existing
  Resend/Beehiiv keys, same as `origin/main` today.
- **Required migrations:** none — the Founder Access migration is removed
  from this tree, not applied.
- **Build artifact:** verified, Section 6.
- **Rollback:** tag the pre-deploy HEAD; because Method B is itself a
  revert, reversing course later is a further `git revert` of the revert —
  no history loss either direction.
- **Risk:** low-to-medium, contingent on the Section 9 decision.

### Option C — Full feature-branch release (Founder Access live)
- **Base:** feature branch tip directly, no construction needed.
- **Included:** all 43 commits.
- **Required environment variables:** `SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `BEEHIIV_API_KEY`
  confirmed present in Cloudflare Worker production bindings — unverifiable
  from this repository.
- **Required migrations:** `supabase/migration_founder_access_signups.sql`
  applied to production, RLS confirmed active there — unverifiable from
  this repository.
- **Rollback:** tag the deploy HEAD; a rollback after real signups requires
  a data-retention decision, not just a code revert.
- **Risk:** medium-high — the only option with unverified production
  configuration in the path of real customer PII.

**No option is authorized for execution by this document.**

---

## 12. Rollback Plan

Unchanged in substance from the first pass: tag the exact candidate HEAD
before any deploy (Options B or C above, or the Section 15 confidentiality
patch); `wrangler deploy` has no evidenced built-in "redeploy previous
version" command in this repo, so rollback means checking out the tagged
commit and re-running `npm run deploy`; database rollback only matters if
Option C's Founder Access has collected real signups by the time of
rollback; cache invalidation behavior is not fully characterized from code
(Section 15 flags this specifically for the confidentiality patch).

---

## 13. Dry Release Validation Plan

| Test | Status |
|---|---|
| Clean install | **(run)** — Section 6, Section 8 |
| Typecheck | **(run)** — Section 6, Section 8 |
| Production build (`next build --webpack`) | **(run)** — Section 6, Section 8 |
| Cloudflare/OpenNext build | **(run)** — Section 6, Section 8 |
| Route smoke tests (every route responds) | (planned) — requires a live preview against the actual release branch |
| Direct URL tests (`/founder-access`, `/subscribe`, `/api/founder-access`) | (planned) |
| API endpoint tests with sandbox credentials | (planned) |
| Missing-environment-variable tests | (planned) |
| Sitemap and robots inspection | **(run)** — Section 9 |
| Public asset inspection (Garamond, malformed JSON) | **(run)** — Sections 4, 8 |
| Confidential-file inspection | (planned) — repeat the secret-pattern scan against the final release branch specifically |
| Lighthouse checks on the actual release branch | (planned) — prior scores are for the feature branch, not yet re-run against a constructed release branch |
| Rollback rehearsal | (planned) — requires an actual deploy target |

---

## 14. Release Sequencing

**Release 1 — minimal confidentiality patch for `/inci`.** Independent of
Founder Access, independent of the Maison migration, independent of the
controlled feature release. Scope: exactly the two-file diff in Section 15.
**Not yet authorized for branch creation or deployment.**

**Release 2 — controlled feature release.** Gated on all of:
- One coherent Founder Access state selected (Section 9) — and if State B,
  the 21-row table actually patched, not just the five backend commits
  reverted.
- Garamond binaries excluded from the tree, or licensing confirmed
  (Section 8).
- Malformed public JSON removed (Section 7).
- The exact resulting candidate tree built and tested end-to-end — typecheck
  and both builds are done (Section 6/8); route-level smoke testing against
  a live preview is still outstanding (Section 13).
- A rollback target named and tagged before deploy.

Nothing in Release 1 blocks Release 2, and nothing in Release 2 needs to
precede Release 1.

---

## 15. Confidential Formulation-Percentage Exposure — Minimal Patch Plan

Treated as a separate track from the controlled release, per instruction.
**No branch created, no deployment performed.**

### Exact live files exposing percentages (on `origin/main`, today)

| File | `percentageRange` occurrences | Non-empty (real) values | Actually rendered to visitors? |
|---|---|---|---|
| `data/formulas/faceElixir.json` (private mirror) | 28 | 6 | No (not under `public/`) |
| `public/data/formulas/faceElixir.json` | 28 | 6 | **Yes — the exact file `INCILists.tsx` fetches and renders on `/inci`** |
| `data/inci/faceElixir.json` (private mirror) | 10 | includes the same 6 values | No |
| `public/data/inci/faceElixir.json` | 10 | includes the same 6 values | Not rendered by any component, but statically fetchable by direct URL |
| `data/inci/bodyElixir.json` / `public/data/inci/bodyElixir.json` | 4 each | some real values present | No — `INCILists.tsx`'s `isPlaceholder` check shows a static "in development" message instead, because `public/data/formulas/bodyElixir.json` (the file actually fetched for body) is an empty placeholder (`{"status": "In development", "ingredients": []}`) on `origin/main` today |

### Exact lines/data structures involved

In `public/data/formulas/faceElixir.json` (and its identical private
mirror), six of 28 ingredients carry non-empty `percentageRange` values
(the other 22 already use `""` as the file's own "not disclosed"
convention):

- Niacinamide — `"percentageRange": "2–5%"`
- Tranexamic Acid — `"percentageRange": "3%"`
- Alpha-Arbutin — `"percentageRange": "2%"`
- Kojic Dipalmitate — `"percentageRange": "2%"`
- THD Ascorbate — `"percentageRange": "5.21%"`
- Ectoin — `"percentageRange": "2%"`

`INCILists.tsx` renders each ingredient's `percentageRange` conditionally
(`{item.percentageRange && (<p ...>{item.percentageRange}</p>)}`) — an
empty string renders nothing, exactly the behavior the other 22 ingredients
already rely on. Blanking these six to `""` uses the file's own existing
convention; no schema or component change is needed.

### Exact patch files (tested this pass)

Tested in an isolated worktree built directly from `origin/main`
(`4f2c411`):

- `data/formulas/faceElixir.json` — 6 value replacements, 12 lines changed,
  byte-identical otherwise (verified: no CRLF churn, no BOM change, no
  reformatting).
- `public/data/formulas/faceElixir.json` — same 6 replacements, same
  12-line diff shape.

**Zero supporting code changes required** — a pure data patch.

**Not applicable to this patch:** the malformed-JSON removal (Section 7) —
that defect exists only on the feature branch (`b70dab5`), not on `origin/
main`. This patch's base predates that defect entirely.

**Related item, explicitly excluded from this patch's scope:** `data/inci/
faceElixir.json` and `public/data/inci/faceElixir.json` carry the same real
percentage values and are directly fetchable by URL even though nothing
renders them today. Recommend a fast-follow — not folded into this patch,
to honor the "strictly necessary, customer-facing only" scope.

### Proposed base commit and resulting candidate HEAD

- **Base:** `origin/main` @ `4f2c411826c1c950c3385759084a9e56a87a9102`.
- **Proposed resulting candidate HEAD:** one new commit on a new branch off
  `4f2c411` (e.g. `hotfix/inci-percentage-exposure`) containing exactly the
  two-file diff above. Verified only inside a disposable, now-removed
  worktree — no such commit exists in the real repository.

### Build and route test plan

| Step | Status |
|---|---|
| `npm install` | **(run)** — succeeded |
| `npx tsc --noEmit` | **(run)** — passed |
| `npm run build` (`next build --webpack`) | **(run)** — succeeded |
| `opennextjs-cloudflare build` | (planned) — recommend re-running against the actual hotfix branch once created |
| Direct check that all 28 `percentageRange` occurrences are empty post-patch | **(run)** — confirmed via grep |
| `/inci` manual render check | (planned) — requires a live preview server |
| Confirm Body Elixir `/inci` view unaffected | (planned, low risk) — reasoned from unchanged `isPlaceholder` logic |

### Rollback method

Tag the pre-deploy HEAD before deploying. Rollback is a single-commit
revert or redeploy of the tagged pre-patch commit — no schema, migration, or
environment variable is touched, so no data-consistency concerns.

### Cached asset / page purge

**Not verifiable as unnecessary — should be treated as required.** No
explicit `Cache-Control` configuration was found in `next.config.mjs` or
`wrangler.jsonc` governing `/data/` paths, so default Cloudflare Workers
Assets caching applies, which this audit cannot fully characterize from
code. Because the JSON is fetched client-side at runtime, a stale edge or
browser cache could keep serving the old percentage-containing response
after deploy. Recommend an explicit Cloudflare cache purge for this asset
path as a deployment step, confirmed by whoever has dashboard access — not
assumed to self-resolve.

---

## 16. Founder Decisions Required

1. **Coherent Founder Access state:** State A (included, production-ready —
   needs the unverifiable-from-code confirmations already on record) or
   State B (fully excluded — needs the Section 9 table actually patched,
   including a content decision on the quiz's `founder_access` result
   branch and the five paragraph-copy blocks that name Founder Access
   directly).
2. **Confidentiality patch authorization:** approve creating
   `hotfix/inci-percentage-exposure` from `origin/main` with the exact
   two-file diff in Section 15, and separately approve deploying it.
3. **Garamond licensing:** confirm self-hosted webfont redistribution
   rights, or proceed with removal (verified safe this pass).
4. **Malformed JSON:** confirm removal (verified safe this pass).
5. **Cache purge ownership:** confirm who validates the Cloudflare cache
   purge after the confidentiality patch deploys.
6. **Face Elixir 30ml/50ml and Body Elixir 200ml/125ml/75ml:** still require
   verification against physical packaging (Section 10).
7. **Founder Access go-live** (if State A is chosen): Supabase
   migration/RLS/env-var confirmation in production.

**No deployment scope has been authorized by this document.**
