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
 *  - both the anatomical labels (Epidermis, Dermis, Hypodermis) and the
 *    cosmetic zone labels are retained, and the two are visually distinct
 *  - the bands describe where visible needs *appear*, not where an ingredient
 *    travels; no penetration or dermal-action claim is made or implied
 *  - no biological mechanism has been added
 *
 * Emphasis is communicated by opacity *and* by an outline plus a visible
 * "In focus" marker, so it never depends on colour alone.
 */
export function SkinLayerSchematic({ layers, emphasized }: SkinLayerSchematicProps) {
  const hasEmphasis = emphasized.length > 0
  const isUp = (id: LayerId) => !hasEmphasis || emphasized.includes(id)

  // Band geometry, sized so the drawing itself carries the chapter rather than
  // sitting as a small illustration beside a large body of text.
  //
  // The block occupies 320 of 520 viewBox units horizontally (was 286 of 566)
  // and 272 of 300 vertically (was 232 of 292), so almost all of the viewBox is
  // now drawing rather than empty margin. Combined with a wider schematic
  // column, the rendered block grows roughly a quarter in each dimension.
  //
  // The label column could be narrowed because long zone names now wrap onto a
  // second line instead of forcing the viewBox wide enough to fit them on one.
  //
  // Geometry lives here; colour does not. Fills come from the layer's `bandHex`
  // so the schematic band and the Layer Context colour bar below read the same
  // token and cannot drift apart. The hex values are unchanged, as are the
  // relative proportions of the five bands.
  const BLOCK = { x: 16, y: 14, width: 320, height: 272 }

  const geometry: { id: LayerId; y: number; height: number }[] = [
    { id: 'surface', y: 14, height: 54 },
    { id: 'barrier', y: 68, height: 54 },
    { id: 'tone', y: 122, height: 56 },
    { id: 'texture', y: 178, height: 56 },
    { id: 'radiance', y: 234, height: 52 },
  ]

  const bands = geometry.map((band) => ({
    ...band,
    fill: layers.find((layer) => layer.id === band.id)?.bandHex ?? 'transparent',
  }))

  const anatomical = [
    { label: 'Epidermis', y: 96 },
    { label: 'Dermis', y: 209 },
    { label: 'Hypodermis', y: 274 },
  ]

  /**
   * Splits a long zone name across two lines.
   *
   * This is what lets the block grow: single-line labels forced the viewBox
   * wide enough for "Texture and suppleness", and every extra unit of label
   * width shrank the drawing at a fixed column width.
   */
  const wrapLabel = (text: string): string[] => {
    if (text.length <= 14) return [text]
    const words = text.split(' ')
    if (words.length < 2) return [text]
    let head = ''
    let index = 0
    while (index < words.length - 1 && (head + words[index]).length < text.length / 2) {
      head = head ? `${head} ${words[index]}` : words[index]
      index += 1
    }
    return [head, words.slice(index).join(' ')]
  }

  return (
    <svg
      viewBox="0 0 520 300"
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
          <rect x="16" y="14" width="320" height="272" rx="22" />
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
          <circle cx="61" cy="260" r="3.4" />
          <circle cx="112" cy="272" r="2.7" />
          <circle cx="166" cy="256" r="3.1" />
          <circle cx="224" cy="272" r="3.6" />
          <circle cx="282" cy="260" r="2.9" />
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

      {/* Anatomical context, visually quieter than the cosmetic zone labels. */}
      <g fill="#17352a" opacity="0.7" className="text-[15px] uppercase tracking-[0.06em]">
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
        const midY = band.y + band.height / 2
        const active = hasEmphasis && emphasized.includes(band.id)
        return (
          <g key={`label-${band.id}`}>
            <path
              d={`M${BLOCK.x + BLOCK.width} ${midY}H${BLOCK.x + BLOCK.width + 20}`}
              stroke={active ? '#e6ca8c' : 'rgba(253,252,248,0.34)'}
              strokeWidth={active ? 1.6 : 1}
              fill="none"
            />
            {/* Label sizes are in viewBox units. The schematic scales down to
                roughly 0.65 on a 375px viewport, so these are set large enough
                to stay legible there without zooming. */}
            <text
              x="364"
              y={midY - 6}
              className="text-[22px] uppercase tracking-[0.05em]"
              fill={active ? '#e6ca8c' : 'rgba(253,252,248,0.82)'}
            >
              {layer.label}
            </text>
            <text
              x="364"
              y={midY + 16}
              className="text-[20px]"
              fill={active ? 'rgba(230,202,140,0.9)' : 'rgba(253,252,248,0.62)'}
            >
              {(active ? ['In focus'] : wrapLabel(layer.zone)).map((line, index) => (
                <tspan key={line} x="364" dy={index === 0 ? 0 : 22}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
