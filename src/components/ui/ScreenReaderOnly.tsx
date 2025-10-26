import { ReactNode } from 'react'

interface ScreenReaderOnlyProps {
  children: ReactNode
}

export default function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}


