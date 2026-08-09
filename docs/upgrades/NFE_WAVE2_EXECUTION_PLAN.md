# NFE Wave 2 QA — Normalized Execution Plan

**Basis:** `NFE_Wave2_Founder_Disposition_Developer_Authorization.md`, against the Issue
Register in `NFE_WAVE2_QA_AUDIT.md`.
**Branch:** `feature/nfe-wave2-qa-audit`
**Deployment:** not authorized. This branch does not deploy until the §8 gate passes and the
founder authorizes.

The audit document is preserved unchanged as evidence. This is the execution plan only.

---

## 1. Erratum on the audit document

The founder memo (§7) is correct that ID references drift inside the audit. The drift is
confined to the **narrative sections**, not to the Issue Register.

The Issue Register table is authoritative and correct. Sections C, F and K cite several IDs
offset by one, because those were written by hand while the register was generated from the
verified findings. Specifically, Section K referred to typography as W2-04 (register: W2-03),
`/learn` as W2-23 (register: W2-22), `/skin-strategy` as W2-20 (register: W2-19), the Face
Elixir INCI as W2-15 (register: W2-14), the heroes as W2-16/17/18 (register: W2-15/16/17),
and dependencies as W2-25 (register: W2-24).

**Use the Issue Register. Disregard narrative-section ID citations.**

The register was not renumbered, so every ID in the founder memo continues to resolve.

## 2. ID verification

Every ID cited in the founder memo was mapped back to the register and checked against the
finding's own area, problem, root cause and file path.

- **40 IDs cited. 0 mismatches.**
- Three register entries are dispositioned by route name rather than by ID, and are covered:
  **W2-19** and **W2-34** (`/skin-strategy`) under §4, and **W2-22** (`/learn`) under §4.
- All 43 findings are therefore dispositioned.

## 3. Deduplicated work items

Per §7, these collapse into single items so no duplicate work is created.

| Work item | Register IDs | Note |
|---|---|---|
| Open Graph image / `metadataBase` | W2-04 + W2-05 | one defect, reported by two passes |
| Transport and response headers | W2-02 + W2-23 | edge setting plus application headers |
| Metadata coverage on public routes | W2-12 + W2-25 + W2-36 | overlapping route lists |
| Public-route and sitemap policy | W2-28 + W2-43 | resolved by the §4 route decisions |
| Mis-cropped article heroes | W2-15 + W2-16 + W2-17 | one mechanism, three asset groups |
| `/skin-strategy` disposition | W2-19 + W2-34 | restricting it moots the copy defect |

## 4. Order of work

Sequenced by dependency, not by severity. Metadata comes first because canonical URLs,
Open Graph images and sitemap policy all resolve against the same helper.

1. **Metadata foundation** — W2-04/05, W2-42, W2-12, and the canonical groundwork for W2-41
2. **Route decisions** — W2-22, W2-19/34, W2-28/43, W2-27, W2-38, W2-06, W2-07
3. **Security** — W2-23, W2-35, W2-20, W2-24, and the edge half of W2-02
4. **Accessibility** — W2-08, W2-09, W2-10, W2-11, W2-13, W2-21, W2-29, W2-30, W2-32
5. **Typography** — W2-03, bespoke to NFE tokens
6. **Hero refits** — W2-15/16/17, with a founder review set
7. **Cleanup** — W2-18, W2-31, W2-33, W2-37, W2-39, W2-40
8. **Held** — W2-14, blocked on the authoritative formulation record

## 5. Canonical host

Production serves **`https://www.nfebeauty.com`**; the apex answers 307 to it. The sitemap
confirms `NEXT_PUBLIC_SITE_URL` is already set to the www host in production.

`src/lib/site-url.ts` hard-coded the **apex** as its fallback, so any environment without
that variable would have advertised canonical URLs and Open Graph images on a host that only
redirects. Corrected to the canonical host, since canonicals, sharing images and the sitemap
now all derive from it.

