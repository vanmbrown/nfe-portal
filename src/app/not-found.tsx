import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-nfe-green flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-serif text-nfe-gold text-7xl mb-6 tracking-widest opacity-60">
          NFE
        </p>
        <h1 className="font-serif text-3xl text-nfe-paper mb-4 tracking-tight">
          This page doesn&apos;t exist yet.
        </h1>
        <p className="text-nfe-paper/70 text-lg mb-10 leading-relaxed">
          It may have moved, or it may be something we haven&apos;t built yet.
          Either way, there&apos;s still plenty worth exploring.
        </p>
        <Link
          href="/"
          className="inline-block border border-nfe-gold text-nfe-gold px-8 py-3 text-sm tracking-widest uppercase hover:bg-nfe-gold hover:text-nfe-ink transition-colors duration-200"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
