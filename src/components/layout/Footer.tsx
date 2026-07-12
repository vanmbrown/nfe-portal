import Link from 'next/link'

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/inci', label: 'Ingredients' },
  { href: '/shop', label: 'The Atelier' },
  { href: '/founder-access', label: 'Founder Access' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
]

export default function Footer() {
  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA;

  return (
    <footer role="contentinfo" className="bg-nfe-green-900 text-nfe-paper py-10">
      <div className="container mx-auto px-4 text-center text-sm">
        <nav aria-label="Footer navigation" className="mb-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-nfe-paper/80 transition-colors duration-motion-base hover:text-nfe-gold focus:text-nfe-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>© 2025 NFE Beauty. All rights reserved.</p>
        {buildSha ? (
          <p className="mt-2 text-xs text-nfe-paper/70">Build: {buildSha}</p>
        ) : null}
      </div>
    </footer>
  )
}


