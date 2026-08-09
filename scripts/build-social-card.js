/* The NFE default sharing card.
   1200x630, drawn from the maison tokens. Typographic and architectural: deep
   NFE green, the wordmark in warm gold, warm-bone supporting type, generous
   negative space. No photograph, no montage, no new motif. */
const path = require('path')
const fs = require('fs')
const sharp = require(path.join(
  'C:/nfe_dev/nfe_portal/.claude/worktrees/wt-journal-expand/node_modules/sharp'
))

const OUT = 'C:/nfe_dev/nfe_portal/.claude/worktrees/wt-wave2-qa/public/images/social/nfe-default-share-card.png'

const W = 1200
const H = 630

// Maison tokens, taken from tailwind.config.js.
const GREEN_900 = '#0b291e' // deepest ground
const GREEN = '#103B2A' // the maison green
const GOLD = '#C6A664' // warm gold, wordmark
const BONE = '#F4F1EA' // warm bone, supporting type

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${GREEN}"/>
      <stop offset="100%" stop-color="${GREEN_900}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>

  <!-- A single quiet architectural line, inset. Structure, not decoration. -->
  <rect x="72" y="72" width="${W - 144}" height="${H - 144}"
        fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="1"/>

  <!-- Wordmark. No optical nudge: this renderer does not carry the tracking
       past the final letter, so text-anchor already centres the ink. Measured,
       not assumed - a hand-applied half-tracking shift threw it off by 14px. -->
  <text x="${W / 2}" y="286" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="132"
        letter-spacing="26" fill="${GOLD}">NFE</text>

  <!-- The house line, small and wide, beneath the mark -->
  <text x="${W / 2}" y="340" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="19"
        letter-spacing="11" fill="${BONE}" fill-opacity="0.72">NOT FOR EVERYONE</text>

  <!-- Rule -->
  <line x1="${W / 2 - 70}" y1="392" x2="${W / 2 + 70}" y2="392"
        stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1"/>

  <!-- Supporting line -->
  <text x="${W / 2}" y="454" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="34"
        letter-spacing="0.4" fill="${BONE}">Luxury-performance skincare for skin that has lived.</text>
</svg>`

;(async () => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT)
  const m = await sharp(OUT).metadata()
  console.log('  wrote ' + OUT)
  console.log('  ' + m.width + 'x' + m.height + '  ratio ' + (m.width / m.height).toFixed(3) +
    '  ' + Math.round(fs.statSync(OUT).size / 1024) + ' KB')

  // Contrast of the two type colours against the ground they sit on.
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const L = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  }
  const ratio = (a, b) => { const x = L(a), y = L(b); const hi = Math.max(x, y), lo = Math.min(x, y); return (hi + 0.05) / (lo + 0.05) }
  console.log('  gold on green : ' + ratio(GOLD, GREEN).toFixed(2) + ':1')
  console.log('  bone on green : ' + ratio(BONE, GREEN).toFixed(2) + ':1')
  console.log('  bone on deepest: ' + ratio(BONE, GREEN_900).toFixed(2) + ':1')
})().catch((e) => { console.error('FAILED', e.message); process.exit(1) })
