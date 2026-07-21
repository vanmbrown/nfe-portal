# Incident — Zero-Byte Product Images Live on Production

**Severity:** customer-facing defect, live now.
**Status:** OPEN — fix deferred until production provenance is resolved.
**Opened:** 2026-07-21
**Independent of:** the confidentiality hotfix, the Maison release, and every
other open question. This stands alone.

---

## What is wrong

Four product images are served on production **right now** at HTTP `200`
with a body length of **0 bytes** — i.e. broken/blank images on both live
product pages:

| URL | Status | Bytes |
|---|---|---|
| `https://www.nfebeauty.com/images/products/face-elixir-hero.jpg` | 200 | 0 |
| `https://www.nfebeauty.com/images/products/face-elixir-detail.jpg` | 200 | 0 |
| `https://www.nfebeauty.com/images/products/body-elixir-hero.jpg` | 200 | 0 |
| `https://www.nfebeauty.com/images/products/body-elixir-detail.jpg` | 200 | 0 |

Verified by direct fetch on 2026-07-21.

## Why it exists

Commit `4a1cc89` ("fix: resolve pre-phase-one content and asset risks",
2026-07-19) was written specifically to remove these four zero-byte files
from the repository. Production provenance work (see
`nfe-release-readiness-audit.md` Section 18) proves the currently deployed
commit is **older than `4a1cc89`** — so production still ships the broken
files. The fix exists in git history; it has simply never been deployed.

## Constraints on the fix (per architect direction)

- Do **not** patch from `origin/main` (its base does not match production —
  deploying it would regress live functionality; see Section 18).
- Do **not** use placeholder images.
- Do **not** use stock imagery.
- Do **not** introduce unapproved product photography.

## Fix plan (blocked on provenance)

Once the exact deployed production commit is identified (Founder Access
verification checklist, Cloudflare step 5, is the fastest route to that
metadata):

1. Create a minimal branch **from the exact deployed source commit** — not
   from `origin/main`, not from the feature branch.
2. Either remove the broken image references from the product pages, or
   replace them with **approved, real** assets — pending Vanessa's decision
   on which.
3. Validate both `/products/face-elixir` and `/products/body-elixir`:
   - zero broken image requests (no `200`-with-`0-bytes`, no `404` on any
     `<img>`/`<source>`),
   - Lighthouse pass,
   - console clean, no hydration warnings.
4. Prepare a **separate rollback path** for this fix (its own pre-deploy tag
   / redeploy target), independent of any other release.

## Do NOT bundle

This is not part of the confidentiality hotfix and not part of the
controlled feature release. It gets its own minimal branch, its own
validation, and its own rollback, once provenance is known.
