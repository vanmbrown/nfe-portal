import { NextResponse, type NextRequest } from 'next/server'

/**
 * Send every cleartext request to its HTTPS equivalent.
 *
 * `http://www.nfebeauty.com` answered 200 and served the whole site in the
 * clear, Founder Access and Concierge included, so anything typed into those
 * forms travelled unencrypted. The apex is a separate matter: it is an
 * unproxied record pointing elsewhere and already answers 308 on its own, so
 * this only has to cover the hosts this Worker serves.
 *
 * Scoped deliberately to a redirect rather than the zone-wide Cloudflare
 * setting. The zone's full hostname inventory could not be read with the
 * available credentials, and switching on a zone-wide rule without that
 * inventory risks breaking a host nobody remembered.
 *
 * ---
 *
 * Deliberately `middleware`, not the newer `proxy` convention, despite the
 * deprecation notice Next prints.
 *
 * Next 16 runs `proxy` on the Node.js runtime unconditionally and rejects any
 * route segment config in that file, so it cannot be moved to the edge. The
 * Cloudflare adapter in turn refuses to build a Node.js proxy at all: the
 * Worker bundle is simply never emitted. `middleware` runs on the edge runtime
 * and builds cleanly, so it is the only form of this that can actually ship
 * here. Revisit when the adapter supports Node proxies.
 */

/** The scheme the client actually used, or null when nothing states it.
 *
 *  Three sources, most trustworthy first. The third matters: a Cloudflare
 *  Worker receives the request directly rather than as a proxied origin fetch,
 *  so neither forwarding header is guaranteed, and the request URL itself
 *  carries the real scheme. Relying on headers alone would leave this silently
 *  dead in production. */
function clientScheme(request: NextRequest): 'http' | 'https' | null {
  // cf-visitor first. Cloudflare sets it and strips any client-supplied CF-*
  // header, so it cannot be forged, whereas x-forwarded-proto can be set by
  // anything upstream. Order matters: a dev server that injects
  // `x-forwarded-proto: http` would otherwise send a secure request into a
  // redirect.
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

export function middleware(request: NextRequest) {
  const url = request.nextUrl

  // The Host header is what a browser asked for; nextUrl can carry the
  // listening socket's host instead, which in local preview is always
  // localhost and would mask the behaviour being tested.
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
  // No `runtime` key: middleware is edge by default, which is what the
  // Cloudflare adapter needs. Setting it here is what broke the Worker build.
  //
  // Everything a person can browse. Static assets and image optimisation are
  // fetched by a page that already arrived over HTTPS, so they would only cost
  // an extra hop.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)'],
}
