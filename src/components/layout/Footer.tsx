export default function Footer() {
  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA;

  return (
    <footer role="contentinfo" className="bg-nfe-green-900 text-nfe-paper py-8">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© 2025 NFE Beauty. All rights reserved.</p>
        {buildSha ? (
          <p className="mt-2 text-xs text-nfe-paper/70">Build: {buildSha}</p>
        ) : null}
      </div>
    </footer>
  )
}


