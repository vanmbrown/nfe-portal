import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — NFE Beauty',
  description: 'How NFE collects, stores, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-nfe-paper">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-serif text-4xl text-nfe-ink mb-4 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-nfe-muted text-sm mb-12">Last updated: July 2026</p>

        <div className="prose prose-stone max-w-none space-y-10">

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">What we collect</h2>
            <p className="text-nfe-muted leading-relaxed">
              When you subscribe to the NFE newsletter, join a product waitlist, submit
              through the Community Input form, or request Founder Access, we collect only
              what you provide.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              For Founder Access, that may include your first name, last name, email
              address, optional phone number, age range, skin interests, product interest,
              and an optional topic request. We do not collect payment data, government
              IDs, or health records.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              For other forms, we may collect your email address and, where you choose to
              share them, your name and skin details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Founder Access</h2>
            <p className="text-nfe-muted leading-relaxed">
              When you request Founder Access, we store your submission in Supabase, our
              secure cloud database hosted in the United States. This record helps NFE
              manage founder invitations, release updates, and early allocation interest.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              If you check the optional newsletter consent box, we may also sync your
              information to Beehiiv so you can receive founder updates, skincare
              education, articles, and product release news. If you do not opt in, no
              Beehiiv marketing sync occurs for that submission.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              We use Resend to send a confirmation email when your Founder Access request
              is received and to notify the NFE team of new requests. These are
              transactional notifications related to your submission.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">How we store it</h2>
            <p className="text-nfe-muted leading-relaxed">
              Your information is stored in Supabase, a cloud database hosted in the United
              States. We use industry-standard security practices. Your email is never stored
              in plain text in logs or analytics systems.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Who we share it with</h2>
            <p className="text-nfe-muted leading-relaxed">
              We use Resend to send transactional emails such as Founder Access
              confirmations, subscription confirmations, and waitlist notifications.
              If you opt in to founder updates or newsletter communication through
              Founder Access, we also sync your information to Beehiiv, our email
              platform provider, for that communication.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              We do not sell, rent, or share your personal information with advertisers,
              data brokers, or any other third parties.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Analytics</h2>
            <p className="text-nfe-muted leading-relaxed">
              We use Google Analytics 4 to understand how people navigate the site. Analytics
              are only activated after you accept cookies through our consent banner. You can
              decline or withdraw consent at any time. We do not use fingerprinting, session
              recording, or behavioral advertising.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Your rights</h2>
            <p className="text-nfe-muted leading-relaxed">
              You can request to view, correct, or delete your personal information at any
              time. To do so, email{' '}
              <a
                href="mailto:vanessa@nfebeauty.com"
                className="text-nfe-gold hover:underline"
              >
                vanessa@nfebeauty.com
              </a>{' '}
              with your request. We will respond within 30 days.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              If you receive marketing emails from NFE through Beehiiv, you can unsubscribe
              at any time using the unsubscribe link in those emails.
            </p>
            <p className="text-nfe-muted leading-relaxed mt-4">
              If you are in the European Union or United Kingdom, you have additional rights
              under GDPR including the right to data portability and the right to lodge a
              complaint with your local supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Cookies</h2>
            <p className="text-nfe-muted leading-relaxed">
              For details on how we use cookies and how to manage them, see our{' '}
              <Link href="/cookies" className="text-nfe-gold hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-nfe-ink mb-4">Updates to this policy</h2>
            <p className="text-nfe-muted leading-relaxed">
              If we make material changes, we will update the date above and, where
              appropriate, notify subscribers by email. Continued use of the site after
              changes take effect constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="border-t border-nfe-ink/10 pt-10">
            <p className="text-nfe-muted leading-relaxed text-sm">
              Questions about this policy? Write to us at{' '}
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
