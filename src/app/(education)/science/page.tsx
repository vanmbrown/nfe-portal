import type { Metadata } from 'next'

import ScienceIntelligence from './ScienceIntelligence'

export const metadata: Metadata = {
  title: 'Science, Method & Proof | NFE Beauty',
  description:
    'NFE Skin Intelligence translates mature, melanated skin priorities into cosmetic formulation logic, ritual guidance, and proof discipline.',
}

export default function SciencePage() {
  return <ScienceIntelligence />
}
