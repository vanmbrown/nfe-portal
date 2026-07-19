import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

/**
 * NFE Maison — Token Specimen (Phase 1 exit artifact)
 *
 * INTERNAL REVIEW SURFACE. NOT A PRODUCTION PAGE.
 *
 * Safety posture:
 *   - Returns 404 in any production build (guard below). The route does not
 *     exist for real visitors even if deployed.
 *   - noindex, nofollow via metadata.
 *   - Absent from src/app/sitemap.ts (explicit allowlist — nothing auto-added).
 *   - Disallowed in robots.ts under /dev/.
 *   - Not linked from Header, Footer, or any page.
 *
 * Typography: Inter only, inherited from layout.tsx. Garamond is NOT loaded
 * anywhere and must not be — web embedding is unapproved. Figtree is deferred.
 *
 * Token usage: this specimen consumes --maison-* deliberately, because
 * demonstrating that the tokens resolve is its entire purpose. It is dev-only
 * and excluded from production. NO production component consumes them.
 */

export const metadata: Metadata = {
  title: 'Token Specimen (internal)',
  robots: { index: false, follow: false, nocache: true },
}

const LIGHT_GROUNDS = [
  { name: 'Bone', hex: '#F5EFE6', note: 'design pkg — page ground' },
  { name: 'Ivory', hex: '#FCF9F3', note: 'design pkg — raised surface' },
  { name: 'Paper', hex: '#FAFAF8', note: 'PRODUCTION' },
  { name: 'Parchment', hex: '#EDE3D1', note: 'design pkg — BINDING CONSTRAINT' },
]

const DARK_GROUNDS = [
  { name: 'NFE Green', hex: '#103B2A', note: 'PRODUCTION — signature anchor' },
  { name: 'Green-900', hex: '#0b291e', note: 'PRODUCTION' },
  { name: 'Cacao', hex: '#1C1510', note: 'design pkg' },
]

/** Measured with the WCAG 2.x formula from token source. */
const ON_LIGHT: Array<{ label: string; hex: string; r: number[]; status: 'ratified' | 'candidate' | 'prod' | 'fail' | 'excluded' }> = [
  { label: 'accent-on-light', hex: '#77633C', r: [5.05, 5.5, 5.53, 4.54], status: 'ratified' },
  { label: 'text-muted (candidate)', hex: '#666666', r: [5.02, 5.46, 5.49, 4.51], status: 'candidate' },
  { label: 'espresso', hex: '#2B2018', r: [13.89, 15.11, 15.19, 12.48], status: 'candidate' },
  { label: 'umber', hex: '#6B5945', r: [5.85, 6.36, 6.4, 5.26], status: 'candidate' },
  { label: 'nfe-ink (production)', hex: '#111111', r: [16.52, 17.97, 18.07, 14.84], status: 'prod' },
  { label: 'nfe-muted (production)', hex: '#6B6B6B', r: [4.66, 5.07, 5.1, 4.19], status: 'prod' },
  { label: 'nfe-gold on light (production)', hex: '#C6A664', r: [2.03, 2.21, 2.22, 1.83], status: 'fail' },
  { label: 'taupe — EXCLUDED', hex: '#9A8770', r: [3.02, 3.29, 3.31, 2.72], status: 'excluded' },
]

const ON_DARK: Array<{ label: string; hex: string; r: number[]; status: string }> = [
  { label: 'accent-on-dark', hex: '#C6A664', r: [5.38, 6.7, 7.77], status: 'ratified' },
  { label: 'bone', hex: '#F5EFE6', r: [10.93, 13.61, 15.78], status: 'candidate' },
  { label: 'paper (production)', hex: '#FAFAF8', r: [11.95, 14.88, 17.26], status: 'prod' },
  { label: 'text-subtle-on-dark (candidate)', hex: '#8CA097', r: [4.52, 5.62, 6.52], status: 'candidate' },
]

const STATES = [
  { label: 'error — text-red-600 (current, 29 uses)', hex: '#DC2626', white: 4.83, bone: 4.22 },
  { label: 'error — text-red-700', hex: '#B91C1C', white: 6.47, bone: 5.66 },
  { label: 'success — text-green-700 (current)', hex: '#15803D', white: 5.02, bone: 4.39 },
  { label: 'success — text-green-800', hex: '#166534', white: 7.13, bone: 6.24 },
]

