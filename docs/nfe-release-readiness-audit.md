# NFE Maison — Release-Readiness Audit

**Status:** Complete audit + release-candidate clarification pass.

**Disposition: HOLD CONTROLLED RELEASE DEFINITION**

The prior disposition on this document (READY FOR CONTROLLED FEATURE RELEASE)
is withdrawn. It named a desired logical scope ("the branch minus Founder
Access") without identifying an exact deployable Git tree, without verifying
that Founder Access behavior is actually excluded by that scope, and without
running a candidate build. This revision does all three. It also corrects two
material errors in the original pass (Section 7 and Section 10).

**Audit HEAD:** `54bdb4db` seed → completed at `c62494a` (first pass) → this
clarification pass adds no new commits to the feature branch itself; it
defines and tests a **candidate tree** without merging or pushing it.
**Compared against:** `origin/main` @ `4f2c411`
**Date completed:** 2026-07-20

**Authorization boundary for this document:** documentation and read-only
verification only. Two isolated, detached git worktrees were created under
the scratch directory to test cherry-pick and revert mechanics; both were
removed after inspection. No branch was created in the actual repository, no
branch was pushed, and the working tree was not modified except for this
file.

---

## 1. Executive Summary

This pass answers the question the first audit left open: **what exact tree
ships if Founder Access is excluded, and does excluding it actually exclude
it?**

**Finding 1 — the exact tree is now identified and proven, not assumed.**
Two independent construction methods were tested:

- **Cherry-pick 38 commits onto `origin/main`** (Option A), skipping
  `d82e3a9`, `4d86fec`, `8e3357c`, `2eede3b`, `2474aff`.
- **Revert those same 5 commits on top of the feature branch tip `c62494a`**
  (Option B).

Both were executed for real in isolated worktrees (not the working repo).
**Both produced the identical resulting tree** — verified by comparing git
tree hashes directly, not by inspection. Option B is recommended: 5 revert
operations versus 38 ordered cherry-picks, same result, and it preserves the
historical record that Founder Access was built and deliberately held back
rather than erasing it from the branch's own history.

**Finding 2 — "excluded" was wrong as originally stated. Nav-hiding does not
exclude Founder Access, and reverting the three named commits does not fully
exclude it either.** The candidate tree (either construction method) still
contains, natively authored inside nine *other* commits this audit classified
"ready to ship": CTAs on the homepage (×2), Shop (×2), Concierge, Discovery
(×2), the Skin Ritual Quiz's result-routing logic, an Article Related Links
component, a Journal Article Card component, and two Atelier components — all
linking to `/founder-access`. The route is also in `sitemap.ts` and is not
disallowed in `robots.ts`. What reverting the 5 commits *does* remove: the
extended-fields intake form, the dedicated `founder_access_signups` Supabase
table, the Upstash rate limiter wired to it, the footer link, and the
`/subscribe → /founder-access` redirect. What it does *not* remove: the route
itself (added earlier, in `b70dab5`), its ~10 site-wide CTAs, or general
email capture — `/subscribe`'s pre-revert form still posts to `/api/subscribe`,
which already writes to Supabase and calls Beehiiv/Resend **on `origin/main`
today**, independent of this branch entirely.

**Finding 3 (correction) — the malformed `public/data/inci/faceElixir.json`
was introduced by this branch, not pre-existing.** The original audit's
Section 7 stated this without checking blame. It was wrong. `b70dab5`
rewrote this file from a clean array into the corrupted structure.

**Finding 4 (correction, more consequential) — `origin/main`'s live,
publicly-indexed `/inci` page currently renders real formulation
percentages** (Niacinamide 2–5%, Tranexamic Acid 3%, Alpha-Arbutin 2%, Kojic
Dipalmitate 2%, and more) via `public/data/formulas/faceElixir.json`, which
`INCILists.tsx` fetches and renders per-ingredient today. The original audit
checked this file's content on the *branch* and correctly found no
percentages — but never checked what is *currently live on `origin/main`*,
and did not connect that this branch's `b70dab5` commit strips the
percentages from the exact file the live page renders. **This branch fixes a
real, current confidentiality exposure on production, as a side effect of
unrelated homepage-rebuild work, while its corrupted-JSON side effect
(Finding 3) is cosmetic by comparison.** Neither fact was visible in the
first pass. See Section 7.

**Finding 5 — the Garamond font binaries predate this branch (added
2025-11-14) and are not loaded by any `@font-face` or `next/font` rule in
either tree, but remain tracked under `public/` and are therefore
statically servable by URL regardless of that fact.** "Unused" does not mean
"not shipped." See Section 8.

**Revised disposition:** HOLD CONTROLLED RELEASE DEFINITION. Not because the
work is unsound — the candidate tree typechecks, builds under the project's
actual `next build --webpack` script, and builds under
`opennextjs-cloudflare build` (all three tested for real, Section 5) — but
because founder decisions are still required on exactly what "Founder Access
excluded" is allowed to mean (Section 9), on the font binaries (Section 8),
and on the now-corrected confidentiality picture (Section 7), before a
release branch is actually created.

---

## 2. Branch & History Verification

Unchanged from the first pass — still accurate, re-stated for completeness:

- Merge base `4f2c411826c1c950c3385759084a9e56a87a9102`, identical to
  `origin/main`'s tip. 43 commits ahead (42 + the first audit's own commit
  `c62494a`), 0 behind, linear history, zero merge-conflict markers.
