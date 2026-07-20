# NFE Maison — Release-Readiness Audit

**Status:** Seed document. Contains the open findings surfaced during Phase 1, the
Our Story pilot, and the homepage hero fidelity correction. **This is not yet the
full commit-by-commit release audit** (classification of all commits between `main`
and `feature/nfe-digital-maison-upgrade`, system-by-system verification, rollback
plan) — that is the next workstream, not started.

**Date opened:** 2026-07-20

---

## Open findings

### 1. Production Cloudflare/OpenNext image optimization defect

**Classification:** production image-optimization pipeline defect, performance
risk, independent of the Our Story pilot and the homepage hero fix, requires a
sitewide regression plan before repair.

**Finding:** production's `/_next/image` endpoint returns the full, unresized
original for every request regardless of the requested width. Confirmed on both
the homepage hero's desktop asset (`w=384` and `w=1920` both returned the same
700,874-byte, 3600×2547 file) and its mobile asset (`w=828` and `w=1920` both
returned the same 521,766-byte, 2000×2827 file). This is not specific to the hero
— every image on production routed through Next's image optimizer is currently
serving full-resolution originals to every visitor on every device.

**Not fixed.** Root cause not diagnosed beyond confirming the symptom — likely an
OpenNext-Cloudflare image-optimization configuration or deployment issue. Needs
its own investigation and a sitewide regression plan (every image on the site
routes through this same broken mechanism) before any repair is attempted.

### 2. Deployment provenance risk

**Verified conclusion, stated narrowly:** the current deployed production state
cannot be reconstructed from `origin/main` alone. The homepage hero desktop asset
live on production does not exist anywhere in `origin/main`'s git history
(confirmed with a fresh `fetch`, not memory) — the only branch that has ever
contained it is `feature/nfe-digital-maison-upgrade`.

**What is not claimed:** which specific local checkout, process, or person
deployed the current production state. No deployment logs were available to
confirm that, so no attribution is made — only the fact that a rebuild from
`origin/main` today would not reproduce what is currently live.

**Risk:** rollback-to-main is not a safe assumption. Any release-scope decision
needs to account for the gap between `origin/main` and what is actually running
in production.

### 3. Homepage Accessibility score — pre-existing, deferred

**Finding:** homepage Lighthouse Accessibility remains **96/100** after the hero
fidelity correction (unchanged from the pre-fix baseline; the hero patch did not
touch this). The gap is pre-existing color-contrast findings, consistent with the
systemic F-A11y-01 pattern documented in the Phase 0 baseline audit.

**Decision:** do not address in isolated patches. Fix during the **approved
homepage Maison migration**, when the ratified contrast tokens
(`--maison-accent-on-light`, `--maison-text-muted`, etc. — see
`nfe-contrast-token-candidates.md` and `nfe-maison-token-map.md`) are actually
applied to the homepage. Fixing it piecemeal now would mean touching the same
surfaces twice.

---

## Explicitly not yet done

- Commit-by-commit classification of the 38+ commits between `origin/main` and
  `feature/nfe-digital-maison-upgrade` (approved-and-ready / needs regression
  testing / blocked by product fact / blocked by founder decision / internal-docs-
  only / should-not-ship / requires separate deployment).
- System-by-system verification (homepage, Founder Access, Beehiiv, Supabase,
  Resend, Upstash, Concierge, Quiz, Discovery, Science, Journal, Atelier, product
  pages, redirects, privacy policy, favicon, analytics, build configuration,
  Cloudflare deployment compatibility).
- Migration/environment dependency mapping, database migrations already applied,
  required production secrets.
- Rollback plan.
- Recommended deployment grouping.

**No deployment scope has been approved.** This document exists to hold findings
that would otherwise be lost between sessions, not to authorize release.
