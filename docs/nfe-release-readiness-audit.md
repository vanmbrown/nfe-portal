# NFE Maison — Release-Readiness Audit

**Status:** Complete audit, release-candidate clarification pass,
confidentiality-priority pass, and a live-production reconciliation pass
that corrects this document's central working assumption.

**Disposition: HOLD — CANDIDATE DOES NOT MATCH LIVE BASELINE**

**Correction, load-bearing:** every prior pass in this document reasoned
about "the live confidentiality exposure" by reading `origin/main`'s file
content and assuming it represented, or safely approximated, what is
running in production. That assumption was never checked against the
actual production site until this pass. It does not hold. Direct fetches
against `https://www.nfebeauty.com` (2026-07-21) prove production is
running feature-branch content well past `origin/main` — including the
full Founder Access build (`d82e3a9`) — while also predating the favicon,
Our Story pilot, and homepage hero fidelity work, and predating `4a1cc89`'s
fixes. **The hotfix branch built and validated in this document
(`hotfix/inci-percentage-exposure`, based on `origin/main`) would cause a
severe regression if deployed as-is** — it would revert production's
current Atelier/accordion product pages back to an older component tree,
among other rollbacks — **and, separately, the specific percentage values
it removes are not actually rendering on production today.** Full detail
in the new Section 18. The four-commit hotfix branch remains fully built,
tested, and pushed; it is not deployed and must not be deployed in its
current form.

Method B (revert) remains approved as the preferred construction mechanism
for a future non-Founder-Access *candidate*, but — as established before
this pass — is not by itself a valid release candidate: nine other approved
commits still route every major CTA to `/founder-access`, and the route
remains sitemapped. That finding is unchanged. What changed is the
deployment target itself: neither `origin/main` nor
`feature/nfe-digital-maison-upgrade` can be assumed to represent, or safely
supersede, what is currently live.

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

**Status update (2026-07-20): implemented, not yet deployed.** The plan below
was executed on branch `hotfix/inci-percentage-exposure` (base `4f2c411` =
`origin/main`) as three independent commits, each reviewable and revertible
on its own:

1. `bf9ba21` — fix: remove confidential face elixir percentages (the two
   formulas JSON files, exactly as planned below)
2. `9cc2e0a` — chore: remove unverified public font binaries (the three
   Garamond files, Section 8)
3. `847faec` — fix: remove public product concentration data (a **second
   exposure surface discovered during hotfix validation** — see Section 16,
   which expands the scope beyond what this section originally planned)

All three commits are pushed to `origin/hotfix/inci-percentage-exposure`.
**No deployment has been performed.** The remainder of this section is the
original plan, retained as the record of scope and method.

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

### Cached asset / page purge (expanded after Section 16's findings)

**Not verifiable as unnecessary — treat as required.** No explicit
`Cache-Control` configuration was found in `next.config.mjs` or
`wrangler.jsonc` governing these paths, so default Cloudflare Workers Assets
caching applies, which this audit cannot fully characterize from code. A
stale edge or browser cache could keep serving old percentage-containing
responses after deploy. Purge explicitly, confirmed by whoever has
Cloudflare dashboard access — do not rely on TTL expiration:

- `/inci` (HTML)
- `/products/face-elixir` (HTML)
- `/products/body-elixir` (HTML — this page server-renders the ingredient
  data into its HTML, confirmed in the build output, so the cached page
  itself contains the old concentrations, not just a JSON fetch)
- `/data/formulas/faceElixir.json`
- `/data/inci/faceElixir.json`
- `/data/inci/bodyElixir.json`
- Any cached RSC payload variants of the three HTML routes above (Next.js
  App Router serves `?_rsc=` flight payloads alongside HTML; if the edge
  caches them, they carry the same rendered data)

---

## 16. Product-Page Concentration Exposure — Found and Remediated During Hotfix Validation

