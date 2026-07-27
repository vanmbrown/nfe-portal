import type { SkinLayer } from './types'

/**
 * Cosmetic appearance zones for the Skin Layer Intelligence Map.
 *
 * These are the same five zones the previous implementation used, with the
 * same colour language and the same scientifically cautious framing. They
 * describe where visible needs *appear*, not where an ingredient travels.
 *
 * Deliberately unchanged from the prior version:
 *  - the five zones and their order
 *  - the palette (cream, olive, gold, bronze, sand)
 *  - the absence of any claim that a product acts in the dermis
 *
 * The schematic retains both the anatomical labels (Epidermis, Dermis,
 * Hypodermis) and these cosmetic zone labels, exactly as before. No
 * biological mechanism has been added.
 */
export const SKIN_LAYERS: SkinLayer[] = [
  {
    id: 'surface',
    label: 'Surface',
    zone: 'Surface hydration',
    visibleContext:
      'Where dryness, ashiness, and a rough or dull surface are usually noticed first.',
    formulationContext:
      'Surface hydration, cushioning, and a smoother-feeling finish.',
    bandHex: '#f4eadb',
  },
  {
    id: 'barrier',
    label: 'Barrier',
    zone: 'Barrier comfort',
    visibleContext:
      'Where tightness, dehydration, and a less comfortable feel tend to show up.',
    formulationContext:
      'Barrier comfort, a replenished feel, and skin that feels cushioned rather than stripped.',
    bandHex: '#a5ad86',
  },
  {
    id: 'tone',
    label: 'Tone',
    zone: 'Tone integrity',
    visibleContext:
      'Where uneven-looking tone, visible dullness, and post-blemish-looking marks appear.',
    formulationContext:
      'A more even-looking complexion, tone integrity, and visible radiance.',
    bandHex: '#d5ae62',
  },
  {
    id: 'texture',
    label: 'Texture',
    zone: 'Texture and suppleness',
    visibleContext:
      'Where crepey-looking texture, the look of fine lines, and a loss of suppleness are noticed.',
    formulationContext:
      'Softening the look of texture and supporting supple, well-conditioned skin.',
    bandHex: '#a66f45',
  },
  {
    id: 'radiance',
    label: 'Radiance',
    zone: 'Visible resilience',
    visibleContext:
      'Where skin can look tired or flat, and where visible vitality is read.',
    formulationContext:
      'Antioxidant-supportive care, visible radiance, and a more rested look.',
    bandHex: '#ead7aa',
  },
]

export const LAYER_BY_ID = Object.fromEntries(
  SKIN_LAYERS.map((layer) => [layer.id, layer])
) as Record<SkinLayer['id'], SkinLayer>
