import type { LayerId, SkinLayer } from '@/content/science/types'

interface SkinLayerSchematicProps {
  layers: SkinLayer[]
  /** Layers to bring forward. Empty means the default state: all layers present. */
  emphasized: LayerId[]
}

/**
 * The Skin Layer Intelligence Map schematic.
 *
 * Presentational and pure — it renders whatever emphasis it is handed, and
 * holds no state. That keeps it usable from the server-rendered default as
 * well as from the interactive client island.
 *
 * Scientific caution carried forward unchanged from the previous
 * implementation:
 *  - both the anatomical labels (Stratum Corneum, Epidermis, Dermis,
 *    Hypodermis) and the cosmetic zone labels are retained, and the two are
 *    visually distinct
 *  - the bands describe where visible needs *appear*, not where an ingredient
 *    travels; no penetration or dermal-action claim is made or implied
 *  - no biological mechanism has been added
 *
 * Emphasis is communicated by opacity *and* by an outline plus a visible
 * "In focus" marker, so it never depends on colour alone.
 */

// The drawing is 620 units wide and 810 tall, and the block fills all but a
// 10-unit margin. Height rather than width was the thing to change: at the
// previous 620x300 the schematic finished roughly 455px above the bottom of
// the interpretation column beside it, leaving a long band of empty green.
// Deepening the viewBox lets the drawing run the length of that column.
//
// Only the vertical dimension moved. The width, the label sizes and the
// relative depth of the five bands are all unchanged, so the block gets taller
// without the labels changing size: label units are relative to the 620 width,
// which is what sets the render scale at a fixed column width.
const VIEW = { width: 620, height: 810 }
const BLOCK = { x: 16, y: 10, width: 360, height: VIEW.height - 20 }

// Relative depth of each band, exactly as approved. Geometry is derived from
// these rather than written out as absolute offsets, so the proportions cannot
// drift apart from the block if its height is ever changed again.
const BAND_WEIGHTS: { id: LayerId; weight: number }[] = [
  { id: 'surface', weight: 56 },
  { id: 'barrier', weight: 56 },
  { id: 'tone', weight: 58 },
  { id: 'texture', weight: 58 },
  { id: 'radiance', weight: 52 },
]
const TOTAL_WEIGHT = BAND_WEIGHTS.reduce((sum, band) => sum + band.weight, 0)

// Anatomical context, named by the band it sits over rather than by a hard
// coordinate, so each label stays centred on its band at any block height.
// The stratum corneum is the outermost layer of the epidermis, which is what
// the top band stands for.
const ANATOMY: { label: string; band: LayerId }[] = [
  { label: 'Stratum Corneum', band: 'surface' },
  { label: 'Epidermis', band: 'barrier' },
  { label: 'Dermis', band: 'texture' },
  { label: 'Hypodermis', band: 'radiance' },
]

// Decorative depth cues, held as offsets from the centre of the lowest band so
// they stay a cluster instead of spreading out as the band deepens.
const DEPTH_CUES = [
  { cx: 63, dy: 0, r: 3.4 },
  { cx: 116, dy: 12, r: 2.7 },
  { cx: 172, dy: -4, r: 3.1 },
  { cx: 232, dy: 12, r: 3.6 },
  { cx: 292, dy: 0, r: 2.9 },
]