- No CI/CD exists; deploys are manual (`npm run deploy`).

---

## 3. Commit Classification

Unchanged from the first pass (Section 3 of the prior version), with one
correction: Group 2 (`b70dab5` and siblings) should now also be understood as
the commit that (a) introduced the `/founder-access` CTA links found in
Section 9 below, and (b) both fixed the live percentage exposure and
corrupted the unused public INCI duplicate (Section 7). This does not change
its "ready after regression test" classification — the net effect of
`b70dab5` on confidentiality is positive — but the full picture belongs here,
not just in the new sections.

---

## 4. Route-by-Route Inventory

Unchanged from the first pass.

---

## 5. Release Candidate Construction — Three Methods, Tested

### Method A — Cherry-pick onto `origin/main`

**Procedure tested:** detached worktree at `origin/main` (`4f2c411`); cherry-
picked the 38 commits from the branch's 43, in original chronological order,
skipping `d82e3a9`, `4d86fec`, `8e3357c`, `2eede3b`, `2474aff`.

- **Result:** all 38 applied with **zero conflicts**.
- **Resulting tree:** identical (by tree-hash comparison, see Method B) to
  Method B's result.
- **Routes present / API routes present / redirects present:** identical to
  Method B — see that subsection, not duplicated here.
- **Dependency conflicts:** none encountered, but this is fragile in
  principle — the sequence depends on replaying 38 commits in the exact
  original order (several touch `src/app/page.tsx` and `shop/page.tsx`
  repeatedly); any future amendment to the source branch would require
  redoing the full sequence.
- **Build result:** not independently re-run — moot, since the tree is
  byte-identical to Method B's, which was built successfully three ways
  (Section 6).
- **Rollback complexity:** N/A in the traditional sense — this produces a new
  branch from scratch each time; there is nothing to roll back on the
  release branch itself, only a decision to not deploy it.

### Method B — Revert on top of the feature branch tip (recommended)

**Procedure tested:** detached worktree at the feature branch tip (`c62494a`);
reverted, in reverse-chronological order, `2474aff`, `2eede3b`, `8e3357c`,
`4d86fec`, `d82e3a9`.

- **First attempt reverting only the three named commits (`d82e3a9`,
  `4d86fec`, `8e3357c`) failed**: `git revert` hit a modify/delete conflict
  on `scripts/closeout-founder-access-production.mjs`, because `2eede3b` and
  `2474aff` (Group 9, "internal documentation only" in Section 3) modified a
  file that `8e3357c` created — those two must be reverted alongside Group 8
  for a clean result. This is exactly the kind of thing "ship the branch
  except commits X, Y, Z" glosses over.
- **Second attempt, reverting all five in the correct order, applied with
  zero conflicts.**
- **Resulting tree:** confirmed identical to Method A by direct tree-hash
  comparison (`git rev-parse HEAD^{tree}` matched exactly between the two
  worktrees).
- **Routes present:** every route from the first audit's Section 4 *except*
  the extended-form behavior at `/founder-access` (reverts to a static,
  87-line "not fully active yet" page — see below) and the `/subscribe`
  redirect (reverts to the pre-existing email-capture form).
