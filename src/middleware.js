import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const V_SCHOOL_TENANT_ID = '10000000-0000-0000-0000-000000000001'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Skip static files and auth routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname === '/login') {
    return NextResponse.next()
  }

  // Tenant resolution priority:
  // 1. Subdomain: vschool.zuri.app
  // 2. Session JWT: token.tenantId
  // 3. Header: X-Tenant-Slug (QStash/internal)
  // 4. Default: vschool
  let tenantId = V_SCHOOL_TENANT_ID
  let tenantSlug = 'vschool'

  // Check JWT session
  const token = await getToken({ req })

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
  headers.set('x-tenant-id', tenantId)
  headers.set('x-tenant-slug', tenantSlug)

  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
