import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ElixirEditorialPage } from '@/components/atelier/ElixirEditorialPage'
import { bodyElixirEditorial } from '@/content/atelier/elixir-editorial'
import { productData } from '@/content/products/registry'
import type { Product } from '@/types/products'

export const metadata: Metadata = {
  title: 'Body Elixir | The Atelier | NFE Beauty',
  description:
    'Body Elixir brings face-level formulation intelligence to the body: hydration, barrier comfort, and sensorial ritual for skin that has lived.',
}

async function getProduct(): Promise<Product | null> {
  try {
    const mod = await productData['body-elixir']()
    const product = mod.default as Product
    return {
      ...product,
      hero_image: '/images/products/radiant-body-elixir-white.png',
    }
  } catch {
    return null
  }
}

export default async function BodyElixirPage() {
  const product = await getProduct()
  if (!product) notFound()

  return (
    <ElixirEditorialPage product={product} editorial={bodyElixirEditorial} />
  )
}