- **API routes present:** `/api/founder-access` is deleted entirely (the
  file was added by `d82e3a9`, nothing else depends on it — confirmed via a
  full-tree grep for dangling imports after the revert, none found).
  `/api/subscribe` remains, unchanged from what's already on `origin/main`
  plus `ebfbe65`'s attribution/tagging additions.
- **Redirects present:** the `/founders-access → /founder-access`
  `next.config.mjs` redirect (unrelated to Group 8, added by `d82e3a9` as
  part of a larger config change — confirmed this specific redirect rule
  predates Group 8 and survives the revert) still applies. `/subscribe`'s
  *in-page* `redirect('/founder-access')` (added by `d82e3a9`) does not
  survive — subscribe reverts to serving its own form directly.
- **Navigation exposure:** Footer link removed. Nine other CTAs (Section 9)
  remain, unchanged, because they were never part of Group 8.
- **Form submission behavior:** `/founder-access` in the reverted tree has no
  form at all — it is static copy whose only link points to `/subscribe`.
  `/subscribe`'s form still submits to `/api/subscribe`, which is
  unmodified by this revert.
- **Environment-variable behavior:** unchanged for `/api/subscribe` (already
  live on `origin/main`). Moot for `/api/founder-access` since it no longer
  exists in this tree.
- **Build result:** see Section 6 — typecheck, `next build --webpack`, and
  `opennextjs-cloudflare build` all succeeded against this exact tree.
- **Rollback complexity:** low. The five original commits remain in git
  history (revert does not rewrite history); reverting the revert
  (`git revert <revert-commit>`) would cleanly restore Founder Access if a
  future decision reverses course. This is the main structural advantage
  over Method A, whose cherry-picked branch has no record of Founder Access
  ever having been considered.

### Method C — Keep Founder Access code, prove it dormant and unreachable

**Not achievable on the current code without further changes — tested and
rejected, not merely assumed.**

- The route has no server-side or build-time gate. Next.js renders
  `src/app/founder-access/page.tsx` and serves `src/app/api/founder-access/
  route.ts` regardless of environment configuration; there is no feature
  flag, no env-var check that disables the route itself.
- Env-var behavior at the API layer, verified by reading the route and its
  three dependencies line by line (Section 9): missing `SUPABASE_SERVICE_
  ROLE_KEY` causes `createAdminSupabase()` to throw, caught by the route's
  try/catch, returning a 500 to the submitting user — the route *fails*, it
  does not silently no-op, and it does not prevent the route from being
  requested and attempted. Missing `RESEND_API_KEY` degrades silently (the
  code explicitly checks `if (process.env.RESEND_API_KEY)` before sending —
  DB write still succeeds if Supabase is configured). Missing
  `BEEHIIV_API_KEY` degrades silently (`syncBeehiivSubscriber` returns
  `{status: 'skipped', reason: 'beehiiv_not_configured'}`, does not throw).
  Missing Upstash vars: `checkSubscribeRateLimit` returns `'allow'` — fails
  open, not closed.