function Ratio({ v }: { v: number }) {
  const ok = v >= 4.5
  return (
    <span
      style={{
        fontVariantNumeric: 'tabular-nums',
        color: ok ? '#166534' : '#B91C1C',
        fontWeight: ok ? 400 : 700,
      }}
    >
      {v.toFixed(2)}
      {ok ? '' : ' ✕'}
    </span>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: '4rem' }}>
      <h2
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.24em',
          color: '#77633C',
          borderBottom: '1px solid #E3D7C3',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function TokenSpecimenPage() {
  // Hard gate: this route does not exist in a production build.
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const th: React.CSSProperties = {
    textAlign: 'left',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#666666',
    padding: '0.5rem 0.75rem',
    borderBottom: '1px solid #E3D7C3',
    fontWeight: 400,
  }
  const td: React.CSSProperties = {
    padding: '0.6rem 0.75rem',
    borderBottom: '1px solid #F0EAE0',
    fontSize: '0.85rem',
  }

  return (
    <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <p
          style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            color: '#B91C1C',
            fontWeight: 700,
          }}
        >
          Internal — not a production page
        </p>
        <h1 style={{ fontSize: '2rem', margin: '0.75rem 0 0.5rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
          NFE Maison Token Specimen
        </h1>
        <p style={{ color: '#666666', maxWidth: '65ch', lineHeight: 1.7, fontSize: '0.95rem' }}>
          Phase 1 exit artifact. Every ratio below is computed with the WCAG 2.x formula from token
          source, not estimated. AA for normal text is 4.5:1. This page returns 404 in production,
          is noindex, is absent from the sitemap, and is not linked from anywhere.
        </p>
        <p style={{ color: '#666666', maxWidth: '65ch', lineHeight: 1.7, fontSize: '0.95rem', marginTop: '0.75rem' }}>
          Typography is <strong>Inter only</strong>, inherited from the root layout. Garamond is not
          loaded (web embedding unapproved). Figtree is deferred.
        </p>
      </header>

      {/* ------------------------------------------------------------------ */}
      <Section id="namespaces" title="1 · Namespace contract">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
          <div style={{ border: '1px solid #E3D7C3', padding: '1.25rem' }}>
            <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>--nfe-*</code>
            <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <strong>Current production tokens.</strong> Live, consumed by real components.
              Unchanged by Phase 1. This is the source of truth.
            </p>
          </div>
          <div style={{ border: '1px solid #E3D7C3', padding: '1.25rem', background: '#FCF9F3' }}>
            <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>--maison-*</code>
            <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '0.5rem', lineHeight: 1.6 }}>
              <strong>Transitional candidate tokens.</strong> Defined, not consumed by any
              production component. Applying them is a separate, founder-gated step.
            </p>
          </div>
        </div>
        <p
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: '#FEF2F2',
            borderLeft: '3px solid #B91C1C',
            fontSize: '0.85rem',
            lineHeight: 1.6,
          }}
        >
          <strong>Never import the design package&rsquo;s token files directly.</strong> The package
          defines <code>--nfe-gold: #C79A56</code> against production&rsquo;s <code>#C6A664</code>;
          importing it would shift gold sitewide. The same hazard exists for spacing: production{' '}
          <code>--space-*</code> is 4px-base, the package is 8px-base under identical names.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="accent-light" title="2 · Accent on light grounds — RATIFIED #77633C">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {LIGHT_GROUNDS.map((g, i) => (
            <div key={g.name} style={{ background: g.hex, border: '1px solid #E3D7C3', padding: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.24em',
                  color: 'var(--maison-accent-on-light)',
                  marginBottom: '0.75rem',
                }}
              >
                Founder Access
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--maison-accent-on-light)', marginBottom: '0.5rem' }}>
                Accent body text
              </p>
              <p style={{ fontSize: '0.75rem', color: '#666666' }}>
                {g.name} {g.hex}
                <br />
                <Ratio v={ON_LIGHT[0].r[i]} />:1
              </p>
              <p style={{ fontSize: '0.65rem', color: '#8A8A8A', marginTop: '0.4rem' }}>{g.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="accent-dark" title="3 · Accent on dark grounds — RATIFIED #C6A664 (unchanged)">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {DARK_GROUNDS.map((g, i) => (
            <div key={g.name} style={{ background: g.hex, padding: '1.5rem' }}>
              <p
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.24em',
                  color: 'var(--maison-accent-on-dark)',
                  marginBottom: '0.75rem',
                }}
              >
                Founder Access
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--maison-accent-on-dark)', marginBottom: '0.5rem' }}>
                Accent body text
              </p>
              <p style={{ fontSize: '0.75rem', color: '#B4C1BA' }}>
                {g.name} {g.hex}
                <br />
                <span style={{ color: '#8CA097', fontVariantNumeric: 'tabular-nums' }}>
                  {ON_DARK[0].r[i].toFixed(2)}
                </span>
                :1
              </p>
              <p style={{ fontSize: '0.65rem', color: '#7E8C85', marginTop: '0.4rem' }}>{g.note}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="matrix-light" title="4 · Full contrast matrix — light grounds">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr>
                <th style={th}>Token</th>
                <th style={th}>Hex</th>
                {LIGHT_GROUNDS.map((g) => (
                  <th key={g.name} style={th}>
                    {g.name}
                  </th>
                ))}
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {ON_LIGHT.map((row) => (
                <tr key={row.label} style={row.status === 'fail' || row.status === 'excluded' ? { background: '#FEF2F2' } : undefined}>
                  <td style={td}>{row.label}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.8rem',
                        height: '0.8rem',
                        background: row.hex,
                        border: '1px solid #E3D7C3',
                        verticalAlign: 'middle',
                        marginRight: '0.4rem',
                      }}
                    />
                    {row.hex}
                  </td>
                  {row.r.map((v, i) => (
                    <td key={i} style={td}>
                      <Ratio v={v} />
                    </td>
                  ))}
                  <td style={{ ...td, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '1rem', lineHeight: 1.6, maxWidth: '65ch' }}>
          Parchment <code>#EDE3D1</code> is the binding constraint on every light-ground token. Two
          earlier candidates passed on Bone, Ivory, and Paper and failed only here:{' '}
          <code>#78643C</code> at 4.48 and <code>#676767</code> at 4.45. Test against Parchment
          explicitly.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="matrix-dark" title="5 · Full contrast matrix — dark grounds">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
            <thead>
              <tr>
                <th style={th}>Token</th>
                <th style={th}>Hex</th>
                {DARK_GROUNDS.map((g) => (
                  <th key={g.name} style={th}>
                    {g.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ON_DARK.map((row) => (
                <tr key={row.label}>
                  <td style={td}>{row.label}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>{row.hex}</td>
                  {row.r.map((v, i) => (
                    <td key={i} style={td}>
                      <Ratio v={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="muted" title="6 · Muted text — caption and body sizes">
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          {LIGHT_GROUNDS.map((g, i) => (
            <div key={g.name} style={{ background: g.hex, border: '1px solid #E3D7C3', padding: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A8A8A', marginBottom: '0.75rem' }}>
                {g.name}
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--maison-text-muted)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
                Body at 16px in the candidate muted token.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--maison-text-muted)', lineHeight: 1.6 }}>
                Caption at 12px in the same token. <Ratio v={ON_LIGHT[1].r[i]} />:1
              </p>
              <hr style={{ border: 0, borderTop: '1px solid #E3D7C3', margin: '1rem 0' }} />
              <p style={{ fontSize: '0.75rem', color: '#6B6B6B', lineHeight: 1.6 }}>
                Production <code>#6B6B6B</code> for comparison: <Ratio v={ON_LIGHT[5].r[i]} />:1
              </p>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: '#FFFBEB',
            borderLeft: '3px solid #77633C',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            maxWidth: '65ch',
          }}
        >
          <strong>Do not use opacity-based colors for meaningful text.</strong> The production
          pattern <code>text-nfe-ink/45</code> is not a chosen color; it is <code>#111111</code>{' '}
          composited onto whatever sits behind it, yielding <code>#919190</code> at 3.02:1 on Paper.
          Its contrast is an accident of stacking context and changes silently when a background
          changes. Opacity remains fine for dividers, scrims, and hover states.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="eyebrows" title="7 · Eyebrow treatments">
        <p style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1.25rem', maxWidth: '65ch', lineHeight: 1.6 }}>
          Contrast is solved by darkening the accent, <strong>not</strong> by enlarging or
          emboldening the type. All three below are 12px / 0.24em, matching production.
        </p>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          <div style={{ background: '#FAFAF8', border: '1px solid #E3D7C3', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: '#C6A664' }}>
              Founder Access opens first
            </p>
            <p style={{ fontSize: '0.7rem', color: '#B91C1C', marginTop: '0.75rem', fontWeight: 700 }}>
              CURRENT — 2.22:1 FAILS AA
            </p>
          </div>
          <div style={{ background: '#FAFAF8', border: '1px solid #E3D7C3', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--maison-accent-on-light)' }}>
              Founder Access opens first
            </p>
            <p style={{ fontSize: '0.7rem', color: '#166534', marginTop: '0.75rem', fontWeight: 700 }}>
              RATIFIED — 5.53:1 PASSES
            </p>
          </div>
          <div style={{ background: '#103B2A', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--maison-accent-on-dark)' }}>
              Founder Access opens first
            </p>
            <p style={{ fontSize: '0.7rem', color: '#8CA097', marginTop: '0.75rem', fontWeight: 700 }}>
              ON DARK — 5.38:1 PASSES
            </p>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="buttons" title="8 · Button states">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button style={{ background: '#103B2A', color: '#FAFAF8', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: 'var(--maison-radius-control)', cursor: 'pointer' }}>
            Primary
          </button>
          <button style={{ background: 'transparent', color: '#103B2A', border: '1px solid #103B2A', padding: '0.75rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: 'var(--maison-radius-control)', cursor: 'pointer' }}>
            Secondary
          </button>
          <button style={{ background: 'var(--maison-accent-on-light)', color: '#FFFFFF', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: 'var(--maison-radius-control)', cursor: 'pointer' }}>
            Accent
          </button>
          <button disabled style={{ background: '#E3D7C3', color: '#666666', border: 'none', padding: '0.75rem 1.5rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.12em', borderRadius: 'var(--maison-radius-control)', cursor: 'not-allowed' }}>
            Disabled
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '1rem', lineHeight: 1.6 }}>
          Radii use DDR-5 selective sharpness: <code>--maison-radius-control</code> at 2px. Tab to
          each button to see the focus ring.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="links-borders-focus" title="9 · Links, borders, focus">
        <p style={{ fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '65ch' }}>
          Body copy with an{' '}
          <a href="#links-borders-focus" style={{ color: 'var(--maison-accent-on-light)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            inline text link
          </a>{' '}
          in the ratified accent, and a{' '}
          <a href="#links-borders-focus" style={{ color: '#103B2A', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            green link
          </a>{' '}
          for comparison. Both are underlined so color is not the sole signal.
        </p>
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
          <div style={{ border: '1px solid var(--maison-hairline)', padding: '1rem', fontSize: '0.8rem' }}>
            1px <code>--maison-hairline</code>
          </div>
          <div style={{ border: '1px solid #103B2A', padding: '1rem', fontSize: '0.8rem' }}>1px green</div>
          <div style={{ borderBottom: '1px solid var(--maison-hairline)', padding: '1rem', fontSize: '0.8rem' }}>
            bottom rule only
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '1.25rem', lineHeight: 1.6, maxWidth: '65ch' }}>
          Focus rings come from the global <code>:focus-visible</code> rule using{' '}
          <code>--focus-ring</code> (2px solid <code>--nfe-gold</code>) with{' '}
          <code>--focus-ring-offset</code>. Tab through this page to verify. Note the focus ring
          currently uses the <em>bright</em> gold; on light grounds that is a visibility concern
          worth reviewing separately, since it is a non-text UI indicator (3:1 threshold, not 4.5).
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="forms" title="10 · Form labels and states">
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', maxWidth: '48rem' }}>
          <div>
            <label htmlFor="spec-email" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666666', marginBottom: '0.5rem' }}>
              Email address
            </label>
            <input
              id="spec-email"
              type="email"
              placeholder="you@example.com"
              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #E3D7C3', borderRadius: 'var(--maison-radius-input)', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--maison-text-muted)', marginTop: '0.4rem' }}>
              Helper text in the candidate muted token.
            </p>
          </div>
          <div>
            <label htmlFor="spec-err" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666666', marginBottom: '0.5rem' }}>
              Field with error
            </label>
            <input
              id="spec-err"
              type="text"
              defaultValue="invalid"
              aria-invalid="true"
              aria-describedby="spec-err-msg"
              style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #B91C1C', borderRadius: 'var(--maison-radius-input)', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
            <p id="spec-err-msg" style={{ fontSize: '0.75rem', color: '#B91C1C', marginTop: '0.4rem' }}>
              Error message — 6.47:1 on white.
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '1rem', lineHeight: 1.6 }}>
          Inputs use <code>--maison-radius-input</code> at 4px, preserving accessible control shapes
          per DDR-5.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="states" title="11 · Success and error states">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
            <thead>
              <tr>
                <th style={th}>State color</th>
                <th style={th}>Hex</th>
                <th style={th}>on White</th>
                <th style={th}>on Bone</th>
              </tr>
            </thead>
            <tbody>
              {STATES.map((s) => (
                <tr key={s.label} style={s.bone < 4.5 ? { background: '#FEF2F2' } : undefined}>
                  <td style={{ ...td, color: s.hex }}>{s.label}</td>
                  <td style={{ ...td, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>{s.hex}</td>
                  <td style={td}>
                    <Ratio v={s.white} />
                  </td>
                  <td style={td}>
                    <Ratio v={s.bone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: '#FEF2F2',
            borderLeft: '3px solid #B91C1C',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            maxWidth: '65ch',
          }}
        >
          <strong>Finding for founder review.</strong> The current error color{' '}
          <code>text-red-600</code> (29 uses) passes on white at 4.83 but{' '}
          <strong>fails on Bone at 4.22</strong>. <code>text-green-700</code> likewise passes on
          white at 5.02 and fails on Bone at 4.39. If the warm Bone ground is ever adopted, both
          state colors need darkening to <code>red-700</code> and <code>green-800</code>, which pass
          on both. No change made in this pass.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="motion" title="12 · Reduced motion">
        <div
          style={{ display: 'inline-block', padding: '1rem 1.5rem', border: '1px solid #E3D7C3', fontSize: '0.85rem' }}
          className="specimen-motion-probe"
        >
          This box pulses. With <code>prefers-reduced-motion: reduce</code> it holds still.
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: '1rem', lineHeight: 1.6, maxWidth: '65ch' }}>
          The global rule in <code>globals.scss</code> reduces all animation and transition
          durations to near-zero under <code>prefers-reduced-motion</code>. Toggle the OS setting, or
          emulate it in DevTools, and the pulse should stop.
        </p>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes specimenPulse {
                0%,100% { opacity: 1; }
                50%     { opacity: 0.45; }
              }
              .specimen-motion-probe { animation: specimenPulse 1.6s ease-in-out infinite; }
              @media (prefers-reduced-motion: reduce) {
                .specimen-motion-probe { animation: none !important; }
              }
            `,
          }}
        />
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="typography" title="13 · Typography — Inter only">
        <div style={{ maxWidth: '65ch' }}>
          <p style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
            Display 32px / 600
          </p>
          <p style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Heading 24px / 600</p>
          <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Subhead 18px / 500</p>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '0.5rem' }}>
            Body 16px / 1.8. Measure is capped at 65ch. This paragraph exists to show the reading
            measure and line height at the body size that most of the site uses.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--maison-text-muted)', marginBottom: '0.5rem' }}>
            Small 14px in the candidate muted token.
          </p>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: 'var(--maison-accent-on-light)' }}>
            Eyebrow 12px / 0.24em
          </p>
        </div>
        <p
          style={{
            marginTop: '1.5rem',
            padding: '1rem 1.25rem',
            background: '#FFFBEB',
            borderLeft: '3px solid #77633C',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            maxWidth: '65ch',
          }}
        >
          <strong>No serif is shown.</strong> Production declares{' '}
          <code>--font-primary: &quot;Garamond Premier Pro&quot;, Georgia, serif</code> but loads no{' '}
          <code>@font-face</code> and no <code>next/font/local</code>, so real visitors render{' '}
          <strong>Georgia</strong>. Garamond web embedding is unapproved, so this specimen
          deliberately shows Inter only. Figtree is deferred; Inter is retained per DDR-2.
        </p>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section id="copy-review" title="14 · Copy flagged for founder review">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>String</th>
              <th style={th}>Where</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...td, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                Founder Access opens first
              </td>
              <td style={{ ...td, fontSize: '0.78rem' }}>shop/page.tsx, elixir-editorial.ts</td>
              <td style={{ ...td, color: '#166534' }}>Approved — may remain</td>
            </tr>
            <tr style={{ background: '#FFFBEB' }}>
              <td style={{ ...td, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                In development
              </td>
              <td style={{ ...td, fontSize: '0.78rem' }}>shop/page.tsx:95 — Body Elixir card</td>
              <td style={{ ...td, color: '#77633C' }}>
                <strong>FLAGGED for review — unchanged in this pass</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.85rem', color: '#666666', marginTop: '1rem', lineHeight: 1.6, maxWidth: '65ch' }}>
          &ldquo;In development&rdquo; is the fallback branch of the status ternary and is public on
          The Atelier. It violates no DDR-3 rule, so it was not changed. It reads more like internal
          engineering language than maison voice, which is why it is surfaced here rather than
          silently kept. Replacement requires separate founder approval.
        </p>
      </Section>
    </div>
  )
}
