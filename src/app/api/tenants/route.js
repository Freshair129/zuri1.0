import { getPrisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  
  // Basic RBAC: Only Platform Admins should see all tenants
  // For now, if "roles" includes 'OWNER' or 'ADMIN', we allow it
  if (!session || !session.user.roles.includes('ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const prisma = getPrisma()
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  return Response.json(tenants)
}

export async function POST(req) {
  const session = await getSession()
  if (!session || !session.user.roles.includes('ADMIN')) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await req.json()
  const prisma = getPrisma()

  try {
    const newTenant = await prisma.tenant.create({
      data: {
        tenantName: body.tenantName,
        tenantSlug: body.tenantSlug,
        plan: body.plan || 'STARTER',
        isActive: true,
      }
    })
    return Response.json(newTenant, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 })
  }
}
