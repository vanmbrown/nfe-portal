import Link from 'next/link'
import type { ReactNode } from 'react'

export function AtelierLink({
  href,
  children,
  variant = 'dark',
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'light' | 'outline'
}) {
  const classes = {
    dark:
      'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700',
    light:
      'bg-nfe-gold text-nfe-green-900 hover:bg-nfe-paper focus:bg-nfe-paper',
    outline:
      'border border-nfe-green-900 text-nfe-green-900 hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper',
  }

  return (
    <Link
      href={href}
      className={`${classes[variant]} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}
