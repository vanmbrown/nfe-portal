/**
 * Copy governance — ADVISORY ONLY.
 *
 * Encodes the DDR-3 brand language rules for editorial review support.
 *
 * THIS IS NOT A CI GATE. DDR-3 explicitly forbids a naive blocker: several
 * approved phrases contain review-listed words on purpose ("well-aging, not
 * anti-aging"), and some are functional UI copy ("drag and drop"). A scanner
 * that fails the build on substring matches would flag correct, approved copy.
 *
 * Use `scanText` to produce a review report a human reads. Do not wire the
 * result into a failing build step.
 *
 * Source: nfe-maison-refinement-plan-v2.md §3 (DDR-3),
 *         nfe-maison-baseline-audit.md F-Copy-01..04
 */

/** Terms that warrant editorial review. Not automatic failures. */
export const REVIEW_PHRASES = [
  'preorder',
  'pre-order',
  'sale',
  'discount',
  'donation',
  'sample',
  'drop',
  'clearance',
  'shop now',
  'limited-time offer',
  'countdown',
  'anti-aging',
] as const

/** Approved NFE vocabulary. Prefer these when replacing flagged copy. */
export const APPROVED_LANGUAGE = [
  'Founder Access',
  "Founder's Edition",
  'private allocation',
  'release wave',
  'invitation',
  'reserved invitation',
  'small batch',
  'early release',
] as const

/**
 * Phrases that CONTAIN a review term but are approved in context.
 * Each entry suppresses the match it encloses.
 *
 * Traceable to the baseline audit's documented false positives:
 *   F-Copy-02  "well-aging, not anti-aging"      contrastive brand statement
 *   F-Copy-03  "not a discount shelf"            anti-discount positioning
 *   F-Copy-03  "without discounting"             anti-discount positioning
 *   F-Copy-04  "drag and drop" / "drop zone"     functional UI (FileUpload.tsx)
 *   F-Copy-01b "pre-commerce"                    framing, not transactional
 */
export const CONTEXTUAL_ALLOWLIST = [
  'well-aging, not anti-aging',
  'not anti-aging',
  'not a discount shelf',
  'without discounting',
  'drag and drop',
  'drop zone',
  'dropdown',
  'pre-commerce',
  'sample size', // formulation context, not a free-sample offer
  // CSS / Tailwind identifiers. Found by running the scanner over src:
  // the only two hits across 243 files were `drop-shadow-lg` and a
  // `drop-shadow(...)` filter. Code, not copy.
  'drop-shadow',
  'dropped',
  'droplet',
] as const

export interface CopyFinding {
  /** The review-listed term that matched. */
  term: string
  /** Character offset of the match in the scanned text. */
  index: number
  /** Surrounding text, for the reviewer to judge context. */
  excerpt: string
  /** True when an allowlisted phrase encloses this match. */
  suppressed: boolean
  /** Which allowlist entry suppressed it, when applicable. */
  suppressedBy?: string
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Ranges covered by allowlisted phrases, so enclosed matches can be suppressed.
 */
function allowlistRanges(haystack: string): Array<{ start: number; end: number; phrase: string }> {
  const ranges: Array<{ start: number; end: number; phrase: string }> = []
  for (const phrase of CONTEXTUAL_ALLOWLIST) {
    const re = new RegExp(escapeRegExp(phrase), 'gi')
    let m: RegExpExecArray | null
    while ((m = re.exec(haystack)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, phrase })
    }
  }
  return ranges
}

/**
 * Scan text for review-listed terms.
 *
 * Matches are word-bounded, so "sample" does not match "resampled" and "drop"
 * does not match "dropped". Findings enclosed by an allowlisted phrase are
 * returned with `suppressed: true` rather than omitted, so a reviewer can see
 * what was suppressed and why.
 */
export function scanText(text: string): CopyFinding[] {
  const findings: CopyFinding[] = []
  const allowed = allowlistRanges(text)

  for (const term of REVIEW_PHRASES) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi')
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      const start = m.index
      const end = start + m[0].length
      const covering = allowed.find((r) => start >= r.start && end <= r.end)
      findings.push({
        term: m[0],
        index: start,
        excerpt: text.slice(Math.max(0, start - 40), Math.min(text.length, end + 40)).replace(/\s+/g, ' ').trim(),
        suppressed: Boolean(covering),
        ...(covering ? { suppressedBy: covering.phrase } : {}),
      })
    }
  }

  return findings.sort((a, b) => a.index - b.index)
}

/** Findings a reviewer should actually look at. */
export function scanTextForReview(text: string): CopyFinding[] {
  return scanText(text).filter((f) => !f.suppressed)
}

/** True when the text contains at least one unsuppressed review term. */
export function needsCopyReview(text: string): boolean {
  return scanTextForReview(text).length > 0
}
