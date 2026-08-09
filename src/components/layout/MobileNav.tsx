'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { isCurrentRoute, navItems, secondaryNavItem } from './navItems'

const PANEL_ID = 'mobile-navigation-panel'

/** The maison's navigation below the md breakpoint.
 *
 *  The six tabs used to sit in the header and wrap across three lines, which
 *  spent most of the arrival on a menu. They now live behind a single mark.
 *
 *  The drawer stays mounted whether open or closed. That keeps `aria-controls`
 *  pointing at something real, lets the panel transition rather than snap, and
 *  means the header renders identically on the server and after hydration, so
 *  the desktop row never flashes on a phone. When closed the panel is
 *  `visibility: hidden`, which takes its links out of the tab order and out of
 *  the accessibility tree at the same time.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  // Choosing a destination closes the drawer.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Escape closes it; Tab stays inside it.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Hold the page still behind the drawer. The gutter measurement keeps the
  // layout from jumping on any browser that reserves space for a scrollbar.
  useEffect(() => {
    if (!open) return

    const { body } = document
    const previousOverflow = body.style.overflow
    const previousPadding = body.style.paddingRight
    const gutter = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    return () => {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPadding
    }
  }, [open])

  // Focus follows the drawer in, and returns to the mark on the way out.
  // The inbound focus waits a frame: the panel is unfocusable until the browser
  // has recalculated it from `invisible` to `visible`, and a focus() call
  // against a still-hidden element is dropped without error.
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => closeRef.current?.focus())
      wasOpen.current = true
      return () => cancelAnimationFrame(frame)
    }
    if (wasOpen.current) toggleRef.current?.focus()
    wasOpen.current = false
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        // The name stays put and `aria-expanded` carries the state. Renaming it
        // to "Close navigation" while open gave the page two differently-placed
        // buttons with one name, which is ambiguous to announce.
        aria-label="Open navigation"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className="-mr-2 flex h-11 w-11 items-center justify-center text-nfe-paper transition-colors duration-200 hover:text-nfe-gold"
      >
        <span aria-hidden="true" className="flex w-5 flex-col gap-[5px]">
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
          <span className="h-px w-full bg-current" />
        </span>
      </button>

      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-nfe-ink/60 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        id={PANEL_ID}
        ref={panelRef}
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[min(22rem,82vw)] flex-col bg-nfe-green text-nfe-paper transition-transform duration-300 ease-out ${
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-serif text-xl tracking-[0.2em] text-nfe-gold">NFE</span>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-nfe-paper transition-colors duration-200 hover:text-nfe-gold"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M4 4 L16 16 M16 4 L4 16" />
            </svg>
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-6">
          <ul>
            {navItems.map((item) => {
              const current = isCurrentRoute(pathname, item.href)
              return (
                <li key={item.href} className="border-b border-nfe-paper/10">
                  <Link
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={`block py-4 text-lg tracking-wide transition-colors duration-200 hover:text-nfe-gold ${
                      current ? 'text-nfe-gold' : 'text-nfe-paper'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-6 pb-8 pt-6">
          <Link
            href={secondaryNavItem.href}
            className="block py-2 text-sm uppercase tracking-[0.18em] text-nfe-paper/80 transition-colors duration-200 hover:text-nfe-gold"
          >
            {secondaryNavItem.label}
          </Link>
        </div>
      </div>
    </div>
  )
}