A **second, independent confidential-concentration exposure** was discovered
while validating the Section 15 patch's build artifact (a stray "3%" match
traced to its real source), and remediated as the hotfix's third commit
(`847faec`). It is both a confidentiality defect and a data-integrity
defect, and it is live on `origin/main` today.

### Exact affected files (all remediated in `847faec`)

| File | What it exposed | Remediation |
|---|---|---|
| `src/content/products/face-elixir.ts` | `concentration` field per ingredient: THD Ascorbate 15%, Bakuchiol 1%, Copper Peptide 0.1%, Palmitoyl Tripeptide-5 0.05%, Niacinamide 5%, Hyaluronic Acid 2% — plus "15%" embedded in the THD ascorbate clinical-evidence sentence | Six `concentration` fields removed (field is optional in the shared type, which is retained); "15% THD ascorbate" → "THD ascorbate" in the claim sentence, efficacy statistic (40% in 8 weeks) unchanged |
| `src/content/products/body-elixir.ts` | `concentration` per ingredient: Ceramide Complex 2%, Cacay Oil 5%, Prickly Pear Seed Oil 3%, Blue Tansy 0.5%, Gotu Kola Extract 1%, Bisabolol 0.5% | Six `concentration` fields removed |
| `src/components/products/IngredientList.tsx` | Rendered a "Concentration: <value>" badge for any ingredient carrying the field | Badge rendering block removed entirely — rendering defense: no future content entry can re-expose a value through this component. The `concentration` field stays optional in the TypeScript type for internal compatibility; it is simply never rendered. |
| `data/inci/faceElixir.json`, `public/data/inci/faceElixir.json` | `percentageRange` values incl. 2–5%, 3%, 2%, 5.21%, 0.5–1%, 0.1–0.5% — statically servable by direct URL even though no component fetches them | All real values blanked to `""` (the files' own undisclosed-value convention); `"q.s."` retained as a qualitative term, not a disclosed concentration |
| `data/inci/bodyElixir.json`, `public/data/inci/bodyElixir.json` | `percentageRange` values incl. 2–5%, 5.21%, 0.5–1% | Same |

### Exact affected routes

- **`/products/body-elixir`** — the only route that *rendered* the
  concentration badges: its dedicated page imports `IngredientList` +
  `BenefitsTable` fed by `bodyElixirData`. The badges were server-rendered
  into the page HTML (confirmed in the pre-fix build output), customer-
  visible today on `origin/main`.
- **`/products/face-elixir`** — does **not** render `faceElixirData` on this
  base (it uses a separate accordion fed by `data/products/*.json`, which
  was checked and contains zero percent values). The face concentrations
  were source-only exposure; pre-fix build-artifact search found no 15%/
  5.21% in text output. Removed regardless — the feature branch's rebuilt
  product pages consume content differently, and source-level removal is
  the only future-proof state.
- **`/data/inci/*.json`** — direct-URL exposure only (nothing fetches them).

### Conflicting values between data sources — recorded, NOT reconciled

The same ingredients carry **different concentration figures in different
files**, e.g. THD Ascorbate: **15%** (`face-elixir.ts`) vs. **5.21%**
(formulas/INCI JSON); Niacinamide: **5%** (`face-elixir.ts`) vs. **2–5%**
(formulas JSON); Hyaluronic Acid: **2%** vs. a range elsewhere. Which figure
(if either) matches the actual formula is unknowable from this repository.
**No reconciliation was attempted** — every value was removed, none was
corrected, replaced with a range, or inferred. The data-integrity question
(which source was ever right) is a founder matter and is moot for the
public site now that no concentration renders anywhere.

### Verification results (three-commit state, `847faec`)

- `npx tsc --noEmit`: passed. `npm run build` (webpack): succeeded.
  `npx opennextjs-cloudflare build`: succeeded.
- Distinctive-value sweep (15%, 5.21%, 2–5%, 0.05%, 0.1–0.5%, 0.5–1%) across
  `.next` and `.open-next` text output: **zero matches**. A
  formulation-context regex (`concentration`/`percentageRange` near any
  percent) across both artifacts: **zero matches**. Remaining generic
  percent strings were classified: UI stats (95% satisfaction / 40%
  improvement marketing claims — not formulation data), CSS layout values
  (`max-width:75%`, font-size percentages), analytics/library code inside
  `node_modules`, and random byte sequences inside binary font/image files.
  **Zero unresolved product-formulation percentages.**
- Rendered validation on a real production build: `/products/body-elixir`
  shows all six ingredient names with Source/Benefits intact, no
  "Concentration:" label in visible text or raw HTML, no empty containers,
  no dangling punctuation, no layout overflow (desktop and 375px mobile),
  zero console errors, zero hydration warnings. `/products/face-elixir` and
  `/inci`: same result. All three JSON endpoints fetched directly: no real
  `percentageRange` values.
- Garamond: zero files in `.open-next`; no page requests any Garamond URL.

### Cosmetic residue — resolved (fourth commit, `498f8c4`)

The two leftovers noted above were approved and fixed as a fourth,
independent commit: intro copy no longer says "with concentrations" (now
"Explore every ingredient selected for {product.name}, complete with
benefits and safety information"); the inert "Concentration" sort button is
removed outright (not hidden) — A-Z and Safety remain, no empty control
slot, no speculative replacement filter. Verified: `tsc`, webpack build, and
OpenNext build all pass; `/products/body-elixir` renders with zero
"Concentration" string anywhere, zero console errors, layout intact at
desktop and mobile. Pushed to `origin/hotfix/inci-percentage-exposure`.

---

## 18. Live-Production Reconciliation — Corrects This Document's Central Assumption

Requested before any deployment: determine what is *actually* running on
Cloudflare production, and whether the four-commit hotfix (based on
`origin/main`) can be safely deployed onto it. This section's findings
supersede the framing in Sections 1 and 15 wherever they conflict.

### Method

No Cloudflare API, dashboard, or wrangler-authenticated access is available
in this environment — Worker version IDs, deployment timestamps, and build
IDs are **not obtainable** and are not claimed below. What is available and
was used instead: direct, unauthenticated HTTPS fetches against
`https://www.nfebeauty.com` (the production domain, confirmed reachable;
not itself declared anywhere in this repository — `wrangler.jsonc` defines
no `routes`/custom-domain binding, consistent with the existing
"deployment provenance" finding that binding configuration lives outside
this repo), comparing response content, headers, and route existence
against what each git ref actually produces.

### Findings, each independently verified

1. **Production is not `origin/main`.** `/founder-access`, `/concierge`,
   `/discovery`, `/skin-ritual-quiz`, and `/journal` all return `200` on
   production. None of these routes exist on `origin/main` at any commit —
   they were added by the feature branch. This alone rules out `origin/
   main` as the live source.
2. **Production has the full Founder Access commerce build (`d82e3a9`).**
   `/subscribe` transparently redirects to `/founder-access` (identical
   response hash and length to `/founder-access` itself) — this exact
   redirect was added by `d82e3a9`, and does not exist before it.
   `/founder-access`'s rendered HTML contains the extended form's fields
   (`ageRange`, `productInterest`, `privacyPolicyAccepted`) and does not
   contain the pre-`d82e3a9` static-placeholder copy ("Full segmentation is
   not active yet"). **The Founder Access data-collection system, which
   earlier passes of this document treated as "not yet live, requires its
   own go-live checklist," is either live now or was live at some point
   this repository cannot date — its frontend and redirect behavior are
   demonstrably live today.** Whether it is currently writing to Supabase
   cannot be determined by GET requests alone, and no POST was sent to
   production to test this, per this session's standing prohibition on
   irreversible production actions.
3. **Production predates the favicon, Our Story pilot, and homepage hero
   fidelity work (`7f31a52`, `55c9f26`, `3c1817b`, `5f6303b` — all
   2026-07-19/20).** `/icon.png`, `/favicon.ico`, and `/apple-icon.png` all
   `404`. `/our-story`'s rendered HTML contains the old medical-language
   copy ("melasma," "dermatologist") this session rewrote, and contains
   none of the pilot's markers (no YouTube embed, no `founder-hero`/
   `founder-portrait` asset references). The homepage's hero `<picture>`
   element references the single legacy file
   (`nfe-home-hero-product-vessel-desktop.webp`) through Next's runtime
   `/_next/image` optimizer — not the five static Lanczos variants
   `5f6303b` added. **This session's Our Story pilot and hero-fidelity fix,
   both explicitly "approved and closed," have never been deployed.**
4. **Production predates `4a1cc89`'s asset/copy fixes (2026-07-19).** The
   shop page serves the pre-`4a1cc89` strings ("Pre-order pathway in
   preparation," "In development") rather than the post-fix strings
   ("Founder Access opens first," "A future NFE ritual"). More seriously:
   **all four product images `4a1cc89` was written to remove are live on
   production right now, still zero bytes** —
   `/images/products/{face,body}-elixir-{hero,detail}.jpg` each return
   `200` with `0` bytes. This is a real, current, customer-facing defect —
   broken/blank product imagery on both live product pages — independent
   of confidentiality, and not fixed by anything in the hotfix branch.
5. **Production's live formulation-data paths show no real percentages —
   but not because of anything this session did.** `/data/formulas/
   faceElixir.json`, `/data/inci/faceElixir.json`, and `/data/inci/
   bodyElixir.json` were all fetched directly from production: none
   contain a non-empty `percentageRange` value. `/data/inci/bodyElixir.
   json`'s raw content is byte-for-byte the same corrupted `.NET`-
   serialization structure (`Count`, `Length`, `SyncRoot`, `IsFixedSize`,
   etc.) identified in Section 7 as introduced by `b70dab5` — direct proof
   `b70dab5` (2026-06-22) is live, and that its incidental stripping of the
   `percentageRange` field (a side effect of the corruption, not a
   deliberate fix) already closed this specific exposure on production,
   weeks before this session's confidentiality-patch work began. **The
   premise stated in Section 1 and Section 15 — "`origin/main`'s live,
   indexed `/inci` page currently displays these percentages to any
   visitor, today" — was true of `origin/main`'s file content and was
   never checked against the actual production site until this pass. It
   does not hold for production.** `/products/body-elixir` was also
   checked directly: it does not use `IngredientList`/`BenefitsTable`/
   `bodyElixirData` at all — it renders an accordion-based page (`ElixirEditorialPage` /
   `ProductAccordion`, from `20ee75b`'s atelier rebuild) fed by `data/
   products/*.json`, which was checked and contains no percentage or
   concentration field of any kind, on either `origin/main` or the feature
   branch. **`IngredientList.tsx`, `bodyElixirData`, and `faceElixirData` —
   everything the hotfix's third and fourth commits patched — are confirmed
   dead code on the feature branch** (`git grep` across
   `feature/nfe-digital-maison-upgrade` finds no importer of `IngredientList`
   or either data object outside their own definition files) **and are not
   what production is running for its product pages either.**

### What this means for the hotfix as constructed

The hotfix branch is fully built, typechecks, builds under both pipelines,
and does exactly what it was scoped to do — but its scope was set against
the wrong baseline. Two independent problems, not one:

- **Deploying it would cause a severe, unintended regression.** Because
  the branch is rooted at `origin/main`, deploying it would take
  production backward: the Atelier/accordion product pages would revert to
  the older `IngredientList`/`BenefitsTable` tree; the full Founder Access
  build (currently live) would be replaced by, at best, whatever partial
  state exists between `origin/main` and wherever production actually sits;
  the already-live `/subscribe` → `/founder-access` redirect, the atelier
  shop copy, and other weeks-old live behavior would all be reverted to a
  pre-`d82e3a9` state. This is a regression across nearly every route
  checked, not a targeted fix.
- **The specific percentages it removes are not the ones currently exposed
  to the public**, because production's own accidental history (`b70dab5`'s
  corruption) already closed that specific gap, and production's actual
  product-page architecture never used the component tree the hotfix's
  third and fourth commits patched.

Neither problem is small enough to route around by adjusting the hotfix in
place. The confidentiality intent behind the hotfix remains sound — the raw
percentages still exist in the repository, `data/inci/faceElixir.json` and
its public/private counterparts still carry them without corruption on
`origin/main` and (unverified) possibly at whatever commit production
actually runs, and a future deploy from a different base could
reintroduce a real exposure. But **this specific branch, deployed as-is,
does not solve a current problem and creates a severe one.**

### Genuinely live, current risks (independent of the hotfix)

1. **Broken product images** — zero-byte files served at four URLs on two
   live product pages, today.
2. **Deployment provenance remains unresolved and is now proven more
   severe than previously stated.** Production cannot be mapped to any
   single commit: it is provably after `d82e3a9` (2026-07-12) and provably
   before `4a1cc89` (2026-07-19 morning) — a nine-day window containing six
   commits (`4d86fec`, `8e3357c`, `2eede3b`, `2474aff`, `ed824bb`,
   `a4b6f83`) — but none of those six change anything externally observable
   this pass checked, so the exact commit cannot be pinpointed further from
   outside evidence. **No git commit is asserted as "the" production
   commit** — only this bounded window, per instruction.
3. **The controlled-release Founder Access question (Section 9) may be
   moot or already decided by facts on the ground** — if Founder Access's
   backend is genuinely collecting signups against production Supabase
   right now, "should Founder Access ship" is not the live question;
   "is Founder Access's current production configuration correct and
   monitored" is. This audit cannot determine which, without either
   Cloudflare/Supabase dashboard access or an authorized live-write test,
   neither of which this pass performed.

### Candidate impact classification

| Surface | Hotfix-vs-production classification |
|---|---|
| `/founder-access`, `/subscribe` redirect, Founder Access form fields | **Unintended regression** if the hotfix (origin/main-based) is deployed — production's live commerce build would be replaced by an inert placeholder |
| `/products/face-elixir`, `/products/body-elixir` (Atelier/accordion structure) | **Unintended regression** — production's current architecture would revert to the older `IngredientList` tree the hotfix patched, which production is not even running |
| Homepage hero, favicon, Our Story content | **Uncertain / already-live difference preserved** — these are already absent from production regardless of the hotfix (production predates them); the hotfix neither adds nor removes them since it's rooted below all three |
| `/data/formulas/faceElixir.json`, `/data/inci/*.json` percentage values | **Already-live difference preserved, not an intended hotfix fix** — production already shows no real values, independent of and before this session's patch existed |
| Zero-byte product images | **Uncertain because production provenance is unknown**, but confirmed as a real, current defect regardless of which release path is chosen — not addressed by the hotfix, not caused by it |
| Garamond fonts | **Live on production today** (`200` for all three files) — the hotfix's removal, if deployed on a corrected base, would be an intended, safe fix with no observed counter-evidence |

### Safe release-construction options — evaluated

- **A. Deploy current hotfix branch from `origin/main`: rejected.** Proven
  above to cause a severe regression across Founder Access and the product
  pages. Does not meet "only acceptable if production comparison proves no
  reversion" — the comparison proves the opposite.
- **B. Apply the four hotfix commits onto the exact deployed source commit:
  not currently executable.** The exact deployed commit cannot be
  identified from available evidence (see the nine-day window above). This
  remains the preferred path in principle once the exact commit — or
  Cloudflare deployment metadata that names it — becomes available.
- **C. Apply the confidentiality changes onto a branch proven to match
  current production: not currently executable either**, for the same
  reason — no branch in this repository has been proven, only narrowed to
  a window. The feature branch tip is a closer *functional* match (it has
  Founder Access, the atelier pages, and the routes production has) but is
  proven to be *ahead* of production (it has the Our Story pilot, favicon,
  and hero fix production doesn't have) — deploying the full feature
  branch would not regress anything found live, but would not be "proven
  equivalent" either, and was not authorized for deployment by this pass.
- **D. Cloudflare-level rollback/version strategy: cannot be determined
  from this environment.** No Cloudflare API or dashboard access is
  available here. If Cloudflare's dashboard supports retaining or
  restoring a specific Worker version independent of git history, that
  capability was not verified and cannot be documented from code or public
  HTTP responses alone. **Stated plainly, per instruction: this cannot be
  confirmed one way or the other from this environment.**

**No path is recommended for immediate execution.** The evidence-backed
next step is identifying the exact deployed commit or obtaining Cloudflare
deployment metadata that names it — from whoever has dashboard/wrangler
access — before constructing any deploy candidate.

### Pre-deploy snapshot (what could be captured vs. what could not)

- ~~Cloudflare Worker version/deployment ID~~ — not obtainable, no API
  access.
- ~~Deployment timestamp~~ — not obtainable.
- ~~Environment binding names~~ — not obtainable.
- ~~Custom-domain routing~~ — not obtainable from this repo (`wrangler.jsonc`
  defines no routes).
- **Route smoke-test results** — captured above (Section 18 findings), full
  detail preserved in this session's fingerprint output.
- **Production asset/route content hashes for the routes checked** —
  captured this pass (available on request; omitted here for length).
- **No Git tag was created.** Per instruction, no tag claiming to represent
  production was made, since the exact deployed commit is not proven.

### Cache-purge plan — unchanged, still applies once a safe candidate exists

The Section 15 purge target list (`/inci`, both product pages, the JSON
paths, RSC payload variants) remains correct regardless of which base a
future, corrected candidate is built from — the caching mechanism doesn't
change; only the deploy source does.

## 19. Founder Decisions Required

**New, highest-priority item given Section 18:**

0. **Identify the exact deployed production commit, or obtain Cloudflare
   deployment metadata that names it**, from whoever has dashboard/wrangler
   access. This blocks constructing any safe hotfix or release candidate —
   without it, neither Method B (apply the hotfix commits onto the deployed
   source) nor Method C (prove a branch matches production) is executable,
   per Section 18. In parallel: confirm through Cloudflare/Supabase
   dashboard access whether Founder Access is actually writing to
   production right now — this document did not and should not test that
   with a live write.

Carried forward, materially affected by Section 18's findings:

1. **Coherent Founder Access state:** may already be decided by facts on
   the ground (Section 18, finding 2) rather than a choice still open —
   confirm whether the live system is actively collecting signups before
   treating this as a forward-looking decision.
2. **Confidentiality patch deployment: HOLD.** The four-commit hotfix
   (`bf9ba21`, `9cc2e0a`, `847faec`, `498f8c4`) is fully built, tested, and
   pushed to `origin/hotfix/inci-percentage-exposure`, but must not be
   deployed from its current base (Section 18). Once item 0 is resolved,
   the same confidentiality intent should be re-applied onto whichever base
   is proven safe.
3. **Garamond licensing:** confirm self-hosted webfont redistribution
   rights, or proceed with removal (verified safe this pass, and confirmed
   still live on production today per Section 18).
4. **Malformed JSON:** confirm removal (verified safe this pass on the
   feature branch; also confirmed live on production today per Section 18,
   finding 5, where it incidentally serves as evidence of `b70dab5`'s
   deployment).
5. **Cache purge ownership:** confirm who validates the Cloudflare cache
   purge once a real deploy occurs.
6. **Broken product images (Section 18, finding 4):** four zero-byte files
   are live on two product pages today, independent of every other
   question in this document — worth its own minimal fix once the
   provenance question is resolved enough to build one safely.
7. **Face Elixir 30ml/50ml and Body Elixir 200ml/125ml/75ml:** still require
   verification against physical packaging (Section 10).
8. **Founder Access go-live confirmation** — see item 0; this may already
   have happened rather than being a future decision.

**No deployment scope has been authorized by this document.**
