import { permanentRedirect } from 'next/navigation'

export default function SubscribePage() {
  // Permanent, not temporary: /subscribe is retired in favour of Founder Access.
  permanentRedirect('/founder-access')
}
