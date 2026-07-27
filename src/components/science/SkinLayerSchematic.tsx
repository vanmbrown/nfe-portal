import type { LayerId, SkinLayer } from '@/content/science'

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

  // Generous band geometry. Taller and wider than the previous schematic so
  // labels are legible without zoom on mobile.
  const bands: { id: LayerId; y: number; height: number; fill: string }[] = [
    { id: 'surface', y: 30, height: 46, fill: '#f4eadb' },
    { id: 'barrier', y: 76, height: 46, fill: '#a5ad86' },
    { id: 'tone', y: 122, height: 48, fill: '#d5ae62' },
    { id: 'texture', y: 170, height: 48, fill: '#a66f45' },
    { id: 'radiance', y: 218, height: 44, fill: '#ead7aa' },
  ]

  const anatomical = [
    { label: 'Epidermis', y: 100 },
    { label: 'Dermis', y: 196 },
    { label: 'Hypodermis', y: 252 },
  ]

  return (
    <svg
      viewBox="0 0 520 292"
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
          <rect x="18" y="30" width="286" height="232" rx="20" />
        </clipPath>
      </defs>

      <rect
        x="18"
        y="30"
        width="286"
        height="232"
        rx="20"
        fill="#0b2f24"
        stroke="rgba(253,252,248,0.34)"
        strokeWidth="1.5"
      />

      <g clipPath="url(#nfe-map-clip)">
        {bands.map((band) => (
          <rect
            key={band.id}
            x="18"
            y={band.y}
            width="286"
            height={band.height}
            fill={band.fill}
            opacity={isUp(band.id) ? 1 : 0.24}
            className="nfe-map-band"
          />
        ))}
        <rect
          x="18"
          y="30"
          width="286"
          height="232"
          fill="url(#nfe-map-sheen)"
        />
        {/* Decorative depth cues in the lowest band. */}
        <g fill="#6f744f" opacity={isUp('radiance') ? 0.42 : 0.12} aria-hidden="true">
          <circle cx="58" cy="240" r="3" />
          <circle cx="104" cy="250" r="2.4" />
          <circle cx="152" cy="236" r="2.8" />
          <circle cx="204" cy="250" r="3.2" />
          <circle cx="256" cy="240" r="2.6" />
        </g>
      </g>

      {/* Emphasis outline — a second, non-colour signal. */}
      {bands.map((band) =>
        hasEmphasis && emphasized.includes(band.id) ? (
          <rect
            key={`focus-${band.id}`}
            x="19.5"
            y={band.y + 1.5}
            width="283"
            height={band.height - 3}
            fill="none"
            stroke="#e6ca8c"
            strokeWidth="2"
            rx="4"
          />
        ) : null
      )}

      {/* Anatomical context, visually quieter than the cosmetic zone labels. */}
      <g fill="#17352a" opacity="0.7" className="text-[13px] uppercase tracking-[0.06em]">
        {anatomical.map((item) => (
          <text key={item.label} x="34" y={item.y}>
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
              d={`M304 ${midY}H326`}
              stroke={active ? '#e6ca8c' : 'rgba(253,252,248,0.34)'}
              strokeWidth={active ? 1.6 : 1}
              fill="none"
            />
            {/* Label sizes are in viewBox units. The schematic scales down to
                roughly 0.65 on a 375px viewport, so these are set large enough
                to stay legible there without zooming. */}
            <text
              x="334"
              y={midY - 3}
              className="text-[19px] uppercase tracking-[0.05em]"
              fill={active ? '#e6ca8c' : 'rgba(253,252,248,0.82)'}
            >
              {layer.label}
            </text>
            <text
              x="334"
              y={midY + 18}
              className="text-[18px]"
              fill={active ? 'rgba(230,202,140,0.9)' : 'rgba(253,252,248,0.6)'}
            >
              {active ? 'In focus' : layer.zone}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
