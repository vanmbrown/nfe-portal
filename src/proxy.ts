import { NextResponse, type NextRequest } from 'next/server'

/**
 * Send every cleartext request to its HTTPS equivalent.
 *
 * `http://www.nfebeauty.com` answered 200 and served the whole site in the
 * clear, Founder Access and Concierge included, so anything typed into those
 * forms travelled unencrypted. The apex is a separate matter: it is an
 * unproxied record pointing elsewhere and already answers 308 to HTTPS on its
 * own, so this only has to cover the hosts this Worker serves.
 *
 * Scoped deliberately to a redirect rather than the zone-wide Cloudflare
 * setting. The zone's full hostname inventory could not be read with the
 * available credentials, and switching on a zone-wide rule without that
 * inventory risks breaking a host nobody remembered.
 *
 * Behind Cloudflare the original scheme arrives in `x-forwarded-proto`, with
 * `cf-visitor` as a second source. Both are read, and the redirect only fires
 * when one of them positively says `http`, so a missing header can never cause
 * a loop.
 *
 * This is the `proxy` convention. Next 16 deprecated `middleware`.
 */

/** The scheme the client actually used, or null when nothing states it.
 *
 *  Three sources, most explicit first. The third matters: a Cloudflare Worker
 *  receives the request directly rather than as a proxied origin fetch, so
 *  neither forwarding header is guaranteed to be present, and the request URL
 *  itself carries the real scheme. Relying on the headers alone would leave the
 *  redirect silently dead in production. */
function clientScheme(request: NextRequest): 'http' | 'https' | null {
  // cf-visitor first. Cloudflare sets it and strips any client-supplied CF-*
  // header, so it cannot be forged, whereas x-forwarded-proto can be set by
  // anything upstream. Order matters: a local dev server that injects
  // `x-forwarded-proto: http` would otherwise override the true scheme and
  // send an already-secure request into a redirect.
  const visitor = request.headers.get('cf-visitor')
  if (visitor) {
    try {
      const scheme = (JSON.parse(visitor) as { scheme?: string }).scheme?.toLowerCase()
      if (scheme === 'http' || scheme === 'https') return scheme
    } catch {
      // A malformed header is simply not a signal.
    }
  }

  const forwarded = request.headers.get('x-forwarded-proto')
  if (forwarded) {
    // May be a list when proxies are chained; the client is first.
    const first = forwarded.split(',')[0]?.trim().toLowerCase()
    if (first === 'http' || first === 'https') return first
  }

  const protocol = request.nextUrl.protocol.replace(':', '').toLowerCase()
  if (protocol === 'http' || protocol === 'https') return protocol

  return null
}

/** Hosts that legitimately speak plain HTTP: local dev and Worker previews. */
function servesPlainHttp(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.workers.dev')
  )
}

export default function proxy(request: NextRequest) {
  const url = request.nextUrl

  // The Host header is what a browser asked for; nextUrl can carry the
  // listening socket's host instead, which in local preview is always
  // localhost and would mask the very behaviour being tested.
  const host = (request.headers.get('host') ?? url.host).split(':')[0].toLowerCase()

  if (servesPlainHttp(host)) return NextResponse.next()
  if (clientScheme(request) !== 'http') return NextResponse.next()

  const target = new URL(url.toString())
  target.protocol = 'https:'
  target.host = host
  target.port = ''

  // 308 rather than 302: the method survives and the redirect is permanent, so
  // a browser upgrades on its own next time.
  return NextResponse.redirect(target, 308)
}

export const config = {
  // Everything a person can browse. Static assets and image optimisation are
  // fetched by a page that already arrived over HTTPS, so they would only cost
  // an extra hop.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}