- **Net effect:** with a fully unconfigured production environment, a
  visitor who finds `/founder-access` (it's in the sitemap; it doesn't need
  to be "found," it's indexed) and submits the form gets a 500 error — not a
  silent no-op, not a 404. With Supabase configured but nothing else, the
  signup **is written to the database**, no confirmation email sent. There
  is no environment-variable combination that makes this route inert in the
  sense the option's own description requires ("completely dormant and
  unreachable").
- Making Method C true would require an actual code change: a build-time or
  server-side kill switch that returns 404 (matching the existing pattern
  already used for `/dev/token-specimen`) regardless of env-var state. That
  code does not currently exist for this route. No such change was made in
  this pass — recommending it is not the same as doing it.
- **Recommendation: reject Method C as currently specified.** If keeping the
  code present but inert is genuinely wanted, it would need the same
  `notFound()`-in-production guard pattern already proven on the token
  specimen page — a small, well-precedented change, but a real code change
  requiring its own authorization, not a property of the branch as it
  stands today.

### Recommended method

**Method B** — revert `2474aff`, `2eede3b`, `8e3357c`, `4d86fec`, `d82e3a9`
(in that order) on top of `c62494a`. Lower mechanical risk than Method A for
an identical result, and preserves rollback-ability and historical honesty
that a cherry-picked branch would lose.

**No release branch was created from this method in the actual repository.**
This section documents a test performed in a disposable, already-removed
worktree.

---

## 6. Candidate Tree — Build Verification (executed, not assumed)

Run against the Method B candidate tree in its isolated worktree:

| Step | Command | Result |
|---|---|---|
| Clean install | `npm install` | Succeeded — 1792 packages |
| Typecheck | `npx tsc --noEmit` | **Passed**, exit 0, zero errors |
| Production build (correct script) | `npm run build` (= `next build --webpack`) | **Succeeded**, exit 0 |
| Cloudflare/OpenNext build | `npx opennextjs-cloudflare build` | **Succeeded**, exit 0 |

One methodology note, disclosed rather than hidden: an initial build attempt
used a bare `npx next build`, which under Next.js 16 defaults to Turbopack
and failed on an unrelated SCSS `@import`-deprecation/CSS-parsing error. That
failure was reproduced identically on the **unmodified feature branch tip**
(`c62494a`, no revert applied) — proving it is a Turbopack-specific
pre-existing condition, not something this pass introduced, and not
representative of the real build since the project's actual `package.json`
`build` script explicitly forces `--webpack`. Both trees build cleanly under
the script that's actually used.

No dangling imports of any deleted Founder Access file were found anywhere
in `src/` after the revert (`FounderAccessForm`, `FounderAccessTracker`,
`founder-access/validation`, `founder-access/options`, `api/founder-access`
all checked by name).

---

## 7. Asset & Media Findings (corrected from the first pass)

### Malformed `public/data/inci/faceElixir.json` — corrected origin

The first pass's Section 7 stated this file's malformed structure was
unexamined for origin and implicitly treated it as pre-existing. **That was
not verified and was incomplete.** Checked properly this pass via `git log
--follow` and `git show b70dab5 -- <path>`:

- At `0177b45` (2025-11-14, already on `origin/main`) and still on
  `origin/main` today, this file is a **clean, well-formed JSON array**.
- `b70dab5` (this branch, 2026-06-22) rewrote it into the corrupted
  `.NET`-serialization-artifact structure (`Count`, `SyncRoot`,
  `IsFixedSize`, etc.) described in the first pass.
- **This branch introduced the malformation. It is not pre-existing.**
- Confirmed (unchanged from the first pass): no source file fetches
  `/data/inci/*` at runtime — `INCILists.tsx` fetches `/data/formulas/*`
  only. The malformed file is dead but still statically servable.
- Confirmed: removing it would not break anything (nothing references it);
  `data/inci/bodyElixir.json` and its public counterpart remain
  byte-identical and are unaffected by any faceElixir-only cleanup.
- **Recommendation, per instruction: remove `public/data/inci/
  faceElixir.json` from the release candidate tree.** Not repaired, not
  replaced with reconstructed data — removed. Not yet performed; this is a
  recommendation for whoever constructs the actual release branch.

### Formulation-percentage exposure — new finding, more consequential

Checked this pass, not checked in the first pass: what `origin/main`
currently serves, not just what this branch contains.

- `public/data/formulas/faceElixir.json` on **`origin/main` today** contains
  28 occurrences of `percentageRange` with real values: Niacinamide 2–5%,
  Tranexamic Acid 3%, Alpha-Arbutin 2%, Kojic Dipalmitate 2%, and others.
  `public/data/inci/faceElixir.json` and `public/data/inci/bodyElixir.json`
  on `origin/main` carry the same kind of data (4 occurrences on the body
  file).
- `src/components/education/INCILists.tsx` fetches `/data/formulas/
  faceElixir.json` at runtime and explicitly renders `item.percentageRange`
  when present (`{item.percentageRange && (<p ...>{item.percentageRange}
  </p>)}`).
- `/inci` (`src/app/(education)/inci/page.tsx`) renders `INCILists`, is
  listed in `sitemap.ts`, and is not disallowed in `robots.ts`.
- **Conclusion: `origin/main`'s live, indexed `/inci` page currently
  displays real Face Elixir formulation percentages to any visitor. This is
  a present-tense condition on production today, independent of whether
  this branch ships.**
- On this feature branch (`b70dab5` onward), `data/formulas/faceElixir.json`
  and its public copy contain **zero** `percentageRange` occurrences — the
  field was stripped. Whether this was a deliberate confidentiality fix or
  an incidental effect of restructuring the homepage's data files is not
  determinable from the commit alone (the commit message does not mention
  it); the effect is real regardless of intent.
- **This means shipping this branch — under any of the three release
  methods above — removes a real, currently-live confidentiality exposure.**
  That is a point in favor of moving forward, not a blocker, but it belongs
  in the record precisely because the first pass's Section 10 said "no
  percentage/concentration data" found without disclosing that this was
  true only of the branch, not of what's currently live.

### Everything else from the first pass's Section 7

Unchanged and re-confirmed: no zero-byte images; the broken `/images/logo/
nfe_logo.png` reference in `ArticleJsonLd.tsx` remains confirmed pre-existing
on `origin/main` (this was correctly checked via `git show origin/main:...`
in the first pass); favicon/icon correct; Our Story video/photo assets
correct.

---

## 8. Garamond Font Binaries

| Path | Type | Tracked? | Referenced? | In production build? | Publicly servable? |
|---|---|---|---|---|---|
| `public/fonts/garamondpremrpro.otf` | OpenType, 428,520 bytes | Yes, normally tracked (not gitignored) | No `@font-face` or `next/font` loader anywhere in `src/` | Yes — anything under `public/` ships in the build artifact verbatim | **Yes** — at its literal path, regardless of CSS usage |
| `public/fonts/garamondpremrpro.woff` | WOFF, 273,412 bytes | Same | Same | Same | Same |
| `public/fonts/garamondpremrpro.woff2` | WOFF2, 206,616 bytes | Same | Same | Same | Same |

- **Origin:** added at commit `0177b45`, 2025-11-14 — **pre-existing on
  `origin/main`, not introduced by this branch.** True in both trees
  regardless of which release method is chosen.
- **Reference check:** `--font-primary: "Garamond Premier Pro", Georgia,
  serif` in `src/styles/tokens.scss` is a CSS font-family fallback stack
  only — no `src: url(...)` rule loads the binary. The dev-only token
  specimen page (`src/app/dev/token-specimen/page.tsx`) explicitly documents
  "Garamond web embedding is unapproved" and confirms Georgia is what
  actually renders. **No page currently causes a browser to download these
  files.**
- **The distinction that matters, per instruction:** being unreferenced in
  CSS does not stop Next.js/Cloudflare from serving the binary if requested
  directly by URL. The files are tracked, they are under `public/`, and
  `wrangler.jsonc` serves `.open-next/assets` (which includes everything
  under `public/`) as static assets with no path-level access control. The
  repository's own distribution — not any page's markup — is what exposes
  them.
- Font files were not opened, copied, or reproduced beyond the metadata
  above, per instruction.
- **Recommendation: remove the three files from the release tree, or hold
  release pending confirmed licensing for self-hosted webfont
  redistribution.** "Unused" is not being treated as sufficient protection,
  per instruction. Not yet performed — this predates the current branch and
  is present in `origin/main` today regardless of this release decision, so
  it is flagged as a standing item requiring its own resolution, not
  something this branch caused or can unilaterally fix by itself.

---

## 9. Founder Access — Full Exposure Map (supersedes the first pass's framing)

Checked item by item, per instruction, rather than asserted:

| Surface | Present in current feature tree? | Present after Method B revert? |
|---|---|---|
| `/founder-access` route | Yes (`b70dab5`, extended by `d82e3a9`) | Yes — reverts to `b70dab5`'s original 87-line static page (no form) |
| `/subscribe` redirect to `/founder-access` | Yes (`d82e3a9`) | No — reverts to `/subscribe`'s own form |
| `/founders-access` → `/founder-access` config redirect | Yes (`next.config.mjs`, added alongside `d82e3a9`) | Yes — this specific redirect rule is not part of the file/line the revert touches |
| `/api/founder-access` endpoint | Yes (`d82e3a9`) | **No — file deleted entirely** |
| Supabase calls (founder-access-specific table) | Yes, `founder_access_signups` (`d82e3a9`) | No — table/migration file removed from tree (does not undo anything already applied to a live database) |
| Supabase calls (general `subscribers` table, via `/subscribe`) | Yes — **also present on `origin/main` today, independent of this branch** | Yes — unaffected by the revert, because it predates Group 8 |
| Beehiiv calls | Yes, both via founder-access-specific tagging (`d82e3a9`) and via general subscribe (`ebfbe65`, pre-existing pattern on main) | Founder-access-specific tagging removed; general subscribe sync remains |
| Resend calls | Yes, both paths | Founder-access-specific emails removed; `/subscribe`'s existing Resend usage remains |
| Upstash rate limiting | Yes, wired specifically to founder-access via `checkSubscribeRateLimit` (shared with `/subscribe`) | Limiter function remains (used by `/subscribe`, pre-existing); founder-access-specific route that called it is gone |
| Form submission path | Yes, full extended-field form (`FounderAccessForm.tsx`) | No form on `/founder-access` after revert; `/subscribe`'s own simpler form is unaffected |
| Sitemap entry | Yes, `/founder-access` listed | **Still yes** — sitemap.ts is not touched by Group 8, so this is unchanged by any revert-only approach |
| Robots behavior | `/founder-access` not disallowed; `/api/` is disallowed (irrelevant to POST reachability) | Unchanged |
| Footer link | Yes (`d82e3a9`) | **No — removed** |
| Header link | Not found in `PrimaryNav.tsx` in any commit | N/A |
| Homepage CTA (×2) | Yes — native to `b70dab5` and `aff206a`, **not Group 8** | **Still present** |
| Shop CTA (×2) | Yes — native to `20ee75b`, **not Group 8** | **Still present** |
| Concierge CTA | Yes — native to `061a98f`, **not Group 8** | **Still present** |
| Discovery CTA (×2) | Yes — native to `b70dab5`/`948f231`, **not Group 8** | **Still present** |
| Skin Ritual Quiz — `founder_access` is a full result-routing state, primary+secondary CTAs | Yes — native to `733b061`, **not Group 8** | **Still present, including the result-state logic itself** |
| Article Related Links CTA | Yes — native to `a9a6110`, **not Group 8** | **Still present** |
| Journal Article Card CTA | Yes — native to `a9a6110`, **not Group 8** | **Still present** |
| Atelier Maison Links / Elixir Editorial CTA (×2) | Yes — native to `20ee75b`, **not Group 8** | **Still present** |

**Bottom line, stated plainly:** reverting Group 8 (+9) removes the dedicated
allocation *experience* — its form, its table, its dedicated API, its
footer link, its subscribe-redirect hijack. It does **not** remove Founder
Access as the site's primary calls-to-action, because nine other commits
this audit classifies "ready to ship" were themselves authored to point at
`/founder-access` as their conversion destination. Calling that state
"Founder Access excluded" or "Founder Access unlinked" would be false. The
accurate description is: **the dedicated data-collection backend is
removed; the front-end funnel still points at a now-static placeholder page
whose only action is a link to the pre-existing `/subscribe` form** (which
itself already writes to Supabase and calls Beehiiv/Resend, on `origin/main`
today, unrelated to this branch).

---

## 10. Product-Size Classification (language corrected per instruction)

**Face Elixir 30ml/50ml contradiction:**
- Existing production defect. Confirmed via `git show origin/main:src/
  components/products/face-elixir/FaceElixirFAQ.tsx` — the conflicting text
  predates this branch.
- Not introduced by this branch. `20ee75b` modified this file but did not
  create the contradiction (verified by diffing against the pre-`20ee75b`
  parent — the 30ml/50ml text is unchanged by that commit).
- Founder verification required against physical packaging before any copy
  change. Not expanded, rewritten, or duplicated anywhere in this branch or
  this audit pass.
- **Exact affected surface, listed precisely, not summarized:**
  - `src/components/products/face-elixir/FaceElixirFAQ.tsx` (lines 38–39) —
    imported into `src/app/products/[slug]/ProductPageClient.tsx`, rendered
    live at `/products/face-elixir`. **This is the only reachable,
    customer-facing instance.**
  - `src/components/products/FaceElixirSections.tsx` (lines 44, 54, 57) —
    contains the same contradiction but is **not imported anywhere in
    `src/app/`** — confirmed via a repo-wide grep for the component name.
    Dead code, not customer-facing.

**Body Elixir 200ml vs. 125ml/75ml:**
- Internal-source contradiction. `src/content/products/body-elixir.ts`
  (lines 112, 116) consistently states 200ml in every place it appears in
  shipped code, on both `origin/main` and this branch.
- The only conflicting figures (125ml/75ml) come from a Maison design
  package reference, not any code path — confirmed not customer-facing by
  the same grep methodology used for Face Elixir (no 125ml/75ml string
  found anywhere in `src/`).
- No public correction made or implied by inference in this document.

No product copy was changed in the course of producing this document.

---

## 11. Revised Deployment Options — Exact Commits

Supersedes the first pass's Section 11. Base commit for all three:
`origin/main` @ `4f2c411`. Candidate HEAD in each option refers to the
**Method B worktree result** (Section 5), not yet created as a real branch.

### Option A — Hold (no new production surface)
- **Base:** N/A. **Included commit range:** none.
- **Excluded:** all 43 commits remain on `feature/nfe-digital-maison-
  upgrade`, unmerged.
- **Resulting route inventory / API inventory:** unchanged from current
  production.
- **Required environment variables / migrations:** none.
- **Expected build artifact:** unchanged from current production.
- **Rollback commit/tag:** N/A.
- **Risk level:** none.
- Not recommended as a terminal state — see Section 1.

### Option B — Controlled release via Method B revert (recommended construction, not yet authorized to execute)
- **Base:** `feature/nfe-digital-maison-upgrade` @ `c62494a`.
- **Exact excluded commits:** `d82e3a9`, `4d86fec`, `8e3357c`, `2eede3b`,
  `2474aff` (reverted via 5 new commits, applied in reverse-chronological
  order, on a new branch — e.g. `release/2026-07-controlled`).
- **Exact included commits:** the other 38 (all of `feature/nfe-digital-
  maison-upgrade` minus the 5 above), plus the 5 revert commits themselves.
- **Additional required action before this option is truly "Founder Access
  excluded" in fact, not just backend-excluded:** a decision on the ~10
  remaining CTAs (Section 9) — either accept they point to a static,
  honest "not fully active yet" placeholder page (the `b70dab5` original
  copy already says exactly that), or edit those nine files to point
  elsewhere. **This document does not recommend editing product CTAs by
  inference — that is a founder decision**, not a technical default.
- **Recommended pre-release cleanup, not yet performed:** remove `public/
  data/inci/faceElixir.json` (Section 7); resolve the Garamond font
  question (Section 8).
- **Resulting route inventory:** Section 4's list, minus `/api/founder-
  access`; `/founder-access` present as a static page; `/subscribe` present
  as its own form (not a redirect).
- **Resulting API inventory:** everything in Section 4 except `/api/
  founder-access`.
- **Required environment variables:** none newly required by this option —
  the one system with a hard environment dependency (Founder Access's
  Supabase table) is exactly what's excluded. `/api/subscribe`,
  `/api/concierge` need their existing Resend/Beehiiv keys, same as they do
  on `origin/main` today for subscribe.
- **Required migrations:** none — `migration_founder_access_signups.sql` is
  removed from this tree, not applied.
- **Expected build artifact:** verified in Section 6 — typecheck, webpack
  build, and OpenNext/Cloudflare build all succeed against this exact tree.
- **Rollback commit/tag:** tag the pre-deploy HEAD of the new release branch
  before deploying; rollback reverts to that tag. Because Method B's
  approach is itself a revert (not a rewrite), reversing course later
  (re-enabling Founder Access) is a further `git revert` of the revert
  commits — no history loss either direction.
- **Risk level:** low-to-medium, contingent on the founder decision above
  about the remaining CTAs.

### Option C — Full feature-branch release (Founder Access live)
- **Base:** `feature/nfe-digital-maison-upgrade` @ `c62494a` directly, no
  construction needed.
- **Exact included commits:** all 43.
- **Exact excluded commits:** none.
- **Resulting route/API inventory:** Section 4's full list, unmodified.
- **Required environment variables:** `SUPABASE_SERVICE_ROLE_KEY`,
  `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`/`TOKEN`, `BEEHIIV_API_KEY` all
  confirmed present in the Cloudflare Worker's production bindings —
  **unverifiable from this repository.**
- **Required migrations:** `supabase/migration_founder_access_signups.sql`
  applied to the production database, RLS confirmed active there —
  **unverifiable from this repository.**
- **Expected build artifact:** not independently re-tested this pass (the
  first pass's Lighthouse/manual QA evidence still applies to this exact
  tree, since it is simply `c62494a` unmodified).
- **Rollback commit/tag:** tag `c62494a` (or whatever the actual deploy HEAD
  is) before deploying; rollback requires a decision about any real signups
  collected in the interim (Section 12).
- **Risk level:** medium-high — the only option with unverified production
  configuration in the path of real customer PII.

**No option is authorized for execution by this document.**

---

## 12. Rollback Plan

Unchanged in substance from the first pass. Restated with the correction that
whichever option is chosen, the tag should be cut from the exact candidate
HEAD actually built and verified in Section 6 (Method B) or the exact `c62494a`
(Option C) — not a re-derived approximation of either.

---

## 13. Dry Release Validation Plan

Defined here; items marked **(run)** were executed this pass against the
Method B candidate tree and are not merely planned. Items marked **(planned)**
require either a live preview environment or production access this audit
does not have, and should be run against the actual release branch once
created.

| Test | Status |
|---|---|
| Clean install | **(run)** — succeeded, Section 6 |
| Typecheck | **(run)** — passed, Section 6 |
| Production build (`next build --webpack`) | **(run)** — succeeded, Section 6 |
| Cloudflare/OpenNext build | **(run)** — succeeded, Section 6 |
| Route smoke tests (every route in Section 4 responds) | (planned) — requires a running server against the actual release branch |
| Direct URL tests for `/founder-access`, `/subscribe`, `/api/founder-access` (confirm the API 404s/is absent, confirm `/founder-access` renders the static page, confirm `/subscribe` renders its form not a redirect) | (planned) |
| API endpoint tests (`/api/subscribe`, `/api/concierge` with a real payload, in a non-production environment) | (planned) — requires sandbox Resend/Beehiiv/Supabase credentials, not production ones |
| Missing-environment-variable tests (confirm `/api/subscribe` degrades as described in Section 9, not just as claimed) | (planned) |
| Sitemap and robots inspection | **(run)** — confirmed content, Section 9 |
| Public asset inspection (confirm `public/data/inci/faceElixir.json` removed if that recommendation is taken; confirm Garamond disposition) | (planned) — contingent on the founder decisions in Section 8/Section 7 |
| Confidential-file inspection (repeat the secret-pattern scan from the first pass's Section 10 against the final release branch, not just the feature branch) | (planned) |
| Lighthouse checks on the release branch specifically (the first pass's scores are for `feature/nfe-digital-maison-upgrade`, not the constructed release branch — likely identical for shared routes, but not yet re-run against the actual artifact) | (planned) |
| Rollback rehearsal (tag, deploy, revert to tag, confirm live state matches) | (planned) — requires an actual deploy target, out of scope for a no-deploy audit |

No deployment was performed in the course of this validation plan or this
document.

---

## 14. Founder Decisions Still Required

1. **Release construction method:** approve Method B (revert, recommended)
   over Method A (cherry-pick) or Method C (rejected as currently
   unachievable without new code).
2. **What "Founder Access excluded" is allowed to mean:** accept that the
   ~10 remaining CTAs point to a static "not fully active yet" placeholder
   page (no code change needed beyond the Method B revert itself), or
   direct that those nine files be edited to point elsewhere/be removed
   (a real, separately-scoped content change, not performed here).
3. **`public/data/inci/faceElixir.json`:** confirm removal from the release
   tree (recommended; not yet performed).
4. **Garamond font binaries:** confirm licensing for self-hosted webfont
   redistribution, or remove the three files from the release tree.
   Pre-existing on `origin/main`, so this decision is not gated on this
   branch's release timeline, but should not be deferred indefinitely
   either.
5. **Face Elixir size fact** (30ml vs. 50ml) and **Body Elixir size fact**
   (200ml vs. 125ml/75ml): both still require verification against physical
   packaging. Not addressed by this pass; exact affected files listed in
   Section 10.
6. **Founder Access go-live** (Option C): requires production confirmation
   of the Supabase migration, RLS policy, and all four env vars — none
   verifiable from this repository.
7. **Note for the record, not a blocker:** this branch, via `b70dab5`,
   already removes a real, currently-live formulation-percentage exposure
   on `origin/main`'s `/inci` page (Section 7). Worth knowing regardless of
   which release option is chosen, since it argues for eventually shipping
   this fix on its own merits.

**No deployment scope has been authorized by this document.** This audit
provides the evidence, the tested construction methods, and the options; the
decision remains the founder's.