## 6. Items needing a founder answer before they can proceed

1. **Cloudflare "Always Use HTTPS" (W2-02).** This is an edge setting, not a deployment. It
   changes live production the moment it is enabled, ahead of the §8 gate. Approved in the
   memo, but confirmation is wanted before touching production directly. HSTS is deliberately
   not being added yet, per the memo's own instruction to verify subdomain HTTPS capability
   first, and no preload.
2. **The sharing image (W2-26).** No 1200x630 asset exists. The closest approved image is the
   homepage hero at 1.41. The structural Open Graph and Twitter metadata is wired and uses
   that hero at its native ratio; platforms centre-crop it. Cropping an approved brand image
   to make a card is a founder decision, and the Beauty Cabinet defect came from exactly that
   kind of unilateral crop, so it has not been done. `src/lib/social-image.ts` is a single
   point of change once a card is approved.
3. **The Face Elixir formulation record (W2-14).** Held. If it cannot be supplied before
   release, the memo's own fallback applies: stop publishing the current list under the
   heading "Full INCI List".

## 7. Dependency advisory dispositions

Target applied: **next 16.2.11**, **@opennextjs/cloudflare 1.20.2**. The adapter's
declared peer range is `>=15.5.21 <16 || >=16.2.11`, which the installed Next satisfies.
No `npm audit fix --force`. Four further advisories were cleared by in-range updates of
transitive packages (`js-yaml` 3.14.1 to 3.15.1, `nanoid` 3.3.11 to 3.3.18, `picomatch`
2.3.1 to 2.3.2, `ws` 8.18.3 to 8.21.3).

`npm audit --omit=dev` went from **8 high** to **4 high**, 0 critical. Each survivor,
with whether it applies to this deployment:

| Package | Applies here? | Disposition |
|---|---|---|
| **next** | **No.** It carries no advisory of its own. `npm audit` reports it solely because it depends on `postcss` and `sharp`, both listed below. The 16.2.11 upgrade cleared Next's own SSRF, open-redirect and App Router DoS advisories. | Resolved. The residual flag is inherited, not intrinsic. |
| **postcss** | **No.** Declared as a **devDependency**, used at build time to process CSS. It is not part of the Worker bundle, so none of the four advisories (all requiring attacker-controlled CSS or `sourceMappingURL` input) can be reached by a visitor. NFE authors its own stylesheets. | Accepted for this release. A fixed version is in range but is pinned by the toolchain; revisit when Next ships a newer postcss. |
| **sharp** | **No.** Image optimisation on Cloudflare is performed by the adapter, not by `sharp`, which is a build-time and local-tooling dependency. The libvips CVEs require processing attacker-supplied images; NFE processes only committed brand assets. | Accepted for this release. The fix is a **major** bump (0.34.5 to 0.35.3) and was not taken, because a major image-library change during a QA release has a regression surface of its own. Recommend upgrading in a dedicated tranche with visual regression over every hero. |
| **next-mdx-remote** | **No, and it is dead.** The advisory concerns server-rendering **untrusted** MDX. This project renders no untrusted MDX, and more decisively, `next-mdx-remote` is **imported nowhere** in `src`, `tests` or `scripts`. MDX compiles through `@next/mdx` at build time. | Remove the dependency in the cleanup tranche (W2-37), rather than take a major upgrade of something unused. Removal resolves the advisory outright. |

Nothing above is a live exposure on the deployed Worker. Two are build-time only, one is
inherited from those two, and one is an unused package scheduled for deletion.

## 8. Progress

| Tranche | State |
|---|---|
| Normalization and ID verification | complete |
| Metadata foundation | complete and verified against a running preview |
| Route decisions | not started |
| Security | not started |
| Accessibility | not started |
| Typography | not started |
| Hero refits | not started |
| Cleanup | not started |
| Face Elixir INCI | held, awaiting founder record |
