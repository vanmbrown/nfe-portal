import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie Policy — NFE Beauty',
  description: 'How NFE uses cookies and how to manage your preferences.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-nfe-paper">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-serif text-4xl text-nfe-ink mb-4 tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-nfe-muted text-sm mb-12">Last updated: May 2026</p>

        <div className="prose prose-stone max-w-none space-y-10">

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">What cookies are</h2>
            <p className="text-nfe-muted leading-relaxed">
              Cookies are small text files stored on your device when you visit a website.
              They help the site remember your preferences between visits. NFE uses a minimal
              set of cookies and gives you control over each category.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Cookies we use</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-nfe-ink mb-2">Essential (always on)</h3>
                <p className="text-nfe-muted leading-relaxed text-sm">
                  Your cookie consent preference is stored in your browser&apos;s local storage
                  so we remember what you chose without asking every visit. This does not
                  track you across sites and is never sent to our servers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-nfe-ink mb-2">
                  Analytics (consent required)
                </h3>
                <p className="text-nfe-muted leading-relaxed text-sm">
                  If you accept analytics cookies, we activate Google Analytics 4 to
                  understand how visitors navigate the site — which pages are visited,
                  how long people stay, and what devices they use. This data is aggregated
                  and anonymised. We do not use it for advertising or share it with
                  third parties beyond Google Analytics.
                </p>
                <p className="text-nfe-muted leading-relaxed text-sm mt-2">
                  If you decline analytics cookies, no tracking scripts are loaded.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-nfe-ink mb-2">
                  Referral context (consent required)
                </h3>
                <p className="text-nfe-muted leading-relaxed text-sm">
                  If you accept, we keep a single record in your browser&apos;s session
                  storage, under the key <code>nfe.attribution.v1</code>, noting how you
                  reached us: the referring site, the page you arrived on, and any campaign
                  parameters in the link you followed. It helps us understand which
                  conversations bring people to NFE. It holds nothing about you, and it is
                  discarded when you close the tab.
                </p>
                <p className="text-nfe-muted leading-relaxed text-sm mt-2">
                  We keep it only from the moment you accept. Before you decide, and if you
                  decline, nothing is recorded and nothing is sent with a Founder Access or
                  Concierge enquiry. If you later withdraw consent, anything already held is
                  deleted. We would rather lose the record than keep one you did not agree to.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Managing your preferences</h2>
            <p className="text-nfe-muted leading-relaxed">
              You can change your cookie preferences at any time by clearing your browser&apos;s
              local storage or using your browser&apos;s built-in privacy settings. Most browsers
              allow you to refuse or delete cookies through their settings menu.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              To opt out of Google Analytics tracking specifically, you can install the{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                className="text-nfe-gold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics Opt-out Browser Add-on
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">No advertising cookies</h2>
            <p className="text-nfe-muted leading-relaxed">
              NFE does not use advertising networks, retargeting pixels, or third-party
              tracking for commercial purposes. The only external script we load with
              your consent is Google Analytics.
            </p>
          </section>

          <section className="border-t border-nfe-ink/10 pt-10">
            <p className="text-nfe-muted leading-relaxed text-sm">
              For broader privacy information, see our{' '}
              <Link href="/privacy" className="text-nfe-gold hover:underline">
                Privacy Policy
              </Link>
              . Questions? Write to{' '}
              <a
                href="mailto:vanessa@nfebeauty.com"
                className="text-nfe-gold hover:underline"
              >
                vanessa@nfebeauty.com
              </a>
              .
            </p>
            <p className="text-nfe-muted text-sm mt-4 italic">
              — with gratitude, Vanessa
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
