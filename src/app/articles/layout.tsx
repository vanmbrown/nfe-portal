import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal | NFE Beauty',
  description:
    'NFE Journal is the editorial house for well-aging philosophy, mature melanated skin education, ritual intelligence, and proof discipline.',
  openGraph: {
    title: 'Journal | NFE Beauty',
    description:
      'Editorial authority for mature melanated skin: barrier comfort, tone integrity, ritual intelligence, and proof discipline.',
    type: 'website',
  },
}

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
