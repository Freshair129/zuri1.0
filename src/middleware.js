import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// V School default tenant (ADR-056)
const DEFAULT_TENANT_ID = '10000000-0000-0000-0000-000000000001'

// Routes that don't require auth
const PUBLIC_PATHS = new Set(['/login', '/register', '/forgot-password'])

// Static + API auth routes — skip middleware entirely
const SKIP_PREFIXES = ['/_next', '/api/auth', '/favicon.ico', '/icons', '/manifest.json']

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // 1. Skip static + NextAuth routes
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 2. Tenant resolution — extract from subdomain
  const host = req.headers.get('host') || ''
  let slug = host.split('.')[0]

  // Local dev: localhost or main domain → fallback to 'vschool'
  if (!slug || slug === 'www' || slug === 'zuri' || host.startsWith('localhost')) {
    slug = req.nextUrl.searchParams.get('tenant') || 'vschool'
  }

  // 3. Auth check
  const token = await getToken({ req })

  // Allow public pages without auth
  if (PUBLIC_PATHS.has(pathname)) {
    // Redirect already-authenticated users away from auth pages
    if (token) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Resolve tenantId — prefer JWT tenantId (most authoritative)
  const tenantId = token.tenantId ?? DEFAULT_TENANT_ID

  // 5. Inject tenant context headers for API routes + Server Components
  const headers = new Headers(req.headers)
  headers.set('x-tenant-id', tenantId)
  headers.set('x-tenant-slug', slug)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
