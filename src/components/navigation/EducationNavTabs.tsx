'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links: { label: string; href: string }[] = [
  { label: 'Science', href: '/science' },
  { label: 'Ingredients', href: '/inci' },
];

/**
 * Navigation between the two education routes.
 *
 * This previously used role="tablist"/role="tab" on buttons that called
 * router.push. Tab semantics describe panels swapping within one view; these
 * are separate pages, so a screen-reader user was told to expect a tabpanel
 * and instead got a navigation. It is now a <nav> of links with
 * aria-current="page", which is what the interaction actually is.
 *
 * Links also restore ordinary browser behaviour the buttons had removed:
 * middle-click, open-in-new-tab, and a visible target on hover.
 *
 * The visual treatment is unchanged, including the gold underline on the
 * active route. The framer-motion layout animation was dropped with the
 * buttons -- the underline is now static, which also removes a motion effect
 * that had no reduced-motion handling of its own.
 */
export default function EducationNavTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Education"
      className="w-full border-b border-[#C9A66B]/30 bg-gradient-to-br from-[#0B291E] via-[#0E2A22] to-[#0B291E]"
    >
      <ul className="flex gap-1 px-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href} className="flex-none">
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-[44px] items-center px-6 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#E7C686]'
                    : 'text-[#D5D2C7] hover:text-[#FDFCF8]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E7C686]"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
