import type { Metadata } from 'next'
import { Suspense } from 'react'
import { StudyCircleExperience } from '@/components/seed-access/StudyCircleExperience'

export const metadata: Metadata = {
  title: 'The NFE Study Circle',
  description: 'A private NFE invitation.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function StudyCirclePage() {
  return (
    <Suspense fallback={null}>
      <StudyCircleExperience />
    </Suspense>
  )
}
