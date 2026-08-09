import { permanentRedirect } from 'next/navigation'

export default function ArticlesIndexPage() {
  // `redirect` answers 307, which tells a crawler the move is temporary.
  // /articles is a retired legacy URL, not a detour, so it answers 308.
  permanentRedirect('/journal')
}