export function SkinLayerSchematic({ layers, emphasized }: SkinLayerSchematicProps) {
  const hasEmphasis = emphasized.length > 0
  const isUp = (id: LayerId) => !hasEmphasis || emphasized.includes(id)

  // Fills come from the layer's `bandHex` so the schematic band and the Layer
  // Context colour bar below read the same token and cannot drift apart.
  let cursor = BLOCK.y
  const bands = BAND_WEIGHTS.map(({ id, weight }) => {
    const height = (weight / TOTAL_WEIGHT) * BLOCK.height
    const band = {
      id,
      y: cursor,
      height,
      midY: cursor + height / 2,
      fill: layers.find((layer) => layer.id === id)?.bandHex ?? 'transparent',
    }
    cursor += height
    return band
  })

  const bandById = (id: LayerId) => bands.find((band) => band.id === id)
  const anatomical = ANATOMY.map(({ label, band }) => ({
    label,
    y: bandById(band)?.midY ?? BLOCK.y,
  }))
  const lowest = bandById('radiance')

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby="nfe-skin-map-title nfe-skin-map-desc"
    >
      <title id="nfe-skin-map-title">Skin Layer Intelligence Map</title>
      <desc id="nfe-skin-map-desc">
        {`A cosmetic framework showing five appearance zones from the skin surface downward: ${layers
          .map((layer) => layer.zone)
          .join(', ')}. ${
          hasEmphasis
            ? `Currently bringing forward: ${emphasized
                .map((id) => layers.find((l) => l.id === id)?.zone ?? id)
                .join(', ')}.`
            : 'All zones are shown equally.'
        }`}
      </desc>

      <defs>
        <linearGradient id="nfe-map-sheen" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff8ef" stopOpacity="0.4" />
          <stop offset="1" stopColor="#0b2f24" stopOpacity="0" />
        </linearGradient>
        <clipPath id="nfe-map-clip">
          <rect
            x={BLOCK.x}
            y={BLOCK.y}
            width={BLOCK.width}
            height={BLOCK.height}
            rx="22"
          />
        </clipPath>
      </defs>

      <rect
        x={BLOCK.x}
        y={BLOCK.y}
        width={BLOCK.width}
        height={BLOCK.height}
        rx="22"
        fill="#0b2f24"
        stroke="rgba(253,252,248,0.34)"
        strokeWidth="1.5"
      />

      <g clipPath="url(#nfe-map-clip)">
        {bands.map((band) => (
          <rect
            key={band.id}
            x={BLOCK.x}
            y={band.y}
            width={BLOCK.width}
            height={band.height}
            fill={band.fill}
            opacity={isUp(band.id) ? 1 : 0.24}
            className="nfe-map-band"
          />
        ))}
        <rect
          x={BLOCK.x}
          y={BLOCK.y}
          width={BLOCK.width}
          height={BLOCK.height}
          fill="url(#nfe-map-sheen)"
        />
        {/* Decorative depth cues in the lowest band. */}
        <g fill="#6f744f" opacity={isUp('radiance') ? 0.42 : 0.12} aria-hidden="true">
          {lowest
            ? DEPTH_CUES.map((cue) => (
                <circle key={cue.cx} cx={cue.cx} cy={lowest.midY + cue.dy} r={cue.r} />
              ))
            : null}
        </g>
      </g>

      {/* Emphasis outline — a second, non-colour signal. */}
      {bands.map((band) =>
        hasEmphasis && emphasized.includes(band.id) ? (
          <rect
            key={`focus-${band.id}`}
            x={BLOCK.x + 1.5}
            y={band.y + 1.5}
            width={BLOCK.width - 3}
            height={band.height - 3}
            fill="none"
            stroke="#e6ca8c"
            strokeWidth="2"
            rx="4"
          />
        ) : null
      )}

      {/* Anatomical context, visually quieter than the cosmetic zone labels.
          Quieter is carried by size, case and family, not by fading the ink:
          these are 15 units against the zone labels' 22, and they stay in the
          page's supporting sans while the zone labels take the brand serif.
          That is the same division the column beside this drawing uses, where
          the "All layers" eyebrow is sans and each zone heading is serif.

          The 0.7 opacity that used to sit here was doing the fading, and it
          cost too much: sampled against the rasterised band behind each name,
          Epidermis was 3.83:1, Dermis 2.93:1 and Hypodermis 4.47:1, all short
          of AA for text this size.

          Dropping the opacity alone did not finish the job. Dermis sits on the
          texture band, the darkest ground of the four, and #17352a at full
          strength still only reached 3.73:1 there. The ink is a deeper green
          for that reason. Measured on the rendered page, not calculated from
          the token: see the schematic contrast test for the figures. */}
      <g fill="#0a1f17" className="text-[15px] uppercase tracking-[0.06em]">
        {anatomical.map((item) => (
          <text key={item.label} x="32" y={item.y}>
            {item.label}
          </text>
        ))}
      </g>

      {/* Cosmetic zone labels and leader lines. */}
      {bands.map((band) => {
        const layer = layers.find((l) => l.id === band.id)
        if (!layer) return null
        const active = hasEmphasis && emphasized.includes(band.id)
        return (
          <g key={`label-${band.id}`}>
            <path
              d={`M${BLOCK.x + BLOCK.width} ${band.midY}H${BLOCK.x + BLOCK.width + 20}`}
              stroke={active ? '#e6ca8c' : 'rgba(253,252,248,0.34)'}
              strokeWidth={active ? 1.6 : 1}
              fill="none"
            />
            {/* These two lines name the same zones the interpretation column
                beside them names, and that column sets those headings in the
                brand serif. They carried the supporting sans instead, so the
                identical words appeared in two different faces side by side.
                They take font-primary for that reason. Sizes are unchanged;
                only the family moved. */}
            <text
              x="396"
              y={band.midY - 8}
              className="font-primary text-[22px] uppercase tracking-[0.05em]"
              fill={active ? '#e6ca8c' : 'rgba(253,252,248,0.82)'}
            >
              {layer.label}
            </text>
            <text
              x="396"
              y={band.midY + 18}
              className="font-primary text-[18px]"
              fill={active ? 'rgba(230,202,140,0.9)' : 'rgba(253,252,248,0.62)'}
            >
              {active ? 'In focus' : layer.zone}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
