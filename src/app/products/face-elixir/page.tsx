import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ElixirEditorialPage } from '@/components/atelier/ElixirEditorialPage'
import { faceElixirEditorial } from '@/content/atelier/elixir-editorial'
import { productData } from '@/content/products/registry'
import type { Product } from '@/types/products'

export const metadata: Metadata = {
  title: 'Face Elixir | The Atelier | NFE Beauty',
  description:
    'Face Elixir is NFE\'s daily face ritual for barrier comfort, visible radiance, and tone integrity. An editorial product dossier until ordering opens.',
}

async function getProduct(): Promise<Product | null> {
  try {
    const mod = await productData['face-elixir']()
    return mod.default as Product
  } catch {
    return null
  }
}

export default async function FaceElixirPage() {
  const product = await getProduct()
  if (!product) notFound()

  return (
    <ElixirEditorialPage product={product} editorial={faceElixirEditorial} />
  )
}
