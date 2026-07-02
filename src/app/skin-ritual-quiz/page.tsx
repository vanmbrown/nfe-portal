import type { Metadata } from 'next'
import SkinRitualQuiz from './SkinRitualQuiz'

export const metadata: Metadata = {
  title: 'Skin Ritual Quiz | NFE Beauty',
  description:
    'A restrained NFE Skin Ritual Quiz for mature, melanated skin, designed to guide cosmetic well-aging care with quiet authority.',
}

export default function SkinRitualQuizPage() {
  return <SkinRitualQuiz />
}
