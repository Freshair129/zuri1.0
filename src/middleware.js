import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Skip static files and auth routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname === '/login') {
    return NextResponse.next()
  }

  // Tenant resolution:
  // 1. Extract from subdomain (e.g. vschool.zuri.app -> vschool)
  const host = req.headers.get('host') || ''
  let slug = host.split('.')[0]

  // Handle local dev (localhost:3000) or main domains
  if (slug === 'www' || slug === 'zuri' || slug === 'localhost:3000') {
    // If local dev, we could query params or fallback to vschool
    const searchParams = req.nextUrl.searchParams
    slug = searchParams.get('tenant') || 'vschool'
  }

  // 2. Check JWT session
  const token = await getToken({ req })

  let tenantId = null
  if (token?.tenantId) {
    tenantId = token.tenantId
  }

  // Protect dashboard routes
  if (pathname.startsWith('/') && !pathname.startsWith('/api') && pathname !== '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Inject tenant context for downstream API routes
  const headers = new Headers(req.headers)
  if (tenantId) {
    headers.set('x-tenant-id', tenantId)
  }
  headers.set('x-tenant-slug', slug)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
